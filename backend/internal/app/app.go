package app

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"tradeOn/internal/config"
	"tradeOn/internal/platform/logs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type App struct {
	r         *gin.Engine
	Container *Container
	cfg       *config.Config
	logger    *slog.Logger
}

func NewApp(cfg *config.Config) *App {
	logger := logs.NewSlog(cfg.Environment)
	return &App{
		r:         gin.Default(),
		Container: NewContainer(cfg, logger),
		cfg:       cfg,
		logger:    logger,
	}
}
func (a *App) setupMiddleware() {
	a.r.Use(cors.New(cors.Config{
		AllowOrigins:     a.cfg.ServerSecurity.AllowedOrigins,
		AllowCredentials: true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-CSRF-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}))
}

func (a *App) Run() {
	server := &http.Server{
		Addr:    ":" + a.cfg.ServerConfig.Port,
		Handler: a.r,
	}

	serverErrors := make(chan error, 1)

	go func() {
		a.logger.Info("Server starting on port: " + a.cfg.ServerConfig.Port)

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(
		shutdown,
		os.Interrupt,
		syscall.SIGTERM,
	)

	select {
	case err := <-serverErrors:
		log.Fatalf("server error: %v", err)

	case sig := <-shutdown:
		log.Printf("shutdown signal received: %v", sig)

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("graceful shutdown failed: %v", err)

			if closeErr := server.Close(); closeErr != nil {
				log.Printf("forced server close failed: %v", closeErr)
			}
		}

		log.Println("server stopped gracefully")
	}
}
