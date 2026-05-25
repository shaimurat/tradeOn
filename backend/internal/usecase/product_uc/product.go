package product_uc

import (
	"context"
	"errors"
	"log/slog"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/usecase"
)

type ProductUseCase struct {
	productRepo         repos.ProductRepo
	productCategoryRepo repos.ProductCategoryRepo
	storeRepo           repos.StoreRepo
	logger              *slog.Logger
}

func NewProductUseCase(productRepo repos.ProductRepo, productCategoryRepo repos.ProductCategoryRepo, storeRepo repos.StoreRepo, logger *slog.Logger) *ProductUseCase {
	return &ProductUseCase{productRepo: productRepo, productCategoryRepo: productCategoryRepo, storeRepo: storeRepo, logger: logger}
}
func (uc *ProductUseCase) Create(ctx context.Context, input CreateProductInput, userID string, role models.Role) (*models.Product, error) {
	if role != models.RoleAdmin {
		if err := uc.checkStoreBelongsToSeller(ctx, input.Product.StoreID, userID); err != nil {
			return nil, err
		}
	}
	if input.Product.CategoryID == "" {
		if input.ProductCategory == nil {
			uc.logger.Error("product category id and object is null")
			return nil, errs.ErrInvalidInput
		}
		input.ProductCategory.StoreID = input.Product.StoreID
		productCategory, err := uc.productCategoryRepo.Create(ctx, *input.ProductCategory)
		if err != nil {
			uc.logger.Error("error creating product category", "error", err)
			return nil, usecase.MapDBError(err)
		}
		input.Product.CategoryID = productCategory.ID
	}
	product, err := uc.productRepo.Create(ctx, input.Product)
	if err != nil {
		uc.logger.Error("error creating product", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return product, nil
}
func (uc *ProductUseCase) GetByID(ctx context.Context, productID string) (*models.Product, error) {
	product, err := uc.productRepo.GetByID(ctx, productID)
	if err != nil {
		uc.logger.Error("error getting product", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return product, nil
}
func (uc *ProductUseCase) GetBySlug(ctx context.Context, storeID, slug string) (*models.Product, error) {
	product, err := uc.productRepo.GetBySlug(ctx, storeID, slug)
	if err != nil {
		uc.logger.Error("error getting product", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return product, nil
}

func (uc *ProductUseCase) Update(ctx context.Context, id, userID string, role models.Role, params models.PatchProductParams) (*models.Product, error) {
	if role != models.RoleAdmin {
		if err := uc.checkSellerCanManageProduct(ctx, id, userID); err != nil {
			return nil, err
		}
	}
	product, err := uc.productRepo.Update(ctx, id, params)
	if err != nil {
		uc.logger.Error("error updating product", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return product, nil
}

func (uc *ProductUseCase) Delete(ctx context.Context, id, userID string, role models.Role) error {
	if role != models.RoleAdmin {
		if err := uc.checkSellerCanManageProduct(ctx, id, userID); err != nil {
			return err
		}
	}
	err := uc.productRepo.Delete(ctx, id)
	if err != nil {
		uc.logger.Error("error deleting product", "error", err)
		return usecase.MapDBError(err)
	}
	return nil
}

func (uc *ProductUseCase) GetList(ctx context.Context, params models.ListProductsParams) ([]models.Product, error) {
	products, err := uc.productRepo.GetList(ctx, params)
	if err != nil {
		uc.logger.Error("error getting products", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return products, nil
}

func (uc *ProductUseCase) checkSellerCanManageProduct(ctx context.Context, productID, userID string) error {
	product, err := uc.productRepo.GetByID(ctx, productID)
	if err != nil {
		if errors.Is(usecase.MapDBError(err), errs.ErrNotFound) {
			uc.logger.Error("product doesnt exist", "error", err)
			return errs.ErrInvalidInput
		}
		uc.logger.Error("error getting product", "error", err)
		return usecase.MapDBError(err)
	}
	store, err := uc.storeRepo.GetByID(ctx, product.StoreID)
	if err != nil {
		if errors.Is(usecase.MapDBError(err), errs.ErrNotFound) {
			uc.logger.Error("store doesnt exist", "error", err)
			return errs.ErrInvalidInput
		}
		uc.logger.Error("error getting store", "error", err)
		return usecase.MapDBError(err)
	}
	if store.SellerID != userID {
		uc.logger.Error("Failed to do something to product, product doesnt belong to client")
		return errs.ErrForbidden
	}
	return nil
}

func (uc *ProductUseCase) checkStoreBelongsToSeller(ctx context.Context, storeID, userID string) error {
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
