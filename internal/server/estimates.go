package server

import (
	"fmt"
	"time"

	"../../internal/db"

	"github.com/google/uuid"
)

func StoreEstimate (dbHandle *db.Handle, property *db.Property, estimatedPrice int) error {
	if estimatedPrice != 0 {
		updates := map[string]interface{}{
			"estimate": estimatedPrice,
		}
		
		// TODO: el (look into batching our property updates)
		updatePropertyErr := dbHandle.UpdateProperty(property.ID, updates)

		now := time.Now()

		data := &db.PropertiesHistoricalData{
			ID: uuid.New().String(),
			UserID: property.UserID,
			PropertyID: property.ID,
			CreatedAt: &now,
			Estimate: estimatedPrice,
		}

		addHistoricalDataErr := dbHandle.AddPropertiesHistoricalData(data)

		if addHistoricalDataErr != nil {
			return fmt.Errorf("unable to add historical data: %w", addHistoricalDataErr)
		}

		if updatePropertyErr != nil {
			return fmt.Errorf("unable to update property: %w", updatePropertyErr)
		}
	}
	return nil
}