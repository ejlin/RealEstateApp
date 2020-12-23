package server

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/rs/zerolog/log"
	"google.golang.org/api/iterator"
)

const (
	address      = "address"
	fileCategory = "file_category"
	year         = "year"

	fileType = "file_type"
)

type FileInfo struct {
	Name string `json:"name"`
	// PropertyID is the id of the property with which this file is associated with.
	PropertyID string `json:"property_id"`
	Address    string `json:"address"`
	Year       string `json:"year"`

	FileCategory string `json:"file_category"`

	Metadata FileMetadata `json:"file_metadata"`
}

// FileMetadata contains metadata information about the file. Note, this is NOT the same as
// the "metadata" field for every GCS object.
type FileMetadata struct {
	FileType     string     `json:"file_type"`
	UploadedAt   *time.Time `json:"uploaded_at"`
	LastEditedAt *time.Time `json:"last_edited_at"`
}

// Files are store in the following directory format in our bucket.
// `{bucket_name}/{user_id}/{property}`

// getFileslistByUser will return all files associated with this user.
func (s *Server) getCloudFileslistByUser(ctx context.Context, userID string) ([]*FileInfo, error) {

	tCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	// sanitize the input.
	prefix := strings.Trim(userID, "/")

	filesInfo, err := getFilesAtPrefix(tCtx, s.StorageClient, s.UsersBucket, prefix)
	if err != nil {
		return nil, err
	}

	var sanitizedFilesInfo []*FileInfo

	for _, fileInfo := range filesInfo {
		name := fileInfo.Name
		dir := strings.Split(name, "/")
		if len(dir) < 2 {
			// format should be {property_id}/{file_name}
			continue
		}

		name = dir[len(dir)-1]

		sanitizedFilesInfo = append(sanitizedFilesInfo, &FileInfo{
			Name:       name,
			PropertyID: dir[0],
			Metadata:   fileInfo.Metadata,
		})
	}
	return sanitizedFilesInfo, nil
}

// getFileslistByUserAndPropertyId returns all the files associated with a certain property.
func (s *Server) getFileslistByUserAndPropertyId(ctx context.Context, userID, propertyID string) ([]*FileInfo, error) {

	tCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	prefix := path.Join(userID, propertyID)
	return getFilesAtPrefix(tCtx, s.StorageClient, s.UsersBucket, prefix)
}

// getFileData is used for downloading files.
func (s *Server) getFileData(ctx context.Context, userID, propertyID, fileName string, w http.ResponseWriter, r *http.Request) ([]byte, error) {

	tCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	filePath := path.Join(userID, propertyID, fileName)

	ll := log.With().Str("file_path", filePath).Logger()

	rc, err := s.StorageClient.Bucket(s.UsersBucket).Object(filePath).NewReader(tCtx)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to create new reader")
		return nil, fmt.Errorf("unable to create new reader: %s, %w", filePath, err)
	}

	defer rc.Close()

	contentType := rc.ContentType()
	disposition := "attachment"

	if strings.Contains(contentType, "image") || strings.Contains(contentType, "pdf") {
		disposition = "inline"
	}

	size := strconv.FormatInt(rc.Size(), 10)

	w.Header().Set("Content-Disposition", disposition+"; filename='"+fileName+"'")
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Length", size)

	_, err = io.Copy(w, rc)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to copy content to writer")
		return nil, err
	}

	return nil, nil
}

// addStorageFile adds a new file to cloudstorage bucket.
func (s *Server) addStorageFile(ctx context.Context, f io.Reader, userID, propertyID, fileName, fileType, fileCategory, year string) (*FileInfo, error) {

	tCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	prefix := path.Join(userID, propertyID)
	key := path.Join(prefix, fileName)

	o := s.StorageClient.Bucket(s.UsersBucket).Object(key)
	wc := o.NewWriter(tCtx)

	wc.Metadata = map[string]string{
		"property_id": propertyID,
		"year":        year,
		"file_type":   fileType,
	}

	if _, err := io.Copy(wc, f); err != nil {
		return nil, err
	}

	if err := wc.Close(); err != nil {
		return nil, err
	}

	t := time.Now().UTC()

	return &FileInfo{
		Name:         fileName,
		PropertyID:   propertyID,
		Year:         year,
		Address:      address,
		FileCategory: fileCategory,
		Metadata: FileMetadata{
			FileType:     fileType,
			UploadedAt:   &t,
			LastEditedAt: &t,
		},
	}, nil
}

// deleteFile removes a file from cloudstorage bucket.
func (s *Server) deleteStorageFile(ctx context.Context, userID, propertyID, fileName string) error {

	tCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	key := path.Join(userID, propertyID, fileName)

	o := s.StorageClient.Bucket(s.UsersBucket).Object(key)
	if err := o.Delete(tCtx); err != nil {
		return err
	}
	return nil
}

// getSignedURL returns a signed url.
func (s *Server) getSignedURL(ctx context.Context, userID, propertyID, fileName string) (string, error) {

	key := path.Join(userID, propertyID, fileName)

	ll := log.With().Str("key", key).Logger()

	url, err := storage.SignedURL(s.UsersBucket, key, &storage.SignedURLOptions{
		GoogleAccessID: s.GoogleAccessID,
		PrivateKey:     []byte(s.GooglePrivateKey),
		Method:         "GET",
		Expires:        time.Now().Add(24 * time.Hour),
	})

	if err != nil {
		ll.Warn().Err(err).Msg("unable to generate signed url")
		return "", err
	}

	ll.Info().Msg("generated signed url")
	return url, nil
}

/*** Helper Functions ***/

func getFilesAtPrefix(ctx context.Context, cli *storage.Client, bucket, prefix string) ([]*FileInfo, error) {

	it := cli.Bucket(bucket).Objects(ctx, &storage.Query{
		Prefix: prefix + "/",
	})

	var fileInfos []*FileInfo

	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Info().Err(err).Str("prefix", prefix).Msg("error iterating through files")
			return nil, err
		}

		if fInfo := getFileInfoFromAttrs(attrs, prefix); fInfo != nil {
			fileInfos = append(fileInfos, fInfo)
		}
	}

	return fileInfos, nil
}

func getFileInfoFromAttrs(attrs *storage.ObjectAttrs, prefix string) *FileInfo {
	name := strings.Trim(strings.TrimPrefix(attrs.Name, prefix), "/")
	if name != "" && name != "/" {
		fInfo := &FileInfo{
			Name: name,
			Metadata: FileMetadata{
				UploadedAt:   &attrs.Created,
				LastEditedAt: &attrs.Updated,
			},
		}

		metadata := attrs.Metadata

		if fileCategory, ok := metadata[fileCategory]; ok {
			fInfo.FileCategory = fileCategory
		}

		if address, ok := metadata[address]; ok {
			fInfo.Address = address
		}

		if year, ok := metadata[year]; ok {
			fInfo.Year = year
		}

		if fileType, ok := metadata[fileType]; ok {
			fInfo.Metadata.FileType = fileType
		}
		return fInfo
	}
	return nil
}
