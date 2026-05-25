package repository

import (
	"context"

	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type ProductCategoryRepository struct {
	q *sqldb.Queries
}

func NewProductCategoryRepository(q *sqldb.Queries) *ProductCategoryRepository {
	return &ProductCategoryRepository{
		q: q,
	}
}

func (r *ProductCategoryRepository) Create(ctx context.Context, category models.ProductCategory) (*models.ProductCategory, error) {
	createdCategory, err := r.q.CreateProductCategory(ctx, mappers.ToCreateProductCategoryParams(category))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductCategory(createdCategory)
	return &result, nil
}

func (r *ProductCategoryRepository) Update(ctx context.Context, id string, category models.PatchProductCategoryParams) (*models.ProductCategory, error) {
	updatedCategory, err := r.q.UpdateProductCategory(ctx, mappers.ToUpdateProductCategoryParams(id, category))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductCategoryFromUpdate(updatedCategory)
	return &result, nil
}

func (r *ProductCategoryRepository) Delete(ctx context.Context, id string) error {
	if err := r.q.DeleteProductCategory(ctx, mappers.StringToUUID(id)); err != nil {
		return err
	}
	return nil
}

func (r *ProductCategoryRepository) ListCategories(ctx context.Context, params models.ListProductCategoryParams) ([]models.ProductCategory, error) {
	categories, err := r.q.ListProductCategories(ctx, mappers.ToListProductCategoriesParams(params))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductCategories(categories), nil
}
