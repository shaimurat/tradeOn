package mappers

import (
	"errors"
	"tradeOn/internal/domain/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

const (
	pgUniqueViolation     = "23505"
	pgForeignKeyViolation = "23503"
	pgNotNullViolation    = "23502"
	pgCheckViolation      = "23514"
)

func MapDBError(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return models.ErrNotFound
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case pgUniqueViolation:
			return mapUniqueViolation(pgErr)

		case pgForeignKeyViolation:
			return models.ErrInvalidInput

		case pgNotNullViolation:
			return models.ErrInvalidInput

		case pgCheckViolation:
			return models.ErrInvalidInput
		}
	}

	return err
}

func mapUniqueViolation(pgErr *pgconn.PgError) error {
	switch pgErr.ConstraintName {
	case "users_email_key":
		return models.ErrEmailAlreadyExists
	case "users_username_key":
		return models.ErrUsernameAlreadyExists
	default:
		return models.ErrAlreadyExists
	}
}
