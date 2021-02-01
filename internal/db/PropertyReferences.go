package db

import (
	"database/sql"
)

// PropertiesReferences is a mapping of properties expenses and files. One expense can map to multiple properties and
// one property can map to multiple expenses. This is a separate table within our database.
type PropertiesReferences struct {
	UserID     string         `json:"user_id,omitempty",sql:"type:uuid; foreign key"`
	PropertyID sql.NullString `json:"property_id,omitempty",sql:"type:uuid; foreign key"`
	ExpenseID  sql.NullString `json:"expense_id,omitempty",sql:"type:uuid; foreign key"`
	FileID     sql.NullString `json:"file_id,omitempty",sql:"type:uuid; foreign key"`
}
