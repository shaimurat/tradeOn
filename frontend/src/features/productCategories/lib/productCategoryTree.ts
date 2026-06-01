import type { ProductCategory } from '../model/types';

export type ProductCategoryTreeItem = ProductCategory & {
  level: number;
};

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

export function buildCategoryByID(categories: ProductCategory[]) {
  return categories.reduce<Record<string, ProductCategory>>((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});
}

export function flattenCategoryTree(
  categoriesByParentID: Record<string, ProductCategory[]>,
  parentID = 'root',
  level = 0
): ProductCategoryTreeItem[] {
  const children = categoriesByParentID[parentID] || [];

  return children.flatMap((category) => [
    {
      ...category,
      level,
    },
    ...flattenCategoryTree(categoriesByParentID, category.id, level + 1),
  ]);
}

export function getDescendantCategoryIDs(
  categoryID: string,
  categoriesByParentID: Record<string, ProductCategory[]>
): string[] {
  const children = categoriesByParentID[categoryID] || [];
  const result: string[] = [];

  for (const child of children) {
    result.push(child.id);
    result.push(...getDescendantCategoryIDs(child.id, categoriesByParentID));
  }

  return result;
}

export function getCategoryLevel(
  category: ProductCategory,
  categoryByID: Record<string, ProductCategory>
) {
  let level = 0;
  let parentID = category.parent_id;

  while (parentID) {
    const parent = categoryByID[parentID];

    if (!parent) {
      break;
    }

    level += 1;
    parentID = parent.parent_id || null;
  }

  return level;
}

export function flattenSearchCategories(
  categories: ProductCategory[],
  categoryByID: Record<string, ProductCategory>
): ProductCategoryTreeItem[] {
  return categories.map((category) => ({
    ...category,
    level: getCategoryLevel(category, categoryByID),
  }));
}

export function mergeCategoriesWithParents(
  categories: ProductCategory[],
  parentsByID: Record<string, ProductCategory>
) {
  return [...categories, ...Object.values(parentsByID)];
}
