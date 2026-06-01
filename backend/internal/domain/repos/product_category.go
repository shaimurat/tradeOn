package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type ProductCategoryRepo interface {
	Create(ctx context.Context, category models.ProductCategory) (*models.ProductCategory, error)
	Update(ctx context.Context, id string, category models.PatchProductCategoryParams) (*models.ProductCategory, error)
	Delete(ctx context.Context, id string) error
	ListCategories(ctx context.Context, params models.ListProductCategoryParams) ([]models.ProductCategory, error)
	GetByID(ctx context.Context, id string) (*models.ProductCategory, error)
}
