package server

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

// UserSummary returns general information about a user. It pulls in information from multiple places (properties, expenses,
// historical data, etc.)
type UserSummary struct {
	Properties        *PropertiesSummary `json:"properties_summary,omitempty"`
	Expenses          *ExpensesSummary   `json:"expenses_summary,omitempty"`
	HistoricalSummary *HistoricalSummary `json:"historical_summary,omitempty"`
}

func (s *Server) getUserSummary(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userID, ok := vars["id"]
	if !ok {
		log.Warn().Str("func", "getPropertiesSummary").Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	userSummary, err := s.calculateUserSummary(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to calculate properties summary")
		http.Error(w, "unable to calculate properties summary", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, userSummary)
	return
}

func (s *Server) getUserSummaryByProperty(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userID, ok := vars["id"]
	if !ok {
		log.Warn().Str("func", "getPropertiesSummary").Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		log.Warn().Str("func", "getPropertiesSummary").Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", userID).Logger()

	userSummaryByProperty, err := s.calculatePropertiesAnalysis(userID, []string{propertyID}, nil)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to calculate user summary by property")
		http.Error(w, "unable to calculate user summary by property", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, userSummaryByProperty)
	return
}


func (s *Server) calculateUserSummary(userID string) (*UserSummary, error) {

	propertiesSummary, err := s.calculatePropertiesAnalysis(userID, nil, nil)
	if err != nil {
		return nil, err
	}

	expensesSummary, err := s.calculateExpensesAnalysis(userID)
	if err != nil {
		return nil, err
	}

	historicalSummary, err := s.calculateHistoricalAnalysis(userID, nil, nil)
	if err != nil {
		return nil, err
	}

	return &UserSummary{
		Properties:        propertiesSummary,
		Expenses:          expensesSummary,
		HistoricalSummary: historicalSummary,
	}, nil
}

func (s *Server) getPropertiesHistory(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("user id not set")
		http.Error(w, "user id not set", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertySummary, err := s.calculatePropertiesAnalysis(userID, nil, nil)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to calculate properties analysis")
		http.Error(w, "unable to calculate properties analysis", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, propertySummary)
	return
}

func (s *Server) getPropertiesHistoryByProperty(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("user id not set")
		http.Error(w, "user id not set", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("property id not set")
		http.Error(w, "property id not set", http.StatusBadRequest)
		return
	}

	ll = log.With().Str("property_id", propertyID).Logger()

	historicalSummary, err := s.calculateHistoricalAnalysis(userID, nil, []string {propertyID}) 
	if err != nil {
		ll.Warn().Err(err).Msg("unable to calculate historical analysis by property")
		http.Error(w, "unable to calculate historical analysis by property", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, historicalSummary)
	return
}
