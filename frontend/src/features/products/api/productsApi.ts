import { api } from '../../../shared/api/api';

import type {
  CreateProductRequest,
  ListProductsParams,
  PatchProductRequest,
  ProductResponse,
  ProductsListResponse,
  StoresListResponse,
} from '../model/types';

export const productsApi = {
  getProducts: async (params?: ListProductsParams) => {
    const response = await api.get<ProductsListResponse>('/products', {
      params,
    });

    return response.data;
  },

  getProductBySlug: async (storeId: string, slug: string) => {
    const response = await api.get<ProductResponse>(
      `/products/store/${encodeURIComponent(storeId)}/slug/${encodeURIComponent(slug)}`
    );

    return response.data.product;
  },

  createProduct: async (payload: CreateProductRequest) => {
    const response = await api.post<ProductResponse>('/products/', payload);

    return response.data.product;
  },

  updateProduct: async (id: string, payload: PatchProductRequest) => {
    const response = await api.patch<ProductResponse>(`/products/${id}`, payload);

    return response.data.product;
  },

  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  getSellerStores: async () => {
    const response = await api.get<StoresListResponse>('/stores/seller');

    return response.data;
  },
};
