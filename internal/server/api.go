package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"../../internal"
	"../db"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

// HandleRoutes will
func (s *Server) HandleRoutes() {

	r := mux.NewRouter()

	r.HandleFunc("/api/user/{id}", s.getUser).Methods("GET")
	r.HandleFunc("/api/propertyfinder", s.propertiesHandler).Methods("GET")

	r.HandleFunc("/api/user/property/{id}", s.getProperties).Methods("GET")
	r.HandleFunc("/api/user/property/{id}", s.removePropertyByUser).Queries("property_id", "{property_id}").Methods("DELETE")
	r.HandleFunc("/api/user/property/{id}", s.addPropertyByUser).Methods("POST")

	// Used to display our main dashboard page. Provides a summary for users.
	r.HandleFunc("/api/user/summary/{id}", s.getUserSummary).Methods("GET")

	// Order matters. Routing is done sequentially, so the first one must be the one that doesn't satisfy the second one.
	r.HandleFunc("/api/user/files/property/{id}/{property_id}/{file_name}", s.getFile).Queries("request", "{request}").Methods("GET")
	r.HandleFunc("/api/user/files/property/{id}/{property_id}", s.getFilesByProperty).Methods("GET")
	r.HandleFunc("/api/user/files/{id}/{file_id}", s.deleteFile).Methods("DELETE")
	r.HandleFunc("/api/user/files/{id}/{file_id}", s.getFileByID).Methods("GET")
	r.HandleFunc("/api/user/files/{id}", s.getFileslistByUser).Methods("GET")
	// r.HandleFunc("/api/user/files/upload/{id}/{property_id}", s.getStoreFileSignedURL).Queries("file_name", "{file_name}").Methods("GET")
	r.HandleFunc("/api/user/files/upload/{id}", s.uploadFileByUser).Methods("POST")

	// Analysis Flow
	r.HandleFunc("/api/user/analysis/{id}/{property_id}", s.getPropertiesAnalysisByProperty).Methods("GET")
	r.HandleFunc("/api/user/analysis/{id}", s.getPropertiesAnalysis).Methods("GET")

	// Expenses Flow
	r.HandleFunc("/api/user/expenses/{id}/{property_id}", s.getExpensesByProperty).Methods("GET")
	r.HandleFunc("/api/user/expenses/{id}", s.getExpensesByUser).Methods("GET")
	r.HandleFunc("/api/user/expenses/{id}", s.addExpensesByUser).Methods("POST")
	r.HandleFunc("/api/user/expenses/{id}/{expense_id}", s.editExpense).Methods("PATCH")
	r.HandleFunc("/api/user/expenses/{id}/{expense_id}", s.deleteExpense).Methods("DELETE")

	// User Settings Flow
	r.HandleFunc("/api/user/settings/profile/{id}", s.updateSettingsProfile).Methods("PUT")
	r.HandleFunc("/api/user/settings/preferences/{id}", s.getSettings).Methods("GET")
	r.HandleFunc("/api/user/settings/preferences/{id}", s.updateSettingsPreferences).Methods("PUT")

	r.HandleFunc("/api/user/settings/profile/picture/{id}", s.uploadProfilePictureByUser).Methods("POST")
	r.HandleFunc("/api/user/settings/profile/picture/{id}", s.getProfilePictureByUser).Methods("GET")

	// sign up and login
	r.HandleFunc("/api/user/signup", s.addUser).Methods("POST")
	r.HandleFunc("/api/user/login/email", s.loginUserByEmail).Methods("POST")

	// Update a new plan for users
	r.HandleFunc("/api/user/plan/{id}", s.updateUserPlan).Methods("PATCH")

	r.HandleFunc("/api/property/{property_id}", s.getProperty).Methods("GET")

	http.Handle("/", r)
}

func (s *Server) getUser(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	user, err := s.DBHandle.GetUserByID(userID)
	if err != nil {
		if errors.Is(err, internal.ErrUserDoesNotExist) {
			ll.Error().Err(err).Msg("user does not exist")
			http.Error(w, fmt.Sprintf("user does not exist: %s", userID), http.StatusBadRequest)
			return
		}
		ll.Error().Err(err).Msg("internal server error fetching user record")
		http.Error(w, "internal server error fetching user record", http.StatusBadRequest)
		return
	}

	u, err := json.Marshal(user)
	if err != nil {
		return
	}

	w.Write([]byte(u))
}

func (s *Server) propertiesHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("properties")
}

func (s *Server) addUser(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	var user db.User
	err := decoder.Decode(&user)
	if err != nil {
		log.Error().Err(err).Msg("unable to decode new user addition")
		http.Error(w, "unable to decode new user addition", http.StatusBadRequest)
		return
	}

	if err := validateNewUser(&user); err != nil {
		log.Error().Err(err).Str("user_id", user.ID).Msg("unable to create new user")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sanitizeNewUser(&user)

	// Fill in required information.
	now := time.Now().UTC()

	user.ID = uuid.New().String()
	user.CreatedAt = &now
	user.LastLogin = &now

	// Load user settings with the defaults.
	defaultSettings := createDefaultSettings()
	user.Settings = &defaultSettings

	if err := s.DBHandle.AddUser(&user); err != nil {
		log.Error().Err(err).Msg("error creating user")
		http.Error(w, fmt.Sprintf("error creating user: %s", err.Error()), http.StatusBadRequest)
		return
	}

	RespondToRequest(w, user)
	return
}

// ResponseUser is a user struct that we can send back in our API that is stripped of internal information like
// passwords, last login time, etc.
type ResponseUser struct {
	ID        string      `json:"id"`
	Email     string      `json:"email"`
	FirstName string      `json:"first_name"`
	LastName  string      `json:"last_name"`
	CreatedAt *time.Time  `json:"created_at"`
	LastLogin *time.Time  `json:"last_login"`
	Plan      db.PlanType `json:"plan"`
}

func (s *Server) loginUserByEmail(w http.ResponseWriter, r *http.Request) {

	type emailLogin struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	decoder := json.NewDecoder(r.Body)
	var eLogin emailLogin
	err := decoder.Decode(&eLogin)
	if err != nil {
		log.Error().Err(err).Msg("unable to decode email login")
		http.Error(w, "unable to decode email login", http.StatusBadRequest)
		return
	}

	user, err := s.DBHandle.GetUserByEmail(eLogin.Email, eLogin.Password)
	if err != nil {
		log.Warn().Err(err).Str("email", eLogin.Email).Msg("unable to log in user by email")
		http.Error(w, fmt.Sprintf("unable to log in user by email: %s", eLogin.Email), http.StatusBadRequest)
		return
	}

	rUser := convertToResponseUser(user)

	mUser, err := json.Marshal(rUser)
	if err != nil {
		log.Warn().Err(err).Str("email", eLogin.Email).Msg("unable to marshal user returned by email")
		http.Error(w, fmt.Sprintf("unable to marshal user returned by email: %s", eLogin.Email), http.StatusBadRequest)
		return
	}

	w.Write(mUser)
	return
}

func convertToResponseUser(user *db.User) ResponseUser {
	return ResponseUser{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: user.CreatedAt,
		LastLogin: user.LastLogin,
		Plan:      user.Plan,
	}
}

// getPropertyFileslistByUser returns all the files associated with a user.
func (s *Server) getPropertyFileslistByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("property id not set")
		http.Error(w, "property id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	files, err := s.getFileslistByUserAndPropertyId(ctx, userID, propertyID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get fileslist by user and property id")
		http.Error(w, "unable to get fileslist by user and property id", http.StatusBadRequest)
		return
	}

	if len(files) == 0 {
		ll.Warn().Msg("no files found for property")
		http.Error(w, "no files found for property", http.StatusNotFound)
		return
	}

	RespondToRequest(w, files)
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

func (s *Server) getProperties(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userID, ok := vars["id"]
	if ok {

		ll := log.With().Str("user_id", userID).Logger()

		properties, err := s.DBHandle.GetPropertiesByOwner(userID)
		if err != nil {
			ll.Error().Err(err).Msg("unable to get properties by user id")
			http.Error(w, fmt.Sprintf("unable to get properties by user id: %s, %w", userID, err), http.StatusBadRequest)
			return
		}

		RespondToRequest(w, properties)
		return
	}

	log.Warn().Msg("user id required")
	http.Error(w, "user id required", http.StatusBadRequest)
	return
}

func (s *Server) getProperty(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	propertyID, ok := vars["property_id"]
	if ok {

		ll := log.With().Str("property_id", propertyID).Logger()

		property, err := s.DBHandle.GetPropertyByID(propertyID)
		if err != nil {
			ll.Error().Err(err).Msg("unable to get property by property id")
			http.Error(w, fmt.Sprintf("unable to get property by property id: %s, %w", propertyID, err), http.StatusBadRequest)
			return
		}

		marshalledProperty, err := json.Marshal(property)
		if err != nil {
			ll.Error().Err(err).Interface("property", property).Msg("unable to marshal property when fetching by property id")
			http.Error(w, fmt.Sprintf("unable to marshal properties when fetching by property id: %w", err), http.StatusBadRequest)
			return
		}
		ll.Info().Str("property_id", propertyID).Msg("fetched property")
		w.Write(marshalledProperty)
		return
	}

	log.Warn().Msg("property id required")
	http.Error(w, "property id required", http.StatusBadRequest)
	return
}

// removePropertyByUser will remove a property according to the user.
func (s *Server) removePropertyByUser(w http.ResponseWriter, r *http.Request) {

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

	ll = ll.With().Str("property_id", propertyID).Logger()

	err := s.DBHandle.RemovePropertyByID(userID, propertyID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to remove property by user")
		http.Error(w, fmt.Sprintf("unable to remove property by user: %w", err), http.StatusBadRequest)
		return
	}

	w.Write([]byte("success"))
}

/****** Helper Functions ******/

// validateNewUser checks the user that is submitted to our API and makes sure it is valid.
func validateNewUser(user *db.User) error {

	if user.ID != "" {
		return errors.New("user id is already set")
	}

	if user.CreatedAt != nil {
		return errors.New("user created at is already set")
	}

	if user.FirstName == "" || user.LastName == "" || user.Password == "" || user.Email == "" {
		return errors.New("missing required information at user creation")
	}
	return nil
}

// sanitizeNewUser will clean the data we get to make sure that we ensure clean database records.
func sanitizeNewUser(user *db.User) {
	user.FirstName = strings.ToLower(user.FirstName)
	user.LastName = strings.ToLower(user.LastName)
	user.Email = strings.ToLower(user.Email)
}

// validateNewProperty checks the property that is submitted to our API and makes sure it is valid.
func validateNewProperty(property *db.Property) error {

	if property.ID != "" {
		return errors.New("property id is already set")
	}

	if property.CreatedAt != nil {
		return errors.New("property created at is already set")
	}

	if property.Address == "" || property.State == "" || property.City == "" || property.ZipCode == "" || property.BoughtDate == "" || property.PriceBought == 0.0 {
		log.Info().Str("address", property.Address).Str("state", property.State).Str("zip_code", property.ZipCode).Str("bought_date", property.BoughtDate).Float64("price_bought", property.PriceBought).Msg("missing fields")
		return errors.New("missing required information at property creation")
	}

	return nil
}

func sanitizeNewProperty(property *db.Property) {
	// TOOD: sanitize new property
}

func RespondToRequest(w http.ResponseWriter, response interface{}) {
	data, err := json.Marshal(response)
	if err != nil {
		log.Warn().Err(err).Msg("unable to marshal response data")
		http.Error(w, "unable to marshal response data", http.StatusBadRequest)
		return
	}

	w.Write(data)
	return
}
