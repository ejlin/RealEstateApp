package main

import (
	"context"
	"time"
	
	"../../internal/db"

	"github.com/alecthomas/kong"
	"github.com/rs/zerolog/log"
)

var (
	conn = "host=realestate-296303:us-west2:realestate-db user=postgres password=realestate dbname=realestate-db sslmode=disable"
)

/*****************************************************************************/
/* Value Estimator is a microservice that will periodically provide property
/* estimates for our properties.
/* 
/* We shard our properties by 
/*****************************************************************************/

type Context struct {
	Debug bool
	ctx context.Context
}

var cli struct {
	Debug bool `help:"Enable debug mode."`

	EstimateCmd EstimateCmd `cmd help:"Run estimate program"`	// estimate-cmd
}

type EstimateCmd struct {
	EstatedAPIKey string `flag required name:"estated_api_key" help:"Estated API Key"`
	EstimateIntervalSeconds int `flag name:"estimate_interval_seconds" help:"Interval to generate estimates on."` 
}

type Estimate struct {
	EstimateCmd EstimateCmd
}

func main() {
	cmd := kong.Parse(&cli)
	ctx := context.Background()
	// Call the Run() method of the selected parsed command.
	err := cmd.Run(&Context{
		ctx: ctx,
		Debug: cli.Debug,
	})
	cmd.FatalIfErrorf(err)
}

func (cmd *EstimateCmd) Run(rCtx *Context) error {

	ctx := rCtx.ctx
	dbHandle, err := db.NewConnection("cloudsqlpostgres", conn)
	if err != nil {
		log.Error().Err(err).Msg("error connecting to database")
		return err
	}
	log.Info().Msg("successfully connected to database")

	db := &db.Handle{
		DB: dbHandle,
	}

	ticker := time.NewTicker(time.Duration(cmd.EstimateIntervalSeconds) * time.Second)

	for {
		err := cmd.GenerateEstimates(ctx, db)
		if err != nil {
			return err
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
	return nil
}