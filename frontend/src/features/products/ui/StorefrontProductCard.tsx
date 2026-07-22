import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

import { formatPrice } from '../lib/productFormatters';
import type { Product } from '../model/types';

type StorefrontProductCardProps = {
  product: Product;
  categoryName?: string;
  onSelect: (product: Product) => void;
};

export function StorefrontProductCard({
  product,
  categoryName,
  onSelect,
}: StorefrontProductCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
      <CardActionArea
        onClick={() => onSelect(product)}
        aria-label={`Открыть товар ${product.name}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box
          sx={{
            aspectRatio: '4 / 3',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {product.main_image_url ? (
            <Box
              component="img"
              src={product.main_image_url}
              alt={product.name}
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.25s ease',
                '.MuiCardActionArea-root:hover &': { transform: 'scale(1.03)' },
              }}
            />
          ) : (
            <Inventory2OutlinedIcon sx={{ fontSize: 52, color: 'text.disabled' }} />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {categoryName && (
            <Chip
              label={categoryName}
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: 16,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description || 'Подробнее о товаре'}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 'auto', alignItems: 'flex-end', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
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
            <ArrowForwardOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
