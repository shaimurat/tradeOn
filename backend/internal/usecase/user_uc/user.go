package user_uc

import (
	"context"
	"log/slog"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/domain/services"
	"tradeOn/internal/usecase"
)

type UserUseCase struct {
	repo   repos.UserRepo
	hasher services.Hasher
	logger *slog.Logger
}

func NewUserUseCase(repo repos.UserRepo, hasher services.Hasher) *UserUseCase {
	return &UserUseCase{repo: repo, hasher: hasher}
}

func (uc *UserUseCase) Create(ctx context.Context, user models.User) (*models.User, error) {
	passwordHash, err := uc.hasher.Hash(*user.PasswordHash)
	if err != nil {
		uc.logger.Error("Error while hashing password", "error", err)
		return nil, usecase.MapDBError(err)
	}
	user.PasswordHash = &passwordHash
	createdUser, err := uc.repo.Create(ctx, user)
	if err != nil {
		return nil, usecase.MapDBError(err)
	}
	return createdUser, nil
}

func (uc *UserUseCase) Update(ctx context.Context, id string, params models.PatchUserParams) (*models.User, error) {
	if params.PasswordHash != nil {
		hash, err := uc.hashPassword(*params.PasswordHash)
		if err != nil {
			return nil, err
		}
		params.PasswordHash = &hash
	}
	user, err := uc.repo.Update(ctx, id, params)
	if err != nil {
		return nil, usecase.MapDBError(err)
	}
	return user, nil
}

func (uc *UserUseCase) Delete(ctx context.Context, id string) error {
	err := uc.repo.Delete(ctx, id)
	if err != nil {
		return usecase.MapDBError(err)
	}
	return nil
}

func (uc *UserUseCase) Get(ctx context.Context, id string) (*models.User, error) {
	user, err := uc.repo.Get(ctx, id)
	if err != nil {
		return nil, usecase.MapDBError(err)
	}
	return user, nil
}

func (uc *UserUseCase) GetList(ctx context.Context, params models.ListUserParams) ([]models.User, error) {
	users, err := uc.repo.GetList(ctx, params)
	if err != nil {
		return nil, usecase.MapDBError(err)
	}
	return users, nil
}

func (uc *UserUseCase) hashPassword(password string) (string, error) {
	if len(password) < 8 {
		return "", errs.ErrInvalidInput
	}

	return uc.hasher.Hash(password)
}
