package models

import "time"

type StoreStatus string

const (
	StoreStatusActive     StoreStatus = "active"
	StoreStatusInactive   StoreStatus = "inactive"
	StoreStatusBlocked    StoreStatus = "blocked"
	StoreStatusModeration StoreStatus = "moderation"
)

type Store struct {
	ID          string
	Name        string
	Description string
	Slug        string
	SellerID    string
	LogoURL     *string
	BannerURL   *string
	Phone       *string
	Email       *string
	Address     *string
	Status      StoreStatus
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type PatchStoreParams struct {
	Name        *string
	Description *string
	Slug        *string
	LogoURL     *string
	BannerURL   *string
	Phone       *string
	Email       *string
	Address     *string
	Status      *StoreStatus
}

type StoreSortBy string

const (
	StoreSortByCreatedAt StoreSortBy = "created_at"
	StoreSortByName      StoreSortBy = "name"
)

type SortOrder string

const (
	SortOrderAsc  SortOrder = "asc"
	SortOrderDesc SortOrder = "desc"
)

type ListStoreParams struct {
	Search    *string
	SellerID  *string
	Status    *StoreStatus
	Offset    *int
	Limit     *int
	SortBy    *StoreSortBy
	SortOrder *SortOrder
}
