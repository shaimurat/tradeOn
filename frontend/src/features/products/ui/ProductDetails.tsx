import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import type { ProductCategory } from '../../productCategories/model/types';
import type { Store } from '../../stores/model/types';
import { StoreStatusChip } from '../../stores/ui/StoreStatusChip';
import { formatPrice } from '../lib/productFormatters';
import type { Product } from '../model/types';
import { StatusChip } from '../../../shared/ui/StatusChip';

type ProductDetailsProps = {
  product: Product;
  store: Store;
  category: ProductCategory | null;
};

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={0.5}
      sx={{ justifyContent: 'space-between', py: 1.25 }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, textAlign: { sm: 'right' } }}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Stack>
  );
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value)
  );

export function ProductDetails({ product, store, category }: ProductDetailsProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              aspectRatio: '1 / 1',
              bgcolor: 'background.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product.main_image_url ? (
              <Box
                component="img"
                src={product.main_image_url}
                alt={product.name}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Inventory2OutlinedIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
            )}
          </Box>
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <StatusChip status={product.status} />
              {product.sku && (
                <Chip size="small" variant="outlined" label={`SKU: ${product.sku}`} />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              /{product.slug}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography variant="h2">₸{formatPrice(product.price)}</Typography>
            {product.old_price && (
              <Typography sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                ₸{formatPrice(product.old_price)}
              </Typography>
            )}
          </Stack>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Описание
              </Typography>
              <Typography
                sx={{
                  color: product.description ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {product.description || 'Описание товара не указано.'}
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <StorefrontOutlinedIcon color="action" />
                    <Typography variant="h3">Магазин</Typography>
                  </Stack>
                  <DetailRow label="Название" value={store.name} />
                  <Divider />
                  <DetailRow label="Slug" value={`/${store.slug}`} />
                  <Divider />
                  <DetailRow label="Статус" value={<StoreStatusChip status={store.status} />} />
                  <Divider />
                  <DetailRow label="Адрес" value={store.address || 'Не указан'} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <SellOutlinedIcon color="action" />
                    <Typography variant="h3">Категория и поставщик</Typography>
                  </Stack>
                  <DetailRow label="Категория" value={category?.name || 'Не указана'} />
                  <Divider />
                  <DetailRow
                    label="Категория активна"
                    value={category ? (category.is_active ? 'Да' : 'Нет') : '—'}
                  />
                  <Divider />
                  <DetailRow
                    label="Поставщик"
                    value={
                      product.supplier_url ? (
                        <Button
                          component={Link}
                          href={product.supplier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<LinkOutlinedIcon />}
                        >
                          Открыть ссылку
                        </Button>
                      ) : (
                        'Не указан'
                      )
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <CalendarTodayOutlinedIcon color="action" />
                <Typography variant="h3">Системная информация</Typography>
              </Stack>
              <DetailRow label="ID товара" value={product.id} />
              <Divider />
              <DetailRow label="ID магазина" value={product.store_id} />
              <Divider />
              <DetailRow label="ID категории" value={product.category_id || 'Не указан'} />
              <Divider />
              <DetailRow label="Создан" value={formatDate(product.created_at)} />
              <Divider />
              <DetailRow label="Обновлён" value={formatDate(product.updated_at)} />
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}
