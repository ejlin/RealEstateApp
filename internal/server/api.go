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

	// Order matters. Routing is done sequentially, so the first one must be the one that doesn't satisfy the second one.
	r.HandleFunc("/api/user/files/{id}/{property_id}/{file_name}", s.getFile).Queries("request", "{request}").Methods("GET")
	r.HandleFunc("/api/user/files/{id}/{property_id}/{file_name}", s.deleteFile).Methods("DELETE")
	r.HandleFunc("/api/user/files/{id}/{property_id}", s.getPropertyFileslistByUser).Methods("GET")
	r.HandleFunc("/api/user/files/{id}", s.getFileslistByUser).Methods("GET")
	r.HandleFunc("/api/user/files/upload/{id}", s.uploadFileByUser).Methods("POST")

	// sign up and login
	r.HandleFunc("/api/user/signup", s.addUser).Methods("POST")
	r.HandleFunc("/api/user/login/email", s.loginUserByEmail).Methods("POST")

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
	createdAt := time.Now().UTC()

	user.ID = uuid.New().String()
	user.CreatedAt = &createdAt

	if err := s.DBHandle.AddUser(&user); err != nil {
		log.Error().Err(err).Msg("error creating user")
		http.Error(w, fmt.Sprintf("error creating user: %s", err.Error()), http.StatusBadRequest)
		return
	}

	mUser, err := json.Marshal(user)
	if err != nil {
		log.Warn().Err(err).Str("name", user.FirstName+" "+user.LastName).Msg("unable to marshal created user")
		http.Error(w, "unable to marshal created user", http.StatusForbidden)
		return
	}

	w.Write(mUser)
	return
}

// ResponseUser is a user struct that we can send back in our API that is stripped of internal information like
// passwords, last login time, etc.
type ResponseUser struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
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
	}
}

func (s *Server) getFileslistByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	files, err := s.getCloudFileslistByUser(ctx, userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to get fileslist by user")
		http.Error(w, "unable to get fileslist by user", http.StatusBadRequest)
		return
	}

	if len(files) == 0 {
		ll.Warn().Msg("no files found for user")
		http.Error(w, "no files found for user", http.StatusNotFound)
		return
	}

	RespondToRequest(w, files)
	return
}

func (s *Server) uploadFileByUser(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	err := r.ParseMultipartForm(32 << 20) // maxMemory 32MB
	if err != nil {
		ll.Error().Err(err).Msg("failed to parse multipart message")
		http.Error(w, "failed to parse multipart message", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		ll.Error().Err(err).Msg("error retrieving the file")
		http.Error(w, "error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	propertyID := r.FormValue("property_id")
	if propertyID == "" {
		ll.Error().Msg("missing property id")
		http.Error(w, "missing property id", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	fileCategory := r.FormValue("file_category")
	if fileCategory == "" {
		ll.Error().Msg("missing file category")
		http.Error(w, "missing file category", http.StatusBadRequest)
		return
	}

	address := r.FormValue("address")
	if address == "" {
		ll.Error().Msg("missing file address")
		http.Error(w, "missing file address", http.StatusBadRequest)
		return
	}

	fileName := r.FormValue("file_name")
	if fileName == "" {
		fileName = handler.Filename
	}

	fileType := r.FormValue("file_type")
	if fileType == "" {
		fileType = "unknown"
	}

	year := r.FormValue("year")
	if year == "" {
		y := time.Now().Year()
		year = fmt.Sprint(y)
	}

	ll = ll.With().Str("file_category", fileCategory).Str("file_name", fileName).Logger()

	fInfo, err := s.addStorageFile(ctx, file, userID, propertyID, fileName, fileType, fileCategory, year)
	if err != nil {
		ll.Error().Err(err).Msg("unable to add file to cloudstorage")
		http.Error(w, "unable to add file to cloudstorage", http.StatusBadRequest)
		return
	}

	// fmt.Printf("PropertyId: %+v\n", val)
	// fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	// fmt.Printf("File Size: %+v\n", handler.Size)
	// fmt.Printf("MIME Header: %+v\n", handler.Header)
	ll.Info().Msg("successfully stored file in GCS")
	RespondToRequest(w, fInfo)
	return

}

// getFile either downloads an individual file or returns a signed URl.
func (s *Server) getFile(w http.ResponseWriter, r *http.Request) {

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

	fileName, ok := vars["file_name"]
	if !ok {
		ll.Warn().Msg("file name not set")
		http.Error(w, "file name not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_name", fileName).Logger()

	request, ok := vars["request"]
	if !ok {
		ll.Warn().Msg("file type not set")
		http.Error(w, "file type not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("request", request).Logger()

	switch request {
	case "download":
		s.getFileData(ctx, userID, propertyID, fileName, w, r)
		return
	case "signed_url":
		url, err := s.getSignedURL(ctx, userID, propertyID, fileName)
		if err != nil {
			ll.Warn().Err(err).Msg("error getting signed url")
			http.Error(w, "error getting signed url", http.StatusBadRequest)
		}
		RespondToRequest(w, url)
		return
	}

	return
}

func (s *Server) deleteFile(w http.ResponseWriter, r *http.Request) {

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

	fileName, ok := vars["file_name"]
	if !ok {
		ll.Warn().Msg("file name not set")
		http.Error(w, "file name not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("file_name", fileName).Logger()

	err := s.deleteStorageFile(ctx, userID, propertyID, fileName)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to delete file")
		http.Error(w, "unable to delete file", http.StatusInternalServerError)
		return
	}

	ll.Info().Msg("file deleted successfully")
	w.Write([]byte("success"))
	return
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
	property.OwnerID = userID

	if err := s.DBHandle.AddPropertyByUser(userID, &property); err != nil {
		ll.Error().Err(err).Msg("unable to add property by user")
		http.Error(w, fmt.Sprintf("unable to add property by user: %w", err), http.StatusBadRequest)
	}

	w.Write([]byte(fmt.Sprintf("added property: %s by user: %s", property.ID, property.OwnerID)))
	w.WriteHeader(http.StatusOK)
}

func (s *Server) getProperties(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	ownerID, ok := vars["id"]
	if ok {

		ll := log.With().Str("owner_id", ownerID).Logger()

		properties, err := s.DBHandle.GetPropertiesByOwner(ownerID)
		if err != nil {
			ll.Error().Err(err).Msg("unable to get properties by owner id")
			http.Error(w, fmt.Sprintf("unable to get properties by owner id: %s, %w", ownerID, err), http.StatusBadRequest)
			return
		}

		marshalledProperties, err := json.Marshal(properties)
		if err != nil {
			ll.Error().Err(err).Interface("properties", properties).Msg("unable to marshal properties when fetching by owner id")
			http.Error(w, fmt.Sprintf("unable to marshal properties when fetching by owner id: %w", err), http.StatusBadRequest)
			return
		}
		w.Write(marshalledProperties)
		return
	}

	log.Warn().Msg("owner id required")
	http.Error(w, "owner id required", http.StatusBadRequest)
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

	ownerID, ok := vars["id"]
	if !ok {
		log.Warn().Msg("owner id not set")
		http.Error(w, "owner id not set", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("owner_id", ownerID).Logger()

	propertyID, ok := vars["property_id"]
	if !ok {
		ll.Warn().Msg("property id not set")
		http.Error(w, "property id not set", http.StatusBadRequest)
		return
	}

	ll = ll.With().Str("property_id", propertyID).Logger()

	err := s.DBHandle.RemovePropertyByID(ownerID, propertyID)
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
