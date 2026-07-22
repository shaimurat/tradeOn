package repository

import (
	"context"

	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type ProductAttributeRepository struct {
	q *sqldb.Queries
}

func NewProductAttributeRepository(q *sqldb.Queries) *ProductAttributeRepository {
	return &ProductAttributeRepository{q: q}
}

func (r *ProductAttributeRepository) Create(ctx context.Context, attribute models.ProductAttribute) (*models.ProductAttribute, error) {
	created, err := r.q.CreateProductAttribute(ctx, mappers.ToCreateProductAttributeParams(attribute))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttribute(created)
	return &result, nil
}

func (r *ProductAttributeRepository) CreateMany(ctx context.Context, attributes []models.ProductAttribute) ([]*models.ProductAttribute, error) {
	created, err := r.q.CreateProductAttributes(ctx, mappers.ToCreateProductAttributesParams(attributes))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributes(created), nil
}

func (r *ProductAttributeRepository) Update(ctx context.Context, id string, params models.PatchProductAttributeParams) (*models.ProductAttribute, error) {
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	applyProductAttributePatch(current, params)

	updated, err := r.q.UpdateProductAttribute(ctx, mappers.ToUpdateProductAttributeParams(id, *current))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttribute(updated)
	return &result, nil
}

func (r *ProductAttributeRepository) Delete(ctx context.Context, id string) error {
	return r.q.DeleteProductAttribute(ctx, mappers.StringToUUID(id))
}

func (r *ProductAttributeRepository) GetByID(ctx context.Context, id string) (*models.ProductAttribute, error) {
	attribute, err := r.q.GetProductAttributeByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttribute(attribute)
	return &result, nil
}

func (r *ProductAttributeRepository) ListByStoreID(ctx context.Context, storeID string) ([]*models.ProductAttribute, error) {
	attributes, err := r.q.ListProductAttributesByStoreID(ctx, mappers.StringToUUID(storeID))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributes(attributes), nil
}

type ProductAttributeOptionRepository struct {
	q *sqldb.Queries
}

func NewProductAttributeOptionRepository(q *sqldb.Queries) *ProductAttributeOptionRepository {
	return &ProductAttributeOptionRepository{q: q}
}

func (r *ProductAttributeOptionRepository) Create(ctx context.Context, option models.ProductAttributeOption) (*models.ProductAttributeOption, error) {
	created, err := r.q.CreateProductAttributeOption(ctx, mappers.ToCreateProductAttributeOptionParams(option))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeOption(created)
	return &result, nil
}

func (r *ProductAttributeOptionRepository) CreateMany(ctx context.Context, options []models.ProductAttributeOption) ([]*models.ProductAttributeOption, error) {
	created, err := r.q.CreateProductAttributeOptions(ctx, mappers.ToCreateProductAttributeOptionsParams(options))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributeOptions(created), nil
}

func (r *ProductAttributeOptionRepository) Update(ctx context.Context, id string, params models.PatchProductAttributeOptionParams) (*models.ProductAttributeOption, error) {
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if params.Value != nil {
		current.Value = *params.Value
	}
	if params.Position != nil {
		current.Position = *params.Position
	}

	updated, err := r.q.UpdateProductAttributeOption(ctx, mappers.ToUpdateProductAttributeOptionParams(id, *current))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeOption(updated)
	return &result, nil
}

func (r *ProductAttributeOptionRepository) Delete(ctx context.Context, id string) error {
	return r.q.DeleteProductAttributeOption(ctx, mappers.StringToUUID(id))
}

func (r *ProductAttributeOptionRepository) GetByID(ctx context.Context, id string) (*models.ProductAttributeOption, error) {
	option, err := r.q.GetProductAttributeOptionByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeOption(option)
	return &result, nil
}

func (r *ProductAttributeOptionRepository) ListByAttributeID(ctx context.Context, attributeID string) ([]*models.ProductAttributeOption, error) {
	options, err := r.q.ListProductAttributeOptionsByAttributeID(ctx, mappers.StringToUUID(attributeID))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributeOptions(options), nil
}

type ProductAttributeValueRepository struct {
	q *sqldb.Queries
}

func NewProductAttributeValueRepository(q *sqldb.Queries) *ProductAttributeValueRepository {
	return &ProductAttributeValueRepository{q: q}
}

func (r *ProductAttributeValueRepository) Create(ctx context.Context, value models.ProductAttributeValue) (*models.ProductAttributeValue, error) {
	created, err := r.q.CreateProductAttributeValue(ctx, mappers.ToCreateProductAttributeValueParams(value))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeValue(created)
	return &result, nil
}

func (r *ProductAttributeValueRepository) CreateMany(ctx context.Context, values []models.ProductAttributeValue) ([]*models.ProductAttributeValue, error) {
	created, err := r.q.CreateProductAttributeValues(ctx, mappers.ToCreateProductAttributeValuesParams(values))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributeValues(created), nil
}

func (r *ProductAttributeValueRepository) Update(ctx context.Context, id string, params models.PatchProductAttributeValueParams) (*models.ProductAttributeValue, error) {
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if params.ValueText != nil {
		current.ValueText = params.ValueText
	}
	if params.ValueNumber != nil {
		current.ValueNumber = params.ValueNumber
	}
	if params.ValueBool != nil {
		current.ValueBool = params.ValueBool
	}
	if params.OptionID != nil {
		current.OptionID = params.OptionID
	}

	updated, err := r.q.UpdateProductAttributeValue(ctx, mappers.ToUpdateProductAttributeValueParams(id, *current))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeValue(updated)
	return &result, nil
}

func (r *ProductAttributeValueRepository) Delete(ctx context.Context, id string) error {
	return r.q.DeleteProductAttributeValue(ctx, mappers.StringToUUID(id))
}

func (r *ProductAttributeValueRepository) GetByID(ctx context.Context, id string) (*models.ProductAttributeValue, error) {
	value, err := r.q.GetProductAttributeValueByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	result := mappers.ToDomainProductAttributeValue(value)
	return &result, nil
}

func (r *ProductAttributeValueRepository) ListByProductID(ctx context.Context, productID string) ([]*models.ProductAttributeValue, error) {
	values, err := r.q.ListProductAttributeValuesByProductID(ctx, mappers.StringToUUID(productID))
	if err != nil {
		return nil, err
	}
	return mappers.ToDomainProductAttributeValues(values), nil
}

func applyProductAttributePatch(attribute *models.ProductAttribute, params models.PatchProductAttributeParams) {
	if params.Name != nil {
		attribute.Name = *params.Name
	}
	if params.Code != nil {
		attribute.Code = *params.Code
	}
	if params.IsRequired != nil {
		attribute.IsRequired = *params.IsRequired
	}
	if params.IsFilter != nil {
		attribute.IsFilter = *params.IsFilter
	}
	if params.Type != nil {
		attribute.Type = *params.Type
	}
	if params.Unit != nil {
		attribute.Unit = params.Unit
	}
}
