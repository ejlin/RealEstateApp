package db

type Expense struct {
	ID        string     `json:"id",sql:"type:uuid; primary key"`
	OwnerID string `json:"owner_id",sql:"type:uuid; foreign key"`
	PropertyID string `json:"property_id",sql:"type:uuid; foreign key"`
	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`
	Amount int `json:"amount,omitempty",sql:"type:INT"`

	// Date is the date of the expense in MM/DD/YYYY format. It is not stored as a timestamp
	// for user ease.
	Date string `json:"date,omitempty", sql:"type:VARCHAR(10)"`
}

// AddExpenseByUser will add a record of a expense for a user.
func (handle *Handle) AddExpenseByUser(userID string, expense *Expense) error {

	_, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	if expense == nil {
		return errors.New("nil expense")
	}

	return handle.DB.FirstOrCreate(&expense, expense).Error
}

// GetExpenseByID will fetch the expense by its unique ID.
func (handle *Handle) GetExpenseByID(expenseID string) (*Expense, error) {

	_, err := uuid.Parse(expenseID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var expense Expense
	if err := handle.DB.Where("id = ?", expenseID).First(&expense).Error; err != nil {
		return nil, err
	}
	return &expense, nil
}

// GetExpensesByOwner will fetch all properties associated with a user.
func (handle *Handle) GetExpensesByOwner(userID string) ([]*Expense, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var expenses []*Expense
	if err := handle.DB.Where("owner_id = ?", userID).Find(&expenses).Error; err != nil {
		return nil, err
	}
	return expenses, nil
}

// RemoveExpenseByID will delete an expense from our database.
func (handle *Handle) RemoveExpenseByID(ownerID, expenseID string) error {

	// TODO: eric.lin to explore gorm soft delete options. Provide users with undo method.

	_, err := uuid.Parse(ownerID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	_, err = uuid.Parse(expenseID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	expense := expense{
		ID: expenseID,
	}

	delete := handle.DB.Where("owner_id = ?", ownerID).Delete(&expense)
	if err := delete.Error; err != nil {
		return err
	}

	if delete.RowsAffected != 1 {
		return fmt.Errorf("incorrect number of properties deleted: %d", delete.RowsAffected)
	}
	return nil
}