package course

import (
	"net/http"
	"platform/pkg/courses"
	"platform/pkg/database"

	"github.com/labstack/echo/v4"
)

func Courses(c echo.Context) error {
	resp, err := courses.GetCoursesWithProgress(c.Get("user").(*database.User).ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, resp)
}

func GetModules(c echo.Context) error {
	courseName := c.Param("course")
	modules, err := courses.GetModules(c.Get("user").(*database.User).ID, courseName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, modules)
}

type AssignCourseRequest struct {
	User   string `json:"user,omitempty"`
	Course string `json:"course,omitempty"`
}
