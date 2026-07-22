package repos

import (
	"context"
	"tradeOn/internal/domain/models"
)

type ProductAttributeRepo interface {
	Create(ctx context.Context, attribute models.ProductAttribute) (*models.ProductAttribute, error)
	CreateMany(ctx context.Context, attributes []models.ProductAttribute) ([]*models.ProductAttribute, error)
	Update(ctx context.Context, id string, params models.PatchProductAttributeParams) (*models.ProductAttribute, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*models.ProductAttribute, error)
	ListByStoreID(ctx context.Context, storeID string) ([]*models.ProductAttribute, error)
}

type ProductAttributeOptionRepo interface {
	Create(ctx context.Context, option models.ProductAttributeOption) (*models.ProductAttributeOption, error)
	CreateMany(ctx context.Context, options []models.ProductAttributeOption) ([]*models.ProductAttributeOption, error)
	Update(ctx context.Context, id string, params models.PatchProductAttributeOptionParams) (*models.ProductAttributeOption, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*models.ProductAttributeOption, error)
	ListByAttributeID(ctx context.Context, attributeID string) ([]*models.ProductAttributeOption, error)
}

type ProductAttributeValueRepo interface {
	Create(ctx context.Context, value models.ProductAttributeValue) (*models.ProductAttributeValue, error)
	CreateMany(ctx context.Context, values []models.ProductAttributeValue) ([]*models.ProductAttributeValue, error)
	Update(ctx context.Context, id string, params models.PatchProductAttributeValueParams) (*models.ProductAttributeValue, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*models.ProductAttributeValue, error)
	ListByProductID(ctx context.Context, productID string) ([]*models.ProductAttributeValue, error)
}
