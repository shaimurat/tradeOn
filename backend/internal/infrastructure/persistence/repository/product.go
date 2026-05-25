package repository

import (
	"context"

	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type ProductRepository struct {
	q *sqldb.Queries
}

func NewProductRepository(q *sqldb.Queries) *ProductRepository {
	return &ProductRepository{
		q: q,
	}
}

func (r *ProductRepository) Create(ctx context.Context, product models.Product) (*models.Product, error) {
	createdProduct, err := r.q.CreateProduct(ctx, mappers.ToCreateProductParams(product))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProduct(createdProduct)
	return &result, nil
}

func (r *ProductRepository) Update(ctx context.Context, id string, params models.PatchProductParams) (*models.Product, error) {
	updatedProduct, err := r.q.PatchProduct(ctx, mappers.ToPatchProductParams(id, params))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProduct(updatedProduct)
	return &result, nil
}

func (r *ProductRepository) GetByID(ctx context.Context, id string) (*models.Product, error) {
	product, err := r.q.GetProductByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProduct(product)
	return &result, nil
}

func (r *ProductRepository) GetBySlug(ctx context.Context, storeID, slug string) (*models.Product, error) {
	product, err := r.q.GetProductBySlug(ctx, mappers.ToGetProductBySlugParams(storeID, slug))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProduct(product)
	return &result, nil
}

func (r *ProductRepository) Delete(ctx context.Context, id string) error {
	if err := r.q.DeleteProduct(ctx, mappers.StringToUUID(id)); err != nil {
		return err
	}
	return nil
}

func (r *ProductRepository) GetList(ctx context.Context, params models.ListProductsParams) ([]models.Product, error) {
	products, err := r.q.GetProductsList(ctx, mappers.ToGetProductsListParams(params))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProducts(products), nil
}
