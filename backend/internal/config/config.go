package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ServerConfig   ServerConfig
	ServerSecurity ServerSecurity
	DatabaseConfig DatabaseConfig
	Environment    string `envconfig:"ENVIRONMENT" default:"dev"`
}
type ServerConfig struct {
	Port string `envconfig:"PORT" default:"8080"`
}
type ServerSecurity struct {
	AllowedOrigins []string `envconfig:"ALLOWED_ORIGINS"`
}
type DatabaseConfig struct {
	DatabaseUrl string `envconfig:"DATABASE_URL"`
}

func LoadConfig() *Config {
	cfg := Config{}
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
	}
	return &cfg
}
