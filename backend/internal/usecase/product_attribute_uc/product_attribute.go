package product_attribute_uc

import (
	"context"
	"errors"
	"log/slog"

	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/usecase"
)

type ProductAttributeUseCase struct {
	attributeRepo repos.ProductAttributeRepo
	optionRepo    repos.ProductAttributeOptionRepo
	valueRepo     repos.ProductAttributeValueRepo
	productRepo   repos.ProductRepo
	categoryRepo  repos.ProductCategoryRepo
	storeRepo     repos.StoreRepo
	logger        *slog.Logger
}

func NewProductAttributeUseCase(
	attributeRepo repos.ProductAttributeRepo,
	optionRepo repos.ProductAttributeOptionRepo,
	valueRepo repos.ProductAttributeValueRepo,
	productRepo repos.ProductRepo,
	categoryRepo repos.ProductCategoryRepo,
	storeRepo repos.StoreRepo,
	logger *slog.Logger,
) *ProductAttributeUseCase {
	return &ProductAttributeUseCase{
		attributeRepo: attributeRepo,
		optionRepo:    optionRepo,
		valueRepo:     valueRepo,
		productRepo:   productRepo,
		categoryRepo:  categoryRepo,
		storeRepo:     storeRepo,
		logger:        logger,
	}
}

func (uc *ProductAttributeUseCase) Create(ctx context.Context, attribute models.ProductAttribute, userID string, role models.Role) (*models.ProductAttribute, error) {
	if err := uc.canManageStore(ctx, attribute.StoreID, userID, role); err != nil {
		return nil, err
	}
	if attribute.CategoryID != nil {
		category, err := uc.categoryRepo.GetByID(ctx, *attribute.CategoryID)
		if err != nil {
			return nil, uc.mapError("getting product category", err)
		}
		if category.StoreID != attribute.StoreID {
			return nil, errs.ErrInvalidInput
		}
	}
	result, err := uc.attributeRepo.Create(ctx, attribute)
	return result, uc.mapError("creating product attribute", err)
}

func (uc *ProductAttributeUseCase) Update(ctx context.Context, id string, params models.PatchProductAttributeParams, userID string, role models.Role) (*models.ProductAttribute, error) {
	attribute, err := uc.attributeRepo.GetByID(ctx, id)
	if err != nil {
		return nil, uc.mapError("getting product attribute", err)
	}
	if err := uc.canManageStore(ctx, attribute.StoreID, userID, role); err != nil {
		return nil, err
	}
	result, err := uc.attributeRepo.Update(ctx, id, params)
	return result, uc.mapError("updating product attribute", err)
}

func (uc *ProductAttributeUseCase) Delete(ctx context.Context, id, userID string, role models.Role) error {
	attribute, err := uc.attributeRepo.GetByID(ctx, id)
	if err != nil {
		return uc.mapError("getting product attribute", err)
	}
	if err := uc.canManageStore(ctx, attribute.StoreID, userID, role); err != nil {
		return err
	}
	return uc.mapError("deleting product attribute", uc.attributeRepo.Delete(ctx, id))
}

func (uc *ProductAttributeUseCase) GetByID(ctx context.Context, id string) (*models.ProductAttribute, error) {
	result, err := uc.attributeRepo.GetByID(ctx, id)
	return result, uc.mapError("getting product attribute", err)
}

func (uc *ProductAttributeUseCase) ListByStoreID(ctx context.Context, storeID string) ([]*models.ProductAttribute, error) {
	result, err := uc.attributeRepo.ListByStoreID(ctx, storeID)
	return result, uc.mapError("listing product attributes", err)
}

func (uc *ProductAttributeUseCase) CreateOption(ctx context.Context, option models.ProductAttributeOption, userID string, role models.Role) (*models.ProductAttributeOption, error) {
	if err := uc.canManageAttribute(ctx, option.ProductAttributeID, userID, role); err != nil {
		return nil, err
	}
	attribute, err := uc.attributeRepo.GetByID(ctx, option.ProductAttributeID)
	if err != nil {
		return nil, uc.mapError("getting product attribute", err)
	}
	if attribute.Type != models.AttributeTypeSelect {
		return nil, errs.ErrInvalidInput
	}
	result, err := uc.optionRepo.Create(ctx, option)
	return result, uc.mapError("creating product attribute option", err)
}

func (uc *ProductAttributeUseCase) UpdateOption(ctx context.Context, id string, params models.PatchProductAttributeOptionParams, userID string, role models.Role) (*models.ProductAttributeOption, error) {
	option, err := uc.optionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, uc.mapError("getting product attribute option", err)
	}
	if err := uc.canManageAttribute(ctx, option.ProductAttributeID, userID, role); err != nil {
		return nil, err
	}
	result, err := uc.optionRepo.Update(ctx, id, params)
	return result, uc.mapError("updating product attribute option", err)
}

func (uc *ProductAttributeUseCase) DeleteOption(ctx context.Context, id, userID string, role models.Role) error {
	option, err := uc.optionRepo.GetByID(ctx, id)
	if err != nil {
		return uc.mapError("getting product attribute option", err)
	}
	if err := uc.canManageAttribute(ctx, option.ProductAttributeID, userID, role); err != nil {
		return err
	}
	return uc.mapError("deleting product attribute option", uc.optionRepo.Delete(ctx, id))
}

func (uc *ProductAttributeUseCase) ListOptions(ctx context.Context, attributeID string) ([]*models.ProductAttributeOption, error) {
	result, err := uc.optionRepo.ListByAttributeID(ctx, attributeID)
	return result, uc.mapError("listing product attribute options", err)
}

func (uc *ProductAttributeUseCase) CreateValue(ctx context.Context, value models.ProductAttributeValue, userID string, role models.Role) (*models.ProductAttributeValue, error) {
	if err := uc.canManageProduct(ctx, value.ProductID, userID, role); err != nil {
		return nil, err
	}
	attribute, err := uc.validateAttributeForProduct(ctx, value.ProductAttributeID, value.ProductID)
	if err != nil {
		return nil, err
	}
	if err := uc.validateValue(ctx, *attribute, value); err != nil {
		return nil, err
	}
	result, err := uc.valueRepo.Create(ctx, value)
	return result, uc.mapError("creating product attribute value", err)
}

func (uc *ProductAttributeUseCase) UpdateValue(ctx context.Context, id string, params models.PatchProductAttributeValueParams, userID string, role models.Role) (*models.ProductAttributeValue, error) {
	value, err := uc.valueRepo.GetByID(ctx, id)
	if err != nil {
		return nil, uc.mapError("getting product attribute value", err)
	}
	if err := uc.canManageProduct(ctx, value.ProductID, userID, role); err != nil {
		return nil, err
	}
	result, err := uc.valueRepo.Update(ctx, id, params)
	return result, uc.mapError("updating product attribute value", err)
}

func (uc *ProductAttributeUseCase) DeleteValue(ctx context.Context, id, userID string, role models.Role) error {
	value, err := uc.valueRepo.GetByID(ctx, id)
	if err != nil {
		return uc.mapError("getting product attribute value", err)
	}
	if err := uc.canManageProduct(ctx, value.ProductID, userID, role); err != nil {
		return err
	}
	return uc.mapError("deleting product attribute value", uc.valueRepo.Delete(ctx, id))
}

func (uc *ProductAttributeUseCase) ListValues(ctx context.Context, productID string) ([]*models.ProductAttributeValue, error) {
	result, err := uc.valueRepo.ListByProductID(ctx, productID)
	return result, uc.mapError("listing product attribute values", err)
}

func (uc *ProductAttributeUseCase) canManageAttribute(ctx context.Context, attributeID, userID string, role models.Role) error {
	attribute, err := uc.attributeRepo.GetByID(ctx, attributeID)
	if err != nil {
		return uc.mapError("getting product attribute", err)
	}
	return uc.canManageStore(ctx, attribute.StoreID, userID, role)
}

func (uc *ProductAttributeUseCase) canManageProduct(ctx context.Context, productID, userID string, role models.Role) error {
	product, err := uc.productRepo.GetByID(ctx, productID)
	if err != nil {
		return uc.mapError("getting product", err)
	}
	return uc.canManageStore(ctx, product.StoreID, userID, role)
}

func (uc *ProductAttributeUseCase) canManageStore(ctx context.Context, storeID, userID string, role models.Role) error {
	if role == models.RoleAdmin {
		return nil
	}
	store, err := uc.storeRepo.GetByID(ctx, storeID)
	if err != nil {
		return uc.mapError("getting store", err)
	}
	if store.SellerID != userID {
		return errs.ErrForbidden
	}
	return nil
}

func (uc *ProductAttributeUseCase) validateAttributeForProduct(ctx context.Context, attributeID, productID string) (*models.ProductAttribute, error) {
	attribute, err := uc.attributeRepo.GetByID(ctx, attributeID)
	if err != nil {
		return nil, uc.mapError("getting product attribute", err)
	}
	product, err := uc.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, uc.mapError("getting product", err)
	}
	if attribute.StoreID != product.StoreID || (attribute.CategoryID != nil && *attribute.CategoryID != product.CategoryID) {
		return nil, errs.ErrInvalidInput
	}
	return attribute, nil
}

func (uc *ProductAttributeUseCase) validateValue(ctx context.Context, attribute models.ProductAttribute, value models.ProductAttributeValue) error {
	valueCount := 0
	if value.ValueText != nil {
		valueCount++
	}
	if value.ValueNumber != nil {
		valueCount++
	}
	if value.ValueBool != nil {
		valueCount++
	}
	if value.OptionID != nil {
		valueCount++
	}
	if valueCount != 1 {
		return errs.ErrInvalidInput
	}

	validType := (attribute.Type == models.AttributeTypeText && value.ValueText != nil) ||
		(attribute.Type == models.AttributeTypeNumber && value.ValueNumber != nil) ||
		(attribute.Type == models.AttributeTypeBool && value.ValueBool != nil) ||
		(attribute.Type == models.AttributeTypeSelect && value.OptionID != nil)
	if !validType {
		return errs.ErrInvalidInput
	}
	if value.OptionID == nil {
		return nil
	}
	option, err := uc.optionRepo.GetByID(ctx, *value.OptionID)
	if err != nil {
		return uc.mapError("getting product attribute option", err)
	}
	if option.ProductAttributeID != attribute.ID {
		return errs.ErrInvalidInput
	}
	return nil
}

func (uc *ProductAttributeUseCase) mapError(message string, err error) error {
	if err == nil {
		return nil
	}
	mapped := usecase.MapDBError(err)
	if !errors.Is(mapped, errs.ErrNotFound) {
		uc.logger.Error(message, "error", err)
	}
	return mapped
}
