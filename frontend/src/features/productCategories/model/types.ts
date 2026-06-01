export type ProductCategory = {
  id: string;
  store_id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  is_active: boolean;
};

export type CreateProductCategoryWithProductRequest = {
  name: string;
  description?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
};

export type CreateProductCategoryRequest = {
  name: string;
  store_id: string;
  description?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
};

export type PatchProductCategoryRequest = {
  name?: string;
  description?: string | null;
  parent_id?: string | null;
};

export type ListProductCategoriesParams = {
  store_id?: string;
  search?: string;
  parent_id?: string;
  only_root?: boolean;
};

export type ProductCategoryResponse = {
  product_category: ProductCategory;
};

export type ProductCategoriesListResponse = {
  product_categories: ProductCategory[];
  count: number;
};