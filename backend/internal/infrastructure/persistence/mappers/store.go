package mappers

import (
	"tradeOn/internal/domain/models"
	generated2 "tradeOn/internal/infrastructure/sqlc/generated"
)

func ToDomainStore(store generated2.Store) models.Store {
	return models.Store{
		ID:          UuidToString(store.ID),
		Name:        store.Name,
		Description: store.Description,
		Slug:        store.Slug,
		SellerID:    UuidToString(store.SellerID),
		LogoURL:     pgTextToStringPtr(store.LogoUrl),
		BannerURL:   pgTextToStringPtr(store.BannerUrl),
		Phone:       pgTextToStringPtr(store.Phone),
		Email:       pgTextToStringPtr(store.Email),
		Address:     pgTextToStringPtr(store.Address),
		Status:      models.StoreStatus(store.Status),
		CreatedAt:   pgTimestamptzToTime(store.CreatedAt),
		UpdatedAt:   pgTimestamptzToTime(store.UpdatedAt),
	}
}

func ToDomainStores(stores []generated2.Store) []models.Store {
	result := make([]models.Store, 0, len(stores))

	for _, store := range stores {
		result = append(result, ToDomainStore(store))
	}

	return result
}

func ToCreateStoreParams(store models.Store) generated2.CreateStoreParams {
	return generated2.CreateStoreParams{
		Name:        store.Name,
		Description: store.Description,
		Slug:        store.Slug,
		SellerID:    StringToUUID(store.SellerID),
		LogoUrl:     stringPtrToPgText(store.LogoURL),
		BannerUrl:   stringPtrToPgText(store.BannerURL),
		Phone:       stringPtrToPgText(store.Phone),
		Email:       stringPtrToPgText(store.Email),
		Address:     stringPtrToPgText(store.Address),
		Status:      string(store.Status),
	}
}

func ToPatchStoreParams(id string, params models.PatchStoreParams) generated2.PatchStoreParams {
	return generated2.PatchStoreParams{
		Name:        stringPtrToPgText(params.Name),
		Description: stringPtrToPgText(params.Description),
		Slug:        stringPtrToPgText(params.Slug),
		LogoUrl:     stringPtrToPgText(params.LogoURL),
		BannerUrl:   stringPtrToPgText(params.BannerURL),
		Phone:       stringPtrToPgText(params.Phone),
		Email:       stringPtrToPgText(params.Email),
		Address:     stringPtrToPgText(params.Address),
		Status:      stringPtrToPgText((*string)(params.Status)),
		ID:          StringToUUID(id),
	}
}

func ToGetStoresListParams(params models.ListStoreParams) generated2.GetStoresListParams {
	return generated2.GetStoresListParams{
		Search:    stringPtrToPgText(params.Search),
		SellerID:  stringPtrToPgUUID(params.SellerID),
		Status:    stringPtrToPgText((*string)(params.Status)),
		SortBy:    stringPtrToPgText((*string)(params.SortBy)),
		SortOrder: stringPtrToPgText((*string)(params.SortOrder)),
		Offset:    intPtrToPgInt4(params.Offset),
		Limit:     intPtrToPgInt4(params.Limit),
	}
}
