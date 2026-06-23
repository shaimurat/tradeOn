import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';

import type { ProductCategory } from '../model/types';
import type { StoreOption } from '../../products/model/types';
import type { ProductCategoryTreeItem as ProductCategoryTreeItemType } from '../lib/productCategoryTree';

import { ProductCategoryTreeItem } from './ProductCategoryTreeItem';

type ProductCategoriesListCardProps = {
  stores: StoreOption[];
  selectedStoreID: string;
  selectedStore?: StoreOption;
  loading: boolean;
  count: number;
  rootCount: number;
  isSearchActive: boolean;
  categories: ProductCategoryTreeItemType[];
  categoriesByParentID: Record<string, ProductCategory[]>;
  categoryNameByID: Record<string, string>;
  onCreateChild: (category: ProductCategory) => void;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
};

type CategoryNodeProps = {
  category: ProductCategoryTreeItemType;
  collapsedCategoryIDs: Set<string>;
  treeCategoriesByParentID: Record<string, ProductCategoryTreeItemType[]>;
  categoriesByParentID: Record<string, ProductCategory[]>;
  categoryNameByID: Record<string, string>;
  onToggleCollapse: (categoryID: string) => void;
  onCreateChild: (category: ProductCategory) => void;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
};

function CategoryNode({
  category,
  collapsedCategoryIDs,
  treeCategoriesByParentID,
  categoriesByParentID,
  categoryNameByID,
  onToggleCollapse,
  onCreateChild,
  onEdit,
  onDelete,
}: CategoryNodeProps) {
  const children = treeCategoriesByParentID[category.id] || [];
  const childrenCount = categoriesByParentID[category.id]?.length || 0;
  const isCollapsed = collapsedCategoryIDs.has(category.id);

  return (
    <>
      <ProductCategoryTreeItem
        category={category}
        level={category.level}
        childrenCount={childrenCount}
        categoryNameByID={categoryNameByID}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onCreateChild={onCreateChild}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {children.length > 0 && (
        <Collapse in={!isCollapsed} timeout={220} unmountOnExit>
          <Box>
            {children.map((child) => (
              <CategoryNode
                key={child.id}
                category={child}
                collapsedCategoryIDs={collapsedCategoryIDs}
                treeCategoriesByParentID={treeCategoriesByParentID}
                categoriesByParentID={categoriesByParentID}
                categoryNameByID={categoryNameByID}
                onToggleCollapse={onToggleCollapse}
                onCreateChild={onCreateChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
}

export function ProductCategoriesListCard({
  stores,
  selectedStoreID,
  selectedStore,
  loading,
  count,
  rootCount,
  isSearchActive,
  categories,
  categoriesByParentID,
  categoryNameByID,
  onCreateChild,
  onEdit,
  onDelete,
}: ProductCategoriesListCardProps) {
  const [collapsedCategoryIDs, setCollapsedCategoryIDs] = useState<Set<string>>(
    () => new Set()
  );

  const categoryByID = useMemo(() => {
    return categories.reduce<Record<string, ProductCategoryTreeItemType>>(
      (acc, category) => {
        acc[category.id] = category;
        return acc;
      },
      {}
    );
  }, [categories]);

  const treeCategoriesByParentID = useMemo(() => {
    return categories.reduce<Record<string, ProductCategoryTreeItemType[]>>(
      (acc, category) => {
        if (!category.parent_id) {
          return acc;
        }

        acc[category.parent_id] = acc[category.parent_id] || [];
        acc[category.parent_id].push(category);

        return acc;
      },
      {}
    );
  }, [categories]);

  const rootCategories = useMemo(() => {
    return categories.filter((category) => {
      if (!category.parent_id) {
        return true;
      }

      return !categoryByID[category.parent_id];
    });
  }, [categories, categoryByID]);

  useEffect(() => {
    const initiallyCollapsedCategoryIDs = new Set<string>();

    categories.forEach((category) => {
      const childrenCount = categoriesByParentID[category.id]?.length || 0;

      if (childrenCount > 0) {
        initiallyCollapsedCategoryIDs.add(category.id);
      }
    });

    setCollapsedCategoryIDs(initiallyCollapsedCategoryIDs);
  }, [categories, categoriesByParentID, selectedStoreID, isSearchActive]);

  const toggleCategory = (categoryID: string) => {
    setCollapsedCategoryIDs((prev) => {
      const next = new Set(prev);

      if (next.has(categoryID)) {
        next.delete(categoryID);
      } else {
        next.add(categoryID);
      }

      return next;
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            {isSearchActive ? 'Результаты поиска' : 'Дерево категорий'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {isSearchActive
              ? `Найдено: ${count}`
              : `Корневых категорий: ${rootCount}`}
            {selectedStore ? ` · ${selectedStore.name}` : ''}
          </Typography>
        </Box>

        {loading && <CircularProgress size={22} />}
      </Box>

      <Divider />

      {stores.length === 0 && !loading && (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            У тебя пока нет магазинов. Сначала создай магазин, затем добавь
            категории.
          </Alert>
        </Box>
      )}

      {stores.length > 0 && !selectedStoreID && !loading && (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Выбери магазин, чтобы загрузить категории.</Alert>
        </Box>
      )}

      {selectedStoreID && !loading && categories.length === 0 && (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            {isSearchActive
              ? 'По этому поиску категории не найдены.'
              : 'Категорий пока нет. Создай первую категорию.'}
          </Alert>
        </Box>
      )}

      {rootCategories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          collapsedCategoryIDs={collapsedCategoryIDs}
          treeCategoriesByParentID={treeCategoriesByParentID}
          categoriesByParentID={categoriesByParentID}
          categoryNameByID={categoryNameByID}
          onToggleCollapse={toggleCategory}
          onCreateChild={onCreateChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Card>
  );
}