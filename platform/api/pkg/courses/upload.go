package courses

import (
	"errors"
	"fmt"
	"platform/pkg/database"

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
	// Найти существующий модуль по имени и course_id
	var existingModule database.Module
	if err := db.Where("name = ? AND course_id = ?", module.Name, module.CourseID).First(&existingModule).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if existingModule.ID != uuid.Nil {
		// Модуль существует, обновляем его
		module.ID = existingModule.ID
		if err := db.Model(&existingModule).Updates(module).Error; err != nil {
			return err
		}
	} else {
		// Модуль не существует, создаём его
		if err := db.Create(module).Error; err != nil {
			return err
		}
	}

	// Обновляем лекции
	for _, lecture := range module.Lectures {
		lecture.ModuleID = module.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateLecture(db, lecture); err != nil {
			return err
		}
	}

	// Обновляем задания
	for _, task := range module.Tasks {
		task.ModuleID = module.ID // Убедиться, что связь установлена
		if err := CreateOrUpdateTask(db, task); err != nil {
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

func UploadCourse(course database.Course) error {
	db := database.DbManager()
	return CreateOrUpdateCourse(db, &course)
}

type PersonalModule struct {
	ID        uuid.UUID        `json:"id,omitempty"`
	Title     string           `json:"title"`
	Lectures  []PersonalStatus `json:"lectures"`
	Tasks     []PersonalStatus `json:"tasks"`
	Quizzes   []PersonalStatus `json:"quizzes"`
	Completed bool             `json:"completed"`
}

type PersonalStatus struct {
	Title     string    `json:"title"`
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name,omitempty"`
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

		// Обработка лекций
		var lectures []PersonalStatus
		for _, lecture := range module.Lectures {
			progress := getStatus(enrollment.Progress, lecture.ID, "lecture")
			lectures = append(lectures, PersonalStatus{
				ID:        lecture.ID,
				Title:     lecture.Title,
				Completed: progress == "completed",
			})
			if progress != "completed" {
				moduleCompleted = false
			}
		}

		// Обработка заданий
		var tasks []PersonalStatus
		for _, task := range module.Tasks {
			progress := getStatus(enrollment.Progress, task.ID, "task")
			tasks = append(tasks, PersonalStatus{
				ID:        task.ID,
				Title:     task.Title,
				Name:      task.Name,
				Completed: progress == "completed",
			})
			if progress != "completed" {
				moduleCompleted = false
			}
		}

		// Обработка квизов
		var quizzes []PersonalStatus
		for _, quiz := range module.Quizzes {
			progress := getStatus(enrollment.Progress, quiz.ID, "quiz")
			quizzes = append(quizzes, PersonalStatus{
				ID:        quiz.ID,
				Title:     quiz.Title,
				Completed: progress == "completed",
			})
			if progress != "completed" {
				moduleCompleted = false
			}
		}

		// Добавление модуля в результат
		result = append(result, PersonalModule{
			ID:        module.ID,
			Title:     module.Title,
			Lectures:  lectures,
			Tasks:     tasks,
			Quizzes:   quizzes,
			Completed: moduleCompleted,
		})
	}

	return result, nil
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
