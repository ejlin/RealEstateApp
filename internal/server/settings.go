package server

import (
	"encoding/json"
	"net/http"
	"io/ioutil"
	"fmt"

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

func (s *Server) updateSettings(w http.ResponseWriter, r *http.Request) {
	// ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	type Settings struct {
		Data map[string]map[string]interface{} `json:"data,omitempty"`
	}

	decoder := json.NewDecoder(r.Body)

	fmt.Println(decoder)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return
	}

	fmt.Println(string(body))

	var setting Settings
	err = decoder.Decode(&setting)

	ll.Info().Msg("decoded new settings")

	fmt.Println(setting.Data, err)
	// err := s.DBHandle.UpdateSettingsByUser(userID, )
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