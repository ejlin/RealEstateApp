package db

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// User represents a user in our database.
type User struct {

	// Internal fields.
	ID string `json:"id",sql:"type:uuid; primary key"`

	CreatedAt *time.Time `json:"created_at",sql:"type:timestamp"`
	LastLogin *time.Time `json:"last_login",sql:"type:timestamp"`

	// External fields.
	FirstName string `json:"first_name",sql:"type:varchar(90)"`
	LastName  string `json:"last_name",sql:"type:varchar(90)"`
	Password  string `json:"password",sql:"type:varchar(50)"`
	Email     string `json:"email",sql:"type:varchar(50)"`

	Plan PlanType `json:"plan",sql:"type:ENUM('Free', 'Basic', 'Business', 'Enterprise')"`
}

type PlanType string

const (
	Free         PropertyType = "Free"
	Basic PropertyType = "Basic"
	Business      PropertyType = "Business"
	Enterprise  PropertyType = "Enterprise"
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

// GetUserIDByUsername returns the id associated with a username.
func (handle *Handle) GetUserByUsername(username, password string) (*User, error) {

	if username == "" {
		return nil, errors.New("empty username")
	}

	if password == "" {
		return nil, errors.New("empty password")
	}

	var users User
	if err := handle.DB.Where("username = ?", username).Where("password = ?", password).Find(&users).Error; err != nil {
		return nil, err
	}

	return &users, nil
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
