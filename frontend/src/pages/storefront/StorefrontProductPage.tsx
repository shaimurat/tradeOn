import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { ProductCategory } from '../../features/productCategories/model/types';
import { productsApi } from '../../features/products/api/productsApi';
import { formatPrice } from '../../features/products/lib/productFormatters';
import { storesApi } from '../../features/stores/api/storesApi';
import { buildWhatsAppUrl } from '../../shared/lib/whatsapp';
import { StorefrontHeader } from '../../widgets/storefront/StorefrontHeader';
import { productAttributesApi } from '../../features/productAttributes/api/productAttributesApi';
import { ProductAttributesView } from '../../features/productAttributes/ui/ProductAttributesView';

const getCategory = async (categoryID: string): Promise<ProductCategory> => {
  const response = await productCategoriesApi.getByID(categoryID);
  return 'product_category' in response ? response.product_category : response;
};

export function StorefrontProductPage() {
  const { storeSlug = '', productSlug = '' } = useParams();
  const detailsQuery = useQuery({
    queryKey: ['public-product', storeSlug, productSlug],
    enabled: Boolean(storeSlug && productSlug),
    queryFn: async () => {
      const store = await storesApi.getStoreBySlug(storeSlug);
      if (store.status !== 'active') throw new Error('STORE_UNAVAILABLE');

      const product = await productsApi.getProductBySlug(store.id, productSlug);
      if (product.status !== 'active') throw new Error('PRODUCT_UNAVAILABLE');

      const category = product.category_id ? await getCategory(product.category_id) : null;
      const attributeData = await productAttributesApi.getForProduct(
        product.store_id,
        product.category_id
      );
      return {
        store,
        product,
        category,
        attributes: attributeData.attributes,
        attributeOptions: attributeData.optionsByAttribute,
      };
    },
  });

  if (detailsQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">Товар не найден или временно недоступен.</Alert>
        <Button component={Link} to={`/shop/${encodeURIComponent(storeSlug)}`} sx={{ mt: 2 }}>
          Вернуться в магазин
        </Button>
      </Container>
    );
  }

  const { store, product, category, attributes, attributeOptions } = detailsQuery.data;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StorefrontHeader store={store} />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Button
          component={Link}
          to={`/shop/${encodeURIComponent(store.slug)}`}
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ mb: 3 }}
        >
          Назад в каталог
        </Button>

        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box
                sx={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
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
                  <Inventory2OutlinedIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <Box>
                {category && (
                  <Chip label={category.name} variant="outlined" size="small" sx={{ mb: 1.5 }} />
                )}
                <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}>
                  {product.name}
                </Typography>
                {product.sku && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Артикул: {product.sku}
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
              >
                <Typography variant="h2" sx={{ fontSize: '2rem' }}>
                  ₸{formatPrice(product.price)}
                </Typography>
                {product.old_price && (
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: 16, textDecoration: 'line-through' }}
                  >
                    ₸{formatPrice(product.old_price)}
                  </Typography>
                )}
              </Stack>

              <Box>
                <Typography variant="h3">Описание</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                >
                  {product.description || 'Описание товара пока не добавлено.'}
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  Характеристики
                </Typography>
                <ProductAttributesView
                  attributes={attributes}
                  optionsByAttribute={attributeOptions}
                  values={product.attributes ?? []}
                />
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700 }}>Хотите уточнить детали?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Свяжитесь с магазином по наличию, доставке и способам оплаты.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  {store.phone && (
                    <Button
                      component="a"
                      href={buildWhatsAppUrl(
                        store.phone,
                        `Здравствуйте! Интересует товар «${product.name}» в магазине «${store.name}». ${window.location.href}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                    >
                      Написать в WhatsApp
                    </Button>
                  )}
                  {store.email && (
                    <Button component="a" href={`mailto:${store.email}`} variant="outlined">
                      Написать на почту
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
