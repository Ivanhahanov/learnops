package database

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func Init() {
	db, err = gorm.Open(postgres.Open(os.Getenv("DATABASE_URL")+"&application_name=$ docs_simplecrud_gorm"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	// defer db.Close()
	if err != nil {
		panic("DB Connection Error")
	}
	Migrate(db)
}

func DbManager() *gorm.DB {
	return db
}
