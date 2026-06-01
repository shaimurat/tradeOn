package repository

import (
	"context"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type StoreRepository struct {
	q *sqldb.Queries
}

func NewStoreRepository(store *sqldb.Queries) *StoreRepository {
	return &StoreRepository{q: store}
}

func (r *StoreRepository) Create(ctx context.Context, store models.Store) (*models.Store, error) {
	pgStore, err := r.q.CreateStore(ctx, mappers.ToCreateStoreParams(store))
	if err != nil {
		return nil, err
	}
	store = mappers.ToDomainStore(pgStore)
	return &store, nil
}

func (r *StoreRepository) Update(ctx context.Context, id string, params models.PatchStoreParams) (*models.Store, error) {
	pgStore, err := r.q.PatchStore(ctx, mappers.ToPatchStoreParams(id, params))
	if err != nil {
		return nil, err
	}
	store := mappers.ToDomainStore(pgStore)
	return &store, nil
}

func (r *StoreRepository) Delete(ctx context.Context, id string) error {
	err := r.q.DeleteStore(ctx, mappers.StringToUUID(id))
	if err != nil {
		return err
	}
	return nil
}

func (r *StoreRepository) GetByID(ctx context.Context, id string) (*models.Store, error) {
	pgStore, err := r.q.GetStoreByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	store := mappers.ToDomainStore(pgStore)
	return &store, nil
}
func (r *StoreRepository) GetBySlug(ctx context.Context, slug string) (*models.Store, error) {
	pgStore, err := r.q.GetStoreBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	store := mappers.ToDomainStore(pgStore)
	return &store, nil
}

func (r *StoreRepository) GetList(ctx context.Context, params models.ListStoreParams) ([]models.Store, error) {
	pgStores, err := r.q.GetStoresList(ctx, mappers.ToGetStoresListParams(params))
	if err != nil {
		return nil, err
	}
	storeList := make([]models.Store, 0, len(pgStores))
	for _, store := range pgStores {
		storeList = append(storeList, mappers.ToDomainStore(store))
	}
	return storeList, nil
}

func (r *StoreRepository) CountList(ctx context.Context, params models.ListStoreParams) (int64, error) {
	count, err := r.q.CountStoresList(ctx, mappers.ToCountStoresListParams(params))
	if err != nil {
		return 0, err
	}
	return count, nil
}
