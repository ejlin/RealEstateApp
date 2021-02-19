package db

import (
	"time"
)

type Tenant struct {
	ID string `json:"id,omitempty",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	PropertyID string `json:"property_id,omitempty",sql:"type:uuid; foreign key"`
	Name string `json:"name,omitempty",sql:"type:VARCHAR(120)"`
	Email string `json:"email,omitempty",sql:"type:VARCHAR(255)"`
	Phone string `json:"phone,omitempty",sql:"type:VARCHAR(15)"`

	StartDate string `json:"start_date,omitempty",sql:"VARCHAR(7)"`
	EndDate string `json:"end_date,omitempty",sql:"VARCHAR(7)"`
	Active bool `json:"active,omitempty",sql:"BOOL"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`
}

func AddTenantByUser(userID string, tenant *Tenant) error {

	_, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	if tenant == nil {
		return errors.New("nil tenant")
	}

	return handle.DB.FirstOrCreate(&tenant, tenant).Error
}

func GetTenantsByPropertyID(userID, propertyID string) ([]*Tenant, error) {

	if _, err := uuid.Parse(userID); err != nil {
		return nil, err
	}

	if _, err := uuid.Parse(propertyID); err != nil {
		return nil, err
	}

	var tenants []*Tenant
	if err := handle.DB.Where("user_ud = ? AND property_id = ?", userID, propertyID).First(&tenants).Error; err != nil {
		return nil, err
	}
	return tenants, nil
}