package progress

import (
	"fmt"
	"platform/pkg/database"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetCourseIDByItemID(db *gorm.DB, itemID uuid.UUID) (uuid.UUID, error) {
	var courseID string

	// Строим запрос в зависимости от типа элемента
	query := db.Table("modules").
		Select("modules.course_id").
		Joins("JOIN lectures ON lectures.module_id = modules.id").
		Joins("JOIN tasks ON tasks.module_id = modules.id").
		Joins("JOIN quizzes ON quizzes.module_id = modules.id").
		Where("lectures.id = ? OR tasks.id = ? OR quizzes.id = ?", itemID, itemID, itemID).
		Limit(1)

	// Выполняем запрос
	err := query.Scan(&courseID).Error
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to find course: %w", err)
	}

	return uuid.MustParse(courseID), nil
}

func MarkProgress(userId, entityId uuid.UUID, entityType string) error {
	// Определяем колонку для типа сущности
	var entityColumn string
	switch entityType {
	case "lecture":
		entityColumn = "lecture_id"
	case "task":
		entityColumn = "task_id"
	case "quiz":
		entityColumn = "quiz_id"
	default:
		return fmt.Errorf("unsupported entity type: %s", entityType)
	}

	// Находим запись об обучении пользователя
	var enrollment database.Enrollment
	const statusCompleted = "completed"

	db := database.DbManager()

	courseId, err := GetCourseIDByItemID(db, entityId)
	if err != nil {
		return fmt.Errorf("can't found course: %v", err)
	}
	if err := db.Where("user_id = ? AND course_id = ?", userId, courseId).
		First(&enrollment).Error; err != nil {
		return fmt.Errorf("enrollment not found: %v", err)
	}

	// Проверяем, существует ли запись прогресса

	progress := database.Progress{
		EnrollmentID: enrollment.ID,
		Status:       statusCompleted,
	}
	switch entityType {
	case "lecture":
		progress.LectureID = &entityId
	case "task":
		progress.TaskID = &entityId
	case "quiz":
		progress.QuizID = &entityId
	}

	query := db.Where("enrollment_id = ? AND "+entityColumn+" = ?", enrollment.ID, entityId)
	if err := query.FirstOrCreate(&progress).Error; err != nil {
		return fmt.Errorf("failed to update progress: %v", err)
	}
	return nil
}
