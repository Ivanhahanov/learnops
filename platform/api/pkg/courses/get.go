package courses

import (
	"fmt"
	"log"
	"platform/pkg/database"
	"platform/pkg/models"

	"github.com/lib/pq"
	"gorm.io/gorm/clause"
)

type CourseWithTasks struct {
	ID          string             `json:"urlId"`
	Title       string             `json:"title"`
	Tasks       []TaskWithStatus   `json:"tasks" gorm:"foreignKey:ID"`
	Description string             `json:"description,omitempty"`
	Difficulty  string             `json:"difficulty,omitempty"`
	Category    string             `json:"category,omitempty"`
	Tags        pq.StringArray     `gorm:"type:text[]" json:"tags"`
	Lectures    []*models.Lecture  `json:"lectures" gorm:"foreignKey:CourseID"`
	Materials   []*models.Material `json:"materials" gorm:"foreignKey:CourseID"`
	Tests       []*models.Test     `json:"tests" gorm:"foreignKey:CourseID"`
}

type TaskWithStatus struct {
	ID          string `json:"urlId"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Readme      string `json:"readme,omitempty"`
	Hint        string `json:"hint,omitempty"`
	Status      string `json:"status,omitempty"`
}

func GetCourses(username string) []*models.UsersCourse {
	var user models.User
	db := database.DbManager()
	if err := db.Preload("AvailableCourses.Course").First(&user, "name = ?", username).Error; err != nil {
		fmt.Println(err)
	}
	return user.AvailableCourses
}

func RegisterUserToCourse(courseId string, username string) {
	var user models.User
	db := database.DbManager()
	db.First(&user, "name = ?", username)
	user.AvailableCourses = append(user.AvailableCourses, &models.UsersCourse{CourseID: courseId})
	db.Save(user)
}

// TODO
var defaultCourses = []string{"linux"}

func RegisterToDefaultCourses(user *models.User) {
	db := database.DbManager()
	for _, courseId := range defaultCourses {
		user.AvailableCourses = append(user.AvailableCourses, &models.UsersCourse{CourseID: courseId})
	}
	db.Save(user)
}

func GetCourse(courseId string) models.Course {
	var course models.Course
	db := database.DbManager()
	if err := db.Preload(clause.Associations).Preload("Tests.Questions.Options").
		Where(&models.Course{ID: courseId}).First(&course).Error; err != nil {
		log.Println(err)
	}
	return course
}

func GetUsersCourse(courseId string, username string) CourseWithTasks {
	var course CourseWithTasks
	user := models.User{}
	db := database.DbManager()
	db.Where("name", username).First(&user)
	// todo Check if course exists in users_courses

	if err := db.Table("courses").
		Select("id", "title").
		Preload("Materials").
		Preload("Lectures").
		Preload("Tests.Questions.Options").
		Where("id = ?", courseId).
		// Joins("left join emails on emails.user_id = users.id").
		Find(&course).Error; err != nil {
		fmt.Println(err)
	}
	var tasks []TaskWithStatus
	err := db.Table("tasks").
		Select(`
				tasks.id, 
				tasks.title, 
				tasks.description, 
				tasks.readme, 
				tasks.hint, 
				COALESCE(task_statuses.status, 'not-started') as status`).
		Joins("LEFT JOIN task_statuses ON tasks.id = task_statuses.task_id AND task_statuses.user_id = ?", user.ID).
		Where("tasks.course_id = ?", courseId).
		Scan(&tasks).Error
	if err != nil {
		log.Println("task with status error", "Failed to fetch tasks")
	}
	course.Tasks = tasks
	// course.Tags = []string{}
	// course.Lectures = []*models.Lecture{}
	//course.Materials = []*models.Material{}
	// course.Tests = []*models.Test{}
	return course
}
