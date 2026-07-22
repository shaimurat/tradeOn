package mappers

import (
	"tradeOn/internal/domain/models"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"

	"github.com/jackc/pgx/v5/pgtype"
)

func ToCreateProductAttributeParams(attribute models.ProductAttribute) sqldb.CreateProductAttributeParams {
	return sqldb.CreateProductAttributeParams{
		StoreID:    StringToUUID(attribute.StoreID),
		CategoryID: stringPtrToPgUUID(attribute.CategoryID),
		Name:       attribute.Name,
		Code:       attribute.Code,
		IsRequired: attribute.IsRequired,
		IsFilter:   attribute.IsFilter,
		Type:       sqldb.AttributeType(attribute.Type),
		Unit:       stringPtrToPgText(attribute.Unit),
	}
}

func ToCreateProductAttributesParams(attributes []models.ProductAttribute) sqldb.CreateProductAttributesParams {
	params := sqldb.CreateProductAttributesParams{
		CategoryIds:      make([]pgtype.UUID, 0, len(attributes)),
		Names:            make([]string, 0, len(attributes)),
		Codes:            make([]string, 0, len(attributes)),
		IsRequiredValues: make([]bool, 0, len(attributes)),
		IsFilterValues:   make([]bool, 0, len(attributes)),
		Types:            make([]sqldb.AttributeType, 0, len(attributes)),
		HasUnits:         make([]bool, 0, len(attributes)),
		Units:            make([]string, 0, len(attributes)),
		StoreIds:         make([]pgtype.UUID, 0, len(attributes)),
	}

	for _, attribute := range attributes {
		params.CategoryIds = append(params.CategoryIds, stringPtrToPgUUID(attribute.CategoryID))
		params.Names = append(params.Names, attribute.Name)
		params.Codes = append(params.Codes, attribute.Code)
		params.IsRequiredValues = append(params.IsRequiredValues, attribute.IsRequired)
		params.IsFilterValues = append(params.IsFilterValues, attribute.IsFilter)
		params.Types = append(params.Types, sqldb.AttributeType(attribute.Type))
		params.HasUnits = append(params.HasUnits, attribute.Unit != nil)
		if attribute.Unit == nil {
			params.Units = append(params.Units, "")
		} else {
			params.Units = append(params.Units, *attribute.Unit)
		}
		params.StoreIds = append(params.StoreIds, StringToUUID(attribute.StoreID))
	}

	return params
}

func ToUpdateProductAttributeParams(id string, attribute models.ProductAttribute) sqldb.UpdateProductAttributeParams {
	return sqldb.UpdateProductAttributeParams{
		CategoryID: stringPtrToPgUUID(attribute.CategoryID),
		Name:       attribute.Name,
		Code:       attribute.Code,
		IsRequired: attribute.IsRequired,
		IsFilter:   attribute.IsFilter,
		Type:       sqldb.AttributeType(attribute.Type),
		Unit:       stringPtrToPgText(attribute.Unit),
		ID:         StringToUUID(id),
	}
}

func ToDomainProductAttribute(attribute sqldb.ProductAttribute) models.ProductAttribute {
	return models.ProductAttribute{
		ID:         UuidToString(attribute.ID),
		StoreID:    UuidToString(attribute.StoreID),
		CategoryID: pgUUIDToStringPtr(attribute.CategoryID),
		Name:       attribute.Name,
		Code:       attribute.Code,
		IsRequired: attribute.IsRequired,
		IsFilter:   attribute.IsFilter,
		Type:       models.AttributeType(attribute.Type),
		Unit:       pgTextToStringPtr(attribute.Unit),
	}
}

func ToDomainProductAttributes(attributes []sqldb.ProductAttribute) []*models.ProductAttribute {
	result := make([]*models.ProductAttribute, 0, len(attributes))
	for _, attribute := range attributes {
		item := ToDomainProductAttribute(attribute)
		result = append(result, &item)
	}
	return result
}

func ToCreateProductAttributeOptionParams(option models.ProductAttributeOption) sqldb.CreateProductAttributeOptionParams {
	return sqldb.CreateProductAttributeOptionParams{
		ProductAttributeID: StringToUUID(option.ProductAttributeID),
		Value:              option.Value,
		Position:           int32(option.Position),
	}
}

func ToCreateProductAttributeOptionsParams(options []models.ProductAttributeOption) sqldb.CreateProductAttributeOptionsParams {
	params := sqldb.CreateProductAttributeOptionsParams{
		Values:              make([]string, 0, len(options)),
		Positions:           make([]int32, 0, len(options)),
		ProductAttributeIds: make([]pgtype.UUID, 0, len(options)),
	}
	for _, option := range options {
		params.Values = append(params.Values, option.Value)
		params.Positions = append(params.Positions, int32(option.Position))
		params.ProductAttributeIds = append(params.ProductAttributeIds, StringToUUID(option.ProductAttributeID))
	}
	return params
}

func ToUpdateProductAttributeOptionParams(id string, option models.ProductAttributeOption) sqldb.UpdateProductAttributeOptionParams {
	return sqldb.UpdateProductAttributeOptionParams{
		Value:    option.Value,
		Position: int32(option.Position),
		ID:       StringToUUID(id),
	}
}

func ToDomainProductAttributeOption(option sqldb.ProductAttributeOption) models.ProductAttributeOption {
	return models.ProductAttributeOption{
		ID:                 UuidToString(option.ID),
		ProductAttributeID: UuidToString(option.ProductAttributeID),
		Value:              option.Value,
		Position:           int(option.Position),
	}
}

func ToDomainProductAttributeOptions(options []sqldb.ProductAttributeOption) []*models.ProductAttributeOption {
	result := make([]*models.ProductAttributeOption, 0, len(options))
	for _, option := range options {
		item := ToDomainProductAttributeOption(option)
		result = append(result, &item)
	}
	return result
}

func ToCreateProductAttributeValueParams(value models.ProductAttributeValue) sqldb.CreateProductAttributeValueParams {
	return sqldb.CreateProductAttributeValueParams{
		ProductID:          StringToUUID(value.ProductID),
		ProductAttributeID: StringToUUID(value.ProductAttributeID),
		ValueText:          stringPtrToPgText(value.ValueText),
		ValueNumber:        float64PtrToPgFloat8(value.ValueNumber),
		ValueBool:          boolPtrToPgBool(value.ValueBool),
		OptionID:           stringPtrToPgUUID(value.OptionID),
	}
}

func ToCreateProductAttributeValuesParams(values []models.ProductAttributeValue) sqldb.CreateProductAttributeValuesParams {
	params := sqldb.CreateProductAttributeValuesParams{
		ProductAttributeIds: make([]pgtype.UUID, 0, len(values)),
		HasValueTexts:       make([]bool, 0, len(values)),
		ValueTexts:          make([]string, 0, len(values)),
		HasValueNumbers:     make([]bool, 0, len(values)),
		ValueNumbers:        make([]float64, 0, len(values)),
		HasValueBools:       make([]bool, 0, len(values)),
		ValueBools:          make([]bool, 0, len(values)),
		OptionIds:           make([]pgtype.UUID, 0, len(values)),
		ProductIds:          make([]pgtype.UUID, 0, len(values)),
	}
	for _, value := range values {
		params.ProductAttributeIds = append(params.ProductAttributeIds, StringToUUID(value.ProductAttributeID))
		params.HasValueTexts = append(params.HasValueTexts, value.ValueText != nil)
		params.ValueTexts = append(params.ValueTexts, valueOrZero(value.ValueText))
		params.HasValueNumbers = append(params.HasValueNumbers, value.ValueNumber != nil)
		params.ValueNumbers = append(params.ValueNumbers, valueOrZero(value.ValueNumber))
		params.HasValueBools = append(params.HasValueBools, value.ValueBool != nil)
		params.ValueBools = append(params.ValueBools, valueOrZero(value.ValueBool))
		params.OptionIds = append(params.OptionIds, stringPtrToPgUUID(value.OptionID))
		params.ProductIds = append(params.ProductIds, StringToUUID(value.ProductID))
	}
	return params
}

func ToUpdateProductAttributeValueParams(id string, value models.ProductAttributeValue) sqldb.UpdateProductAttributeValueParams {
	return sqldb.UpdateProductAttributeValueParams{
		ProductAttributeID: StringToUUID(value.ProductAttributeID),
		ValueText:          stringPtrToPgText(value.ValueText),
		ValueNumber:        float64PtrToPgFloat8(value.ValueNumber),
		ValueBool:          boolPtrToPgBool(value.ValueBool),
		OptionID:           stringPtrToPgUUID(value.OptionID),
		ID:                 StringToUUID(id),
	}
}

func ToDomainProductAttributeValue(value sqldb.ProductAttributeValue) models.ProductAttributeValue {
	return models.ProductAttributeValue{
		ID:                 UuidToString(value.ID),
		ProductID:          UuidToString(value.ProductID),
		ProductAttributeID: UuidToString(value.ProductAttributeID),
		ValueText:          pgTextToStringPtr(value.ValueText),
		ValueNumber:        pgFloat8ToFloat64Ptr(value.ValueNumber),
		ValueBool:          pgBoolToBoolPtr(value.ValueBool),
		OptionID:           pgUUIDToStringPtr(value.OptionID),
	}
}

func ToDomainProductAttributeValues(values []sqldb.ProductAttributeValue) []*models.ProductAttributeValue {
	result := make([]*models.ProductAttributeValue, 0, len(values))
	for _, value := range values {
		item := ToDomainProductAttributeValue(value)
		result = append(result, &item)
	}
	return result
}

func float64PtrToPgFloat8(value *float64) pgtype.Float8 {
	if value == nil {
		return pgtype.Float8{}
	}
	return pgtype.Float8{Float64: *value, Valid: true}
}

func pgFloat8ToFloat64Ptr(value pgtype.Float8) *float64 {
	if !value.Valid {
		return nil
	}
	return &value.Float64
}

func boolPtrToPgBool(value *bool) pgtype.Bool {
	if value == nil {
		return pgtype.Bool{}
	}
	return pgtype.Bool{Bool: *value, Valid: true}
}

func pgBoolToBoolPtr(value pgtype.Bool) *bool {
	if !value.Valid {
		return nil
	}
	return &value.Bool
}

func valueOrZero[T any](value *T) T {
	if value == nil {
		var zero T
		return zero
	}
	return *value
}
