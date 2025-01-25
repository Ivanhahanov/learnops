package main

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
	"sync"
	"time"

	"github.com/coreos/go-oidc"
	"github.com/google/uuid"
	"github.com/urfave/cli/v3"
	"golang.org/x/oauth2"
)

type OIDCToken struct {
	IDToken      string    `json:"id_token"`
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

type OIDCConfig struct {
	IssuerURI    string
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

var (
	usePkce      = true
	codeVerifier = ""
)

func LoginCommand() *cli.Command {
	return &cli.Command{
		Name:  "login",
		Usage: "Login via Keycloak and save tokens",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "issuer-url",
				Aliases: []string{"I"},
				Usage:   "issuer",
				Value:   "https://auth.learnops.local/realms/master",
			},
			&cli.StringFlag{
				Name:    "client-id",
				Aliases: []string{"C"},
				Usage:   "client-id",
				Value:   "kube",
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			oidcConfig := OIDCConfig{
				IssuerURI:   cmd.String("issuer-url"),
				ClientID:    cmd.String("client-id"),
				RedirectURI: "http://localhost:8888/callback",
			}
			err := performOIDCLogin(oidcConfig)
			if err != nil {
				return fmt.Errorf("failed to log in: %w", err)
			}

			fmt.Println("Login successful!")
			return nil
		},
	}
}

func calcSha256(s string) string {
	b := sha256.Sum256([]byte(s))
	return base64.RawURLEncoding.EncodeToString(b[:])
}

func performOIDCLogin(config OIDCConfig) error {
	state := "random-state" // For production, generate a secure random state.
	ctx := context.Background()
	provider, err := oidc.NewProvider(ctx, config.IssuerURI)
	if err != nil {
		log.Fatal(fmt.Errorf("unable to create OIDC provider: %w", err))
	}

	authUrl, err := url.Parse(provider.Endpoint().AuthURL)
	if err != nil {
		return fmt.Errorf("unable to parse authorizationUrl [%s]: %w", provider.Endpoint().AuthURL, err)

	}

	oauth2Config := oauth2.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		RedirectURL:  config.RedirectURI,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID},
	}

	authParams := url.Values{}
	authParams.Set("response_type", "code")
	authParams.Set("client_id", config.ClientID)
	authParams.Set("redirect_uri", config.RedirectURI)
	authParams.Set("scope", oidc.ScopeOpenID)
	authParams.Set("state", state)

	if usePkce {
		codeVerifier = uuid.New().String() + "-" + uuid.New().String()
		codeChallenge := calcSha256(codeVerifier)
		codeChallengeMethod := "S256"

		authParams.Set("code_challenge", codeChallenge)
		authParams.Set("code_challenge_method", codeChallengeMethod)
	}
	//authorizationParams.Set("nonce", nonce)

	authUrl.RawQuery = authParams.Encode()

	var wg = new(sync.WaitGroup)
	codeChan := make(chan string)
	tokenChan := make(chan *OIDCToken)

	// parse redirect uri
	redirectUri, err := url.Parse(config.RedirectURI)
	if err != nil {
		panic(err)
	}
	_, port, _ := net.SplitHostPort(redirectUri.Host)

	// setup server for callback
	server := http.Server{}
	server.Addr = fmt.Sprintf(":%s", port)
	server.Handler = receiveCodeFunc(codeChan, wg)

	wg.Add(1)
	go func() {
		err = server.ListenAndServe()
		if err != nil {
			close(codeChan)
			close(tokenChan)
			log.Fatal(fmt.Errorf("unable to parse authorizationUrl [%s]: %w", provider.Endpoint().AuthURL, err))
		}
	}()

	wg.Add(1)
	go exchangeForToken(codeChan, tokenChan, wg, provider, oauth2Config)

	wg.Add(1)
	go saveToken(tokenChan, wg)

	if err := openBrowser(authUrl.String()); err != nil {
		return fmt.Errorf("failed to open browser: %w", err)
	}

	wg.Wait()

	return nil
}

func openBrowser(url string) error {
	switch runtime.GOOS {
	case "windows":
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		return exec.Command("open", url).Start()
	case "linux":
		return exec.Command("xdg-open", url).Start()
	default:
		return fmt.Errorf("unsupported platform")
	}
}

func exchangeForToken(codeChan chan string, jwtChan chan *OIDCToken, wg *sync.WaitGroup, provider *oidc.Provider, oauth2Config oauth2.Config) {
	defer wg.Done()

	code, ok := <-codeChan
	if !ok {
		close(jwtChan)
		return
	}

	var opts []oauth2.AuthCodeOption

	if usePkce && codeVerifier != "" {
		opts = append(opts, oauth2.SetAuthURLParam("code_verifier", codeVerifier))
	}

	oauth2Token, err := oauth2Config.Exchange(context.Background(), code, opts...)
	if err != nil {
		close(jwtChan)
		fmt.Print(fmt.Errorf("unable to exchange code for token: %w", err))
		return
	}
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		close(jwtChan)
		fmt.Print(fmt.Errorf("no id_token in the access token response: %w", err))
		return
	}
	token := &OIDCToken{
		IDToken:      rawIDToken,
		AccessToken:  oauth2Token.AccessToken,
		RefreshToken: oauth2Token.RefreshToken,
		Expiry:       oauth2Token.Expiry,
	}

	jwtChan <- token
}

func receiveCodeFunc(codeChan chan string, wg *sync.WaitGroup) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodGet {
			http.Error(w, "NotFound", http.StatusNotFound)
			return
		}

		query, err := url.ParseQuery(req.URL.RawQuery)
		if err != nil {
			return
		}

		if query.Has("error") || query.Has("error_description") || query.Has("error_uri") {
			fmt.Printf("error=%s\n", query.Get("error"))
			fmt.Printf("error_description=%s\n", query.Get("error_description"))
			fmt.Printf("error_uri=%s\n", query.Get("error_uri"))

			close(codeChan)
			wg.Done()
		}

		if query.Has("code") {
			if !query.Has("state") {
				fmt.Printf("code must be accompanied by state\n")
				close(codeChan)
				wg.Done()
			}

			code := query.Get("code")
			codeChan <- code
			fmt.Fprintf(w, "login success")
			wg.Done()
		}
	}
}

func saveToken(tokenChan chan *OIDCToken, wg *sync.WaitGroup) error {
	defer wg.Done()

	token, ok := <-tokenChan
	if !ok {
		return fmt.Errorf("not ok")
	}
	data, err := json.Marshal(token)
	if err != nil {
		return fmt.Errorf("failed to marshal token: %w", err)
	}
	return os.WriteFile("oidc_token.json", data, 0600)
}

func readTokenFromFile(tokenFile string) (*OIDCToken, error) {
	data, err := os.ReadFile(tokenFile)
	if err != nil {
		return nil, err
	}
	var token OIDCToken
	err = json.Unmarshal(data, &token)
	if err != nil {
		return nil, err
	}
	return &token, nil
}
