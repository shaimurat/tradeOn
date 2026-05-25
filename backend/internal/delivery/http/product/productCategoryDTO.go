package product

type ProductCategoryDTO struct {
	ID          string  `json:"id"`
	StoreID     string  `json:"store_id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	IsActive    bool    `json:"is_active"`
}
type CreateProductCategoryBodyRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}
