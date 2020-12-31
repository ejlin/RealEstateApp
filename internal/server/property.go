package server

import (
	"github.com/rs/zerolog/log"
)

// RentPaymentAtDateSummary contains information about how many properties are paying rent
// and the total rent paid.
type RentPaymentAtDateSummary struct {
	NumProperties int `json:"num_properties,omitempty"`
	TotalRent float64 `json:"total_rent,omitempty"`
}

// PropertiesSummary contains information 
type PropertiesSummary struct {
	TotalProperties int	`json:"total_properties,omitempty"`
	TotalCurrentlyRented int `json:"total_currently_rented,omitempty"`

	TotalEstimateWorth float64 `json:"total_estimate_worth,omitempty"`
	TotalNetWorth float64	`json:"total_net_worth,omitempty"`

	TotalRent float64	`json:"total_rent,omitempty"`
	TotalCost float64	`json:"total_cost,omitempty"`

	AnnualRateOfReturn float64	`json:"annual_rate_of_return,omitempty"`
	AverageLTV float64	`json:"average_ltv,omitempty"`
	AverageDTI float64	`json:"average_dti,omitempty"`

	RentPaymentDateMap map[int]*RentPaymentAtDateSummary `json:"rent_payment_date_map,omitempty"`
	MortgagePaymentDateMap map[int]int `json:"mortgage_payment_date_map,omitempty"`

	MissingEstimate bool	`json:"missing_estimate,omitempty"`
}

func (s *Server) calculatePropertiesSummary(userID string) (*PropertiesSummary, error) {

	ll := log.With().Str("user_id", userID).Logger()

	properties, err := s.DBHandle.GetPropertiesByOwner(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get properties by owner")
		return nil, err
	}

	// todo: fetch the user salary.
	var totalCurrentlyRented int
	var totalNetWorth float64
	var totalEstimateWorth float64
	var totalRent float64
	var totalCost float64
	var totalDownPayment float64
	var totalLoan float64
	var missingEstimate bool

	rentPaymentDateMap := make(map[int]*RentPaymentAtDateSummary)
	// TODO: make this a map to mortgage IDs
	mortgagePaymentDateMap := make(map[int]int)

	for _, property := range properties {

		if (property.CurrentlyRented) {
			totalCurrentlyRented++
		}
		totalRent += property.PriceRented
		// totalCost is the mortgage and also the property manager fee.
		totalCost += property.PriceMortgage + (property.PricePropertyManager * property.PriceRented / 100.0)
		totalNetWorth += property.PriceBought
		totalLoan += property.PriceBought - property.PriceDownPayment

		if property.PriceEstimate == 0.0 {
			missingEstimate = true
			totalEstimateWorth += property.PriceBought
		} else {
			totalEstimateWorth += property.PriceEstimate
		}
		totalDownPayment += property.PriceDownPayment
		if property.CurrentlyRented && property.PriceRented != 0.0 && property.RentPaymentDate != 0 {
			if rentPaymentAtDateSummary, ok := rentPaymentDateMap[property.RentPaymentDate]; ok {
					rentPaymentAtDateSummary.NumProperties++
					rentPaymentAtDateSummary.TotalRent += property.PriceRented
			} else {
				rentPaymentDateMap[property.RentPaymentDate] = &RentPaymentAtDateSummary {
					NumProperties: 1,
					TotalRent: property.PriceRented,
				}
			}
		}

		if property.MortgagePaymentDate != 0 {
			mortgagePaymentDateMap[property.MortgagePaymentDate]++
		}
	}

	averageLTV := totalLoan / totalEstimateWorth * 100.0;
	userMonthlySalary := 0.0
	// if (user.Salary != 0.0) {
	// 	userMonthlySalary = user.Salary / 12.0
	// }
	averageDTI := totalCost / (totalRent + userMonthlySalary) * 100.0
	annualRateOfReturn := (totalRent - totalCost) / totalDownPayment * 100.0 * 12.0

	return &PropertiesSummary{
		TotalProperties: len(properties),
		TotalCurrentlyRented: totalCurrentlyRented,
		TotalEstimateWorth: totalEstimateWorth,
		TotalNetWorth: totalNetWorth,
		TotalRent: totalRent,
		TotalCost: totalCost,
		AnnualRateOfReturn: annualRateOfReturn,
		AverageLTV: averageLTV,
		AverageDTI: averageDTI,
		RentPaymentDateMap: rentPaymentDateMap,
		MortgagePaymentDateMap: mortgagePaymentDateMap,
		MissingEstimate: missingEstimate,
	}, nil
}

