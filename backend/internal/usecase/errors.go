package usecase

import (
	"errors"
	"tradeOn/internal/domain/models/errs"

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
		return errs.ErrNotFound
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case pgUniqueViolation:
			return mapUniqueViolation(pgErr)

		case pgForeignKeyViolation:
			return errs.ErrInvalidInput

		case pgNotNullViolation:
			return errs.ErrInvalidInput

		case pgCheckViolation:
			return errs.ErrInvalidInput
		}
	}

	return err
}
func mapUniqueViolation(pgErr *pgconn.PgError) error {
	switch pgErr.ConstraintName {
	// products
	case "uq_products_store_slug":
		return errs.NewDuplicateError("slug")

	case "uq_products_store_sku":
		return errs.NewDuplicateError("sku")

	// product categories
	case "uq_product_categories_store_parent_name":
		return errs.NewDuplicateError("name")

	// product attributes
	case "uq_product_attributes_store_category_code":
		return errs.NewDuplicateError("code")

	case "uq_product_attribute_options_attribute_value":
		return errs.NewDuplicateError("value")

	case "uq_product_attribute_values_product_attribute":
		return errs.NewDuplicateError("attribute")
	// users
	case "users_email_key":
		return errs.NewDuplicateError("email")

	case "users_username_key":
		return errs.NewDuplicateError("username")

	default:
		return errs.NewDuplicateError("value")
	}
}
