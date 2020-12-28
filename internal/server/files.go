package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

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

	files, err := s.getCloudFileslistByUser(ctx, userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get fileslist by user")
		http.Error(w, "unable to get fileslist by user", http.StatusBadRequest)
		return
	}

	if len(files) == 0 {
		ll.Warn().Msg("no files found for user")
		http.Error(w, "no files found for user", http.StatusNotFound)
		return
	}

	RespondToRequest(w, files)
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

	w.Write([]byte(url))
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

	file, handler, err := r.FormFile("file")
	if err != nil {
		ll.Error().Err(err).Msg("error retrieving the file")
		http.Error(w, "error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	propertyID := r.FormValue("property_id")
	if propertyID == "" {
		ll.Error().Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	fileCategory := r.FormValue("file_category")
	if fileCategory == "" {
		ll.Error().Msg("missing file category")
		http.Error(w, "missing file category", http.StatusBadRequest)
		return
	}

	address := r.FormValue("address")
	if address == "" {
		ll.Error().Msg("missing file address")
		http.Error(w, "missing file address", http.StatusBadRequest)
		return
	}

	fileName := r.FormValue("file_name")
	if fileName == "" {
		fileName = handler.Filename
	}

	fileType := r.FormValue("file_type")
	if fileType == "" {
		fileType = "unknown"
	}

	year := r.FormValue("year")
	if year == "" {
		y := time.Now().Year()
		year = fmt.Sprint(y)
	}

	ll = ll.With().Str("file_category", fileCategory).Str("file_name", fileName).Logger()

	fInfo, err := s.addStorageFile(ctx, file, userID, propertyID, fileName, fileType, fileCategory, address, year)
	if err != nil {
		ll.Error().Err(err).Msg("unable to add file to cloudstorage")
		http.Error(w, "unable to add file to cloudstorage", http.StatusBadRequest)
		return
	}

	ll.Info().Interface("info", fInfo).Msg("successfully stored file in GCS")
	RespondToRequest(w, fInfo)
	return

}

// getFile either downloads an individual file or returns a signed URl.
func (s *Server) getFile(w http.ResponseWriter, r *http.Request) {

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

	fileName, ok := vars["file_name"]
	if !ok {
		ll.Warn().Msg("file name not set")
		http.Error(w, "file name not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_name", fileName).Logger()

	request, ok := vars["request"]
	if !ok {
		ll.Warn().Msg("file type not set")
		http.Error(w, "file type not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("request", request).Logger()

	switch request {
	case "download":
		s.getFileData(ctx, userID, propertyID, fileName, w, r)
		return
	case "signed_url":
		url, err := s.getSignedURL(ctx, userID, propertyID, fileName)
		if err != nil {
			ll.Warn().Err(err).Msg("error getting signed url")
			http.Error(w, "error getting signed url", http.StatusBadRequest)
		}
		RespondToRequest(w, url)
		return
	}

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

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("property id not set")
		http.Error(w, "property id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	fileName, ok := vars["file_name"]
	if !ok {
		ll.Warn().Msg("file name not set")
		http.Error(w, "file name not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_name", fileName).Logger()

	err := s.deleteStorageFile(ctx, userID, propertyID, fileName)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to delete file")
		http.Error(w, "unable to delete file", http.StatusInternalServerError)
		return
	}

	ll.Info().Msg("file deleted successfully")
	w.Write([]byte("success"))
	return
}
