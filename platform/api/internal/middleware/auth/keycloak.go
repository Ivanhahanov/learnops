package auth

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"platform/pkg/config"
	"platform/pkg/database"
	"strings"
	"sync"

	"github.com/coreos/go-oidc"
	"github.com/labstack/echo/v4"
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

var userCache sync.Map

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
		c.Set("groups", claims.Groups)
		c.Set("token", bearerToken)
		c.Set("user_id", user.ID)
		return next(c)
	}
}

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
