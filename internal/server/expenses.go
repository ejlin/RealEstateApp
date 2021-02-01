package server

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"../cloudstorage"
	"../db"
	"../util"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

const (
	expensesDelimiter = "expenses"
)

// RestExpense is an expense sent back by the server to the client.
type RestExpense struct {
	ID             string           `json:"id"`
	UserID         string           `json:"user_id"`
	CreatedAt      *time.Time       `json:"created_at,omitempty"`
	LastModifiedAt *time.Time       `json:"last_modified_at,omitempty"`
	Title          string           `json:"title,omitempty"`
	Description    string           `json:"description,omitempty"`
	Amount         float64          `json:"amount,omitempty"`
	Frequency      db.FrequencyType `json:"frequency,omitempty"`
	Properties     []string         `json:"properties,omitempty"`
	FileID         string           `json:"file_id,omitempty"`
	// Date is the date of the expense in MM/DD/YYYY format. It is not stored as a timestamp
	// for user ease.
	Date string `json:"date,omitempty"`
}

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

	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	expenses, err := s.DBHandle.GetExpensesByUser(userID)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to query for user expenses")
		http.Error(w, "unable to query for user expenses", http.StatusBadRequest)
		return
	}

	var restExpenses []*RestExpense

	for _, expense := range expenses {
		propertiesReferences, err := s.DBHandle.GetPropertyReferencesAssociatedWithExpense(userID, expense.ID)
		if err != nil {
			// Don't error out so we still return what expenses we can.
			ll.Warn().Err(err).Str("expense_id", expense.ID).Msg("unable to get properties associated with expense")
			continue
		}

		var fileID string
		var properties []string
		for _, propertyReferences := range propertiesReferences {
			// This will overwrite every iteration of our loop, but each expense can only have one file
			// mapped to it currently, so it will overwrite with the same value every time.
			fileID = propertyReferences.FileID.String
			properties = append(properties, propertyReferences.PropertyID.String)
		}

		restExpenses = append(restExpenses, &RestExpense{
			ID:             expense.ID,
			UserID:         expense.UserID,
			CreatedAt:      expense.CreatedAt,
			LastModifiedAt: expense.LastModifiedAt,
			Title:          expense.Title,
			Description:    expense.Description,
			Amount:         expense.Amount,
			Frequency:      expense.Frequency,
			Properties:     properties,
			FileID:         fileID,
			Date:           expense.Date,
		})
	}

	ll.Info().Msg("successfully returned expenses by user")
	RespondToRequest(w, restExpenses)
	return
}

func (s *Server) addExpensesByUser(w http.ResponseWriter, r *http.Request) {

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

	var noFileAttached bool
	formFile, handler, err := r.FormFile("file")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			noFileAttached = true
		} else {
			ll.Error().Err(err).Msg("error retrieving the file")
			http.Error(w, "error retrieving the file", http.StatusBadRequest)
			return
		}
	}
	if !noFileAttached {
		defer formFile.Close()
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

	amount, err := strconv.ParseFloat(sAmount, 64)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to convert expense amount to int")
		http.Error(w, "unable to convert expense amount to int", http.StatusBadRequest)
		return
	}

	expense := &db.Expense{
		ID:             uuid.New().String(),
		UserID:         userID,
		CreatedAt:      &now,
		LastModifiedAt: &now,
		Title:          title,
		Description:    description,
		Amount:         amount,
		Frequency:      getFrequency(frequency),
		Date:           date,
	}

	var file *db.File
	var fileKey string
	if !noFileAttached {
		fileName := handler.Filename
		if fileName == "" {
			fileName = title + "-file"
		}

		metadataFileType := r.FormValue("metadata_file_type")
		if metadataFileType == "" {
			metadataFileType = "unknown"
		}

		metadataFileSizeBytesVal := r.FormValue("metadata_file_size_bytes")

		metadataFileSizeBytes, err := strconv.Atoi(metadataFileSizeBytesVal)
		if err != nil {
			metadataFileSizeBytes = -1
		}

		fileMetadata := map[string]interface{}{
			"type":       metadataFileType,
			"size_bytes": metadataFileSizeBytes,
		}

		var fileMetadataField json.RawMessage

		marshalledFileMetadata, err := json.Marshal(fileMetadata)
		if err != nil {
			// log and continue.
			ll.Warn().Err(err).Msg("unable to marshal file metadata")
			fileMetadataField = json.RawMessage("")
		} else {
			fileMetadataField = json.RawMessage(marshalledFileMetadata)
		}

		// The key to an expense file is {userID}/expenses/{expense_name}/{file_name}
		fileKey = path.Join(userID, "expenses", title, fileName)

		file = &db.File{
			ID:             uuid.New().String(),
			UserID:         userID,
			CreatedAt:      &now,
			LastModifiedAt: &now,
			Name:           fileName,
			Year:           util.GetYear(date),
			Type:           db.FileType("other"),
			Path:           fileKey,
			Metadata:       fileMetadataField,
		}
	} else {
		file = nil
	}

	addFileToCloudStorage := func() func(ctx context.Context) error {
		return func(ctx context.Context) error {
			return cloudstorage.AddCloudstorageFile(ctx, s.StorageClient, formFile, s.UsersBucket, fileKey)
		}
	}

	// Add our expense to our expenses table.
	err = s.DBHandle.AddExpense(ctx, userID, expense, associatedProperties, file, addFileToCloudStorage())
	if err != nil {
		ll.Warn().Err(err).Msg("unable to add expense to database")
		http.Error(w, "unable to add expense to database", http.StatusInternalServerError)
		return
	}

	restExpense := &RestExpense{
		ID:             expense.ID,
		UserID:         expense.UserID,
		CreatedAt:      expense.CreatedAt,
		LastModifiedAt: expense.LastModifiedAt,
		Title:          expense.Title,
		Description:    expense.Description,
		Amount:         expense.Amount,
		Frequency:      expense.Frequency,
		Date:           expense.Date,
		Properties:     associatedProperties,
	}

	if file != nil && file.ID != "" {
		restExpense.FileID = file.ID
	}

	RespondToRequest(w, restExpense)
	return
}

func (s *Server) editExpense(w http.ResponseWriter, r *http.Request) {

	// vars := mux.Vars(r)

	// userID, ok := vars["id"]
	// if !ok {
	// 	log.Info().Msg("missing user id")
	// 	http.Error(w, "missing user id", http.StatusBadRequest)
	// 	return
	// }

	// ll := log.With().Str("user_id", userID).Logger()

	// expenseID, ok := vars["expense_id"]
	// if !ok {
	// 	ll.Info().Msg("missing expense id")
	// 	http.Error(w, "missing expense id", http.StatusBadRequest)
	// 	return
	// }

}

func (s *Server) deleteExpense(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	vars := mux.Vars(r)

	userID, ok := vars["id"]
	if !ok {
		log.Info().Msg("missing user id")
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ll := log.With().Str("user_id", userID).Logger()

	expenseID, ok := vars["expense_id"]
	if !ok {
		ll.Info().Msg("missing expense id")
		http.Error(w, "missing expense id", http.StatusBadRequest)
		return
	}

	deleteFileFromCloudstorage := func(ctx context.Context, filePath string) error {
		return s.deleteStorageFile(ctx, filePath)
	}

	err := s.DBHandle.DeleteExpenseByID(ctx, userID, expenseID, deleteFileFromCloudstorage)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to delete expense")
		http.Error(w, "unable to delete expense", http.StatusInternalServerError)
		return
	}

	ll.Info().Str("expense_id", expenseID).Msg("successfully deleted expense")
	w.Write([]byte("ok"))
}

type ExpensesSummary struct {
	TotalExpenses float64 `json:"total_expenses,omitempty"`
}

func (s *Server) calculateExpensesAnalysis(userID string) (*ExpensesSummary, error) {

	expenses, err := s.DBHandle.GetExpensesByUser(userID)
	if err != nil {
		return nil, err
	}

	var totalExpenses float64
	for _, expense := range expenses {
		totalExpenses += expense.Amount
	}

	return &ExpensesSummary{
		TotalExpenses: totalExpenses,
	}, nil
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
