package product_uc

import "tradeOn/internal/domain/models"

type CreateProductInput struct {
	Product         models.Product
	ProductCategory *models.ProductCategory
	Attributes      []models.ProductAttribute
	AttributeValues []models.ProductAttributeValue
}
