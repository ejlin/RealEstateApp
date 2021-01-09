package db

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// User represents a user in our database.
type User struct {

	// Internal fields.
	ID string `json:"id",sql:"type:uuid; primary key"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastLogin *time.Time `json:"last_login,omitempty",sql:"type:timestamp"`

	// External fields.
	FirstName string `json:"first_name,omitempty",sql:"type:varchar(90)"`
	LastName  string `json:"last_name,omitempty",sql:"type:varchar(90)"`
	Password  string `json:"password,omitempty",sql:"type:varchar(50)"`
	Email     string `json:"email,omitempty",sql:"type:varchar(50)"`

	Plan PlanType `json:"plan,omitempty",sql:"type:ENUM('Inactivated', 'Starter', 'Professional', 'Enterprise')"`

	// User settings, corresponds to the "Settings page" in the UI. Contains information about
	// about stuff like "whether to receive marketing emails, etc."
	Settings *json.RawMessage `json:"settings,omitempty",sql:"type:jsonb"`
}

type PlanType string

const (
	Inactivated      PropertyType = "Inactivated"
	Starter     PropertyType = "Starter"
	Professional   PropertyType = "Professional"
	Enterprise PropertyType = "Enterprise"
)

// AddUser will add a new user to the database.
func (handle *Handle) AddUser(user *User) error {

	if user == nil {
		return errors.New("nil user")
	}

	return handle.DB.FirstOrCreate(&user, user).Error
}

// GetUser will return an existing user from the database.
func (handle *Handle) GetUserByID(id string) (*User, error) {

	_, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var user User
	if err := handle.DB.Where("id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (handle *Handle) GetUserByEmail(email, password string) (*User, error) {

	if email == "" {
		return nil, errors.New("empty email")
	}

	if password == "" {
		return nil, errors.New("empty password")
	}

	var users User
	if err := handle.DB.Where("email = ?", email).Where("password = ?", password).Find(&users).Error; err != nil {
		return nil, err
	}

	return &users, nil
}

// GetSettingsByUserID returns a user's individual settings.
func (handle *Handle) GetSettingsByUserID(id string) (*json.RawMessage, error) {
	_, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var user User
	if err := handle.DB.Select("settings").Where("id = ?", id).Find(&user).Error; err != nil {
		return nil, err
	}

	return user.Settings, nil
}

func (handle *Handle) UpdateSettingsProfileByUser(id string, m map[string]interface{}) error {
	_, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	var user User
	return handle.DB.Model(&user).Updates(m).Error
}

func (handle *Handle) UpdateSettingsPreferencesByUser(id string, settings *json.RawMessage) error {
	_, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	var user User
	return handle.DB.Model(&user).UpdateColumn("settings", settings).Error
}