package store_uc

import (
	"context"
	"log/slog"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/repos"
	"tradeOn/internal/usecase"
)

type StoreUseCase struct {
	repo   repos.StoreRepo
	logger *slog.Logger
}

func NewStoreUseCase(repo repos.StoreRepo, logger *slog.Logger) *StoreUseCase {
	return &StoreUseCase{repo: repo, logger: logger}
}

func (uc *StoreUseCase) Create(ctx context.Context, store models.Store) (*models.Store, error) {
	createdStore, err := uc.repo.Create(ctx, store)
	if err != nil {
		uc.logger.Error("Failed to create store", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return createdStore, nil
}
func (uc *StoreUseCase) Update(ctx context.Context, id, userID string, role models.Role, params models.PatchStoreParams) (*models.Store, error) {
	if role != models.RoleAdmin {
		err := uc.checkStoreBelongsToSeller(ctx, id, userID)
		if err != nil {
			return nil, err
		}
	}
	store, err := uc.repo.Update(ctx, id, params)
	if err != nil {
		uc.logger.Error("Failed to update store", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return store, nil
}
func (uc *StoreUseCase) Delete(ctx context.Context, id, userID string, role models.Role) error {
	if role != models.RoleAdmin {
		err := uc.checkStoreBelongsToSeller(ctx, id, userID)
		if err != nil {
			return err
		}
	}
	err := uc.repo.Delete(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to delete store", "error", err)
		return usecase.MapDBError(err)
	}
	return nil
}

func (uc *StoreUseCase) GetByID(ctx context.Context, id string) (*models.Store, error) {
	store, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to get store", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return store, nil
}
func (uc *StoreUseCase) GetBySlug(ctx context.Context, slug string) (*models.Store, error) {
	store, err := uc.repo.GetBySlug(ctx, slug)
	if err != nil {
		uc.logger.Error("Failed to get store by slug", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return store, nil
}

func (uc *StoreUseCase) GetList(ctx context.Context, params models.ListStoreParams) ([]models.Store, error) {
	stores, err := uc.repo.GetList(ctx, params)
	if err != nil {
		uc.logger.Error("Failed to get store list", "error", err)
		return nil, usecase.MapDBError(err)
	}
	return stores, nil
}

func (uc *StoreUseCase) checkStoreBelongsToSeller(ctx context.Context, storeID, userID string) error {
	store, err := uc.repo.GetByID(ctx, storeID)
	if err != nil {
		uc.logger.Error("Failed to get store", "error", err)
		return usecase.MapDBError(err)
	}
	if store.SellerID != userID {
		uc.logger.Error("Failed to do something to store, store doesnt belong to client")
		return errs.ErrForbidden
	}
	return nil
}
