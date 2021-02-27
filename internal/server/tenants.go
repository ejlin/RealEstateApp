package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"../db"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

func (s *Server) getTenantsByUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	tenants, err := s.DBHandle.GetTenantsByUser(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get tenants by user")
		http.Error(w, "unable to get tenants by user", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, tenants)
	return
}

func (s *Server) getTenantsByUserProperty(w http.ResponseWriter, r *http.Request) {
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
		log.Warn().Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	tenants, err := s.DBHandle.GetTenantsByUserProperty(userID, propertyID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get tenants by user property")
		http.Error(w, "unable to get tenants by user property", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, tenants)
	return
}

func (s *Server) deleteTenant(w http.ResponseWriter, r *http.Request) {
	
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	tenantID, ok := vars["tenant_id"]
	if !ok {
		log.Warn().Msg("missing tenant id")
		http.Error(w, "missing tenant id", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("tenant_id", userID).Logger()

	if err := s.DBHandle.DeleteTenantByID(userID, tenantID); err != nil {
		ll.Warn().Msg("unable to delete tenant by id")
		http.Error(w, "unable to delete tenant by id", http.StatusBadRequest)
		return
	}

	ll.Info().Msg("tenant deleted successfully")
	w.Write([]byte("success"))
	return
}

func (s *Server) addTenantByUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	decoder := json.NewDecoder(r.Body)
	var tenant db.Tenant
	if err := decoder.Decode(&tenant); err != nil {
		ll.Error().Err(err).Msg("unable to decode new tenant by user addition")
		http.Error(w, fmt.Sprintf("unable to decode new tenant by user addition: %w", err), http.StatusBadRequest)
		return
	}

	if tenant.ID != "" && !tenant.CreatedAt.IsZero() {
		ll.Warn().Str("tenant_id", tenant.ID).Time("created_at", *tenant.CreatedAt).Msg("tenant id or created at is already set")
		http.Error(w, "tenant id or created at is already set", http.StatusBadRequest)
		return
	}

	now := time.Now().UTC()

	tenant.ID = uuid.New().String()
	tenant.UserID = userID
	tenant.CreatedAt = &now
	tenant.LastModifiedAt = &now

	if err := s.DBHandle.AddTenantByUser(userID, &tenant); err != nil {
		ll.Error().Err(err).Msg("unable to add tenant by user")
		http.Error(w, "unable to add tenant by user", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, tenant)
	return 
}