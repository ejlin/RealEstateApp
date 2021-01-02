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

	BoughtDate           string  `json:"bought_date,omitempty",sql:"type:VARCHAR(5)"`
	PriceBought          float64 `json:"price_bought,omitempty",sql:"type:NUMERIC(16,2)"`
	PriceRented          float64 `json:"price_rented,omitempty",sql:"type:NUMERIC(10,2)"`
	Estimate        float64 `json:"estimate,omitempty",sql:"type:NUMERIC(16,2)"`
	PriceMortgage        float64 `json:"price_mortgage,omitempty",sql:"type:NUMERIC(12,2)"`
	DownPayment     float64 `json:"down_payment,omitempty",sql:"type:NUMERIC(12,2)"`
	PricePropertyManager float64 `json:"price_property_manager,omitempty",sql:"type:NUMERIC(12,2)"`

	MortgageCompany      string       `json:"mortgage_company,omitempty",sql:"type:VARCHAR(64)"`
	MortgageInterestRate float64      `json:"mortgage_interest_rate,omitempty",sql:"type:NUMERIC(5,1)"`
	PropertyType         PropertyType `json:"property_type,omitempty",sql:"type:ENUM('SFH', 'Manufactured', 'Condo/Op', 'Multi-family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial')"`

	NumUnits int `json:"num_units,omitempty",sql:"type:INT"`
	NumBeds int `json:"num_beds,omitempty",sql:"type:INT"`
	NumBaths int `json:"num_baths,omitempty",sql:"type:INT"`
	SquareFootage int `json:"square_footage,omitempty",sql:"type:INT"`

	// The day the user can expect rent to come in for this property.
	RentPaymentDate int `json:"rent_payment_date,omitempty",sql:"type:INT"`
	MortgagePaymentDate int `json:"mortgage_payment_data,omitempty",sql:"type:INT"`

	CurrentlyRented bool `json:"currently_rented,omitempty",sql:"type:BOOLEAN"`

	OwnerID string `json:"owner_id,omitempty",sql:"type:uuid; foreign key"`
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

// GetSpecificPropertiesByOwner
func (handle *Handle) GetSpecificPropertiesByOwner(userID string, propertyIDs []string, propertyTypes []string) ([]*Property, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var properties []*Property

	// Find all properties.
	if propertyIDs == nil && propertyTypes == nil {
		if err := handle.DB.Where("owner_id = ?", userID).Find(&properties).Error; err != nil {
			return nil, err
		}
		return properties, nil
	}

	// Find properties that are in the union of these two.
	if err := handle.DB.Where("owner_id = ? AND id IN ? AND property_type IN ?", userID, propertyIDs, propertyTypes).Find(&properties).Error; err != nil {
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
