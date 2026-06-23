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
  level = 0,
  visited = new Set<string>()
): ProductCategoryTreeItem[] {
  const children = categoriesByParentID[parentID] || [];

  return children.flatMap((category) => {
    if (visited.has(category.id)) {
      return [];
    }

    const nextVisited = new Set(visited);
    nextVisited.add(category.id);

    return [
      {
        ...category,
        level,
      },
      ...flattenCategoryTree(
        categoriesByParentID,
        category.id,
        level + 1,
        nextVisited
      ),
    ];
  });
}

export function getDescendantCategoryIDs(
  categoryID: string,
  categoriesByParentID: Record<string, ProductCategory[]>,
  visited = new Set<string>()
): string[] {
  if (visited.has(categoryID)) {
    return [];
  }

  visited.add(categoryID);

  const children = categoriesByParentID[categoryID] || [];
  const result: string[] = [];

  for (const child of children) {
    result.push(child.id);
    result.push(
      ...getDescendantCategoryIDs(child.id, categoriesByParentID, visited)
    );
  }

  return result;
}

export function getCategoryLevel(
  category: ProductCategory,
  categoryByID: Record<string, ProductCategory>
) {
  let level = 0;
  let parentID = category.parent_id;
  const visited = new Set<string>();

  while (parentID) {
    if (visited.has(parentID)) {
      break;
    }

    visited.add(parentID);

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
  const categoryByID = new Map<string, ProductCategory>();

  for (const category of categories) {
    categoryByID.set(category.id, category);
  }

  for (const parent of Object.values(parentsByID)) {
    categoryByID.set(parent.id, parent);
  }

  return Array.from(categoryByID.values());
}