package auth_uc

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"strings"
	"time"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/domain/services"
	"tradeOn/internal/usecase"
)

type AuthUseCase struct {
	userRepo         repos.UserRepo
	refreshTokenRepo repos.RefreshTokenRepo
	hasher           services.Hasher
	tokenService     services.JwtService
	logger           *slog.Logger
	refreshTTL       time.Duration
}

func NewAuthUseCase(
	userRepo repos.UserRepo,
	refreshTokenRepo repos.RefreshTokenRepo,
	hasher services.Hasher,
	tokenService services.JwtService,
	refreshTTL time.Duration,
	logger *slog.Logger,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		hasher:           hasher,
		tokenService:     tokenService,
		refreshTTL:       refreshTTL,
		logger:           logger,
	}
}

func (uc *AuthUseCase) Register(ctx context.Context, input RegisterInput) (*AuthResult, error) {

	passwordHash, err := uc.hasher.Hash(input.Password)
	if err != nil {
		uc.logger.Error("Error while hashing password", "error", err)
		return nil, usecase.MapDBError(err)
	}

	user := models.User{
		Email:        input.Email,
		Username:     input.Username,
		PasswordHash: &passwordHash,
		Role:         models.RoleClient,
		AuthMethod:   models.AuthMethodEmail,
		Status:       models.UserStatusActive,
	}

	createdUser, err := uc.userRepo.Create(ctx, user)
	if err != nil {
		uc.logger.Error("Error while creating user", "error", err)
		return nil, usecase.MapDBError(err)
	}

	tokens, err := uc.issueTokens(ctx, *createdUser, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		uc.logger.Error("Error while issuing tokens after registration", "error", err)
		return nil, usecase.MapDBError(err)
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
		return nil, errs.ErrInvalidInput
	}

	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		uc.logger.Error("Error while getting user by email", "error", err)
		return nil, errs.ErrInvalidCredentials
	}

	if user.Status != models.UserStatusActive {
		return nil, errs.ErrUnauthorized
	}

	if user.PasswordHash == nil {
		return nil, errs.ErrInvalidCredentials
	}

	if err := uc.hasher.Compare(input.Password, *user.PasswordHash); err != nil {
		uc.logger.Error("Error while comparing password hash", "error", err)
		return nil, errs.ErrInvalidCredentials
	}
	if err := uc.userRepo.UpdateLastLogin(ctx, user.Email); err != nil {
		uc.logger.Error("Error while updating last login", "error", err)
		return nil, usecase.MapDBError(err)
	}

	tokens, err := uc.issueTokens(ctx, *user, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		uc.logger.Error("Error while issuing tokens after login", "error", err)
		return nil, usecase.MapDBError(err)
	}

	return &AuthResult{
		User:         user,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}
func (uc *AuthUseCase) Refresh(ctx context.Context, input RefreshInput) (*AuthResult, error) {
	if input.RefreshToken == "" {
		return nil, errs.ErrInvalidInput
	}

	claims, err := uc.tokenService.ValidateRefreshToken(ctx, input.RefreshToken)
	if err != nil {
		return nil, errs.ErrUnauthorized
	}

	refreshTokenHash := hashToken(input.RefreshToken)

	storedToken, err := uc.refreshTokenRepo.GetByHash(ctx, refreshTokenHash)
	if err != nil {
		return nil, errs.ErrUnauthorized
	}

	if storedToken.UserID != claims.UserID {
		return nil, errs.ErrUnauthorized
	}

	if storedToken.RevokedAt != nil {
		return nil, errs.ErrUnauthorized
	}

	if storedToken.ExpiresAt.Before(time.Now()) {
		return nil, errs.ErrUnauthorized
	}

	user, err := uc.userRepo.Get(ctx, claims.UserID)
	if err != nil {
		uc.logger.Error("Error while getting user by id during refresh", "error", err)
		return nil, errs.ErrUnauthorized
	}

	if user.Status != models.UserStatusActive {
		return nil, errs.ErrUnauthorized
	}

	if err := uc.refreshTokenRepo.RevokeByHash(ctx, refreshTokenHash); err != nil {
		uc.logger.Error("Error while revoking old refresh token", "error", err)
		return nil, usecase.MapDBError(err)
	}

	tokens, err := uc.issueTokens(ctx, *user, input.UserAgent, input.IpAddress, input.UserDevice)
	if err != nil {
		uc.logger.Error("Error while issuing new tokens after refresh", "error", err)
		return nil, usecase.MapDBError(err)
	}

	return &AuthResult{
		User:         user,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}
func (uc *AuthUseCase) Logout(ctx context.Context, input LogoutInput) error {
	if input.RefreshToken == "" {
		return errs.ErrInvalidInput
	}
	refreshTokenHash := hashToken(input.RefreshToken)

	if err := uc.refreshTokenRepo.RevokeByHash(ctx, refreshTokenHash); err != nil {
		uc.logger.Error("Error while revoking refresh token during logout", "error", err)
		return usecase.MapDBError(err)
	}

	return nil
}
func (uc *AuthUseCase) Me(ctx context.Context, userID string) (*models.User, error) {
	if userID == "" {
		return nil, errs.ErrUnauthorized
	}

	user, err := uc.userRepo.Get(ctx, userID)
	if err != nil {
		uc.logger.Error("Error while getting current user", "error", err)
		return nil, usecase.MapDBError(err)
	}

	if user.Status != models.UserStatusActive {
		return nil, errs.ErrUnauthorized
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
