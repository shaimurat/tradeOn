package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ServerConfig   ServerConfig
	ServerSecurity ServerSecurity
	DatabaseConfig DatabaseConfig
	JWTConfig      JWTConfig
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

type JWTConfig struct {
	JwtAccessSecret        string `envconfig:"JWT_ACCESS_SECRET"`
	JwtRefreshSecret       string `envconfig:"JWT_REFRESH_SECRET"`
	JwtAccessExpiresMin    int    `envconfig:"JWT_ACCESS_EXPIRES_MIN"`
	JwtRefreshExpiresHours int    `envconfig:"JWT_REFRESH_EXPIRES_HOURS"`
}

func LoadConfig() *Config {
	cfg := Config{}
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
	}
	return &cfg
}
