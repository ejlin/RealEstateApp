package db

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Property represents a property in our database.
type Property struct {
	ID        string     `json:"id,omitempty",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	
	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`

	AddressOne string `json:"address_one,omitempty",sql:"type:VARCHAR(75)"`
	AddressTwo string `json:"address_two,omitempty",sql:"type:VARCHAR(75)"`
	State   string `json:"state,omitempty",sql:"type:VARCHAR(2)"`
	City    string `json:"city,omitempty",sql:"type:VARCHAR(50)"`
	ZipCode string `json:"zip_code,omitempty",sql:"type:VARCHAR(10)"`

	BoughtDate           string  `json:"bought_date,omitempty",sql:"type:VARCHAR(5)"`
	PriceBought          float64 `json:"price_bought,omitempty",sql:"type:NUMERIC(16,2)"`
	PriceRented          float64 `json:"price_rented,omitempty",sql:"type:NUMERIC(10,2)"`
	Estimate             float64 `json:"estimate,omitempty",sql:"type:NUMERIC(16,2)"`
	PriceMortgage        float64 `json:"price_mortgage,omitempty",sql:"type:NUMERIC(12,2)"`
	DownPayment          float64 `json:"down_payment,omitempty",sql:"type:NUMERIC(12,2)"`

	MortgageCompany      string       `json:"mortgage_company,omitempty",sql:"type:VARCHAR(64)"`
	MortgageInterestRate float64      `json:"mortgage_interest_rate,omitempty",sql:"type:NUMERIC(5,1)"`
	PropertyType         PropertyType `json:"property_type,omitempty",sql:"type:ENUM('SFH', 'Manufactured', 'Condo/Op', 'Multi-family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial')"`

	NumUnits      int `json:"num_units,omitempty",sql:"type:INT"`
	NumBeds       int `json:"num_beds,omitempty",sql:"type:INT"`
	NumBaths      float64 `json:"num_baths,omitempty",sql:"type:Numeric(4,1)"`
	SquareFootage int `json:"square_footage,omitempty",sql:"type:INT"`

	// The day the user can expect rent to come in for this property.
	RentPaymentDate     int `json:"rent_payment_date,omitempty",sql:"type:INT"`
	MortgagePaymentDate int `json:"mortgage_payment_date,omitempty",sql:"type:INT"`

	CurrentlyRented bool `json:"currently_rented,omitempty",sql:"type:BOOLEAN"`
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

// GetProperties will find all of the properties in the table.
// TODO: Shard properties.
func (handle *Handle) GetProperties() ([]*Property, error) {

	var properties []*Property
	if err := handle.DB.Select("id, user_id, address_one, address_two, state, city, zip_code").Find(&properties).Error; err != nil {
		return nil, err
	}
	return properties, nil
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

// GetPropertiesAddressesByOwner will fetch all properties associated with a user.
func (handle *Handle) GetPropertiesAddressesByOwner(userID string) ([]*Property, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var properties []*Property
	if err := handle.DB.Select("id, address_one, address_two").Where("user_id = ?", userID).Find(&properties).Error; err != nil {
		return nil, err
	}
	return properties, nil
}

// GetPropertiesByOwner will fetch all properties associated with a user.
func (handle *Handle) GetPropertiesByOwner(userID string) ([]*Property, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var properties []*Property
	if err := handle.DB.Where("user_id = ?", userID).Find(&properties).Error; err != nil {
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

	db := handle.DB.Where("user_id = ?", userID)
	
	if propertyIDs != nil && len(propertyIDs) > 0 {
		db = db.Where("id IN (?)", propertyIDs)
	}

	if propertyTypes != nil && len(propertyIDs) > 0 {
		db = db.Where("property_type IN (?)", propertyTypes)
	}

	var properties []*Property
	if err := db.Find(&properties).Error; err != nil {
		return nil, err
	}
	return properties, nil

}

func (handle *Handle) UpdateProperty(propertyID string, updates map[string]interface{}) error {

	_, err := uuid.Parse(propertyID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	if err := handle.DB.Model(&Property{}).Where("id = ?", propertyID).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}

// RemovePropertyByID will delete a property from our database.
func (handle *Handle) RemovePropertyByID(userID, propertyID string) error {

	// TODO: eric.lin to explore gorm soft delete options. Provide users with undo method.

	_, err := uuid.Parse(userID)
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

	delete := handle.DB.Where("user_id = ?", userID).Delete(&property)
	if err := delete.Error; err != nil {
		return err
	}

	if delete.RowsAffected != 1 {
		return fmt.Errorf("incorrect number of properties deleted: %d", delete.RowsAffected)
	}
	return nil
}
