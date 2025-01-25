package courses

import (
	"platform/pkg/database"

	"github.com/google/uuid"
)

func GetLecture(lectureId string) (*database.Lecture, error) {
	var lecture = database.Lecture{
		ID: uuid.MustParse(lectureId),
	}
	err := database.DbManager().Select("content").First(&lecture).Error
	return &lecture, err
}

// CourseProgressResponse
type CourseProgressResponse struct {
	Title             string `json:"title"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	Category          string `json:"category"`
	Difficulty        string `json:"difficulty"`
	IsStarted         bool   `json:"is_started"`
	IsCompleted       bool   `json:"is_completed"`
	CompletedTasks    int    `json:"completed_tasks"`
	TotalTasks        int    `json:"total_tasks"`
	CompletedLectures int    `json:"completed_lectures"`
	TotalLectures     int    `json:"total_lectures"`
	CompletedQuizzes  int    `json:"completed_quizzes"`
	TotalQuizzes      int    `json:"total_quizzes"`
}

// GetCoursesWithProgress
func GetCoursesWithProgress(userID uuid.UUID) ([]CourseProgressResponse, error) {
	var responses = []CourseProgressResponse{}
	db := database.DbManager()

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

	for _, enrollment := range enrollments {
		course := enrollment.Course
		completedTasks := 0
		totalTasks := 0
		completedLectures := 0
		totalLectures := 0
		completedQuizzes := 0
		totalQuizzes := 0

		for _, module := range course.Modules {
			totalTasks += len(module.Tasks)
			for _, task := range module.Tasks {
				for _, progress := range enrollment.Progress {
					if progress.TaskID != nil && *progress.TaskID == task.ID && progress.Status == "completed" {
						completedTasks++
					}
				}
			}
			totalLectures += len(module.Lectures)
			for _, lecture := range module.Lectures {
				for _, progress := range enrollment.Progress {
					if progress.LectureID != nil && *progress.LectureID == lecture.ID && progress.Status == "completed" {
						completedLectures++
					}
				}
			}
			totalQuizzes += len(module.Quizzes)
			for _, quiz := range module.Quizzes {
				for _, progress := range enrollment.Progress {
					if progress.QuizID != nil && *progress.QuizID == quiz.ID && progress.Status == "completed" {
						completedQuizzes++
					}
				}
			}
		}

		responses = append(responses, CourseProgressResponse{
			Title:             course.Title,
			Name:              course.Name,
			Description:       course.Description,
			Category:          course.Category,
			Difficulty:        course.Difficulty,
			CompletedTasks:    completedTasks,
			TotalTasks:        totalTasks,
			CompletedLectures: completedLectures,
			TotalLectures:     totalLectures,
			CompletedQuizzes:  completedQuizzes,
			TotalQuizzes:      totalQuizzes,
			IsStarted:         completedTasks > 0 || completedLectures > 0 || completedQuizzes > 0,
			IsCompleted:       completedTasks == totalTasks && completedLectures == totalLectures && completedQuizzes == totalQuizzes,
		})
	}

	return responses, nil
}
