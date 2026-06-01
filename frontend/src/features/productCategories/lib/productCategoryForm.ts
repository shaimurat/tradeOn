import type { ProductCategory } from '../model/types';

export type ProductCategoryFormState = {
  name: string;
  description: string;
  parent_id: string;
};

export type ProductCategoryDialogMode = 'create' | 'edit';

export type ProductCategoryPathItem = {
  id: string;
  name: string;
};

export const initialCategoryFormState: ProductCategoryFormState = {
  name: '',
  description: '',
  parent_id: '',
};

export function categoryToForm(category: ProductCategory): ProductCategoryFormState {
  return {
    name: category.name,
    description: category.description || '',
    parent_id: category.parent_id || '',
  };
}

export function buildCreateCategoryPayload(form: ProductCategoryFormState, storeID: string) {
  return {
    store_id: storeID,
    name: form.name.trim(),
    description: form.description.trim() || null,
    parent_id: form.parent_id || null,
    is_active: true,
  };
}

export function buildPatchCategoryPayload(form: ProductCategoryFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    parent_id: form.parent_id || null,
  };
}

export function buildCategoryNameMap(categories: ProductCategory[]) {
  return categories.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});
}
