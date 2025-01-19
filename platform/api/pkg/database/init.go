package database

import (
	"log"
	"os"
	"platform/pkg/models"

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
	db.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.UsersCourse{},
		&models.Task{},
		&models.TaskStatus{},
		&models.Lecture{},
		&models.LectureStatus{},
		&models.Material{},
		&models.Test{},
		&models.TestStatus{},
		&models.Question{},
		&models.Option{},
	)
}

func DbManager() *gorm.DB {
	return db
}
