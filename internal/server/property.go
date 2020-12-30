package server

import (
	"github.com/rs/zerolog/log"
)

// PropertiesSummary contains information 
type PropertiesSummary struct {
	TotalProperties int	`json:"total_properties,omitempty"`

	TotalEstimateWorth float64 `json:"total_estimate_worth,omitempty"`
	TotalNetWorth float64	`json:"total_net_worth,omitempty"`

	TotalRent float64	`json:"total_rent,omitempty"`
	TotalCost float64	`json:"total_cost,omitempty"`

	AnnualRateOfReturn float64	`json:"annual_rate_of_return,omitempty"`
	AverageLTV float64	`json:"average_ltv,omitempty"`
	AverageDTI float64	`json:"average_dti,omitempty"`

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

	var totalNetWorth float64
	var totalEstimateWorth float64
	var totalRent float64
	var totalCost float64
	var totalDownPayment float64
	var totalLoan float64
	var missingEstimate bool

	for _, property := range properties {
		totalRent += property.PriceRented
		// totalCost is the mortgage and also the property manager fee.
		totalCost += property.PriceMortgage + (property.PricePropertyManager * property.PriceRented / 100.0)
		totalNetWorth += property.PriceBought
		totalLoan += property.PriceBought - property.PriceDownPayment

		if (property.PriceEstimate == 0.0) {
			missingEstimate = true
			totalEstimateWorth += property.PriceBought
		} else {
			totalEstimateWorth += property.PriceEstimate
		}
		totalDownPayment += property.PriceDownPayment
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
		TotalEstimateWorth: totalEstimateWorth,
		TotalNetWorth: totalNetWorth,
		TotalRent: totalRent,
		TotalCost: totalCost,
		AnnualRateOfReturn: annualRateOfReturn,
		AverageLTV: averageLTV,
		AverageDTI: averageDTI,
		MissingEstimate: missingEstimate,
	}, nil
}

// BoughtDate           string  `json:"bought_date,omitempty",sql:"type:VARCHAR(5)"`
// PriceBought          float64 `json:"price_bought,omitempty",sql:"type:NUMERIC(16,2)"`
// PriceRented          float64 `json:"price_rented,omitempty",sql:"type:NUMERIC(10,2)"`
// PriceEstimate        float64 `json:"price_estimate,omitempty",sql:"type:NUMERIC(16,2)"`
// PriceMortgage        float64 `json:"price_mortgage,omitempty",sql:"type:NUMERIC(12,2)"`
// PriceDownPayment     float64 `json:"price_down_payment,omitempty",sql:"type:NUMERIC(12,2)"`
// PricePropertyManager float64 `json:"price_property_manager,omitempty",sql:"type:NUMERIC(12,2)"`

// MortgageCompany      string       `json:"mortgage_company",sql:"type:VARCHAR(64)"`
// MortgageInterestRate float64      `json:"mortgage_interest_rate",sql:"type:NUMERIC(5,1)"`
// PropertyType         PropertyType `json:"property_type",sql:"type:ENUM('SFH', 'Manufactured', 'Condo/Op', 'Multi-family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial')"`

// OwnerID string `json:"owner_id",sql:"type:uuid; foreign key"`


