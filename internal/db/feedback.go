package db

import (
	"time"

	"github.com/google/uuid"
)

type FeedbackForm struct {
	ID string `json:"id",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid"`
	UserEmail string `json:"user_email,omitempty",sql:"type:varchar(255)"`
	UserFirstName string `json:"user_first_name,omitempty",sql:"type:varchar(90)"`
	UserLastName string `json:"user_last_name,omitempty",sql:"type:varchar(90)"`

	Type string `json:"plan,omitempty",sql:"type:ENUM('general', 'feature_request', 'bug_report', 'security_issue', 'account_issue')"`
	Severity string `json:"plan,omitempty",sql:"type:ENUM('p1', 'p2', 'p3', 'p4')"`
	
	Title string `json:"title,omitempty",sql:"type:varchar(90)"`
	Body string `json:"body,omitempty",sql:"type:varchar(1000)"`
	
	ContactAgreed bool `json:"contact_agreed,omitempty",sql:"type:boolean"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
}

func (handle *Handle) AddFeedback(feedback *FeedbackForm) error {
	return handle.DB.FirstOrCreate(&feedback, feedback).Error
}

func (handle *Handle) GetFeedbackByID(id string) (*FeedbackForm, error) {

	if _, err := uuid.Parse(id); err != nil {
		return nil, err
	}

	var feedbackForm FeedbackForm
	if err := handle.DB.Where("id = ?", id).First(&feedbackForm).Error; err != nil {
		return nil, err
	}
	return &feedbackForm, nil
}

func (handle *Handle) GetFeedbackByUser(user_id string) ([]*FeedbackForm, error) {
	
	if _, err := uuid.Parse(user_id); err != nil {
		return nil, err
	}

	var feedbackForms []*FeedbackForm
	if err := handle.DB.Where("user_id = ?", user_id).First(&feedbackForms).Error; err != nil {
		return nil, err
	}
	return feedbackForms, nil
}