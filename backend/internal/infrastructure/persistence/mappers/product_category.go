package mappers

import (
	"tradeOn/internal/domain/models"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

func ToCreateProductCategoryParams(category models.ProductCategory) sqldb.CreateProductCategoryParams {
	return sqldb.CreateProductCategoryParams{
		StoreID:     StringToUUID(category.StoreID),
		Name:        category.Name,
		Description: stringPtrToPgText(category.Description),
		ParentID:    stringPtrToPgUUID(category.ParentID),
	}
}

func ToUpdateProductCategoryParams(id string, params models.PatchProductCategoryParams) sqldb.UpdateProductCategoryParams {
	return sqldb.UpdateProductCategoryParams{
		ID:          StringToUUID(id),
		Name:        stringPtrToPgText(params.Name),
		Description: stringPtrToPgText(params.Description),
		ParentID:    stringPtrToPgUUID(params.ParentID),
	}
}

func ToListProductCategoriesParams(params models.ListProductCategoryParams) sqldb.ListProductCategoriesParams {
	return sqldb.ListProductCategoriesParams{
		StoreID:  StringToUUID(params.StoreID),
		Search:   stringPtrToPgText(params.Search),
		ParentID: stringPtrToPgUUID(params.ParentID),
		OnlyRoot: params.OnlyRoot,
	}
}

func ToDomainProductCategory(row sqldb.CreateProductCategoryRow) models.ProductCategory {
	return models.ProductCategory{
		ID:          UuidToString(row.ID),
		StoreID:     UuidToString(row.StoreID),
		Name:        row.Name,
		Description: pgTextToStringPtr(row.Description),
		ParentID:    pgUUIDToStringPtr(row.ParentID),
		IsActive:    row.IsActive,
	}
}

func ToDomainProductCategoryFromUpdate(row sqldb.UpdateProductCategoryRow) models.ProductCategory {
	return models.ProductCategory{
		ID:          UuidToString(row.ID),
		StoreID:     UuidToString(row.StoreID),
		Name:        row.Name,
		Description: pgTextToStringPtr(row.Description),
		ParentID:    pgUUIDToStringPtr(row.ParentID),
		IsActive:    row.IsActive,
	}
}

func ToDomainProductCategoryFromList(row sqldb.ListProductCategoriesRow) models.ProductCategory {
	return models.ProductCategory{
		ID:          UuidToString(row.ID),
		StoreID:     UuidToString(row.StoreID),
		Name:        row.Name,
		Description: pgTextToStringPtr(row.Description),
		ParentID:    pgUUIDToStringPtr(row.ParentID),
		IsActive:    row.IsActive,
	}
}

func ToDomainProductCategoryFromGet(row sqldb.GetProductCategoryByIDRow) models.ProductCategory {
	return models.ProductCategory{
		ID:          UuidToString(row.ID),
		StoreID:     UuidToString(row.StoreID),
		Name:        row.Name,
		Description: pgTextToStringPtr(row.Description),
		ParentID:    pgUUIDToStringPtr(row.ParentID),
		IsActive:    row.IsActive,
	}
}

func ToDomainProductCategories(rows []sqldb.ListProductCategoriesRow) []models.ProductCategory {
	result := make([]models.ProductCategory, 0, len(rows))

	for _, row := range rows {
		result = append(result, ToDomainProductCategoryFromList(row))
	}

	return result
}
