package courses

import (
	"platform/pkg/database"

	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

func UploadCourse(course database.Course) error {
	db := database.DbManager()
	if err := db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Save(&course).Error; err != nil {
		return err
	}
	// if db.Model(&course).Where("name = ?", course.Name).Updates(&course).RowsAffected == 0 {
	// 	db.Create(&course)
	// }
	return nil
}

type PersonalModule struct {
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

func GetFullCourses() ([]database.Course, error) {
	var courses = []database.Course{}
	db := database.DbManager()
	err := db.Preload("Modules").Find(&courses).Error
	return courses, err
}

func GetLecture(lectureId string) (*database.Lecture, error) {
	var lecture = database.Lecture{
		ID: uuid.MustParse(lectureId),
	}
	err := database.DbManager().Select("content").First(&lecture).Error
	return &lecture, err
}

func GetQuiz(quizId string) (*database.Quiz, error) {
	var quiz = database.Quiz{
		ID: uuid.MustParse(quizId),
	}
	err := database.DbManager().Preload("Questions.Options").First(&quiz).Error
	return &quiz, err
}

func GetModules(courseName, userName string) ([]PersonalModule, error) {
	db := database.DbManager()
	var enrollment database.Enrollment
	var course database.Course
	var user database.User
	// TODO: validate if not exists
	// Get user and course ID
	db.First(&user, "name = ?", userName)
	db.First(&course, "name = ?", courseName)

	err := db.Preload("Course.Modules.Lectures").
		Preload("Course.Modules.Tasks").
		Preload("Course.Modules.Quizzes").
		Preload("Progress", "enrollment_id = ?", user.ID).
		Where("user_id = ? AND course_id = ?", user.ID, course.ID).
		First(&enrollment).Error

	if err != nil {
		return nil, err
	}

	var result []PersonalModule

	for _, module := range enrollment.Course.Modules {
		moduleCompleted := true

		// Lectures
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

		// Tasks
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

		// Quizzes
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

		result = append(result, PersonalModule{
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
