package db

import (
	"database/sql"
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

	// Path is the path to our file within our GCS bucket.
	Path string `json:"path,omitempty",sql:"varchar(255)"`
}

type FileType string

const (
	Other FileType = "Other"
)

func (handle *Handle) AddFile(file *File, propertyID []string) error {

	if file == nil {
		return errors.New("nil file")
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.FirstOrCreate(&file, file).Error; err != nil {
			return err
		}

		// If there are property IDs to associate with this file, we need to create a reference to it.
		for _, propertyID := range propertyID {

			propertyID := propertyID

			propertyReference := PropertiesReferences{
				PropertyID: sql.NullString{
					String: propertyID,
					Valid:  true,
				},
				FileID: sql.NullString{
					String: file.ID,
					Valid:  true,
				},
			}
			if err := tx.FirstOrCreate(&propertyReference, propertyReference).Error; err != nil {
				return err
			}
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
	if err := handle.DB.Where("user_id = ? AND property_id = ? AND file_id NOT NULL", userID, propertyID).Find(&propertyReferences).Error; err != nil {
		return nil, err
	}

	var files []*File

	for _, propertyReference := range propertyReferences {

		fileID := propertyReference.FileID.String
		if fileID != "" {
			file := &File{}
			if err := handle.DB.Where("id = ?", fileID).Find(&file).Error; err != nil {
				continue
			}
			files = append(files, file)
		}	
	}
	return files, nil
}