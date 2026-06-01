package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type StoreRepo interface {
	Create(ctx context.Context, store models.Store) (*models.Store, error)
	Update(ctx context.Context, id string, params models.PatchStoreParams) (*models.Store, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*models.Store, error)
	GetBySlug(ctx context.Context, slug string) (*models.Store, error)
	GetList(ctx context.Context, params models.ListStoreParams) ([]models.Store, error)
	CountList(ctx context.Context, params models.ListStoreParams) (int64, error)
}
