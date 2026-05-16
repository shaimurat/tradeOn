package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type UserRepo interface {
	Create(ctx context.Context, user models.User) (*models.User, error)
	Update(ctx context.Context, id string, params models.PatchUserParams) (*models.User, error)
	Delete(ctx context.Context, id string) error
	Get(ctx context.Context, id string) (*models.User, error)
	GetList(ctx context.Context, params models.ListUserParams) ([]models.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
}
