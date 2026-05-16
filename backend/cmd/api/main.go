package main

import (
	"log"
	app2 "tradeOn/internal/app"
	"tradeOn/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := config.LoadConfig()
	app := app2.NewApp(cfg)
	app.Run()
}
