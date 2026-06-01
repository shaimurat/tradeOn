import { api } from '../../../shared/api/api';

import type {
  CreateProductCategoryRequest,
  ListProductCategoriesParams,
  PatchProductCategoryRequest,
  ProductCategoriesListResponse,
  ProductCategory,
  ProductCategoryResponse,
} from '../model/types';

export type ProductCategoryByIDResponse =
  | ProductCategory
  | {
      product_category: ProductCategory;
    };
export const productCategoriesApi = {
  list: async (params?: ListProductCategoriesParams) => {
    const response = await api.get<ProductCategoriesListResponse>('/product-categories', {
      params,
    });

    return response.data;
  },

  getByID: async (id: string): Promise<ProductCategoryByIDResponse> => {
    const response = await api.get<ProductCategoryByIDResponse>(`/product-categories/${id}`);

    return response.data;
  },

  create: async (payload: CreateProductCategoryRequest) => {
    const response = await api.post<ProductCategoryResponse>('/product-categories', payload);

    return response.data.product_category;
  },

  update: async (id: string, payload: PatchProductCategoryRequest) => {
    const response = await api.patch<ProductCategoryResponse>(`/product-categories/${id}`, payload);

    return response.data.product_category;
  },

  delete: async (id: string) => {
    await api.delete(`/product-categories/${id}`);
  },
};
