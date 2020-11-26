package main

import (
	"net/http"
	"sync"

	"../../internal/server"
	"../../internal/db"

	"github.com/rs/zerolog/log"
)

func main() {

	log.Info().Msg("starting server")

	// connect to our cloud SQL Postgres Database.
	conn := "host=realestate-296303:us-west2:realestate-db user=postgres password=realestate dbname=realestate-db sslmode=disable"
	// conn := "postgres@cloudsql(realestate-296303:us-west2:realestate-db)/db-name?charset=utf8&parseTime=True&loc=UTC"
	dbHandle, err := db.NewConnection("cloudsqlpostgres", conn)
	if err != nil {
		log.Error().Err(err).Msg("error connecting to database")
		return
	}

	log.Info().Msg("successfully connected to database")

	s := &server.Server {
		ID: "test",
		DBHandle: &db.Handle {
			DB: dbHandle,
		},
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