export type ProductAttributeType = 'text' | 'number' | 'bool' | 'select';

export type ProductAttribute = {
  id: string;
  store_id: string;
  category_id?: string | null;
  name: string;
  code: string;
  is_required: boolean;
  is_filter: boolean;
  type: ProductAttributeType;
  unit?: string | null;
};

export type ProductAttributeOption = {
  id: string;
  product_attribute_id: string;
  value: string;
  position: number;
};

export type ProductAttributeValue = {
  id: string;
  product_id: string;
  product_attribute_id: string;
  value_text?: string | null;
  value_number?: number | null;
  value_bool?: boolean | null;
  option_id?: string | null;
};

export type ProductAttributePayload = Omit<ProductAttribute, 'id'>;
export type PatchProductAttributePayload = Partial<
  Pick<ProductAttribute, 'name' | 'code' | 'is_required' | 'is_filter' | 'type' | 'unit'>
>;

export type ProductAttributeValuePayload = {
  product_attribute_id: string;
  value_text?: string;
  value_number?: number;
  value_bool?: boolean;
  option_id?: string;
};

