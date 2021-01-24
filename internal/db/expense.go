package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

type Expense struct {
	ID             string        `json:"id",sql:"type:uuid; primary key"`
	UserID         string        `json:"user_id",sql:"type:uuid; foreign key"`
	CreatedAt      *time.Time    `json:"created_at,omitempty",sql:"type:timestamp"`
	LastModifiedAt *time.Time    `json:"last_modified_at,omitempty",sql:"type:timestamp"`
	Title          string        `json:"title,omitempty",sql:"type:VARCHAR(128)"`
	Description    string        `json:"description,omitempty",sql:"type:VARCHAR(300)"`
	Amount         float64       `json:"amount,omitempty",sql:"type:type:NUMERIC(10,2)"`
	Frequency      FrequencyType `json:"frequency,omitempty",sql:"type:ENUM('once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'annually', 'semi-annually')"`
	// Date is the date of the expense in MM/DD/YYYY format. It is not stored as a timestamp
	// for user ease.
	Date string `json:"date,omitempty", sql:"type:VARCHAR(10)"`
}

type FrequencyType string

const (
	Once         FrequencyType = "once"
	Daily        FrequencyType = "daily"
	Weekly       FrequencyType = "weekly"
	BiWeekly     FrequencyType = "bi-weekly"
	Monthly      FrequencyType = "monthly"
	Annually     FrequencyType = "annually"
	SemiAnnually FrequencyType = "semi-annually"
)

// AddExpense will add a record of a expense for a user.
// We need to add three types of records to our database. The first is in our expenses table.
// This contains information about the expense. The second is in our properties_references table.
// This is just a mapping of properties -> {expenses, files}. We need to perform the three additions
// within a transaction so we can roll them back if any of them fail.
// We also need to upload our file to google cloud storage. If it fails to upload, roll back these
// transactions.
func (handle *Handle) AddExpense(ctx context.Context, userID string, expense *Expense, propertyIDs []string, file *File, addFileToCloudstorage func(ctx context.Context) error) error {

	if _, err := uuid.Parse(userID); err != nil {
		return err
	}	

	if expense == nil {
		return errors.New("nil expense")
	}

	return handle.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.FirstOrCreate(&expense, expense).Error; err != nil {
			return fmt.Errorf("error adding expense: %w", err)
		}
		
		if file != nil {
			if err := tx.FirstOrCreate(&file, file).Error; err != nil {
				return fmt.Errorf("error adding file: %w", err)
			}
		}

		var fileID string
		if file != nil {
			fileID = file.ID
		}

		var expenseID string
		if expense != nil {
			expenseID = expense.ID
		}

		fmt.Println(propertyIDs)

		for _, propertyID := range propertyIDs {


			propertyReference := PropertiesReferences{
				UserID: userID, 
				ExpenseID: sql.NullString{
					String: expenseID,
					Valid:  true,
				},
				FileID: sql.NullString{
					String: fileID,
					Valid:  true,
				},
			}

			if propertyID != "" {
				propertyReference.PropertyID = sql.NullString{
					String: propertyID,
					Valid: true,
				}
			}

			if err := tx.FirstOrCreate(&propertyReference, propertyReference).Error; err != nil {
				return err
			}
		}
		

		if file != nil {

			// Note: We MUST perform file operations in this order. First
			// create the db record, _then_ create the GCS file. This is in
			// case we successfully create the record, but cannot successfully
			// upload to GCS. Then we can roll back all of our transactions.
			//
			// TLDR: File upload to GCS _must_ come last after all db operations
			// because we can rollback db operations, but we cannot rollback
			// GCS uploads.
			if err := addFileToCloudstorage(ctx); err != nil {
				return err
			}
		}

		return nil
	})
}

// GetExpenseByID will fetch the expense by its unique ID.
func (handle *Handle) GetExpenseByID(userID, expenseID string) (*Expense, error) {

	_, err := uuid.Parse(expenseID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var expense Expense
	if err := handle.DB.Where("id = ? AND user_id = ?", expenseID, userID).First(&expense).Error; err != nil {
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

// GetExpensesByUser will fetch all properties associated with a user.
func (handle *Handle) GetExpensesByUser(userID string) ([]*Expense, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var expenses []*Expense
	if err := handle.DB.Where("user_id = ?", userID).Find(&expenses).Error; err != nil {
		return nil, err
	}
	return expenses, nil
}

// RemoveExpenseByID will delete an expense from our database.
func (handle *Handle) DeleteExpenseByID(ctx context.Context, 
										userID, 
										expenseID string, 
										deleteFileFromCloudstorage func(ctx context.Context, filePath string) error) error {

	// TODO: eric.lin to explore gorm soft delete options. Provide users with undo method.
	_, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	_, err = uuid.Parse(expenseID)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	// Fetch our file first so we can delete it from GCS.
	propertyReference := PropertiesReferences{
		ExpenseID: sql.NullString{
			String: expenseID,
		},
	}

	// Fetch any associated files.
	if err := handle.DB.Where("expense_id = ?", expenseID).Find(&propertyReference).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// If record is not found, continue.
		} else {
			return err
		}
	}

	fileID := propertyReference.FileID.String

	var fileRecordExists bool
	// If there is a file associated with this expense, fetch the file path so we can delete it from our cloudstorage.
	file := File{}
	if fileID != "" {
		if err := handle.DB.Where("id = ? AND user_id = ?", fileID, userID).Find(&file).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				fileRecordExists = false
			} else {
				return err
			}
		}
		fileRecordExists = true
	}


	return handle.DB.Transaction(func(tx *gorm.DB) error {

		expense := Expense{
			ID: expenseID,
		}

		propertyReference := PropertiesReferences{
			ExpenseID: sql.NullString{
				String: expenseID,
			},
		}

		if err := tx.Where("user_id = ?", userID).Delete(&expense).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}
		

		if fileID != "" && fileRecordExists{
			if err := tx.Where("id = ? AND user_id = ?", fileID, userID).Delete(&file).Error; err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}
			}
		}

		if err := tx.Where("expense_id = ? AND user_id = ?", expenseID, userID).Delete(&propertyReference).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}

		// Delete our file from cloudstorage. This line must go last. File upload to GCS _must_ 
		// come last after all db operations because we can rollback db operations, but we cannot 
		// rollback GCS uploads.
		if file.Path != "" {
			if err := deleteFileFromCloudstorage(ctx, file.Path); err != nil {
				if !errors.Is(err, storage.ErrObjectNotExist) {
					return err
				}
			}
		}

		return nil
	})
}

/*****************************************************************************/

func (handle *Handle) GetPropertyReferencesAssociatedWithExpense(userID, expenseID string) ([]PropertiesReferences, error) {

	_, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	_, err = uuid.Parse(expenseID)
	if err != nil {
		return nil, fmt.Errorf("invalid UUID: %w", err)
	}

	var propertiesReferences []PropertiesReferences
	if err := handle.DB.Select("property_id, file_id").Where("expense_id = ? AND user_id = ?", expenseID, userID).Find(&propertiesReferences).Error; err != nil {
		return nil, err
	}
	return propertiesReferences, nil
}
