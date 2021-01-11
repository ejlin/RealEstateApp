package db

import (
	"errors"
	"time"
	
	"github.com/jinzhu/gorm"
)

type File struct {
	ID        string     `json:"id",sql:"type:uuid; primary key"`
	UserID string `json:"user_id",sql:"type:uuid; foreign key"`
	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`

	Name string `json:"name,omitempty",sql:"type:VARCHAR(45)"`
	Type FileType `json:"type,omitempty",sql:"type:ENUM('mortgage', 'contracting', 'property', 'receipts', 'repairs', 'taxes', 'other')"`
	Year int `json:"year,omitempty",sql:"type:integer"`
	Path string `json:"path,omitempty",sql:"varchar(255)"`
}

type FileType string

func (handle *Handle) AddFile(file *File, propertyID string) error {
	
	if file == nil {
		return errors.New("nil file")
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {
		
		if err := tx.FirstOrCreate(&file, file).Error; err != nil {
			return err
		}

		propertyReference := PropertiesReferences {
			PropertyID: propertyID,
		}

		if err := tx.FirstOrCreate(&propertyReference, propertyReference).Error; err != nil {
			return err
		}

		return nil
	})
}