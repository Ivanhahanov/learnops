package tasks

import (
	"platform/internal/middleware/auth"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	task := e.Group("/api/task")
	task.Use(
		auth.KeycloakTokenToContextMiddleware,
	)
	task.GET("/readme/:id", Readme)
	task.GET("/run/:id", RunTask)
	task.GET("/stop/:id", StopTask)
	task.GET("/verify/:id", VerifyTask)
	// INFO: maybe can ignore middleware
	e.GET("/api/status/:id", handleWebSocket)
}
