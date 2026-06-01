import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import type { Product, StoreOption } from '../model/types';
import { ProductCard } from './ProductCard';

type ProductsListCardProps = {
  products: Product[];
  loading: boolean;
  count: number;
  page: number;
  totalPages: number;
  selectedStore?: StoreOption;
  categoryNameByID: Record<string, string>;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsListCard({
  products,
  loading,
  count,
  page,
  totalPages,
  selectedStore,
  categoryNameByID,
  onPageChange,
  onEdit,
  onDelete,
}: ProductsListCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                md: 'center',
              },
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                Список товаров: {selectedStore ? selectedStore.name : 'Магазин не выбран'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {`${count} товаров`}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 42, color: 'text.secondary', mb: 1 }} />

            <Typography sx={{ fontWeight: 800 }}>Товары не найдены</Typography>

            <Typography variant="body2" color="text.secondary">
              Добавьте первый товар или измените параметры фильтра.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1.5}>
              {products.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                  <ProductCard
                    product={product}
                    categoryName={
                      product.category_id ? categoryNameByID[product.category_id] : undefined
                    }
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Divider />

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
