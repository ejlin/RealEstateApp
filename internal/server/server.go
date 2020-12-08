package server

import (
	"../db"
)

type Server struct {
	ID string

	// need a database connection.
	DBHandle *db.Handle
}
