package main

import (
	"net/http"
	"platform/internal/admin"
	"platform/internal/course"
	"platform/internal/modules"
	"platform/internal/tasks"
	"platform/pkg/database"
	"platform/pkg/tasks/controller"
	"platform/pkg/utils"
	"time"

	"github.com/go-logr/logr"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

func main() {
	database.Init()
	e := echo.New()
	log.SetLogger(logr.Logger{})
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

	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Ok")
	})

	controller := controller.InitCleanupController(
		utils.MustDuration(utils.GetIntEnv("CLEANUP_CONTROLLER_MAX_AGE", 10))*time.Minute,
		utils.MustDuration(utils.GetIntEnv("CLEANUP_CONTROLLER_INTERVAL", 5))*time.Second,
	)
	go controller.Run()

	e.Logger.Fatal(e.Start(":8080"))
}
