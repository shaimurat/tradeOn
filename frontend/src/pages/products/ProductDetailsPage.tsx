import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { ProductCategory } from '../../features/productCategories/model/types';
import { productsApi } from '../../features/products/api/productsApi';
import { ProductDetails } from '../../features/products/ui/ProductDetails';
import { storesApi } from '../../features/stores/api/storesApi';
import { parseApiError } from '../../shared/api/error';
import { productAttributesApi } from '../../features/productAttributes/api/productAttributesApi';

const getCategory = async (categoryID: string): Promise<ProductCategory> => {
  const response = await productCategoriesApi.getByID(categoryID);

  return 'product_category' in response ? response.product_category : response;
};

export function ProductDetailsPage() {
  const navigate = useNavigate();
  const { storeSlug = '', productSlug = '' } = useParams();

  const detailsQuery = useQuery({
    queryKey: ['product-details', storeSlug, productSlug],
    enabled: Boolean(storeSlug && productSlug),
    queryFn: async () => {
      const store = await storesApi.getStoreBySlug(storeSlug);
      const product = await productsApi.getProductBySlug(store.id, productSlug);
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

  return (
    <Stack spacing={3}>
      <Box>
        <Button startIcon={<ArrowBackOutlinedIcon />} sx={{ mb: 1 }} onClick={() => navigate(-1)}>
          Назад к товарам
        </Button>
        <Typography variant="body2" color="text.secondary">
          Полная информация о товаре
        </Typography>
      </Box>

      {detailsQuery.isLoading && (
        <Box
          sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress />
        </Box>
      )}

      {detailsQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => detailsQuery.refetch()}>
              Повторить
            </Button>
          }
        >
          {parseApiError(detailsQuery.error).message || 'Не удалось загрузить товар'}
        </Alert>
      )}

      {detailsQuery.data && <ProductDetails {...detailsQuery.data} />}
    </Stack>
  );
}
