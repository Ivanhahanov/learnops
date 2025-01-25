package admin

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func AdminCheckMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Извлекаем группы пользователя из контекста
		groups, ok := c.Get("groups").([]string)
		if !ok {
			return echo.NewHTTPError(http.StatusForbidden, "User groups not found in context")
		}

		isAdmin := false
		for _, group := range groups {
			if group == "learnops-admin" {
				isAdmin = true
				break
			}
		}
		if !isAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Access denied: user is not an admin")
		}

		// Если пользователь админ, передаём управление следующему обработчику
		return next(c)
	}
}
