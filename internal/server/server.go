package server

import (
	"../db"

	"cloud.google.com/go/storage"
)

type Server struct {
	ID string

	// need a database connection.
	DBHandle *db.Handle

	StorageClient *storage.Client

	// UsersBucket is where users information is stored.
	UsersBucket string

	GoogleAccessID   string
	GooglePrivateKey string
}
