package admin

import (
	"net/http"
	"platform/pkg/courses"
	"platform/pkg/database"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func UploadCourse(c echo.Context) error {
	var data database.Course
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "bad request")
	}
	if err := courses.UploadCourse(data); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.String(http.StatusOK, "ok")
}

type AssignCourseRequest struct {
	User    string   `json:"username"`
	Courses []string `json:"courses"`
}

func AssignCourseHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var req AssignCourseRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid request format"})
		}

		// Find the user by name
		var user database.User
		if err := db.Where("name = ?", req.User).First(&user).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "User not found"})
		}

		var alreadyAssigned []string
		var newlyAssigned []string

		// Assign each course by name
		for _, courseName := range req.Courses {
			var course database.Course
			if err := db.Where("name = ?", courseName).First(&course).Error; err != nil {
				return c.JSON(http.StatusNotFound, echo.Map{"error": "Course not found: " + courseName})
			}

			// Check if the course is already assigned to the user
			var existingEnrollment database.Enrollment
			if err := db.Where("user_id = ? AND course_id = ?", user.ID, course.ID).First(&existingEnrollment).Error; err == nil {
				// Course already assigned, add to the list
				alreadyAssigned = append(alreadyAssigned, courseName)
				continue
			}

			// Assign the course
			enrollment := database.Enrollment{
				ID:       uuid.New(),
				UserID:   user.ID,
				CourseID: course.ID,
			}
			if err := db.Create(&enrollment).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to assign course: " + courseName})
			}

			newlyAssigned = append(newlyAssigned, courseName)
		}

		return c.JSON(http.StatusOK, echo.Map{
			"message":          "Course assignment completed",
			"newly_assigned":   newlyAssigned,
			"already_assigned": alreadyAssigned,
		})
	}
}
