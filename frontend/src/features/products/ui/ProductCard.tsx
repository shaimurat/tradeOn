import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import type { Product } from '../model/types';
import { StatusChip } from '../../../shared/ui/StatusChip';
import { formatPrice } from '../lib/productFormatters';

type ProductCardProps = {
  product: Product;
  categoryName?: string;
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductCard({
  product,
  categoryName,
  onSelect,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`Открыть товар ${product.name}`}
      onClick={() => onSelect(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(product);
        }
      }}
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        transition: '0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ p: 1.25, pb: 0.5 }}>
        <Box
          sx={{
            width: '100%',
            height: {
              xs: 180,
              sm: 170,
              lg: 185,
            },
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'common.white',
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
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Inventory2OutlinedIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
          )}
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 1.5,
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          '&:last-child': {
            pb: 1.5,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <StatusChip status={product.status} />

          <Stack
            direction="row"
            spacing={0.25}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Tooltip title="Редактировать">
              <IconButton size="small" onClick={() => onEdit(product)}>
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Удалить">
              <IconButton size="small" color="error" onClick={() => onDelete(product)}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 38,
            }}
          >
            {product.name}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.25 }}
            noWrap
          >
            {product.description || 'Описание отсутствует'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {Boolean(product.sku) && (
            <Chip
              size="small"
              variant="outlined"
              label={`SKU: ${product.sku}`}
              sx={{ height: 22, fontSize: 11 }}
            />
          )}

          {Boolean(product.category_id) && (
            <Chip
              size="small"
              variant="outlined"
              label={categoryName || 'Категория'}
              sx={{ height: 22, fontSize: 11 }}
            />
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mt: 'auto',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Цена
            </Typography>

            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
              ₸{formatPrice(product.price)}
            </Typography>

            {product.old_price && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                ₸{formatPrice(product.old_price)}
              </Typography>
            )}
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Обновлено
            </Typography>

            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
              {new Date(product.updated_at).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
