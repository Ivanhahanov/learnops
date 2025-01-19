package courses

import (
	"platform/pkg/database"
	"platform/pkg/models"

	"gorm.io/gorm/clause"
)

func UploadCourses(courses []*models.Course) error {
	db := database.DbManager()
	if err := db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(courses).Error; err != nil {
		return err
	}
	// // needs for update course tasks
	// for _, course := range courses {
	// 	if err := db.Clauses(clause.OnConflict{
	// 		UpdateAll: true,
	// 	}).Create(course.Tasks).Error; err != nil {
	// 		return err
	// 	}
	// }
	return nil
}
