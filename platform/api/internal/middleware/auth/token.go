package auth

import (
	"context"
	"fmt"
	"platform/pkg/database"
	"sync"

	"github.com/labstack/echo/v4"
)

func tokenToContextMiddleware(getToken func(c echo.Context) string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := context.Background()

			bearerToken := getToken(c)
			idToken, err := idTokenVerifier.Verify(ctx, bearerToken)
			if err != nil {
				return fmt.Errorf("could not verify bearer token: %v", err)
			}

			var claims struct {
				Name     string   `json:"preferred_username"`
				Email    string   `json:"email"`
				Verified bool     `json:"email_verified"`
				Groups   []string `json:"groups"`
			}
			if err := idToken.Claims(&claims); err != nil {
				return fmt.Errorf("failed to parse claims: %v", err)
			}
			if !claims.Verified {
				return fmt.Errorf("email (%q) in returned claims was not verified", claims.Email)
			}

			user := database.User{
				Name:  claims.Name,
				Email: claims.Email,
			}

			findOrRegisterUser(&user)

			c.Set("user", &user)
			c.Set("groups", claims.Groups)
			c.Set("token", bearerToken)
			return next(c)
		}
	}
}

var userCache sync.Map

func findOrRegisterUser(user *database.User) error {
	// Check cache for user
	cachedUser, ok := userCache.Load(user.Name)
	if ok {
		*user = *(cachedUser.(*database.User))
	} else {
		db := database.DbManager()
		if err := db.FirstOrCreate(&user, database.User{Name: user.Name}).Error; err != nil {
			return fmt.Errorf("Failed to fetch or create user")
		}
		// Add to cache
		userCache.Store(user.Name, user)
	}
	return nil
}
