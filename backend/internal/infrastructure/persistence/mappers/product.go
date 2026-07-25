package mappers

import (
	"encoding/json"
	"tradeOn/internal/domain/models"
	generated2 "tradeOn/internal/infrastructure/sqlc/generated"

	"github.com/jackc/pgx/v5/pgtype"
)

func ToDomainProduct(product generated2.Product) models.Product {
	return models.Product{
		ID:           UuidToString(product.ID),
		StoreID:      UuidToString(product.StoreID),
		CategoryID:   UuidToString(product.CategoryID),
		Name:         product.Name,
		Slug:         product.Slug,
		Description:  pgTextToStringPtr(product.Description),
		Price:        product.Price,
		OldPrice:     pgInt8ToInt64Ptr(product.OldPrice),
		SKU:          pgTextToStringPtr(product.Sku),
		Status:       models.ProductStatus(product.Status),
		MainImageURL: pgTextToStringPtr(product.MainImageUrl),
		SupplierURL:  pgTextToStringPtr(product.SupplierUrl),
		CreatedAt:    pgTimestamptzToTime(product.CreatedAt),
		UpdatedAt:    pgTimestamptzToTime(product.UpdatedAt),
	}
}

func ToDomainProducts(products []generated2.Product) []models.Product {
	result := make([]models.Product, 0, len(products))

	for _, product := range products {
		result = append(result, ToDomainProduct(product))
	}

	return result
}

func ToCreateProductParams(product models.Product) generated2.CreateProductParams {
	return generated2.CreateProductParams{
		StoreID:      StringToUUID(product.StoreID),
		CategoryID:   StringToUUID(product.CategoryID),
		Name:         product.Name,
		Slug:         product.Slug,
		Description:  stringPtrToPgText(product.Description),
		Price:        product.Price,
		OldPrice:     int64PtrToPgInt8(product.OldPrice),
		Sku:          stringPtrToPgText(product.SKU),
		Status:       generated2.ProductStatus(product.Status),
		MainImageUrl: stringPtrToPgText(product.MainImageURL),
		SupplierUrl:  stringPtrToPgText(product.SupplierURL),
	}
}

func ToPatchProductParams(id string, params models.PatchProductParams) generated2.PatchProductParams {
	return generated2.PatchProductParams{
		ID:           StringToUUID(id),
		CategoryID:   stringPtrToPgUUID(params.CategoryID),
		Name:         stringPtrToPgText(params.Name),
		Slug:         stringPtrToPgText(params.Slug),
		Description:  stringPtrToPgText(params.Description),
		Price:        int64PtrToPgInt8(params.Price),
		OldPrice:     int64PtrToPgInt8(params.OldPrice),
		Sku:          stringPtrToPgText(params.SKU),
		Status:       productStatusPtrToNullProductStatus(params.Status),
		MainImageUrl: stringPtrToPgText(params.MainImageURL),
		SupplierUrl:  stringPtrToPgText(params.SupplierURL),
	}
}

func ToGetProductBySlugParams(storeID string, slug string) generated2.GetProductBySlugParams {
	return generated2.GetProductBySlugParams{
		StoreID: StringToUUID(storeID),
		Slug:    slug,
	}
}

func ToGetProductsListParams(params models.ListProductsParams) generated2.GetProductsListParams {
	return generated2.GetProductsListParams{
		StoreID:          StringToUUID(params.StoreID),
		Search:           stringPtrToPgText(params.Search),
		CategoryID:       stringPtrToPgUUID(params.CategoryID),
		PriceFrom:        int64PtrToPgInt8(params.PriceFrom),
		PriceTo:          int64PtrToPgInt8(params.PriceTo),
		Status:           productStatusPtrToNullProductStatus(params.Status),
		Offset:           int32PtrToPgInt4(params.Offset),
		Limit:            int32PtrToPgInt4(params.Limit),
		AttributeFilters: attributeFiltersToPgText(params.AttributeFilters),
	}
}
func ToCountProductsListParams(params models.ListProductsParams) generated2.CountProductsListParams {
	return generated2.CountProductsListParams{
		StoreID:          StringToUUID(params.StoreID),
		Search:           stringPtrToPgText(params.Search),
		CategoryID:       stringPtrToPgUUID(params.CategoryID),
		PriceFrom:        int64PtrToPgInt8(params.PriceFrom),
		PriceTo:          int64PtrToPgInt8(params.PriceTo),
		Status:           productStatusPtrToNullProductStatus(params.Status),
		AttributeFilters: attributeFiltersToPgText(params.AttributeFilters),
	}
}

func attributeFiltersToPgText(filters map[string]string) pgtype.Text {
	if len(filters) == 0 {
		return pgtype.Text{}
	}
	value, err := json.Marshal(filters)
	if err != nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: string(value), Valid: true}
}
