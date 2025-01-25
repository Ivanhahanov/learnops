package course

import (
	"platform/internal/middleware/auth"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	api := e.Group("/api")
	api.Use(
		auth.KeycloakTokenToContextMiddleware,
	)
	api.GET("/courses", Courses)
	// api.POST("/courses/upload", UploadCourses)
	api.GET("/course/:course", GetModules)
	api.POST("/courses/assign", func(c echo.Context) error {
		// TODO: assign logic
		return nil
	})
}
