package app

import (
	"context"
	"log"
	"log/slog"
	"tradeOn/internal/config"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
	"tradeOn/internal/platform/database"
)

type Container struct {
}

func NewContainer(cfg *config.Config, logger *slog.Logger) *Container {
	pool, err := database.NewPostgresPool(context.Background(), cfg.DatabaseConfig.DatabaseUrl)
	if err != nil {
		log.Fatal(err)
	}
	db := sqldb.New(pool)
	return &Container{}
}
