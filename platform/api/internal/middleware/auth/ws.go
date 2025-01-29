package auth

import (
	"github.com/labstack/echo/v4"
)

func ParamsTokenToContextMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return tokenToContextMiddleware(func(c echo.Context) string {
		return c.Param("token")
	})(next)
}
