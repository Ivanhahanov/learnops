package courses

import (
	"errors"
	"fmt"
	"platform/pkg/database"
	"sort"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateOrUpdateCourse(db *gorm.DB, course *database.Course) error {
	tx := db.Begin() // Начинаем транзакцию
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Найти существующий курс по имени
	var existingCourse database.Course
	if err := tx.Where("name = ?", course.Name).First(&existingCourse).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			return err
		}
	}

	if existingCourse.ID != uuid.Nil {
		// Курс существует, обновляем его
		course.ID = existingCourse.ID
		if err := tx.Model(&existingCourse).Updates(course).Error; err != nil {
			tx.Rollback()
			return err
		}
	} else {
		// Курс не существует, создаём его
		if err := tx.Create(course).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// Обновляем модули
	for _, module := range course.Modules {
		module.CourseID = course.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateModule(tx, module); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func CreateOrUpdateModule(db *gorm.DB, module *database.Module) error {
	// Find module by name
	var existingModule database.Module
	if err := db.Where("name = ? AND course_id = ?", module.Name, module.CourseID).First(&existingModule).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if existingModule.ID != uuid.Nil {
		// Update module
		module.ID = existingModule.ID
		if err := db.Model(&existingModule).Updates(module).Error; err != nil {
			return err
		}
	} else {
		// If new Module
		if err := db.Create(module).Error; err != nil {
			return err
		}
	}

	// Update Lectures
	for _, lecture := range module.Lectures {
		lecture.ModuleID = module.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateLecture(db, lecture); err != nil {
			return err
		}
	}

	// Update tasks
	for _, task := range module.Tasks {
		task.ModuleID = module.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateTask(db, task); err != nil {
			return err
		}
	}
	// Update quizzes
	for _, quiz := range module.Quizzes {
		quiz.ModuleID = module.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateQuiz(db, quiz); err != nil {
			return err
		}
	}

	return nil
}

func CreateOrUpdateLecture(db *gorm.DB, lecture *database.Lecture) error {
	var existingLecture database.Lecture
	if err := db.Where("name = ? AND module_id = ?", lecture.Name, lecture.ModuleID).First(&existingLecture).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if existingLecture.ID != uuid.Nil {
		lecture.ID = existingLecture.ID
		return db.Model(&existingLecture).Updates(lecture).Error
	}

	return db.Create(lecture).Error
}

func CreateOrUpdateTask(db *gorm.DB, task *database.Task) error {
	var existingTask database.Task
	if err := db.Where("name = ? AND module_id = ?", task.Name, task.ModuleID).First(&existingTask).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if existingTask.ID != uuid.Nil {
		task.ID = existingTask.ID
		return db.Model(&existingTask).Updates(task).Error
	}

	return db.Create(task).Error
}

func CreateOrUpdateQuiz(db *gorm.DB, quiz *database.Quiz) error {
	var existingQuiz database.Quiz
	if err := db.Where("name = ? AND module_id = ?", quiz.Name, quiz.ModuleID).First(&existingQuiz).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if existingQuiz.ID != uuid.Nil {
		quiz.ID = existingQuiz.ID
		return db.Model(&existingQuiz).Updates(quiz).Error
	}

	return db.Create(quiz).Error
}

func UploadCourse(course database.Course) error {
	db := database.DbManager()
	return CreateOrUpdateCourse(db, &course)
}

type PersonalModule struct {
	ID        uuid.UUID        `json:"id,omitempty"`
	Title     string           `json:"title"`
	Data      []PersonalStatus `json:"data"`
	Order     int              `json:"order"`
	Completed bool             `json:"completed"`
}

type PersonalStatus struct {
	Title     string    `json:"title"`
	Type      string    `json:"type"`
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name,omitempty"`
	Order     int       `json:"order"`
	Completed bool      `json:"completed"`
}

func GetQuiz(quizId string) (*database.Quiz, error) {
	var quiz = database.Quiz{
		ID: uuid.MustParse(quizId),
	}
	err := database.DbManager().Preload("Questions.Options").First(&quiz).Error
	return &quiz, err
}
func GetModules(userId uuid.UUID, courseName string) ([]PersonalModule, error) {
	db := database.DbManager()
	var enrollment database.Enrollment
	var course database.Course

	// Получение курса
	if err := db.First(&course, "name = ?", courseName).Error; err != nil {
		return nil, fmt.Errorf("course not found: %v", err)
	}

	// Получение записи об участии пользователя в курсе
	if err := db.
		Preload("Course.Modules.Lectures").
		Preload("Course.Modules.Tasks").
		Preload("Course.Modules.Quizzes").
		Preload("Progress").
		Where("user_id = ? AND course_id = ?", userId, course.ID).
		First(&enrollment).Error; err != nil {
		return nil, fmt.Errorf("enrollment not found: %v", err)
	}

	var result []PersonalModule

	// Формирование результата
	for _, module := range enrollment.Course.Modules {
		moduleCompleted := true
		var data []PersonalStatus

		// Обработка всех типов данных (лекции, задания, квизы)
		processItems(module.Lectures, "lecture", enrollment.Progress, &data, &moduleCompleted)
		processItems(module.Tasks, "task", enrollment.Progress, &data, &moduleCompleted)
		processItems(module.Quizzes, "quiz", enrollment.Progress, &data, &moduleCompleted)

		// Сортировка data по weight
		sort.Slice(data, func(i, j int) bool {
			weightI := data[i].Order
			weightJ := data[j].Order
			return weightI < weightJ
		})

		// Добавление модуля в результат
		result = append(result, PersonalModule{
			ID:        module.ID,
			Title:     module.Title,
			Data:      data,
			Order:     module.Order,
			Completed: moduleCompleted,
		})
	}

	// Сортировка модулей по weight
	sort.Slice(result, func(i, j int) bool {
		weightI := result[i].Order
		weightJ := result[j].Order
		return weightI < weightJ
	})
	return result, nil
}

// processItems - Обработка элементов (лекции, задания, квизы) и добавление в data
func processItems(items interface{}, itemType string, progress []*database.Progress, data *[]PersonalStatus, moduleCompleted *bool) {
	switch items := items.(type) {
	case []*database.Lecture:
		for _, item := range items {
			status := getStatus(progress, item.ID, itemType)
			*data = append(*data, PersonalStatus{
				Type:      itemType,
				Title:     item.Title,
				ID:        item.ID,
				Order:     item.Order,
				Completed: status == "completed",
			})
			if status != "completed" {
				*moduleCompleted = false
			}
		}
	case []*database.Task:
		for _, item := range items {
			status := getStatus(progress, item.ID, itemType)
			*data = append(*data, PersonalStatus{
				Type:      itemType,
				Title:     item.Title,
				ID:        item.ID,
				Order:     item.Order,
				Name:      item.Name,
				Completed: status == "completed",
			})
			if status != "completed" {
				*moduleCompleted = false
			}
		}
	case []*database.Quiz:
		for _, item := range items {
			status := getStatus(progress, item.ID, itemType)
			*data = append(*data, PersonalStatus{
				Type:      itemType,
				Title:     item.Title,
				ID:        item.ID,
				Order:     item.Order,
				Completed: status == "completed",
			})
			if status != "completed" {
				*moduleCompleted = false
			}
		}
	}
}

func getStatus(progresses []*database.Progress, entityID uuid.UUID, entityType string) string {
	for _, progress := range progresses {
		switch entityType {
		case "lecture":
			if progress.LectureID != nil && *progress.LectureID == entityID {
				return progress.Status
			}
		case "task":
			if progress.TaskID != nil && *progress.TaskID == entityID {
				return progress.Status
			}
		case "quiz":
			if progress.QuizID != nil && *progress.QuizID == entityID {
				return progress.Status
			}
		}
	}
	return "not_started"
}
