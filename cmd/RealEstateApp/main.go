package main

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"sync"

	"../../internal/db"
	"../../internal/server"

	"cloud.google.com/go/storage"
	"github.com/rs/zerolog/log"
)

var (
	projectID = "realestate-296303"

	conn = "host=realestate-296303:us-west2:realestate-db user=postgres password=realestate dbname=realestate-db sslmode=disable"

	// conn = "host=realestate-296303:us-west2:realestate-db user=postgres password=realestate dbname=realestate-admin-db sslmode=disable"


	UsersBucket = "realestate-users"
)

func main() {

	ctx := context.Background()

	log.Info().Msg("starting server")
	dbHandle, err := db.NewConnection("cloudsqlpostgres", conn)
	if err != nil {
		log.Error().Err(err).Msg("error connecting to database")
		return
	}
	log.Info().Msg("successfully connected to database")

	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Error().Err(err).Msg("error connecting to storage client")
		return
	}
	defer client.Close()
	log.Info().Msg("successfully connected to storage client")

	googleApplicationCredentialsFilePath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if googleApplicationCredentialsFilePath == "" {
		log.Error().Err(errors.New("invalid google application credentials")).Msg("unable to fetch google application credentials")
		return
	}

	pkey, err := ioutil.ReadFile(googleApplicationCredentialsFilePath)
	if err != nil {
		log.Error().Err(err).Msg("unable to read google application credentials")
		return
	}

	type GoogleApplicationCredentials struct {
		AccessID   string `json:"client_email"`
		PrivateKey string `json:"private_key"`
	}

	var creds GoogleApplicationCredentials
	err = json.Unmarshal(pkey, &creds)
	if err != nil {
		log.Error().Err(err).Msg("unable to unmarshal google application credentials")
		return
	}

	s := &server.Server{
		ID: "test",
		DBHandle: &db.Handle{
			DB: dbHandle,
		},
		StorageClient:    client,
		UsersBucket:      UsersBucket,
		GoogleAccessID:   creds.AccessID,
		GooglePrivateKey: creds.PrivateKey,
	}

	s.HandleRoutes()

	var wg sync.WaitGroup

	wg.Add(1)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()

		// Listen and serve.
		http.ListenAndServe(":8080", nil)
	}(&wg)

	wg.Wait()

}
