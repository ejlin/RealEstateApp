package server

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"../db"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

func (s *Server) getExpensesByProperty(w http.ResponseWriter, r *http.Request) {
	
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	expenses, err := s.DBHandle.GetExpensesByProperty(userID, propertyID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get expenses by property")
		http.Error(w, "unable to get expenses by property", http.StatusInternalServerError)
		return
	}
	
	RespondToRequest(w, expenses)
	return
}

func (s *Server) getExpensesByUser(w http.ResponseWriter, r *http.Request) {

}

func (s *Server) addExpensesByUser(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	title := r.FormValue("title")
	if title == "" {
		ll.Error().Msg("missing expense title")
		http.Error(w, "missing expense title", http.StatusBadRequest)
		return
	}

	description := r.FormValue("description")
	if description == "" {
		ll.Error().Msg("missing expense description")
		http.Error(w, "missing expense description", http.StatusBadRequest)
		return
	}

	frequency := r.FormValue("frequency")
	if frequency == "" {
		ll.Error().Msg("missing expense frequency")
		http.Error(w, "missing expense frequency", http.StatusBadRequest)
		return
	}

	sAmount := r.FormValue("amount")
	if sAmount == "" {
		ll.Error().Msg("missing expense amount")
		http.Error(w, "missing expense amount", http.StatusBadRequest)
		return
	}

	date := r.FormValue("date")
	if date == "" {
		ll.Error().Msg("missing expense date")
		http.Error(w, "missing expense date", http.StatusBadRequest)
		return
	}

	properties := r.FormValue("properties")
	associatedProperties := strings.Split(properties, ",")

	ll.Info().
		Str("title", title).
		Str("description", description).
		Str("amount", sAmount).
		Str("frequency", frequency).
		Str("date", date).
		Interface("associated_properties", associatedProperties).
		Msg("received expense submission")

	now := time.Now()

	amount, err := strconv.Atoi(sAmount)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to convert expense amount to int")
		http.Error(w, "unable to convert expense amount to int", http.StatusBadRequest)
		return
	}

	expense := &db.Expense {
		ID: uuid.New().String(),
		UserID: userID, 
		CreatedAt: &now,
		LastModifiedAt: &now,
		Title: title,
		Description: description,
		Amount: amount,
		Frequency: getFrequency(frequency),
		Date: date,
	}
		
	// Add our expense to our expenses table.
	err = s.DBHandle.AddExpense(expense, associatedProperties)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to add expense to database")
		http.Error(w, "unable to add expense to database", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Ok"))
}

func getFrequency(frequency string) db.FrequencyType {
	
	frequency = strings.ToLower(frequency)

	frequencyType := db.FrequencyType(frequency)

	if frequencyType != db.Once && frequencyType != db.Daily && frequencyType != db.Weekly &&
		frequencyType != db.BiWeekly && frequencyType != db.Monthly && frequencyType != db.Annually && frequencyType != db.SemiAnnually {
			return db.Once
	}
	return frequencyType
}