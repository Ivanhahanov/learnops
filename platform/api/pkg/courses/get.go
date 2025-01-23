package courses

import (
	"fmt"
	"platform/pkg/database"

	"github.com/google/uuid"
)

func GetCourses(username string) []database.Course {
	var courses = []database.Course{}
	db := database.DbManager()
	err := db.Find(&courses).Error
	if err != nil {
		fmt.Println(err)
	}
	return courses
}

// TODO
// var defaultCourses = []string{"linux"}

// func RegisterToDefaultCourses(user *database.User) {
// 	db := database.DbManager()
// 	for _, courseId := range defaultCourses {
// 		user.Enrollments = append(user.Enrollments, &database.Enrollment{CourseID: courseId})
// 	}
// 	db.Save(user)
// }

// CourseProgressResponse представляет структуру ответа
type CourseProgressResponse struct {
	Title             string `json:"title"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	Category          string `json:"category"`
	Difficulty        string `json:"difficulty"`
	IsStarted         bool   `json:"is_started"`
	CompletedTasks    int    `json:"completed_tasks"`
	TotalTasks        int    `json:"total_tasks"`
	CompletedLectures int    `json:"completed_lectures"`
	TotalLectures     int    `json:"total_lectures"`
	CompletedQuizzes  int    `json:"completed_quizzes"`
	TotalQuizzes      int    `json:"total_quizzes"`
}

// GetCoursesWithProgress получает данные по прогрессу курсов для пользователя
func GetCoursesWithProgress(userID uuid.UUID) ([]CourseProgressResponse, error) {
	var responses []CourseProgressResponse
	db := database.DbManager()
	// Получить все курсы, в которых пользователь зарегистрирован
	var enrollments []database.Enrollment
	err := db.Preload("Course.Modules.Lectures").
		Preload("Course.Modules.Tasks").
		Preload("Course.Modules.Quizzes").
		Preload("Progress").
		Where("user_id = ?", userID).
		Find(&enrollments).Error
	if err != nil {
		return nil, err
	}

	// Обработать каждую регистрацию
	for _, enrollment := range enrollments {
		course := enrollment.Course
		completedTasks := 0
		totalTasks := 0
		completedLectures := 0
		totalLectures := 0
		completedQuizzes := 0
		totalQuizzes := 0

		// Пройтись по модулям курса
		for _, module := range course.Modules {
			// Задания
			totalTasks += len(module.Tasks)
			for _, task := range module.Tasks {
				for _, progress := range enrollment.Progress {
					if progress.TaskID != nil && *progress.TaskID == task.ID && progress.Status == "completed" {
						completedTasks++
					}
				}
			}

			// Лекции
			totalLectures += len(module.Lectures)
			for _, lecture := range module.Lectures {
				for _, progress := range enrollment.Progress {
					if progress.LectureID != nil && *progress.LectureID == lecture.ID && progress.Status == "completed" {
						completedLectures++
					}
				}
			}

			// Викторины
			totalQuizzes += len(module.Quizzes)
			for _, quiz := range module.Quizzes {
				for _, progress := range enrollment.Progress {
					if progress.QuizID != nil && *progress.QuizID == quiz.ID && progress.Status == "completed" {
						completedQuizzes++
					}
				}
			}
		}

		// Добавить данные в ответ
		responses = append(responses, CourseProgressResponse{
			Title:             course.Title,
			Name:              course.Name,
			Description:       course.Description,
			Category:          course.Category,
			Difficulty:        course.Difficulty,
			IsStarted:         completedTasks > 0 || completedLectures > 0 || completedQuizzes > 0,
			CompletedTasks:    completedTasks,
			TotalTasks:        totalTasks,
			CompletedLectures: completedLectures,
			TotalLectures:     totalLectures,
			CompletedQuizzes:  completedQuizzes,
			TotalQuizzes:      totalQuizzes,
		})
	}

	return responses, nil
}
