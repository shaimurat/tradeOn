package mappers

import (
	"time"
	"tradeOn/internal/domain/models"
	generated2 "tradeOn/internal/infrastructure/sqlc/generated"

	"github.com/jackc/pgx/v5/pgtype"
)

func UuidToString(value pgtype.UUID) string {
	if !value.Valid {
		return ""
	}

	return value.String()
}

func StringToUUID(value string) pgtype.UUID {
	var id pgtype.UUID

	if err := id.Scan(value); err != nil {
		return pgtype.UUID{Valid: false}
	}

	return id
}
func stringPtrToPgUUID(value *string) pgtype.UUID {
	if value == nil || *value == "" {
		return pgtype.UUID{
			Valid: false,
		}
	}

	return StringToUUID(*value)
}

func pgTextToStringPtr(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}

func stringPtrToPgText(value *string) pgtype.Text {
	if value == nil {
		return pgtype.Text{Valid: false}
	}

	return pgtype.Text{
		String: *value,
		Valid:  true,
	}
}

func intPtrToPgInt4(value *int) pgtype.Int4 {
	if value == nil {
		return pgtype.Int4{
			Valid: false,
		}
	}

	return pgtype.Int4{
		Int32: int32(*value),
		Valid: true,
	}
}

func pgTimestamptzToTime(value pgtype.Timestamptz) time.Time {
	if !value.Valid {
		return time.Time{}
	}

	return value.Time
}

func pgTimestamptzToTimePtr(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}

	return &value.Time
}
func timeToPgTimestamptz(value time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{
		Time:  value,
		Valid: true,
	}
}
func pgInt8ToInt64Ptr(value pgtype.Int8) *int64 {
	if !value.Valid {
		return nil
	}

	return &value.Int64
}

func int64PtrToPgInt8(value *int64) pgtype.Int8 {
	if value == nil {
		return pgtype.Int8{Valid: false}
	}

	return pgtype.Int8{
		Int64: *value,
		Valid: true,
	}
}

func int32PtrToPgInt4(value *int32) pgtype.Int4 {
	if value == nil {
		return pgtype.Int4{Valid: false}
	}

	return pgtype.Int4{
		Int32: *value,
		Valid: true,
	}
}

func productStatusPtrToNullProductStatus(value *models.ProductStatus) generated2.NullProductStatus {
	if value == nil {
		return generated2.NullProductStatus{
			Valid: false,
		}
	}

	return generated2.NullProductStatus{
		ProductStatus: generated2.ProductStatus(*value),
		Valid:         true,
	}
}
func pgUUIDToStringPtr(value pgtype.UUID) *string {
	if !value.Valid {
		return nil
	}

	str := value.String()
	return &str
}
