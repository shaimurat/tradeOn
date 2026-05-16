package services

import (
	"context"
	"tradeOn/internal/domain/models"
)

type JwtService interface {
	GenerateAccessToken(ctx context.Context, user models.User) (string, error)
	GenerateRefreshToken(ctx context.Context, user models.User) (string, error)

	ValidateAccessToken(ctx context.Context, token string) (*models.TokenClaims, error)
	ValidateRefreshToken(ctx context.Context, token string) (*models.TokenClaims, error)
}
