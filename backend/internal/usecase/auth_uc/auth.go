package auth_uc

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"
	"tradeOn/internal/domain/models"

	"tradeOn/internal/domain/repos"
	"tradeOn/internal/domain/services"
)

type AuthUseCase struct {
	userRepo         repos.UserRepo
	refreshTokenRepo repos.RefreshTokenRepo
	hasher           services.Hasher
	tokenService     services.JwtService

	refreshTTL time.Duration
}

func NewAuthUseCase(
	userRepo repos.UserRepo,
	refreshTokenRepo repos.RefreshTokenRepo,
	hasher services.Hasher,
	tokenService services.JwtService,
	refreshTTL time.Duration,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		hasher:           hasher,
		tokenService:     tokenService,
		refreshTTL:       refreshTTL,
	}
}

func (uc *AuthUseCase) Register(ctx context.Context, input RegisterInput) (*AuthResult, error) {
	email := strings.TrimSpace(strings.ToLower(input.Email))
	username := strings.TrimSpace(input.Username)

	if email == "" || username == "" || input.Password == "" {
		return nil, models.ErrInvalidInput
	}

	if len(input.Password) < 8 {
		return nil, models.ErrInvalidInput
	}

	exists, err := uc.userRepo.ExistsByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, models.ErrEmailAlreadyExists
	}

	passwordHash, err := uc.hasher.Hash(input.Password)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Email:        email,
		Username:     username,
		PasswordHash: &passwordHash,
		Role:         models.RoleUser,
		AuthMethod:   models.AuthMethodEmail,
		Status:       models.UserStatusActive,
	}

	createdUser, err := uc.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	tokens, err := uc.issueTokens(ctx, *createdUser, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		User:         createdUser,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}
func (uc *AuthUseCase) Login(ctx context.Context, input LoginInput) (*AuthResult, error) {
	email := strings.TrimSpace(strings.ToLower(input.Email))

	if email == "" || input.Password == "" {
		return nil, models.ErrInvalidInput
	}

	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, models.ErrInvalidCredentials
	}

	if user.Status != models.UserStatusActive {
		return nil, models.ErrUnauthorized
	}

	if user.PasswordHash == nil {
		return nil, models.ErrInvalidCredentials
	}

	if err := uc.hasher.Compare(input.Password, *user.PasswordHash); err != nil {
		return nil, models.ErrInvalidCredentials
	}

	tokens, err := uc.issueTokens(ctx, *user, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		User:         user,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}
func (uc *AuthUseCase) Refresh(ctx context.Context, input RefreshInput) (*AuthResult, error) {
	if input.RefreshToken == "" {
		return nil, models.ErrInvalidInput
	}

	claims, err := uc.tokenService.ValidateRefreshToken(ctx, input.RefreshToken)
	if err != nil {
		return nil, models.ErrUnauthorized
	}

	refreshTokenHash := hashToken(input.RefreshToken)

	storedToken, err := uc.refreshTokenRepo.GetByHash(ctx, refreshTokenHash)
	if err != nil {
		return nil, models.ErrUnauthorized
	}

	if storedToken.UserID != claims.UserID {
		return nil, models.ErrUnauthorized
	}

	if storedToken.RevokedAt != nil {
		return nil, models.ErrUnauthorized
	}

	if storedToken.ExpiresAt.Before(time.Now()) {
		return nil, models.ErrUnauthorized
	}

	user, err := uc.userRepo.Get(ctx, claims.UserID)
	if err != nil {
		return nil, models.ErrUnauthorized
	}

	if user.Status != models.UserStatusActive {
		return nil, models.ErrUnauthorized
	}

	if err := uc.refreshTokenRepo.RevokeByHash(ctx, refreshTokenHash); err != nil {
		return nil, err
	}

	tokens, err := uc.issueTokens(ctx, *user, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		User:         user,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}
func (uc *AuthUseCase) Logout(ctx context.Context, input LogoutInput) error {
	if input.RefreshToken == "" {
		return models.ErrInvalidInput
	}

	refreshTokenHash := hashToken(input.RefreshToken)

	return uc.refreshTokenRepo.RevokeByHash(ctx, refreshTokenHash)
}
func (uc *AuthUseCase) Me(ctx context.Context, userID string) (*models.User, error) {
	if userID == "" {
		return nil, models.ErrUnauthorized
	}

	user, err := uc.userRepo.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if user.Status != models.UserStatusActive {
		return nil, models.ErrUnauthorized
	}

	return user, nil
}
func (uc *AuthUseCase) issueTokens(
	ctx context.Context,
	user models.User,
	userAgent string,
	ipAddress string,
	userDevice string,
) (*issuedTokens, error) {
	accessToken, err := uc.tokenService.GenerateAccessToken(ctx, user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := uc.tokenService.GenerateRefreshToken(ctx, user)
	if err != nil {
		return nil, err
	}

	refreshTokenHash := hashToken(refreshToken)

	token := models.RefreshToken{
		RefreshTokenHash: refreshTokenHash,
		UserID:           user.ID,
		UserAgent:        userAgent,
		IpAddress:        ipAddress,
		UserDevice:       userDevice,
		ExpiresAt:        time.Now().Add(uc.refreshTTL),
	}

	if _, err := uc.refreshTokenRepo.Create(ctx, token); err != nil {
		return nil, err
	}

	return &issuedTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
