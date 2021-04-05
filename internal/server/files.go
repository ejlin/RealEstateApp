package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"../cloudstorage"
	"../db"
	"../util"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

type RestFile struct {
	ID             string          `json:"id,omitempty"`
	Name           string          `json:"name,omitempty"`
	Year           int             `json:"year,omitempty"`
	CreatedAt      *time.Time      `json:"created_at,omitempty"`
	Type           string          `json:"type,omitempty"`
	LastModifiedAt *time.Time      `json:"last_modified_at,omitempty"`
	GetSignedURL   string          `json:"get_signed_url,omitempty"`
	Metadata       json.RawMessage `json:"metadata,omitempty"`
}

func (s *Server) getFileslistByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	files, err := s.DBHandle.GetAllFiles(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get fileslist by user")
		http.Error(w, "unable to get fileslist by user", http.StatusBadRequest)
		return
	}

	var restFiles []*RestFile

	for _, file := range files {

		// We may need to log how long this takes.
		fileGetSignedURL, err := s.getSignedURL(ctx, file.Path)
		if err != nil {
			// Log and continue.
			ll.Warn().Err(err).Msg("unable to get file signed URL")
			continue
		}

		restFiles = append(restFiles, &RestFile{
			ID:             file.ID,
			Name:           file.Name,
			Year:           file.Year,
			CreatedAt:      file.CreatedAt,
			LastModifiedAt: file.LastModifiedAt,
			GetSignedURL:   fileGetSignedURL,
			Metadata:       file.Metadata,
		})
	}

	RespondToRequest(w, restFiles)
	return
}

func (s *Server) getStoreFileSignedURL(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		log.Info().Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	ll = log.With().Str("property_id", propertyID).Logger()

	fileName, ok := vars["file_name"]
	if !ok {
		log.Info().Msg("missing file name")
		http.Error(w, "missing file name", http.StatusBadRequest)
		return
	}

	ll = log.With().Str("file_name", fileName).Logger()

	url, err := s.generateStoreFileSignedURL(ctx, userID, propertyID, fileName)
	if err != nil {
		ll.Error().Err(err).Msg("unable to generate put signed url")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	RespondToRequest(w, url)
	return
}

func (s *Server) getFilesSummary(w http.ResponseWriter, r *http.Request) {

	// ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	fileSummary, err := s.DBHandle.GetFilesSummaryByUserID(userID)
	if err != nil {
		ll.Error().Err(err).Msg("unable to fetch files summary")
		http.Error(w, "unable to fetch files summary", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, fileSummary)
	return
}

func (s *Server) uploadFileByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	err := r.ParseMultipartForm(32 << 20) // maxMemory 32MB
	if err != nil {
		ll.Error().Err(err).Msg("failed to parse multipart message")
		http.Error(w, "failed to parse multipart message", http.StatusBadRequest)
		return
	}

	uploadedFile, handler, err := r.FormFile("file")
	if err != nil {
		ll.Error().Err(err).Msg("error retrieving the file")
		http.Error(w, "error retrieving the file", http.StatusBadRequest)
		return
	}
	defer uploadedFile.Close()

	fileName := r.FormValue("file_name")
	if fileName == "" {
		fileName = handler.Filename
	}

	fileType := r.FormValue("file_type")
	if fileType == "" {
		fileType = "other"
	}

	metadataFileType := r.FormValue("metadata_file_type")
	if metadataFileType == "" {
		metadataFileType = "unknown"
	}

	metadataFileSizeBytesVal := r.FormValue("metadata_file_size_bytes")

	metadataFileSizeBytes, err := strconv.Atoi(metadataFileSizeBytesVal)
	if err != nil {
		metadataFileSizeBytes = -1
	}

	year := r.FormValue("year")
	if year == "" {
		y := time.Now().Year()
		year = fmt.Sprint(y)
	}

	properties := r.FormValue("properties")
	associatedProperties := strings.Split(properties, ",")

	ll = ll.With().Str("file_name", fileName).Logger()

	fileID := uuid.New().String()
	filePath := path.Join(userID, "files", fileID, fileName)

	now := time.Now()
	metadata := map[string]interface{}{
		"type":       metadataFileType,
		"size_bytes": metadataFileSizeBytes,
	}

	marshalledMetadata, err := json.Marshal(metadata)
	if err != nil {
		// log and continue.
		ll.Warn().Err(err).Msg("unable to marshal file metadata")
	}

	file := &db.File{
		ID:             fileID,
		UserID:         userID,
		CreatedAt:      &now,
		LastModifiedAt: &now,
		Name:           fileName,
		Type:           db.FileType(fileType),
		Year:           util.GetYear(year),
		Path:           filePath,
		Metadata:       json.RawMessage(marshalledMetadata),
	}

	addFileToCloudStorage := func() func(ctx context.Context) error {
		return func(ctx context.Context) error {
			return cloudstorage.AddCloudstorageFile(ctx, s.StorageClient, uploadedFile, s.UsersBucket, filePath)
		}
	}

	err = s.DBHandle.AddFile(ctx, userID, file, associatedProperties, addFileToCloudStorage())
	if err != nil {
		ll.Error().Err(err).Msg("unable to add file")
		http.Error(w, "unable to add file", http.StatusInternalServerError)
		return
	}

	ll.Info().Msg("successfully created file")
	RespondToRequest(w, file)
	return
}

// getFile either downloads an individual file or returns a signed URl.
func (s *Server) getFile(w http.ResponseWriter, r *http.Request) {

	// ctx := r.Context()
	// vars := mux.Vars(r)

	// userID, ok := vars["id"]
	// if !ok {
	// 	log.Info().Msg("missing user id")
	// 	http.Error(w, "missing user id", http.StatusBadRequest)
	// 	return
	// }

	// ll := log.With().Str("user_id", userID).Logger()

	// fileName, ok := vars["file_name"]
	// if !ok {
	// 	ll.Warn().Msg("file name not set")
	// 	http.Error(w, "file name not set", http.StatusBadRequest)
	// 	return
	// }

	// ll = ll.With().Str("file_name", fileName).Logger()

	// request, ok := vars["request"]
	// if !ok {
	// 	ll.Warn().Msg("file type not set")
	// 	http.Error(w, "file type not set", http.StatusBadRequest)
	// 	return
	// }

	// ll = ll.With().Str("request", request).Logger()

	// switch request {
	// case "download":
	// 	s.getFileData(ctx, userID, propertyID, fileName, w, r)
	// 	return
	// case "signed_url":
	// 	key := path.Join(userID, propertyDelimiter, propertyID, fileName)

	// 	url, err := s.getSignedURL(ctx, key)
	// 	if err != nil {
	// 		ll.Warn().Err(err).Msg("error getting signed url")
	// 		http.Error(w, "error getting signed url", http.StatusBadRequest)
	// 	}
	// 	RespondToRequest(w, url)
	// 	return
	// }

	// return
}

func (s *Server) getFileByID(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	fileID, ok := vars["file_id"]
	if !ok {
		ll.Warn().Msg("file id not set")
		http.Error(w, "file id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_id", fileID).Logger()

	file, err := s.DBHandle.GetFileById(userID, fileID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get file by id")
		http.Error(w, "unable to get file by id", http.StatusInternalServerError)
		return
	}

	key := file.Path
	if key == "" {
		ll.Warn().Err(err).Msg("missing cloudstorage path")
		http.Error(w, "missing cloudstorage path", http.StatusInternalServerError)
		return
	}

	fileGetSignedURL, err := s.getSignedURL(ctx, file.Path)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get file signed URL")
		http.Error(w, "unable to get file signed URL", http.StatusInternalServerError)
		return
	}

	restFile := &RestFile{
		ID:             file.ID,
		Name:           file.Name,
		Year:           file.Year,
		CreatedAt:      file.CreatedAt,
		Type:           string(file.Type),
		LastModifiedAt: file.LastModifiedAt,
		GetSignedURL:   fileGetSignedURL,
		Metadata:       file.Metadata,
	}

	ll.Info().Msg("returned file by id")

	RespondToRequest(w, restFile)
	return
}

func (s *Server) getFilesByProperty(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("property id not set")
		http.Error(w, "property id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	files, err := s.DBHandle.GetFilesByProperty(userID, propertyID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get files by property")
		http.Error(w, "unable to get files by property", http.StatusInternalServerError)
		return
	}

	var restFiles []*RestFile
	for _, file := range files {
		fileGetSignedURL, err := s.getSignedURL(ctx, file.Path)
		if err != nil {
			ll.Warn().Err(err).Msg("unable to get file signed URL")
			continue
		}

		restFile := &RestFile{
			ID:             file.ID,
			Name:           file.Name,
			Year:           file.Year,
			CreatedAt:      file.CreatedAt,
			Type:           string(file.Type),
			LastModifiedAt: file.LastModifiedAt,
			GetSignedURL:   fileGetSignedURL,
			Metadata:       file.Metadata,
		}

		restFiles = append(restFiles, restFile)
	}

	RespondToRequest(w, restFiles)
	return

}

func (s *Server) deleteFile(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	fileID, ok := vars["file_id"]
	if !ok {
		ll.Warn().Msg("file id not set")
		http.Error(w, "file id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_id", fileID).Logger()

	deleteFileFromCloudstorage := func() func(ctx context.Context, filePath string) error {
		return func(ctx context.Context, filePath string) error {
			return s.deleteStorageFile(ctx, filePath)
		}
	}

	err := s.DBHandle.DeleteFileByID(ctx, userID, fileID, deleteFileFromCloudstorage())
	if err != nil {
		ll.Warn().Err(err).Msg("unable to delete file")
		http.Error(w, "unable to delete file", http.StatusInternalServerError)
		return
	}

	// key := path.Join(userID, propertyDelimiter, propertyID, fileName)

	// err := s.deleteStorageFile(ctx, key)
	// if err != nil {
	// 	ll.Warn().Err(err).Msg("unable to delete file")
	// 	http.Error(w, "unable to delete file", http.StatusInternalServerError)
	// 	return
	// }

	ll.Info().Msg("file deleted successfully")
	w.Write([]byte("success"))
	return
}
