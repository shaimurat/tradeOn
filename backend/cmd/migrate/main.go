package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not defined")
	}

	dir := os.Getenv("MIGRATIONS_DIR")
	if dir == "" {
		dir = "migrations"
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	if _, err = pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version TEXT PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
	)`); err != nil {
		log.Fatal(err)
	}

	files, err := filepath.Glob(filepath.Join(dir, "*.sql"))
	if err != nil {
		log.Fatal(err)
	}
	sort.Strings(files)

	for _, path := range files {
		version := filepath.Base(path)
		var applied bool
		if err = pool.QueryRow(ctx, "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version=$1)", version).Scan(&applied); err != nil {
			log.Fatal(err)
		}
		if applied {
			continue
		}

		contents, readErr := os.ReadFile(path)
		if readErr != nil {
			log.Fatal(readErr)
		}
		upSQL := strings.SplitN(string(contents), "-- +goose Down", 2)[0]
		upSQL = strings.Replace(upSQL, "-- +goose Up", "", 1)

		tx, txErr := pool.Begin(ctx)
		if txErr != nil {
			log.Fatal(txErr)
		}
		if _, txErr = tx.Exec(ctx, upSQL); txErr == nil {
			_, txErr = tx.Exec(ctx, "INSERT INTO schema_migrations(version) VALUES ($1)", version)
		}
		if txErr != nil {
			_ = tx.Rollback(ctx)
			log.Fatalf("migration %s failed: %v", version, txErr)
		}
		if txErr = tx.Commit(ctx); txErr != nil {
			log.Fatal(txErr)
		}
		fmt.Printf("applied migration %s\n", version)
	}
}
