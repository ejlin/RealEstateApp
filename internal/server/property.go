package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"../db"
	"../../external"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

// RentPaymentAtDateSummary contains information about how many properties are paying rent
// and the total rent paid.
type RentPaymentAtDateSummary struct {
	NumProperties int     `json:"num_properties,omitempty"`
	TotalRent     float64 `json:"total_rent,omitempty"`
}

// PropertiesSummary contains information about multiple properties.
type PropertiesSummary struct {
	TotalProperties      int `json:"total_properties,omitempty"`
	TotalCurrentlyRented int `json:"total_currently_rented,omitempty"`

	TotalEstimateWorth float64 `json:"total_estimate_worth,omitempty"`
	TotalNetWorth      float64 `json:"total_net_worth,omitempty"`

	TotalRent float64 `json:"total_rent,omitempty"`
	TotalCost float64 `json:"total_cost,omitempty"`

	AnnualRateOfReturn float64 `json:"annual_rate_of_return,omitempty"`
	AverageLTV         float64 `json:"average_ltv,omitempty"`
	AverageDTI         float64 `json:"average_dti,omitempty"`

	RentPaymentDateMap     map[int]*RentPaymentAtDateSummary `json:"rent_payment_date_map,omitempty"`
	MortgagePaymentDateMap map[int]int                       `json:"mortgage_payment_date_map,omitempty"`

	TotalMortgagePayment    float64 `json:"total_mortgage_payment,omitempty"`
	TotalPropertyManagerFee float64 `json:"total_property_manager_fee,omitempty"`

	TotalSquareFootage int `json:"total_square_footage,omitempty"`
	TotalBedrooms      int `json:"total_bedrooms,omitempty"`
	TotalBathrooms     int `json:"total_bathrooms,omitempty"`

	MissingEstimate bool `json:"missing_estimate,omitempty"`
}

func calculatePropertiesSummary(properties []*db.Property) *PropertiesSummary {

	// todo: fetch the user salary.
	var totalCurrentlyRented int
	var totalNetWorth float64
	var totalEstimateWorth float64
	var totalRent float64
	var totalCost float64
	var totalDownPayment float64
	var totalLoan float64
	var totalMortgagePayment float64
	var totalPropertyManagerFee float64
	var missingEstimate bool
	var totalSquareFootage int
	var totalBedrooms int
	var totalBathrooms int

	rentPaymentDateMap := make(map[int]*RentPaymentAtDateSummary)
	// TODO: make this a map to mortgage IDs
	mortgagePaymentDateMap := make(map[int]int)

	for _, property := range properties {

		if property.CurrentlyRented {
			totalCurrentlyRented++
		}
		totalRent += property.PriceRented
		// totalCost is the mortgage and also the property manager fee.
		totalCost += property.PriceMortgage + (property.PricePropertyManager * property.PriceRented / 100.0)
		totalNetWorth += property.PriceBought
		totalLoan += property.PriceBought - property.DownPayment

		if property.Estimate == 0.0 {
			missingEstimate = true
			totalEstimateWorth += property.PriceBought
		} else {
			totalEstimateWorth += property.Estimate
		}
		totalDownPayment += property.DownPayment
		if property.CurrentlyRented && property.PriceRented != 0.0 && property.RentPaymentDate != 0 {
			if rentPaymentAtDateSummary, ok := rentPaymentDateMap[property.RentPaymentDate]; ok {
				rentPaymentAtDateSummary.NumProperties++
				rentPaymentAtDateSummary.TotalRent += property.PriceRented
			} else {
				rentPaymentDateMap[property.RentPaymentDate] = &RentPaymentAtDateSummary{
					NumProperties: 1,
					TotalRent:     property.PriceRented,
				}
			}
		}

		if property.MortgagePaymentDate != 0 {
			mortgagePaymentDateMap[property.MortgagePaymentDate]++
		}

		totalSquareFootage += property.SquareFootage
		totalBedrooms += property.NumBeds
		totalBathrooms += property.NumBaths

		totalMortgagePayment += property.PriceMortgage
		totalPropertyManagerFee += (property.PricePropertyManager * property.PriceRented) / 100.0
	}

	averageLTV := totalLoan / totalEstimateWorth * 100.0
	userMonthlySalary := 0.0
	// if (user.Salary != 0.0) {
	// 	userMonthlySalary = user.Salary / 12.0
	// }
	averageDTI := totalCost / (totalRent + userMonthlySalary) * 100.0
	annualRateOfReturn := (totalRent - totalCost) / totalDownPayment * 100.0 * 12.0

	return &PropertiesSummary{
		TotalProperties:         len(properties),
		TotalCurrentlyRented:    totalCurrentlyRented,
		TotalEstimateWorth:      totalEstimateWorth,
		TotalNetWorth:           totalNetWorth,
		TotalRent:               totalRent,
		TotalCost:               totalCost,
		AnnualRateOfReturn:      annualRateOfReturn,
		AverageLTV:              averageLTV,
		AverageDTI:              averageDTI,
		RentPaymentDateMap:      rentPaymentDateMap,
		MortgagePaymentDateMap:  mortgagePaymentDateMap,
		TotalMortgagePayment:    totalMortgagePayment,
		TotalPropertyManagerFee: totalPropertyManagerFee,
		TotalSquareFootage:      totalSquareFootage,
		TotalBedrooms:           totalBedrooms,
		TotalBathrooms:          totalBathrooms,
		MissingEstimate:         missingEstimate,
	}
}

// calculatePropertiesAnalysis will aggregate property information. It takes in two determinations
// on which properties to aggregate on, propertyIDs and propertyTypes. By default, all propertyIDs
// and all propertyTypes are aggregated on.
func (s *Server) calculatePropertiesAnalysis(userID string, propertyIDs []string, propertyTypes []string) (*PropertiesSummary, error) {

	properties, err := s.DBHandle.GetSpecificPropertiesByOwner(userID, propertyIDs, propertyTypes)
	if err != nil {
		return nil, err
	}

	return calculatePropertiesSummary(properties), nil

}

func (s *Server) validateProperty(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	var property db.Property
	if err := decoder.Decode(&property); err != nil {
		log.Error().Err(err).Msg("unable to decode new property by user addition")
		http.Error(w, fmt.Sprintf("unable to decode new property by user addition: %w", err), http.StatusBadRequest)
		return
	}

	lobAddress, err := external.ValidateAddress(property, s.LobAPIKey)
	if err != nil {
		log.Error().Err(err).Msg("unable to validate new property by Lob")
		http.Error(w, fmt.Sprintf("unable to validate new property by Lob: %w", err), http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, lobAddress)
	return
}

// addPropertyByUser will add a property to the database associated with a user.
func (s *Server) addPropertyByUser(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	decoder := json.NewDecoder(r.Body)
	var property db.Property
	if err := decoder.Decode(&property); err != nil {
		ll.Error().Err(err).Msg("unable to decode new property by user addition")
		http.Error(w, fmt.Sprintf("unable to decode new property by user addition: %w", err), http.StatusBadRequest)
		return
	}

	if err := validateNewProperty(&property); err != nil {
		ll.Error().Err(err).Msg("invalid property while adding property by user")
		http.Error(w, fmt.Sprintf("invalid property while adding property by user: %w", err), http.StatusBadRequest)
		return
	}

	sanitizeNewProperty(&property)

	// Fill in required information.
	createdAt := time.Now().UTC()

	property.ID = uuid.New().String()
	property.CreatedAt = &createdAt
	property.UserID = userID

	if err := s.DBHandle.AddPropertyByUser(userID, &property); err != nil {
		ll.Error().Err(err).Msg("unable to add property by user")
		http.Error(w, fmt.Sprintf("unable to add property by user: %w", err), http.StatusBadRequest)
	}

	w.Write([]byte(fmt.Sprintf("added property: %s by user: %s", property.ID, property.UserID)))
	w.WriteHeader(http.StatusOK)
}