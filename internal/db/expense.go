package db

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

type Expense struct {
	ID        string     `json:"id",sql:"type:uuid; primary key"`
	UserID string `json:"user_id",sql:"type:uuid; foreign key"`
	CreatedAt *time.Time `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time `json:"last_modified_at,omitempty",sql:"type:timestamp"`
	Title string `json:"title,omitempty",sql:"type:VARCHAR(128)"`
	Description string `json:"description,omitempty",sql:"type:VARCHAR(300)"`
	Amount int `json:"amount,omitempty",sql:"type:INT"`
	Frequency FrequencyType `json:"frequency,omitempty",sql:"type:ENUM('once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'annually', 'semi-annually')"`
	// Date is the date of the expense in MM/DD/YYYY format. It is not stored as a timestamp
	// for user ease.
	Date string `json:"date,omitempty", sql:"type:VARCHAR(10)"`
}

// ExpensesProperties is a mapping of expenses to properties. One expense can map to multiple propeties and
// one property can map to multiple expenses. This is a separate table within our database.
type ExpensesProperties struct {
	ExpenseID string `json:"expense_id",sql:"type:uuid; foreign key"`
	PropertyID string `json:"property_id",sql:"type:uuid; foreign key"`
}

type FrequencyType string

const (
	Once FrequencyType = "once"
	Daily FrequencyType = "daily"
	Weekly FrequencyType = "weekly"
	BiWeekly FrequencyType = "bi-weekly"
	Monthly FrequencyType = "monthly"
	Annually FrequencyType = "annually"
	SemiAnnually FrequencyType = "semi-annually"
)

// AddExpenseByUser will add a record of a expense for a user.
// We need to add two types of records to our database. The first is in our expenses table.
// This contains information about the expense. The second is in our expenses_properties table.
// This is just a mapping of expense -> properties. We need to perform the two additions within
// a transaction so we can roll back one or the other if either fails.
func (handle *Handle) AddExpense(expense *Expense, propertyIDs []string) error {

	if expense == nil {
		return errors.New("nil expense")
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {
		
		if err := tx.FirstOrCreate(&expense, expense).Error; err != nil {
			return err
		}

		for _, propertyID := range propertyIDs {

			expensesProperties := ExpensesProperties {
				ExpenseID: expense.ID,
				PropertyID: propertyID,
			}

			if err := tx.FirstOrCreate(&expensesProperties, expensesProperties).Error; err != nil {
				return err
			}
		}
		return nil
	})
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

func (handle *Handle) GetExpensesByProperty(userID, propertyID string) ([]*Expense, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var expenses []*Expense
	if err := handle.DB.Where("user_id = ? AND property_id = ?", userID, propertyID).Find(&expenses).Error; err != nil {
		return nil, err
	}
	return expenses, nil
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

	expense := Expense{
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