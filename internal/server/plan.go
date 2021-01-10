package server

import (
	"fmt"
	"net/http"

	"../db"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

func (s *Server) updateUserPlan(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	plan := r.FormValue("plan")
	if plan == "" {
		ll.Error().Msg("missing plan")
		http.Error(w, "missing plan", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("plan", plan).Logger()

	planType, err := db.ConvertStringTosPlanType(plan)
	if err != nil {
		ll.Error().Msg("invalid plan")
		http.Error(w, "invalid plan", http.StatusBadRequest)
		return
	}

	err = s.DBHandle.UpdatePlanByUser(userID, planType)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to update plan by user")
		http.Error(w, fmt.Sprintf("unable to update plan by user: %s", err.Error()), http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, "ok")
	return
}