package product

type ProductCategoryDTO struct {
	ID          string  `json:"id"`
	StoreID     string  `json:"store_id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	IsActive    bool    `json:"is_active"`
}
type CreateProductCategoryWithProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

type CreateProductCategoryRequest struct {
	Name        string  `json:"name" binding:"required"`
	StoreID     string  `json:"store_id" binding:"required"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}
type PatchProductCategoryParams struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
}

type ListProductCategoryParams struct {
	StoreID  string  `form:"store_id"`
	Search   *string `form:"search"`
	ParentID *string `form:"parent_id"`
	OnlyRoot bool    `form:"only_root"`
}

type ProductCategoryResponse struct {
	ProductCategory ProductCategoryDTO `json:"product_category"`
}
type ProductCategoriesListResponse struct {
	ProductCategories []ProductCategoryDTO `json:"product_categories"`
	Count             int                  `json:"count"`
}
