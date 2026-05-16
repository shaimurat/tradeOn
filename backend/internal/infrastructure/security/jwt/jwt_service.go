package jwt

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"tradeOn/internal/domain/models"
)

type Service struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

func NewService(
	accessSecret string,
	refreshSecret string,
	accessTTL time.Duration,
	refreshTTL time.Duration,
) *Service {
	return &Service{
		accessSecret:  []byte(accessSecret),
		refreshSecret: []byte(refreshSecret),
		accessTTL:     accessTTL,
		refreshTTL:    refreshTTL,
	}
}

type tokenClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`

	jwt.RegisteredClaims
}

func (s *Service) GenerateAccessToken(ctx context.Context, user models.User) (string, error) {
	return s.generateToken(user, s.accessSecret, s.accessTTL)
}

func (s *Service) GenerateRefreshToken(ctx context.Context, user models.User) (string, error) {
	return s.generateToken(user, s.refreshSecret, s.refreshTTL)
}

func (s *Service) ValidateAccessToken(ctx context.Context, tokenString string) (*models.TokenClaims, error) {
	return s.validateToken(tokenString, s.accessSecret)
}

func (s *Service) ValidateRefreshToken(ctx context.Context, tokenString string) (*models.TokenClaims, error) {
	return s.validateToken(tokenString, s.refreshSecret)
}

func (s *Service) generateToken(
	user models.User,
	secret []byte,
	ttl time.Duration,
) (string, error) {
	now := time.Now()

	claims := tokenClaims{
		UserID: user.ID,
		Role:   string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(secret)
}

func (s *Service) validateToken(
	tokenString string,
	secret []byte,
) (*models.TokenClaims, error) {
	if tokenString == "" {
		return nil, models.ErrUnauthorized
	}

	claims := &tokenClaims{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return secret, nil
		},
	)
	if err != nil {
		return nil, models.ErrUnauthorized
	}

	if !token.Valid {
		return nil, models.ErrUnauthorized
	}

	if claims.UserID == "" {
		return nil, models.ErrUnauthorized
	}

	return &models.TokenClaims{
		UserID: claims.UserID,
		Role:   models.Role(claims.Role),
	}, nil
}
