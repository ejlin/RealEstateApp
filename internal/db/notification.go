package db

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID string `json:"id,omitempty",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	Body string `json:"body,omitempty",sql:"type:VARCHAR(500)"`
	Seen bool `json:"seen,omitempty",sql:"type:bool"`
	Hide bool `json:"hide,omitempty",sql:"type:bool"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:TIMESTAMP"`
}

func (handle *Handle) GetNotificationsByUser(userID string, includeUnseen bool) ([]*Notification, error) {

	if _, err := uuid.Parse(userID); err != nil {
		return nil, err
	}

	db := handle.DB

	if includeUnseen {
		db = db.Where("seen = True")
	}

	var notifications []*Notification
	if err := db.Where("user_id = ?", userID).Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

func (handle *Handle) AddNotificationByUser(userID string, notification *Notification) error {

	if _, err := uuid.Parse(userID); err != nil {
		return err
	}

	if notification == nil {
		return errors.New("nil notificatioin")
	}

	return handle.DB.FirstOrCreate(&notification, notification).Error
}