package main

import (
	"platform/internal/admin"
	"platform/internal/course"
	"platform/internal/modules"
	"platform/internal/tasks"
	"platform/pkg/database"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

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

	tasks.RegisterRoutes(e)
	course.RegisterRoutes(e)
	modules.RegisterRoutes(e)
	admin.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8080"))
}
