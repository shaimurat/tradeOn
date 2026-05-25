package repository

import (
	"context"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type RefreshTokenRepository struct {
	q *sqldb.Queries
}

func NewRefreshTokenRepository(q *sqldb.Queries) *RefreshTokenRepository {
	return &RefreshTokenRepository{
		q: q,
	}
}
func (r *RefreshTokenRepository) Create(ctx context.Context, token models.RefreshToken) (*models.RefreshToken, error) {
	pgToken, err := r.q.CreateRefreshToken(ctx, mappers.ToCreateTokenParams(token))
	if err != nil {
		return nil, err
	}
	token = mappers.RefreshTokenToDomain(pgToken)

	return &token, nil
}

func (r *RefreshTokenRepository) GetByHash(ctx context.Context, tokenHash string) (*models.RefreshToken, error) {
	pgToken, err := r.q.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil, err
	}
	token := mappers.RefreshTokenToDomain(pgToken)
	return &token, nil
}

func (r *RefreshTokenRepository) ListActiveByUserID(ctx context.Context, userID string) ([]models.RefreshToken, error) {
	pgUserID := mappers.StringToUUID(userID)

	tokens, err := r.q.ListActiveRefreshTokensByUserID(ctx, pgUserID)
	if err != nil {
		return nil, err
	}

	result := make([]models.RefreshToken, 0, len(tokens))
	for _, token := range tokens {
		result = append(result, mappers.RefreshTokenToDomain(token))
	}

	return result, nil
}

func (r *RefreshTokenRepository) RevokeByHash(ctx context.Context, tokenHash string) error {
	return r.q.RevokeRefreshTokenByHash(ctx, tokenHash)
}

func (r *RefreshTokenRepository) RevokeAllByUserID(ctx context.Context, userID string) error {
	pgUserID := mappers.StringToUUID(userID)

	return r.q.RevokeAllRefreshTokensByUserID(ctx, pgUserID)
}

func (r *RefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	return r.q.DeleteExpiredRefreshTokens(ctx)
}
