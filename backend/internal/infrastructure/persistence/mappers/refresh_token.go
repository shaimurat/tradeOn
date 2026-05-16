package mappers

import (
	"tradeOn/internal/domain/models"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

func RefreshTokenToDomain(token sqldb.RefreshToken) models.RefreshToken {
	return models.RefreshToken{
		ID:               UuidToString(token.ID),
		RefreshTokenHash: token.RefreshTokenHash,
		UserID:           UuidToString(token.UserID),
		UserAgent:        token.UserAgent,
		IpAddress:        token.IpAddress,
		UserDevice:       token.UserDevice,
		RevokedAt:        pgTimestamptzToTimePtr(token.RevokedAt),
		CreatedAt:        pgTimestamptzToTime(token.CreatedAt),
		ExpiresAt:        pgTimestamptzToTime(token.ExpiresAt),
	}
}
func ToCreateTokenParams(token models.RefreshToken) sqldb.CreateRefreshTokenParams {
	userID := StringToUUID(token.UserID)

	return sqldb.CreateRefreshTokenParams{
		RefreshTokenHash: token.RefreshTokenHash,
		UserID:           userID,
		UserAgent:        token.UserAgent,
		IpAddress:        token.IpAddress,
		UserDevice:       token.UserDevice,
		ExpiresAt:        timeToPgTimestamptz(token.ExpiresAt),
	}
}
