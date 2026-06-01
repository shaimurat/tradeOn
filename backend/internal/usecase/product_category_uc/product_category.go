package product_category_uc

import (
	"context"
	"errors"
	"log/slog"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/usecase"
)

type ProductCategoryUseCase struct {
	productCategoryRepo repos.ProductCategoryRepo
	storeRepo           repos.StoreRepo
	logger              *slog.Logger
}

func NewProductCategoryUseCase(repo repos.ProductCategoryRepo, storeRepo repos.StoreRepo, logger *slog.Logger) *ProductCategoryUseCase {
	return &ProductCategoryUseCase{productCategoryRepo: repo, storeRepo: storeRepo, logger: logger}
}

func (uc *ProductCategoryUseCase) Create(ctx context.Context, category models.ProductCategory, userID string, role models.Role) (*models.ProductCategory, error) {
	if role != models.RoleAdmin {
		if err := uc.checkStoreBelongsToSeller(ctx, category.StoreID, userID); err != nil {
			return nil, err
		}
	}
	createdCategory, err := uc.productCategoryRepo.Create(ctx, category)
	if err != nil {
		uc.logger.Error("error creating product category", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return createdCategory, nil
}
func (uc *ProductCategoryUseCase) Update(ctx context.Context, id string, params models.PatchProductCategoryParams, userID string, role models.Role) (*models.ProductCategory, error) {
	if role != models.RoleAdmin {
		category, err := uc.productCategoryRepo.GetByID(ctx, id)
		if err != nil {
			uc.logger.Error("error getting product category", "error", err)
			return nil, usecase.MapDBError(err)
		}
		if err := uc.checkStoreBelongsToSeller(ctx, category.StoreID, userID); err != nil {
			return nil, err
		}
	}
	category, err := uc.productCategoryRepo.Update(ctx, id, params)
	if err != nil {
		uc.logger.Error("error updating product category", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return category, nil
}
func (uc *ProductCategoryUseCase) Delete(ctx context.Context, id string, userID string, role models.Role) error {
	if role != models.RoleAdmin {
		category, err := uc.productCategoryRepo.GetByID(ctx, id)
		if err != nil {
			return usecase.MapDBError(err)
		}
		if err := uc.checkStoreBelongsToSeller(ctx, category.StoreID, userID); err != nil {
			return err
		}
	}
	if err := uc.productCategoryRepo.Delete(ctx, id); err != nil {
		uc.logger.Error("error deleting product category", "error", err)
		return usecase.MapDBError(err)
	}
	return nil
}
func (uc *ProductCategoryUseCase) List(ctx context.Context, params models.ListProductCategoryParams) ([]models.ProductCategory, error) {
	categories, err := uc.productCategoryRepo.ListCategories(ctx, params)
	if err != nil {
		uc.logger.Error("error listing product categories", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return categories, nil
}
func (uc *ProductCategoryUseCase) GetByID(ctx context.Context, id string) (*models.ProductCategory, error) {
	category, err := uc.productCategoryRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Error("error getting product category", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return category, nil
}

func (uc *ProductCategoryUseCase) checkStoreBelongsToSeller(ctx context.Context, storeID, userID string) error {
	store, err := uc.storeRepo.GetByID(ctx, storeID)
	if err != nil {
		if errors.Is(usecase.MapDBError(err), errs.ErrNotFound) {
			uc.logger.Error("store doesnt exist", "error", err)
			return errs.ErrInvalidInput
		}
		uc.logger.Error("Failed to get store", "error", err)
		return usecase.MapDBError(err)
	}
	if store.SellerID != userID {
		uc.logger.Error("Failed to create product, store doesnt belong to client")
		return errs.ErrForbidden
	}
	return nil
}
