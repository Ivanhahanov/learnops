package tasks

import (
	"platform/internal/middleware/auth"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	task := e.Group("/api/task")
	task.Use(
		auth.HeaderTokenToContextMiddleware,
	)
	task.GET("/readme/:name", Readme)
	task.GET("/run/:name", RunTask)
	task.GET("/stop/:name", StopTask)
	task.GET("/verify/:name", VerifyTask)
	// INFO: maybe can ignore middleware
	e.GET("/api/status/:name", handleWebSocket, auth.ParamsTokenToContextMiddleware)
	task.GET("/map/:name", GetServiceMap)
}
