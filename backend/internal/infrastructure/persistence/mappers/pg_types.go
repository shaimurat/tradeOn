package mappers

import (
	"time"

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
