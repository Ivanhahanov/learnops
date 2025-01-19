package config

import (
	"os"
	"reflect"
)

type Config struct {
	Domain       string `env:"DOMAIN"`
	OidcIssuer   string `env:"OIDC_ISSUER"`
	OidcClientID string `env:"OIDC_CLIENT_ID"`
	CAIssuer     string `env:"CA_ISSUER"`
}

func GetConfig() *Config {
	var config = new(Config)
	v := reflect.ValueOf(config).Elem()
	typ := v.Type()
	for i := 0; i < typ.NumField(); i++ {
		value := os.Getenv(typ.Field(i).Tag.Get("env"))
		v.Field(i).SetString(value)
	}
	return config
}

func CheckConfig() {
	rv := reflect.ValueOf(GetConfig())
	rv = rv.Elem()

	for i := 0; i < rv.NumField(); i++ {
		if rv.Field(i).String() == "" {
			panic("empty value")
		}
	}
}
