package models

type ProductCategory struct {
	ID          string
	StoreID     string
	Name        string
	Description *string
	ParentID    *string
	IsActive    bool
}

type PatchProductCategoryParams struct {
	Name        *string
	Description *string
	ParentID    *string
}

type ListProductCategoryParams struct {
	StoreID  string
	Search   *string
	ParentID *string
	OnlyRoot bool
}
