package product

import (
	"time"
	"tradeOn/internal/domain/models"
)

type ProductDTO struct {
	ID           string               `json:"id"`
	StoreID      string               `json:"store_id"`
	CategoryID   string               `json:"category_id"`
	Name         string               `json:"name"`
	Slug         string               `json:"slug"`
	Description  *string              `json:"description,omitempty"`
	Price        int64                `json:"price"`
	OldPrice     *int64               `json:"old_price,omitempty"`
	SKU          *string              `json:"sku,omitempty"`
	Status       models.ProductStatus `json:"status"`
	MainImageURL *string              `json:"main_image_url,omitempty"`
	SupplierURL  *string              `json:"supplier_url,omitempty"`
	CreatedAt    time.Time            `json:"created_at"`
	UpdatedAt    time.Time            `json:"updated_at"`
}
type CreateProductRequest struct {
	Product         CreateProductBodyRequest          `json:"product" binding:"required"`
	ProductCategory *CreateProductCategoryBodyRequest `json:"product_category,omitempty"`
}

type CreateProductBodyRequest struct {
	StoreID      string               `json:"store_id" binding:"required"`
	CategoryID   *string              `json:"category_id,omitempty"`
	Name         string               `json:"name" binding:"required"`
	Slug         string               `json:"slug" binding:"required"`
	Description  *string              `json:"description,omitempty"`
	Price        int64                `json:"price" binding:"required,min=1"`
	OldPrice     *int64               `json:"old_price,omitempty"`
	SKU          *string              `json:"sku,omitempty"`
	Status       models.ProductStatus `json:"status" binding:"required,oneof=draft active inactive blocked"`
	MainImageURL *string              `json:"main_image_url,omitempty"`
	SupplierURL  *string              `json:"supplier_url,omitempty"`
}
type PatchProductRequest struct {
	CategoryID   *string               `json:"category_id,omitempty"`
	Name         *string               `json:"name,omitempty"`
	Description  *string               `json:"description,omitempty"`
	Slug         *string               `json:"slug,omitempty"`
	Price        *int64                `json:"price,omitempty"`
	OldPrice     *int64                `json:"old_price,omitempty"`
	SKU          *string               `json:"sku,omitempty"`
	Status       *models.ProductStatus `json:"status,omitempty" binding:"omitempty,oneof=draft active inactive blocked"`
	MainImageURL *string               `json:"main_image_url,omitempty"`
	SupplierURL  *string               `json:"supplier_url,omitempty"`
}
type ListProductsRequest struct {
	StoreID    string                `form:"store_id"`
	Search     *string               `form:"search"`
	CategoryID *string               `form:"category_id"`
	PriceFrom  *int64                `form:"price_from"`
	PriceTo    *int64                `form:"price_to"`
	Status     *models.ProductStatus `form:"status" binding:"omitempty,oneof=draft active inactive blocked"`
	Limit      *int32                `form:"limit"`
	Offset     *int32                `form:"offset"`
}
type ProductResponse struct {
	Product ProductDTO `json:"product"`
}

type ProductsListResponse struct {
	Products []ProductDTO `json:"products"`
	Count    int          `json:"count"`
}

type ProductCategoryResponse struct {
	Category ProductCategoryDTO `json:"category"`
}
