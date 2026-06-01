package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type ProductRepo interface {
	Create(ctx context.Context, product models.Product) (*models.Product, error)
	Update(ctx context.Context, id string, params models.PatchProductParams) (*models.Product, error)
	GetByID(ctx context.Context, id string) (*models.Product, error)
	GetBySlug(ctx context.Context, storeID, slug string) (*models.Product, error)
	Delete(ctx context.Context, id string) error
	GetList(ctx context.Context, params models.ListProductsParams) ([]models.Product, error)
	CountList(ctx context.Context, params models.ListProductsParams) (int64, error)
}
