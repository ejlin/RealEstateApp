package db

import (
	"time"
)

type PropertyManager struct {
	ID string `json:"id,omitempty",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	Name string `json:"name,omitempty",sql:"type:VARCHAR(120)"`
	Email string `json:"email,omitempty",sql:"type:VARCHAR(255)"`
	Phone string `json:"phone,omitempty",sql:"type:VARCHAR(15)"`

	StartDate string `json:"start_date,omitempty",sql:"VARCHAR(7)"`
	EndDate string `json:"end_date,omitempty",sql:"VARCHAR(7)"`
	Active bool `json:"active,omitempty",sql:"BOOL"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`
}
