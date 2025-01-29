package admin

import (
	"platform/internal/middleware/auth"
	"platform/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	db := database.DbManager()
	admin := e.Group("/api/admin")
	admin.Use(
		auth.HeaderTokenToContextMiddleware,
		AdminCheckMiddleware,
	)
	admin.POST("/courses/assign", AssignCourseHandler(db))
	admin.POST("/course/upload", UploadCourse)
}
