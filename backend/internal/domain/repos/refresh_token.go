package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type RefreshTokenRepo interface {
	Create(ctx context.Context, token models.RefreshToken) (*models.RefreshToken, error)
	GetByHash(ctx context.Context, tokenHash string) (*models.RefreshToken, error)
	ListActiveByUserID(ctx context.Context, userID string) ([]models.RefreshToken, error)
	RevokeByHash(ctx context.Context, tokenHash string) error
	RevokeAllByUserID(ctx context.Context, userID string) error
	DeleteExpired(ctx context.Context) error
}
