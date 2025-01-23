package tasks

import (
	"log"
	"platform/pkg/database"
)

func GetReadme(taskName string) string {
	var task database.Task
	db := database.DbManager()
	if err := db.Select("readme").Where("name = ?", taskName).First(&task).Error; err != nil {
		log.Println(err)
	}
	return task.Readme
}
