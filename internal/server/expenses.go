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

// RestExpense is an expense sent back by the server to the client.
type RestExpense struct {
	ID        string     `json:"id"`
	UserID string `json:"user_id"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty"`
	Title string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Amount float64 `json:"amount,omitempty"`
	Frequency db.FrequencyType `json:"frequency,omitempty"`
	Properties []string `json:"properties,omitempty"`
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
		properties, err := s.DBHandle.GetPropertiesAssociatedWithExpense(expense.ID)
		if err != nil {
			// Don't error out so we still return what expenses we can.
			ll.Warn().Err(err).Str("expense_id", expense.ID).Msg("unable to get properties associated with expense")
			continue
		}
		restExpenses = append(restExpenses, &RestExpense {
			ID: expense.ID,
			UserID: expense.UserID,
			CreatedAt: expense.CreatedAt,
			LastModifiedAt: expense.LastModifiedAt,
			Title: expense.Title,
			Description: expense.Description,
			Amount: expense.Amount,
			Frequency: expense.Frequency,
			Properties: properties,
			Date: expense.Date,
		})
	}

	ll.Info().Msg("successfully returned expenses by user")
	RespondToRequest(w, restExpenses)
	return
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
	
	formFile, handler, err := r.FormFile("file")
	if err != nil {
		ll.Error().Err(err).Msg("error retrieving the file")
		http.Error(w, "error retrieving the file", http.StatusBadRequest)
		return
	}
	defer formFile.Close()

	fileName := handler.Filename
	if fileName == "" {
		fileName = title + "-file"
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

	func getYear(date string) string {
		dateSpl := strings.Split(date, "-")
		return dateSpl[0]
	}

	var file *File
	if formFile != nil {
		file = &db.File {
			ID: uuid.New().String(),
			UserID: userID,
			CreatedAt: &now,
			LastModifiedAt: &now,
			Name: fileName,
			Year: getYear(date),
			Type: db.FileType("other"),
		}
	} else {
		file = nil
	}
	
	key := path.Join()

	addFileToCloudStorage := func() func(ctx context.Context) error {
		return func(ctx context.Context) error {
			cloudstorage.AddCloudstorageFile(ctx, s.StorageClient, formFile, s.UsersBucket, key)
		}
	}

	// Add our expense to our expenses table.
	err = s.DBHandle.AddExpense(ctx, expense, associatedProperties, file, addFileToCloudStorage)
	if err != nil {
		ll.Warn().Err(err).Msg("unable to add expense to database")
		http.Error(w, "unable to add expense to database", http.StatusInternalServerError)
		return
	}

	RespondToRequest(w, &RestExpense {
		ID: expense.ID,
		UserID: expense.UserID, 
		CreatedAt: expense.CreatedAt,
		LastModifiedAt: expense.LastModifiedAt,
		Title: expense.Title,
		Description: expense.Description,
		Amount: expense.Amount,
		Frequency: expense.Frequency,
		Date: expense.Date,
		Properties: associatedProperties,
	})
	return
}

func (s *Server) deleteExpense(w http.ResponseWriter, r *http.Request) {

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

	err := s.DBHandle.DeleteExpenseByID(userID, expenseID)
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

	return &ExpensesSummary {
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