package db

import (
	"errors"
	"time"

	"github.com/google/uuid"
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

func (handle *Handle) AddFile(file *File, propertyID string) error {

	if file == nil {
		return errors.New("nil file")
	}

	if err := handle.DB.FirstOrCreate(&file, file).Error; err != nil {
		return err
	}

	return nil
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
