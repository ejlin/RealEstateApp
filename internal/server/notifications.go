package server

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

func (s *Server) getNotificationsByUser(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	notifications, err := s.DBHandle.GetNotificationsByUser(userID, false)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get notifications by user")
		http.Error(w, "unable to get notifications by user", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, notifications)
	return
}