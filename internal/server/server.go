package server

import (
	"../db"

	"cloud.google.com/go/storage"
)

type Server struct {
	ID string

	DBHandle *db.Handle

	AdminDBHandle *db.Handle

	StorageClient *storage.Client

	// UsersBucket is where users information is stored.
	UsersBucket string

	GoogleAccessID   string
	GooglePrivateKey string

	LobAPIKey string
	EstatedAPIKey string
}
