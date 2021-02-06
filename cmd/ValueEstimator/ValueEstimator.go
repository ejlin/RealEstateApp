package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"../../internal/db"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

const (
	estatedAPIURL = "https://apis.estated.com/v4/property"
)

func (cmd *EstimateCmd) GenerateEstimates(ctx context.Context, dbHandle *db.Handle) error {

	estatedRequestURL := fmt.Sprintf("%s?token=%s", estatedAPIURL, cmd.EstatedAPIKey)

	start := time.Now()
	// TODO: get our properties by shard.
	properties, err := dbHandle.GetProperties()
	if err != nil {
		return err
	}

	log.Info().Float64("time_sec", time.Since(start).Seconds()).Msg("finished fetching properties")

	for _, property := range properties {
		err := cmd.GetAndStoreEstimate(dbHandle, property, estatedRequestURL)
		if err != nil {
			log.Warn().Err(err).Str("property_id", property.ID).Msg("unable to get and store estimate")
			// Log and continue.
			continue
		}
	}

	log.Info().Float64("time_sec", time.Since(start).Seconds()).Msg("finished get and store properties")

	return nil
}

/*****************************************************************************/

type EstatedAPIResponse struct {
	Data EstatedAPIData	`json:"data,omitempty"`
	Metadata EstatedAPIMetadata `json:"metadata,omitempty"`
	Warnings []EstatedAPIWarning	`json:"warnings,omitempty"`
}

type EstatedAPIData struct {
	Valuation EstatedAPIDataValuation `json:"valuation,omitempty"`
}

type EstatedAPIDataValuation struct {
	Value float64 `json:"value,omitempty"`
}

/*****************************************************************************/

type EstatedAPIMetadata struct {

}

type EstatedAPIWarning struct {

}

/*****************************************************************************/


func (cmd *EstimateCmd) GetAndStoreEstimate(dbHandle *db.Handle, property *db.Property, requestURL string) error {

	// address := strings.Trim(property.Address, ".")
	propertyRequestURL := fmt.Sprintf("%s&street_address=%s&city=%s&state=%s&zip_code=%s", requestURL, property.Address, property.City, property.State, property.ZipCode)
	propertyRequestURL = strings.Replace(propertyRequestURL, " ", "+", -1)

	resp, err := http.Get(propertyRequestURL)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var estatedResponse EstatedAPIResponse 
	err = json.Unmarshal(body, &estatedResponse)
	if err != nil {
		return err
	}

	estimatedPrice := estatedResponse.Data.Valuation.Value
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