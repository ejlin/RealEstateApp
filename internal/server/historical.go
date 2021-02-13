package server

import (
	"strconv"
	"strings"
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
	Month int `json:"month,omitempty"`
	Year int `json:"year,omitempty"`
	Estimate  float64    `json:"estimate,omitempty"`
}


// timeBack is how far back to gather historical default. Default is 1 year.
func (s *Server) calculateHistoricalAnalysis(userID string, propertyIDs []string, timeBack *time.Duration) (*HistoricalSummary, error) {

	if timeBack == nil {
		// 1 year.
		oneYear := 365 * 24 * time.Hour
		timeBack = &oneYear
	}

	propertiesHistoricalData, err := s.DBHandle.GetPropertiesHistoricalDataByUser(userID, *timeBack, propertyIDs)
	if err != nil {
		return nil, err
	}

	propertyToEstimatesSliceMap := make(map[string][]*PropertyEstimate)
	for _, propertyHistoricalData := range propertiesHistoricalData {
		propertyID := propertyHistoricalData.PropertyID

		createdAt := propertyHistoricalData.CreatedAt

		propertyEstimate := &PropertyEstimate{
			Month: int(createdAt.Month()),
			Year: int(createdAt.Year()),
			Estimate:  propertyHistoricalData.Estimate,
		}

		if estimateSlice, ok := propertyToEstimatesSliceMap[propertyID]; !ok {
			propertyToEstimatesSliceMap[propertyID] = []*PropertyEstimate{
				propertyEstimate,
			}
		} else {
			propertyToEstimatesSliceMap[propertyID] = append(estimateSlice, propertyEstimate)
		}
	}

	var properties []*HistoricalPropertySummary

	// Find the averages per month per property.
	for propertyID, propertyToEstimatesSlice := range propertyToEstimatesSliceMap {

		m := make(map[string][]*PropertyEstimate)
		// First, bucket by month+year -> all the estimates we have for that key.
		for _, estimate := range propertyToEstimatesSlice {
			key := strconv.Itoa(estimate.Month) + "-" + strconv.Itoa(estimate.Year)
			if slice, ok := m[key]; ok {
				slice = append(slice, estimate)
			} else {
				m[key] = []*PropertyEstimate{estimate}
			}
		}

		var estimates []*PropertyEstimate

		// average out all the values we have. 
		for key, estimateSlice := range m {
			if (len(estimateSlice) > 0){
				splitKey := strings.Split(key, "-")
				if (len(splitKey) != 2) {
					continue
				}
				month, err := strconv.Atoi(splitKey[0])
				if err != nil {
					continue
				}
				year, err := strconv.Atoi(splitKey[1])
				if err != nil {
					continue
				}

				totalEstimate := 0.0
				for _, estimate := range estimateSlice {
					totalEstimate += estimate.Estimate
				}
				averageEstimate := totalEstimate / float64(len(estimateSlice))
				estimates = append(estimates, &PropertyEstimate {
					Month: month,
					Year: year,
					Estimate: averageEstimate,
				})
			}
		}
		properties = append(properties,
			&HistoricalPropertySummary {
				PropertyID: propertyID,
				Estimates: estimates,
			},
		)
	}

	return &HistoricalSummary{
		Properties: properties,
	}, nil
}
