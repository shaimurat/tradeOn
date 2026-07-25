import type { ProductCategory } from '../../productCategories/model/types';
import type { CreateProductRequest, Product, ProductStatus } from '../model/types';

export type ProductFormState = {
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price: string;
  sku: string;
  status: ProductStatus;
  main_image_url: string;
  supplier_url: string;
};

export type ProductPatchPayload = {
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  sku: string | null;
  status: ProductStatus;
  main_image_url: string | null;
  supplier_url: string | null;
};

export type CategoryPathItem = {
  id: string;
  name: string;
};

export const initialFormState: ProductFormState = {
  store_id: '',
  category_id: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  old_price: '',
  sku: '',
  status: 'active',
  main_image_url: '',
  supplier_url: '',
};

function toNullableString(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return Number(trimmed);
}

export function buildCreatePayload(form: ProductFormState): CreateProductRequest {
  return {
    product: {
      store_id: form.store_id,
      category_id: form.category_id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: toNullableString(form.description),
      price: Number(form.price),
      old_price: toNullableNumber(form.old_price),
      sku: toNullableString(form.sku),
      status: form.status,
      main_image_url: toNullableString(form.main_image_url),
      supplier_url: toNullableString(form.supplier_url),
    },
    product_category: null,
  };
}

export function buildPatchPayload(form: ProductFormState): ProductPatchPayload {
  return {
    category_id: form.category_id,
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: toNullableString(form.description),
    price: Number(form.price),
    old_price: toNullableNumber(form.old_price),
    sku: toNullableString(form.sku),
    status: form.status,
    main_image_url: toNullableString(form.main_image_url),
    supplier_url: toNullableString(form.supplier_url),
  };
}

export function productToForm(product: Product): ProductFormState {
  return {
    store_id: product.store_id,
    category_id: product.category_id ?? '',
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: String(product.price),
    old_price: product.old_price ? String(product.old_price) : '',
    sku: product.sku ?? '',
    status: product.status,
    main_image_url: product.main_image_url ?? '',
    supplier_url: product.supplier_url ?? '',
  };
}

export function buildCategoryNameMap(categories: ProductCategory[]) {
  return categories.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});
}

export function buildCategoryMap(categories: ProductCategory[]) {
  return categories.reduce<Record<string, ProductCategory>>((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});
}

export function buildCategoriesByParentID(categories: ProductCategory[]) {
  return categories.reduce<Record<string, ProductCategory[]>>((acc, category) => {
    const key = category.parent_id || 'root';

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(category);

    return acc;
  }, {});
}

export function getCategoryCount(category: ProductCategory) {
  const value = category as ProductCategory & {
    count?: number;
    products_count?: number;
    productsCount?: number;
    total?: number;
  };

  return value.count ?? value.products_count ?? value.productsCount ?? value.total ?? null;
}
