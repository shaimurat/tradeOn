import { api } from '../../../shared/api/api';
import type {
  PatchProductAttributePayload,
  ProductAttribute,
  ProductAttributeOption,
  ProductAttributePayload,
  ProductAttributeValue,
  ProductAttributeValuePayload,
} from '../model/types';

export const productAttributesApi = {
  list: async (storeID: string) => {
    const response = await api.get<{
      product_attributes?: ProductAttribute[];
      attributes?: ProductAttribute[];
      count?: number;
    }>('/product-attributes', { params: { store_id: storeID } });
    const productAttributes =
      response.data.product_attributes ?? response.data.attributes ?? [];
    return {
      product_attributes: productAttributes,
      count: response.data.count ?? productAttributes.length,
    };
  },

  create: async (payload: ProductAttributePayload) => {
    const response = await api.post<{ product_attribute: ProductAttribute }>(
      '/product-attributes',
      payload
    );
    return response.data.product_attribute;
  },

  update: async (id: string, payload: PatchProductAttributePayload) => {
    const response = await api.patch<{ product_attribute: ProductAttribute }>(
      `/product-attributes/${id}`,
      payload
    );
    return response.data.product_attribute;
  },

  delete: async (id: string) => {
    await api.delete(`/product-attributes/${id}`);
  },

  listOptions: async (attributeID: string) => {
    const response = await api.get<{
      product_attribute_options?: ProductAttributeOption[];
      options?: ProductAttributeOption[];
      count?: number;
    }>(`/product-attributes/${attributeID}/options`);
    return response.data.product_attribute_options ?? response.data.options ?? [];
  },

  getForProduct: async (storeID: string, categoryID: string) => {
    const data = await productAttributesApi.list(storeID);
    const attributes = data.product_attributes.filter(
      (attribute) => !attribute.category_id || attribute.category_id === categoryID
    );
    const optionEntries = await Promise.all(
      attributes
        .filter((attribute) => attribute.type === 'select')
        .map(async (attribute) => [
          attribute.id,
          await productAttributesApi.listOptions(attribute.id),
        ] as const)
    );
    return {
      attributes,
      optionsByAttribute: Object.fromEntries(optionEntries) as Record<
        string,
        ProductAttributeOption[]
      >,
    };
  },

  createOption: async (
    attributeID: string,
    payload: Pick<ProductAttributeOption, 'value' | 'position'>
  ) => {
    const response = await api.post<{ product_attribute_option: ProductAttributeOption }>(
      `/product-attributes/${attributeID}/options`,
      payload
    );
    return response.data.product_attribute_option;
  },

  updateOption: async (
    attributeID: string,
    optionID: string,
    payload: Partial<Pick<ProductAttributeOption, 'value' | 'position'>>
  ) => {
    const response = await api.patch<{ product_attribute_option: ProductAttributeOption }>(
      `/product-attributes/${attributeID}/options/${optionID}`,
      payload
    );
    return response.data.product_attribute_option;
  },

  deleteOption: async (attributeID: string, optionID: string) => {
    await api.delete(`/product-attributes/${attributeID}/options/${optionID}`);
  },

  createValue: async (productID: string, payload: ProductAttributeValuePayload) => {
    const response = await api.post<{ product_attribute_value: ProductAttributeValue }>(
      `/products/${productID}/attributes`,
      payload
    );
    return response.data.product_attribute_value;
  },

  updateValue: async (
    productID: string,
    valueID: string,
    payload: Omit<ProductAttributeValuePayload, 'product_attribute_id'>
  ) => {
    const response = await api.patch<{ product_attribute_value: ProductAttributeValue }>(
      `/products/${productID}/attributes/${valueID}`,
      payload
    );
    return response.data.product_attribute_value;
  },

  deleteValue: async (productID: string, valueID: string) => {
    await api.delete(`/products/${productID}/attributes/${valueID}`);
  },
};
