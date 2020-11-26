package db

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// User represents a user.
type User struct {

	// Internal fields.
	ID 	string 	`json:"id",sql:"type:uuid; primary key"`

	CreatedAt *time.Time	`json:"created_at",sql:"type:timestamp"`
	LastLogin *time.Time	`json:"last_login",sql:"type:timestamp"`

	// External fields.
	FirstName string `json:"first_name",sql:"type:varchar(90)"`
	LastName string `json:"last_name",sql:"type:varchar(90)"`
	Username string	`json:"username",sql:"type:varchar(50)"`
	Password string	`json:"password",sql:"type:varchar(50)"`
	Email string	`json:"email",sql:"type:varchar(50)"`
}



// AddUser will add a new user to the database.
func (handle *Handle) AddUser(user *User) (error) {

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
func (handle *Handle) GetUserIDByUsername(username, password string) (string, error) {

	if username == "" {
		return "", errors.New("empty username")
	}

	if password == "" {
		return "", errors.New("empty password")
	}

	var users User
	if err := handle.DB.Select("id").Where("username = ?", username).Where("password = ?", password).Find(&users).Error; err != nil {
		return "", err
	}

	if users.ID == "" {
		return "", errors.New("database returned empty user id")
	}
	return users.ID, nil
}

func (handle *Handle) GetUserIDByEmail(email, password string) (string, error) {

	if email == "" {
		return "", errors.New("empty email")
	}

	if password == "" {
		return "", errors.New("empty password")
	}

	var users User
	if err := handle.DB.Select("id").Where("email = ?", email).Where("password = ?", password).Find(&users).Error; err != nil {
		return "", err
	}

	if users.ID == "" {
		return "", errors.New("database returned empty user id")
	}
	return users.ID, nil
}