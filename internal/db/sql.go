package db

import (
	_ "github.com/GoogleCloudPlatform/cloudsql-proxy/proxy/dialers/postgres"
	"github.com/jinzhu/gorm"
	_ "github.com/lib/pq"
)

type Handle struct {
	DB *gorm.DB
}

func NewConnection(dbType, dbConn string) (*gorm.DB, error) {
	db, err := gorm.Open(dbType, dbConn)
	if err != nil {
		return nil, err
	}
	return db, nil
}
