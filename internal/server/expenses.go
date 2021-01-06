package server

import (
	"net/http"

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

}