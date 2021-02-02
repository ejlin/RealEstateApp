package server

import (
	"time"
)

/******************************************************************************
HistoricalSummary is a summary per user.
******************************************************************************/

type HistoricalSummary struct {
	Properties []*HistoricalPropertySummary `json:"properties,omitempty"`
}

type HistoricalPropertySummary struct {
	PropertyID string              `json:"property_id,omitempty"`
	Estimates  []*PropertyEstimate `json:"property_estimates,omitempty"`
}

type PropertyEstimate struct {
	CreatedAt *time.Time `json:"created_at,omitempty"`
	Estimate  float64    `json:"estimate,omitempty"`
}


// timeBack is how far back to gather historical default. Default is 1 year.
func (s *Server) calculateHistoricalAnalysis(userID string, timeBack *time.Duration, propertyIDs []string) (*HistoricalSummary, error) {

	if timeBack == nil {
		// 1 year.
		oneYear := 365 * 24 * time.Hour
		timeBack = &oneYear
	}

	propertiesHistoricalData, err := s.DBHandle.GetPropertiesHistoricalDataByUser(userID, *timeBack, propertyIDs)
	if err != nil {
		return nil, err
	}

	propertyToEstimatesSlice := make(map[string][]*PropertyEstimate)
	for _, propertyHistoricalData := range propertiesHistoricalData {
		propertyID := propertyHistoricalData.PropertyID

		propertyEstimate := &PropertyEstimate{
			CreatedAt: propertyHistoricalData.CreatedAt,
			Estimate:  propertyHistoricalData.Estimate,
		}

		if estimateSlice, ok := propertyToEstimatesSlice[propertyID]; !ok {
			propertyToEstimatesSlice[propertyID] = []*PropertyEstimate{
				propertyEstimate,
			}
		} else {
			propertyToEstimatesSlice[propertyID] = append(estimateSlice, propertyEstimate)
		}
	}

	var properties []*HistoricalPropertySummary

	for propertyID, estimates := range propertyToEstimatesSlice {
		propertyID := propertyID
		properties = append(properties, &HistoricalPropertySummary{
			PropertyID: propertyID,
			Estimates:  estimates,
		})
	}

	return &HistoricalSummary{
		Properties: properties,
	}, nil
}
