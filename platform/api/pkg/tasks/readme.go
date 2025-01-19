package tasks

import (
	"log"
	"platform/pkg/database"
	"platform/pkg/models"
)

func GetReadme(ns, name string) string {
	var task models.Task
	db := database.DbManager()
	if err := db.Where(&models.Task{ID: name}).First(&task).Error; err != nil {
		log.Println(err)
	}
	return task.Readme
}
