package product

import "tradeOn/internal/domain/models"

type ProductAttributeDTO struct {
	ID         string               `json:"id"`
	StoreID    string               `json:"store_id"`
	CategoryID *string              `json:"category_id,omitempty"`
	Name       string               `json:"name"`
	Code       string               `json:"code"`
	IsRequired bool                 `json:"is_required"`
	IsFilter   bool                 `json:"is_filter"`
	Type       models.AttributeType `json:"type"`
	Unit       *string              `json:"unit,omitempty"`
}

type CreateProductAttributeRequest struct {
	StoreID    string               `json:"store_id" binding:"required"`
	CategoryID *string              `json:"category_id,omitempty"`
	Name       string               `json:"name" binding:"required"`
	Code       string               `json:"code" binding:"required"`
	IsRequired bool                 `json:"is_required"`
	IsFilter   bool                 `json:"is_filter"`
	Type       models.AttributeType `json:"type" binding:"required,oneof=text number bool select"`
	Unit       *string              `json:"unit,omitempty"`
}

type PatchProductAttributeRequest struct {
	Name       *string               `json:"name,omitempty"`
	Code       *string               `json:"code,omitempty"`
	IsRequired *bool                 `json:"is_required,omitempty"`
	IsFilter   *bool                 `json:"is_filter,omitempty"`
	Type       *models.AttributeType `json:"type,omitempty" binding:"omitempty,oneof=text number bool select"`
	Unit       *string               `json:"unit,omitempty"`
}

type ProductAttributeOptionDTO struct {
	ID                 string `json:"id"`
	ProductAttributeID string `json:"product_attribute_id"`
	Value              string `json:"value"`
	Position           int    `json:"position"`
}

type CreateProductAttributeOptionRequest struct {
	Value    string `json:"value" binding:"required"`
	Position int    `json:"position"`
}

type PatchProductAttributeOptionRequest struct {
	Value    *string `json:"value,omitempty"`
	Position *int    `json:"position,omitempty"`
}

type ProductAttributeValueDTO struct {
	ID                 string   `json:"id"`
	ProductID          string   `json:"product_id"`
	ProductAttributeID string   `json:"product_attribute_id"`
	ValueText          *string  `json:"value_text,omitempty"`
	ValueNumber        *float64 `json:"value_number,omitempty"`
	ValueBool          *bool    `json:"value_bool,omitempty"`
	OptionID           *string  `json:"option_id,omitempty"`
}

type CreateProductAttributeValueRequest struct {
	ProductAttributeID string   `json:"product_attribute_id" binding:"required"`
	ValueText          *string  `json:"value_text,omitempty"`
	ValueNumber        *float64 `json:"value_number,omitempty"`
	ValueBool          *bool    `json:"value_bool,omitempty"`
	OptionID           *string  `json:"option_id,omitempty"`
}

type PatchProductAttributeValueRequest struct {
	ValueText   *string  `json:"value_text,omitempty"`
	ValueNumber *float64 `json:"value_number,omitempty"`
	ValueBool   *bool    `json:"value_bool,omitempty"`
	OptionID    *string  `json:"option_id,omitempty"`
}

type ProductAttributeResponse struct {
	ProductAttribute ProductAttributeDTO `json:"product_attribute"`
}

type ProductAttributesResponse struct {
	ProductAttributes []ProductAttributeDTO `json:"product_attributes"`
	Count             int                   `json:"count"`
}

type ProductAttributeOptionResponse struct {
	ProductAttributeOption ProductAttributeOptionDTO `json:"product_attribute_option"`
}

type ProductAttributeOptionsResponse struct {
	ProductAttributeOptions []ProductAttributeOptionDTO `json:"product_attribute_options"`
	Count                   int                         `json:"count"`
}

type ProductAttributeValueResponse struct {
	ProductAttributeValue ProductAttributeValueDTO `json:"product_attribute_value"`
}

func toProductAttributeDTO(value models.ProductAttribute) ProductAttributeDTO {
	return ProductAttributeDTO{
		ID: value.ID, StoreID: value.StoreID, CategoryID: value.CategoryID, Name: value.Name,
		Code: value.Code, IsRequired: value.IsRequired, IsFilter: value.IsFilter, Type: value.Type, Unit: value.Unit,
	}
}

func toProductAttributeOptionDTO(value models.ProductAttributeOption) ProductAttributeOptionDTO {
	return ProductAttributeOptionDTO{
		ID: value.ID, ProductAttributeID: value.ProductAttributeID, Value: value.Value, Position: value.Position,
	}
}

func toProductAttributeValueDTO(value models.ProductAttributeValue) ProductAttributeValueDTO {
	return ProductAttributeValueDTO{
		ID: value.ID, ProductID: value.ProductID, ProductAttributeID: value.ProductAttributeID,
		ValueText: value.ValueText, ValueNumber: value.ValueNumber, ValueBool: value.ValueBool, OptionID: value.OptionID,
	}
}
