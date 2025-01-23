package main

import (
	"fmt"
	"net/http"
	"platform/pkg/auth"
	"platform/pkg/courses"
	"platform/pkg/database"
	"platform/pkg/tasks"
	"platform/pkg/tasks/controller"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Readme(c echo.Context) error {
	taskId := c.Param("id")
	return c.String(
		http.StatusOK,
		tasks.GetReadme(taskId),
	)
}

func Courses(c echo.Context) error {
	resp, err := courses.GetCoursesWithProgress(c.Get("user_id").(uuid.UUID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, resp)
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

// TODO: remove
func Deploy(c echo.Context) error {
	//taskName := c.Param("id")
	tasks.CreateHelmRelease()
	return c.String(http.StatusOK, "ok")
}

// TODO: remove
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
	User   string `json:"user,omitempty"`
	Course string `json:"course,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Добавьте проверку источника в продакшене
	},
}

func handleWebSocket(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		fmt.Println("Ошибка обновления до WebSocket:", err)
		return err
	}
	defer conn.Close()

	// Запускаем наблюдение за статусом Pod
	controller.NewController(
		c.QueryParam("name"),
		c.QueryParam("token"),
		c.Param("id"),
		"terminal",
		conn,
	).Watch()
	return nil
}

func GetModules(c echo.Context) error {
	courseName := c.Param("course")
	modules, err := courses.GetModules(courseName, c.Get("name").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, modules)
}
func GetFullCourses(c echo.Context) error {
	courses, err := courses.GetFullCourses()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, courses)
}

func main() {
	database.Init()
	e := echo.New()
	e.Use(
		middleware.Logger(),
		middleware.RequestID(),
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: []string{"*"},
			AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		}))
	api := e.Group("/api")
	api.Use(
		auth.KeycloakTokenToContextMiddleware,
	)
	task := api.Group("/task")
	task.GET("/readme/:id", Readme)
	// task.GET("/deploy/:id", Deploy)
	task.GET("/run/:id", Run)
	task.GET("/stop/:id", StopTask)
	// task.GET("/remove/:id", Remove)
	//task.GET("/status/:id", Status)
	task.GET("/verify/:id", VerifyTask)
	api.GET("/courses", Courses)
	// api.POST("/courses/upload", UploadCourses)
	api.GET("/course/:course", GetModules)

	e.POST("/api/course/upload", UploadCourse)

	e.POST("/api/courses/assign", func(c echo.Context) error {
		// TODO: assign logic
		return nil
	})
	e.GET("/api/status/:id", handleWebSocket)

	api.GET("/lecture/:id", func(c echo.Context) error {
		lecture, err := courses.GetLecture(c.Param("id"))
		if err != nil {
			return c.JSON(400, err.Error())
		}
		return c.JSON(200, lecture)
	})

	api.GET("/quiz/:id", func(c echo.Context) error {
		quiz, err := courses.GetQuiz(c.Param("id"))
		if err != nil {
			return c.JSON(400, err.Error())
		}
		return c.JSON(200, quiz)
	})
	// TODO: remove
	e.GET("/user/add", func(c echo.Context) error {
		db := database.DbManager()
		var course = database.Course{}
		db.Where("name = ?", "linux-basic").Find(&course)
		err := db.Create(&database.User{
			Name:  "user",
			Email: "user@exmample.com",
			Enrollments: []*database.Enrollment{
				{CourseID: course.ID},
			},
		}).Error
		if err != nil {
			return c.String(400, err.Error())
		}
		return c.String(200, "ok")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
