package main

import (
	"fmt"
	"net/http"
	"platform/pkg/auth"
	"platform/pkg/courses"
	"platform/pkg/database"
	"platform/pkg/models"
	"platform/pkg/tasks"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Readme(c echo.Context) error {
	taskName := c.Param("id")
	return c.String(
		http.StatusOK,
		tasks.GetReadme("default", taskName),
	)
}

func Tasks(c echo.Context) error {
	courseName := c.Param("course")
	return c.JSON(http.StatusOK, tasks.GetTasks("default", courseName))
}

// func Course(c echo.Context) error {
// 	courseName := c.Param("course")
// 	return c.JSON(http.StatusOK, courses.GetCourse(courseName))
// }

func Course(c echo.Context) error {
	courseName := c.Param("course")
	return c.JSON(http.StatusOK, courses.GetUsersCourse(courseName, c.Get("name").(string)))
}

func Courses(c echo.Context) error {
	return c.JSON(http.StatusOK, courses.GetCourses(c.Get("name").(string)))
}

func Run(c echo.Context) error {
	taskName := c.Param("id")
	info, err := tasks.RunTask(taskName,
		c.Get("name").(string),
		c.Get("token").(string),
	)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, info)
}

func Deploy(c echo.Context) error {
	//taskName := c.Param("id")
	tasks.CreateHelmRelease()
	return c.String(http.StatusOK, "ok")
}

func Remove(c echo.Context) error {
	//taskName := c.Param("id")
	tasks.UninstallRelease()
	return c.String(http.StatusOK, "ok")
}

func Status(c echo.Context) error {
	taskName := c.Param("id")
	info, err := tasks.GetStatus(taskName,
		c.Get("name").(string),
		c.Get("token").(string),
	)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, info)
}

func StopTask(c echo.Context) error {
	taskName := c.Param("id")
	err := tasks.StopTask(taskName,
		c.Get("name").(string),
		c.Get("token").(string),
	)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.String(http.StatusOK, "ok")
}

func VerifyTask(c echo.Context) error {
	taskName := c.Param("id")
	verdict, err := tasks.VerifyTask(taskName,
		c.Get("name").(string),
		c.Get("token").(string),
	)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.String(http.StatusOK, verdict)
}

func UploadCourses(c echo.Context) error {
	var data []*models.Course
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "bad request")
	}
	for _, row := range data {

		fmt.Println(row)
	}
	if err := courses.UploadCourses(data); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.String(http.StatusOK, "ok")
}

func main() {
	database.Init()
	e := echo.New()
	e.Use(
		middleware.Logger(),
		middleware.RequestID(),
	)
	api := e.Group("/api")
	api.Use(
		auth.KeycloakTokenToContextMiddleware,
	)
	task := api.Group("/task")
	task.GET("/readme/:id", Readme)
	task.GET("/deploy/:id", Deploy)
	task.GET("/run/:id", Run)
	task.GET("/stop/:id", StopTask)
	task.GET("/remove/:id", Remove)
	task.GET("/status/:id", Status)
	task.GET("/verify/:id", VerifyTask)
	api.GET("/tasks/:course", Tasks)
	api.GET("/courses", Courses)
	// api.POST("/courses/upload", UploadCourses)
	api.GET("/course/:course", Course)
	e.POST("/api/courses/upload", UploadCourses)
	// test
	// api.POST("/register", auth.Register)
	// api.GET("/user", auth.User)
	// api.POST("/logout", auth.Logout)

	// e.POST("/api/token", auth.Token)
	// e.POST("/api/token/refresh", auth.RefreshToken)

	e.Logger.Fatal(e.Start(":8080"))
}
