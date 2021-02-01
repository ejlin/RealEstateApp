package db

import (
	"time"
)

/******************************************************************************

CREATE TABLE properties_historical_data (
	ID UUID PRIMARY KEY,
	USER_ID UUID NOT NULL,
	PROPERTY_ID UUID NOT NULL,
	CREATED_AT TIMESTAMP NOT NULL,
	ESTIMATE NUMERIC(16,2) NOT NULL,
	FOREIGN KEY(USER_ID) REFERENCES USERS(ID),
	FOREIGN KEY(PROPERTY_ID) REFERENCES PROPERTIES(ID)
);

******************************************************************************/

type PropertiesHistoricalData struct {
	ID string `json:"id,omitempty",sql:"type:uuid; primary key"`
	UserID string `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	PropertyID string `json:"property_id,omitempty",sql:"type:uuid; foreign key"`

	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	Estimate             float64 `json:"estimate,omitempty",sql:"type:NUMERIC(16,2)"`
}

// AddPropertiesHistoricalData will add a historical data row to our table.
func (handle *Handle) AddPropertiesHistoricalData(data *PropertiesHistoricalData) error {
	return handle.DB.FirstOrCreate(&PropertiesHistoricalData{}, data).Error
}