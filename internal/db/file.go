package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

type File struct {
	ID             string     `json:"id",sql:"type:uuid; primary key"`
	UserID         string     `json:"user_id",sql:"type:uuid; foreign key"`
	CreatedAt      *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`

	Name string   `json:"name,omitempty",sql:"type:VARCHAR(45)"`
	Type FileType `json:"type,omitempty",sql:"type:ENUM('mortgage', 'contracting', 'property', 'receipts', 'repairs', 'taxes', 'other')"`
	Year int      `json:"year,omitempty",sql:"type:integer"`

	SizeKB int `json:"size_kb,omitempty",sql:"type:integer"`

	// Path is the path to our file within our GCS bucket.
	Path string `json:"path,omitempty",sql:"varchar(255)"`

	// Metadata contains information about the uploaded file.
	Metadata json.RawMessage `json:"metadata,omitempty",sql:"type:JSONB"`
}

type FileType string

const (
	Other FileType = "Other"
)

func (handle *Handle) AddFile(ctx context.Context, userID string, file *File, propertyIDs []string, addFileToCloudStorage func(ctx context.Context) error) error {

	if file == nil {
		return errors.New("nil file")
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.FirstOrCreate(&file, file).Error; err != nil {
			return err
		}

		// If there are property IDs to associate with this file, we need to create a reference to it.
		for _, propertyID := range propertyIDs {

			propertyID := propertyID

			if propertyID == "" {
				continue
			}

			propertyReference := PropertiesReferences{
				UserID: userID,
				PropertyID: sql.NullString{
					String: propertyID,
					Valid:  true,
				},
				FileID: sql.NullString{
					String: file.ID,
					Valid:  true,
				},
				ExpenseID: sql.NullString{},
			}

			if err := tx.FirstOrCreate(&propertyReference, propertyReference).Error; err != nil {
				return err
			}
		}

		if err := addFileToCloudStorage(ctx); err != nil {
			return err
		}

		return nil
	})
}

func (handle *Handle) GetFileById(userID, fileID string) (*File, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	_, err = uuid.Parse(fileID)
	if err != nil {
		return nil, err
	}

	file := File{}
	if err := handle.DB.Where("user_id = ? AND id = ?", userID, fileID).Find(&file).Error; err != nil {
		return nil, err
	}

	return &file, nil
}

type FilesSummary struct {
	TotalFiles int `json:"total_files,omitempty",sql:"type:integer"`
	FilesTotalSize int `json:"files_total_size,omitempty",sql:"type:integer"`
}

// GetFilesSummaryByUserID will return a summary of a user's currently uploaded
// files. This is so we can display to users what their current file usage is.
func (handle *Handle) GetFilesSummaryByUserID(userID string) (*FilesSummary, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	var filesSummary FilesSummary
	if err := handle.DB.Select("COUNT(*) AS total_files, SUM(size_kb) AS files_total_size").Where("user_id = ?", userID).Table("files").Find(&filesSummary).Error; err != nil {
		return nil, err
	}
	return &filesSummary, nil
}

// GetAllFiles will return all files for a user.
func (handle *Handle) GetAllFiles(userID string) ([]*File, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	// We may need to filter by year if there are too many files.
	var files []*File
	if err := handle.DB.Where("user_id = ?", userID).Find(&files).Error; err != nil {
		return nil, err
	}
	return files, nil
}

func (handle *Handle) GetFilesByProperty(userID, propertyID string) ([]*File, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	_, err = uuid.Parse(propertyID)
	if err != nil {
		return nil, err
	}

	// We need to first query our properties_references table to find which properties have which files.
	var propertyReferences []*PropertiesReferences
	if err := handle.DB.Where("user_id = ? AND property_id = ? AND file_id IS NOT NULL", userID, propertyID).Find(&propertyReferences).Error; err != nil {
		return nil, err
	}

	var filesIDs []string
	for _, propertyReference := range propertyReferences {
		fileID := propertyReference.FileID.String
		if fileID != "" {
			filesIDs = append(filesIDs, fileID)
		}
	}

	if len(filesIDs) == 0 {
		return nil, nil
	}

	// We may need to filter by year if there are too many files.
	var files []*File
	if err := handle.DB.Where("id IN (?)", filesIDs).Find(&files).Error; err != nil {
		return nil, err
	}
	return files, nil
}

func (handle *Handle) DeleteFileByID(ctx context.Context, userID, fileID string, deleteFileFromCloudstorage func(ctx context.Context, filePath string) error) error {

	_, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	_, err = uuid.Parse(fileID)
	if err != nil {
		return err
	}

	var file File
	// We need to fetch the path first of the file.
	if err := handle.DB.Select("path").Where("id = ? AND user_id = ?", fileID, userID).Find(&file).Error; err != nil {
		return err
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {

		filePath := file.Path

		var propertyReferences PropertiesReferences
		// Need to delete file from properties_references if linked to an expense.
		if err := tx.Where("file_id = ? AND user_id = ?", fileID, userID).Delete(&propertyReferences).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}

		if err := tx.Where("id = ? AND user_id = ?", fileID, userID).Delete(&file).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}

		// We _must_ delete from cloudstorage last, because there is no way to rollback cloudstorage operations.
		if filePath != "" {
			if err := deleteFileFromCloudstorage(ctx, filePath); err != nil {
				return err
			}
		}
		return nil
	})
}
