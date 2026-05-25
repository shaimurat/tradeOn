package product

import (
	"tradeOn/internal/domain/models"
	"tradeOn/internal/usecase/product_uc"
)

func ToProductDTO(product models.Product) ProductDTO {
	return ProductDTO{
		ID:           product.ID,
		StoreID:      product.StoreID,
		CategoryID:   product.CategoryID,
		Name:         product.Name,
		Slug:         product.Slug,
		Description:  product.Description,
		Price:        product.Price,
		OldPrice:     product.OldPrice,
		SKU:          product.SKU,
		Status:       product.Status,
		MainImageURL: product.MainImageURL,
		SupplierURL:  product.SupplierURL,
		CreatedAt:    product.CreatedAt,
		UpdatedAt:    product.UpdatedAt,
	}
}

func ToProductDTOs(products []models.Product) []ProductDTO {
	result := make([]ProductDTO, 0, len(products))

	for _, product := range products {
		result = append(result, ToProductDTO(product))
	}

	return result
}

func CreateProductRequestToInput(req CreateProductRequest) product_uc.CreateProductInput {
	input := product_uc.CreateProductInput{
		Product: models.Product{
			StoreID:      req.Product.StoreID,
			Name:         req.Product.Name,
			Slug:         req.Product.Slug,
			Description:  req.Product.Description,
			Price:        req.Product.Price,
			OldPrice:     req.Product.OldPrice,
			SKU:          req.Product.SKU,
			Status:       req.Product.Status,
			MainImageURL: req.Product.MainImageURL,
			SupplierURL:  req.Product.SupplierURL,
		},
	}

	if req.Product.CategoryID != nil {
		input.Product.CategoryID = *req.Product.CategoryID
	}
	if req.ProductCategory != nil {
		isActive := true
		if req.ProductCategory.IsActive != nil {
			isActive = *req.ProductCategory.IsActive
		}

		input.ProductCategory = &models.ProductCategory{
			Name:        req.ProductCategory.Name,
			Description: req.ProductCategory.Description,
			ParentID:    req.ProductCategory.ParentID,
			IsActive:    isActive,
		}
	}

	return input
}

func PatchProductRequestToParams(req PatchProductRequest) models.PatchProductParams {
	return models.PatchProductParams{
		CategoryID:   req.CategoryID,
		Name:         req.Name,
		Description:  req.Description,
		Slug:         req.Slug,
		Price:        req.Price,
		OldPrice:     req.OldPrice,
		SKU:          req.SKU,
		Status:       req.Status,
		MainImageURL: req.MainImageURL,
		SupplierURL:  req.SupplierURL,
	}
}

func ListProductsRequestToParams(req ListProductsRequest) models.ListProductsParams {
	return models.ListProductsParams{
		StoreID:    req.StoreID,
		Search:     req.Search,
		CategoryID: req.CategoryID,
		PriceFrom:  req.PriceFrom,
		PriceTo:    req.PriceTo,
		Status:     req.Status,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}
}
func ToProductCategoryDTO(category models.ProductCategory) ProductCategoryDTO {
	return ProductCategoryDTO{
		ID:          category.ID,
		StoreID:     category.StoreID,
		Name:        category.Name,
		Description: category.Description,
		ParentID:    category.ParentID,
		IsActive:    category.IsActive,
	}
}

func ToProductCategoryDTOs(categories []models.ProductCategory) []ProductCategoryDTO {
	result := make([]ProductCategoryDTO, 0, len(categories))

	for _, category := range categories {
		result = append(result, ToProductCategoryDTO(category))
	}

	return result
}
