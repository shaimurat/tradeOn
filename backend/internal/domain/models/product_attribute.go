package models

type AttributeType string

const (
	AttributeTypeText   AttributeType = "text"
	AttributeTypeNumber AttributeType = "number"
	AttributeTypeBool   AttributeType = "bool"
	AttributeTypeSelect AttributeType = "select"
)

type ProductAttribute struct {
	ID         string
	StoreID    string
	CategoryID *string

	Name       string
	Code       string
	IsRequired bool
	IsFilter   bool
	Type       AttributeType
	Unit       *string
}

type ProductAttributeOption struct {
	ID                 string
	ProductAttributeID string
	Value              string
	Position           int
}

type ProductAttributeValue struct {
	ID                 string
	ProductID          string
	ProductAttributeID string

	ValueText   *string
	ValueNumber *float64
	ValueBool   *bool
	OptionID    *string
}
