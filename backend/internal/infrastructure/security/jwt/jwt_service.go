package jwt

import (
	"context"
	"errors"
	"time"
	"tradeOn/internal/domain/models/errs"

	"github.com/golang-jwt/jwt/v5"

	"tradeOn/internal/domain/models"
)

type JwtService struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

func NewJwtService(
	accessSecret string,
	refreshSecret string,
	accessTTL time.Duration,
	refreshTTL time.Duration,
) *JwtService {
	return &JwtService{
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

func (s *JwtService) GenerateAccessToken(ctx context.Context, user models.User) (string, error) {
	return s.generateToken(user, s.accessSecret, s.accessTTL)
}

func (s *JwtService) GenerateRefreshToken(ctx context.Context, user models.User) (string, error) {
	return s.generateToken(user, s.refreshSecret, s.refreshTTL)
}

func (s *JwtService) ValidateAccessToken(ctx context.Context, tokenString string) (*models.TokenClaims, error) {
	return s.validateToken(tokenString, s.accessSecret)
}

func (s *JwtService) ValidateRefreshToken(ctx context.Context, tokenString string) (*models.TokenClaims, error) {
	return s.validateToken(tokenString, s.refreshSecret)
}

func (s *JwtService) generateToken(
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

func (s *JwtService) validateToken(
	tokenString string,
	secret []byte,
) (*models.TokenClaims, error) {
	if tokenString == "" {
		return nil, errs.ErrUnauthorized
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
		return nil, errs.ErrUnauthorized
	}

	if !token.Valid {
		return nil, errs.ErrUnauthorized
	}

	if claims.UserID == "" {
		return nil, errs.ErrUnauthorized
	}
	return &models.TokenClaims{
		UserID: claims.UserID,
		Role:   models.Role(claims.Role),
	}, nil
}
