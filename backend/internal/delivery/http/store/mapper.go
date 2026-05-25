package store

import (
	"strings"
	"tradeOn/internal/domain/models"
)

func ToStoreDTO(store models.Store) StoreDTO {
	return StoreDTO{
		ID:          store.ID,
		Name:        store.Name,
		Description: store.Description,
		Slug:        store.Slug,
		SellerID:    store.SellerID,
		LogoURL:     store.LogoURL,
		BannerURL:   store.BannerURL,
		Phone:       store.Phone,
		Email:       store.Email,
		Address:     store.Address,
		Status:      store.Status,
		CreatedAt:   store.CreatedAt,
		UpdatedAt:   store.UpdatedAt,
	}
}

func ToStoreDTOs(stores []models.Store) []StoreDTO {
	result := make([]StoreDTO, 0, len(stores))

	for _, store := range stores {
		result = append(result, ToStoreDTO(store))
	}

	return result
}

func sellerCreateStoreRequestToStore(req SellerCreateStoreRequest, sellerID string) models.Store {
	return models.Store{
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
		Slug:        strings.TrimSpace(req.Slug),
		SellerID:    sellerID,
		LogoURL:     trimOptionalString(req.LogoURL),
		BannerURL:   trimOptionalString(req.BannerURL),
		Phone:       trimOptionalString(req.Phone),
		Email:       trimOptionalString(req.Email),
		Address:     trimOptionalString(req.Address),
		Status:      models.StoreStatusModeration,
	}
}

func adminCreateStoreRequestToStore(req AdminCreateStoreRequest) models.Store {
	return models.Store{
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
		Slug:        strings.TrimSpace(req.Slug),
		SellerID:    strings.TrimSpace(req.SellerID),
		LogoURL:     trimOptionalString(req.LogoURL),
		BannerURL:   trimOptionalString(req.BannerURL),
		Phone:       trimOptionalString(req.Phone),
		Email:       trimOptionalString(req.Email),
		Address:     trimOptionalString(req.Address),
		Status:      req.Status,
	}
}

func sellerPatchStoreRequestToPatchStoreParams(req SellerPatchStoreRequest) models.PatchStoreParams {
	return models.PatchStoreParams{
		Name:        trimOptionalString(req.Name),
		Description: trimOptionalString(req.Description),
		Slug:        trimOptionalString(req.Slug),
		LogoURL:     trimOptionalString(req.LogoURL),
		BannerURL:   trimOptionalString(req.BannerURL),
		Phone:       trimOptionalString(req.Phone),
		Email:       trimOptionalString(req.Email),
		Address:     trimOptionalString(req.Address),
	}
}

func adminPatchStoreRequestToPatchStoreParams(req AdminPatchStoreRequest) models.PatchStoreParams {
	params := sellerPatchStoreRequestToPatchStoreParams(req.SellerPatchStoreRequest)
	params.Status = req.Status

	return params
}

func listStoreRequestToParams(req ListStoreParams) models.ListStoreParams {
	return models.ListStoreParams{
		Search:    trimOptionalString(req.Search),
		SellerID:  trimOptionalString(req.SellerID),
		Status:    req.Status,
		Offset:    req.Offset,
		Limit:     req.Limit,
		SortBy:    req.SortBy,
		SortOrder: req.SortOrder,
	}
}

func trimOptionalString(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*value)
	return &trimmed
}
