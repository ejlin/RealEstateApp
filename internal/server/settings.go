package server

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

func createDefaultSettings() json.RawMessage {

	settings := map[string]map[string]interface{}{
		"emails": {
			"receive_digest": true,
			"receive_newsletter": true,
			"receive_marketing": true,
		},
		"notifications": {
			"rent_pay_date": true,
			"mortgage_pay_date": true,
			"property_value": true,
		},
	}

	// ignore the err as it's not likekly to error while marshalling hard coded values.
	marshalledSettings, _ := json.Marshal(settings)
	return marshalledSettings
}

func (s *Server) updateSettingsProfile(w http.ResponseWriter, r *http.Request) {

	// ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	firstName := r.FormValue("first_name")
	lastName := r.FormValue("last_name")
	email := r.FormValue("email")
	password := r.FormValue("password")
	plan := r.FormValue("plan")

	changed := make(map[string]string)

	m := make(map[string]interface{})
	if firstName != "" {
		m["first_name"] = firstName
		changed["first_name"] = firstName
	}
	if lastName != "" {
		m["last_name"] = lastName
		changed["last_name"] = lastName
	}
	if email != "" {
		m["email"] = email
		changed["email"] = email
	}
	if password != "" {
		m["password"] = password
		changed["password"] = password
	}
	if plan != "" {
		m["plan"] = plan
		changed["plan"] = plan
	}

	err := s.DBHandle.UpdateSettingsProfileByUser(userID, m)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to store user profile settings")
		http.Error(w, "unable to store user profile settings", http.StatusInternalServerError)
		return
	}

	mChanged, err := json.Marshal(changed)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to marshal changed")
		http.Error(w, "unable to marshal changed", http.StatusInternalServerError)
		return
	}
	w.Write(mChanged)
	return
}

func (s *Server) updateSettingsPreferences(w http.ResponseWriter, r *http.Request) {
	// ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	settingsVal := r.FormValue("settings")

	jsonSettingsVal := json.RawMessage(settingsVal)
	
	err := s.DBHandle.UpdateSettingsPreferencesByUser(userID, &jsonSettingsVal)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to store user preference settings")
		http.Error(w, "unable to store user preference settings", http.StatusInternalServerError)
		return
	}
	return
}

func (s *Server) uploadProfilePictureByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	file, _, err := r.FormFile("file")
	if err != nil {
		ll.Error().Err(err).Msg("error retrieving profile picture file")
		http.Error(w, "error retrieving profile picture file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if err := s.addStorageProfilePictureFile(ctx, file, userID); err != nil {
		ll.Error().Err(err).Msg("error storing profile picture in cloud storage")
		http.Error(w, "error storing profile picture in cloud storage", http.StatusInternalServerError)
		return
	}

	return
}

func (s *Server) getProfilePictureByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	url, err := s.getProfilePictureData(ctx, userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get profile picture data by user")
		http.Error(w, "unable to get profile picture data by user", http.StatusInternalServerError)
		return
	}
	
	RespondToRequest(w, url)
	return
}

// getSettings returns an individual users settings.
func (s *Server) getSettings(w http.ResponseWriter, r *http.Request) {

	// ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	settings, err := s.DBHandle.GetSettingsByUserID(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get user settings")
		http.Error(w, "unable to get user settings", http.StatusBadRequest)
		return
	}
	
	// If user is missing settings, give them the default ones.
	if settings == nil {
		defaultSettings := createDefaultSettings()
		w.Write(defaultSettings)
		return
	}

	ll.Info().Msg("retrieved user settings")
	w.Write(*settings)
	return
}