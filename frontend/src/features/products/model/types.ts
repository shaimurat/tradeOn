import type { CreateProductCategoryWithProductRequest } from '../../productCategories/model/types';

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'blocked';

export type Product = {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  old_price?: number | null;
  sku?: string | null;
  status: ProductStatus;
  main_image_url?: string | null;
  supplier_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateProductBody = {
  store_id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  old_price?: number | null;
  sku?: string | null;
  status: ProductStatus;
  main_image_url?: string | null;
  supplier_url?: string | null;
};

export type CreateProductRequest = {
  product: CreateProductBody;
  product_category?: CreateProductCategoryWithProductRequest | null;
};

export type PatchProductRequest = {
  category_id?: string | null;
  name?: string;
  description?: string | null;
  slug?: string;
  price?: number;
  old_price?: number | null;
  sku?: string | null;
  status?: ProductStatus;
  main_image_url?: string | null;
  supplier_url?: string | null;
};

export type ListProductsParams = {
  store_id?: string;
  search?: string;
  category_id?: string;
  price_from?: number;
  price_to?: number;
  status?: ProductStatus;
  limit?: number;
  offset?: number;
};

export type ProductResponse = {
  product: Product;
};

export type ProductsListResponse = {
  products: Product[];
  count: number;
};

export type StoreOption = {
  id: string;
  name: string;
  slug: string;
  seller_id: string;
};

export type StoresListResponse = {
  stores: StoreOption[];
  count: number;
};
