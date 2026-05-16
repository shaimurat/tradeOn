package user_uc

import (
	"context"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/domain/services"
)

type UserUseCase struct {
	repo   repos.UserRepo
	hasher services.Hasher
}

func NewUserUseCase(repo repos.UserRepo, hasher services.Hasher) *UserUseCase {
	return &UserUseCase{repo: repo, hasher: hasher}
}

func (u *UserUseCase) Update(ctx context.Context, id string, params models.PatchUserParams) (*models.User, error) {
	if params.PasswordHash != nil {
		hash, err := u.hashPassword(*params.PasswordHash)
		if err != nil {
			return nil, err
		}
		params.PasswordHash = &hash
	}
	return u.repo.Update(ctx, id, params)
}

func (u *UserUseCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *UserUseCase) Get(ctx context.Context, id string) (*models.User, error) {
	return u.repo.Get(ctx, id)
}

func (u *UserUseCase) GetList(ctx context.Context, params models.ListUserParams) ([]models.User, error) {
	return u.repo.GetList(ctx, params)
}

func (u *UserUseCase) hashPassword(password string) (string, error) {
	if len(password) < 8 {
		return "", models.ErrInvalidInput
	}

	return u.hasher.Hash(password)
}
