import { Alert, Box, Card, CircularProgress, Divider, Typography } from '@mui/material';

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
            {isSearchActive ? `Найдено: ${count}` : `Корневых категорий: ${rootCount}`}
            {selectedStore ? ` · ${selectedStore.name}` : ''}
          </Typography>
        </Box>

        {loading && <CircularProgress size={22} />}
      </Box>

      <Divider />

      {stores.length === 0 && !loading && (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            У тебя пока нет магазинов. Сначала создай магазин, затем добавь категории.
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

      {categories.map((category) => (
        <ProductCategoryTreeItem
          key={category.id}
          category={category}
          level={category.level}
          childrenCount={categoriesByParentID[category.id]?.length || 0}
          categoryNameByID={categoryNameByID}
          onCreateChild={onCreateChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Card>
  );
}
