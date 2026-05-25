package models

import "time"

type ProductStatus string

const (
	ProductStatusDraft    ProductStatus = "draft"
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
	ProductStatusBlocked  ProductStatus = "blocked"
)

type Product struct {
	ID           string
	StoreID      string
	CategoryID   string
	Name         string
	Slug         string
	Description  *string
	Price        int64
	OldPrice     *int64
	SKU          *string
	Status       ProductStatus
	MainImageURL *string
	SupplierURL  *string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type PatchProductParams struct {
	CategoryID   *string
	Name         *string
	Description  *string
	Slug         *string
	Price        *int64
	OldPrice     *int64
	SKU          *string
	Status       *ProductStatus
	MainImageURL *string
	SupplierURL  *string
}

type ListProductsParams struct {
	StoreID    string
	Search     *string
	CategoryID *string
	PriceFrom  *int64
	PriceTo    *int64
	Status     *ProductStatus
	Limit      *int32
	Offset     *int32
}
