package main

import (
	"log"
	app2 "tradeOn/internal/app"
	"tradeOn/internal/config"

	"github.com/joho/godotenv"
)

// @title TradeOn Backend
// @version 0.2
// @description Api server for TradeOn
// @host localhost:8080
// @BasePath /api
// @schemes http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := config.LoadConfig()
	app := app2.NewApp(cfg)
	app.Run()
}
