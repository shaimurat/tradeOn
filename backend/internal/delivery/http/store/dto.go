package store

import (
	"time"
	"tradeOn/internal/domain/models"
)

type StoreDTO struct {
	ID          string             `json:"id"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Slug        string             `json:"slug"`
	SellerID    string             `json:"seller_id"`
	LogoURL     *string            `json:"logo_url,omitempty"`
	BannerURL   *string            `json:"banner_url,omitempty"`
	Phone       *string            `json:"phone,omitempty"`
	Email       *string            `json:"email,omitempty"`
	Address     *string            `json:"address,omitempty"`
	Status      models.StoreStatus `json:"status"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

type StoreResponse struct {
	Store StoreDTO `json:"store"`
}

type AdminCreateStoreRequest struct {
	Status   models.StoreStatus `json:"status" binding:"required,oneof=active inactive blocked moderation"`
	SellerID string             `json:"seller_id" binding:"required,uuid"`
	SellerCreateStoreRequest
}

type SellerCreateStoreRequest struct {
	Name        string  `json:"name" binding:"required,min=2,max=150"`
	Description string  `json:"description" binding:"required,min=10,max=2000"`
	Slug        string  `json:"slug" binding:"required,min=3,max=100"`
	LogoURL     *string `json:"logo_url,omitempty" binding:"omitempty,max=1000"`
	BannerURL   *string `json:"banner_url,omitempty" binding:"omitempty,max=1000"`
	Phone       *string `json:"phone,omitempty" binding:"omitempty,max=30"`
	Email       *string `json:"email,omitempty" binding:"omitempty,email,max=255"`
	Address     *string `json:"address,omitempty" binding:"omitempty,max=500"`
}

type AdminPatchStoreRequest struct {
	Status *models.StoreStatus `json:"status,omitempty" binding:"omitempty,oneof=active inactive blocked moderation"`
	SellerPatchStoreRequest
}

type SellerPatchStoreRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=2,max=150"`
	Description *string `json:"description,omitempty" binding:"omitempty,min=10,max=2000"`
	Slug        *string `json:"slug,omitempty" binding:"omitempty,min=3,max=100"`
	LogoURL     *string `json:"logo_url,omitempty" binding:"omitempty,max=1000"`
	BannerURL   *string `json:"banner_url,omitempty" binding:"omitempty,max=1000"`
	Phone       *string `json:"phone,omitempty" binding:"omitempty,max=30"`
	Email       *string `json:"email,omitempty" binding:"omitempty,email,max=255"`
	Address     *string `json:"address,omitempty" binding:"omitempty,max=500"`
}

type ListStoreParams struct {
	Search    *string             `form:"search" binding:"omitempty,max=255"`
	SellerID  *string             `form:"seller_id" binding:"omitempty,uuid"`
	Status    *models.StoreStatus `form:"status" binding:"omitempty,oneof=active inactive blocked moderation"`
	Offset    *int                `form:"offset" binding:"omitempty,min=0"`
	Limit     *int                `form:"limit" binding:"omitempty,min=1,max=100"`
	SortBy    *models.StoreSortBy `form:"sort_by" binding:"omitempty,oneof=created_at name"`
	SortOrder *models.SortOrder   `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

type ListStoreResponse struct {
	Stores []StoreDTO `json:"stores"`
	Count  int64      `json:"count"`
}
