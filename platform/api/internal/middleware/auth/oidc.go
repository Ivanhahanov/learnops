package auth

import (
	"context"
	"crypto/tls"
	"net/http"
	"platform/pkg/config"

	"github.com/coreos/go-oidc"
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
