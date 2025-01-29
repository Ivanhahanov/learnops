package auth

import (
	"strings"

	"github.com/labstack/echo/v4"
)

func HeaderTokenToContextMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return tokenToContextMiddleware(func(c echo.Context) string {
		return strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
	})(next)
}
