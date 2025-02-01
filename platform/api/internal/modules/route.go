package modules

import (
	"net/http"
	"platform/internal/middleware/auth"
	"platform/pkg/courses"
	"platform/pkg/database"
	"platform/pkg/progress"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	api := e.Group("/api")
	api.Use(
		auth.HeaderTokenToContextMiddleware,
	)
	api.POST("/quiz/:id/submit", CheckQuiz)
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
	api.PUT("/lecture/:id/read", func(c echo.Context) error {
		if err := progress.MarkProgress(c.Get("user").(*database.User).ID, uuid.MustParse(c.Param("id")), "lecture"); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": err.Error(),
			})
		}
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})
}
