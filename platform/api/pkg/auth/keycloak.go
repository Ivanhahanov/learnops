package auth

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"os"
	"platform/pkg/config"
	"platform/pkg/database"
	"strings"

	"github.com/coreos/go-oidc"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// Create an ID token parser, but only trust ID tokens issued to "example-app"
var idTokenVerifier = InitProvider().Verifier(&oidc.Config{ClientID: config.GetConfig().OidcClientID})

func InitProvider() *oidc.Provider {
	insecureClient := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	ctx := oidc.ClientContext(context.Background(), insecureClient)
	provider, err := oidc.NewProvider(ctx, config.GetConfig().OidcIssuer)
	if err != nil {
		panic(err)
	}
	return provider
}

func KeycloakTokenToContextMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := context.Background()

		bearerToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		idToken, err := idTokenVerifier.Verify(ctx, bearerToken)
		if err != nil {
			return fmt.Errorf("could not verify bearer token: %v", err)
		}
		// Extract custom claims.
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

		c.Set("name", user.Name)
		c.Set("token", bearerToken)
		c.Set("user_id", user.ID)
		return next(c)
	}
}

func findOrRegisterUser(user *database.User) error {
	if !checkIfUserExists(user) {
		registerUser(user)
	}
	return nil
}

func registerUser(user *database.User) error {
	db := database.DbManager()
	err := db.Create(&user).Error
	if err != nil {
		return err
	}
	//courses.RegisterToDefaultCourses(user)
	return err
}

func checkIfUserExists(user *database.User) bool {
	db := database.DbManager()
	err := db.First(user, "name = ?", user.Name).Error
	if err == gorm.ErrRecordNotFound {
		return false
	}
	return true
}

func oidcEnv(env, value string) string {
	res := os.Getenv(env)
	if res == "" {
		return value
	}
	return res
}
