package tasks

import (
	"log"
	"platform/pkg/database"
	"platform/pkg/models"
)

func GetTasks(ns, courseId string) []*models.Task {
	var course models.Course
	db := database.DbManager()
	if err := db.Preload("Tasks").Where(&models.Course{ID: courseId}).First(&course).Error; err != nil {
		log.Println(err)
	}
	return course.Tasks
}
