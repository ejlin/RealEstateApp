package db

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Property represents a property in our database.
type Property struct {
	ID        string     `json:"id",sql:"type:uuid; primary key"`
	CreatedAt *time.Time `json:"created_at",sql:"type:timestamp"`

	Address string `json:"address",sql:"type:VARCHAR(75)"`
	State   string `json:"state",sql:"type:VARCHAR(2)"`
	City    string `json:"city",sql:"type:VARCHAR(50)"`
	ZipCode string `json:"zip_code",sql:"type:VARCHAR(10)"`

	BoughtDate           string  `json:"bought_date",sql:"type:VARCHAR(5)"`
	PriceBought          float64 `json:"price_bought",sql:"type:NUMERIC(16,2)"`
	PriceRented          float64 `json:"price_rented",sql:"type:NUMERIC(10,2)"`
	PriceEstimate        float64 `json:"price_estimate",sql:"type:NUMERIC(16,2)"`
	PriceMortgage        float64 `json:"price_mortgage",sql:"type:NUMERIC(12,2)"`
	PriceDownPayment     float64 `json:"price_down_payment",sql:"type:NUMERIC(12,2)"`
	PricePropertyManager float64 `json:"price_property_manager",sql:"type:NUMERIC(12,2)"`

	MortgageCompany      string       `json:"mortgage_company",sql:"type:VARCHAR(64)"`
	MortgageInterestRate float64      `json:"mortgage_interest_rate",sql:"type:NUMERIC(5,1)"`
	PropertyType         PropertyType `json:"property_type",sql:"type:ENUM('SFH', 'Manufactured', 'Condo/Op', 'Multi-family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial')"`

	OwnerID string `json:"owner_id",sql:"type:uuid; foreign key"`
}

type PropertyType string

const (
	SFH          PropertyType = "SFH"
	Manufactured PropertyType = "Manufactured"
	CondoOp      PropertyType = "Condo/Op"
	MultiFamily  PropertyType = "Multi-family"
	Apartment    PropertyType = "Apartment"
	LotLand      PropertyType = "Lot/Land"
	Townhome     PropertyType = "Townhome"
	Commercial   PropertyType = "Commercial"
)

// AddPropertyByUser will add a record of a property for a user.
func (handle *Handle) AddPropertyByUser(userID string, property *Property) error {

	_, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	if property == nil {
		return errors.New("nil property")
	}

	return handle.DB.FirstOrCreate(&property, property).Error
}

// GetPropertyByID will fetch the property by its unique ID.
func (handle *Handle) GetPropertyByID(propertyID string) (*Property, error) {

	_, err := uuid.Parse(propertyID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var property Property
	if err := handle.DB.Where("id = ?", propertyID).First(&property).Error; err != nil {
		return nil, err
	}
	return &property, nil
}

// GetPropertiesByOwner will fetch all properties associated with a user.
func (handle *Handle) GetPropertiesByOwner(userID string) ([]*Property, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var properties []*Property
	if err := handle.DB.Where("owner_id = ?", userID).Find(&properties).Error; err != nil {
		return nil, err
	}
	return properties, nil
}

// RemovePropertyByID will delete a property from our database.
func (handle *Handle) RemovePropertyByID(ownerID, propertyID string) error {

	// TODO: eric.lin to explore gorm soft delete options. Provide users with undo method.

	_, err := uuid.Parse(ownerID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	_, err = uuid.Parse(propertyID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	property := Property{
		ID: propertyID,
	}

	delete := handle.DB.Where("owner_id = ?", ownerID).Delete(&property)
	if err := delete.Error; err != nil {
		return err
	}

	if delete.RowsAffected != 1 {
		return fmt.Errorf("incorrect number of properties deleted: %d", delete.RowsAffected)
	}
	return nil
}
