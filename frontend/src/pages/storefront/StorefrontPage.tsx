import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { CategoryPathItem } from '../../features/products/lib/productForm';
import { productsApi } from '../../features/products/api/productsApi';
import type { Product } from '../../features/products/model/types';
import { StorefrontProductCard } from '../../features/products/ui/StorefrontProductCard';
import { storesApi } from '../../features/stores/api/storesApi';
import { isTwoGisUrl } from '../../features/stores/lib/twoGis';
import { parseApiError } from '../../shared/lib/apiError';
import { buildWhatsAppUrl } from '../../shared/lib/whatsapp';
import { CategoryTreePicker } from '../../shared/ui/CategoryTreePicker';
import { StorefrontHeader } from '../../widgets/storefront/StorefrontHeader';
import { productAttributesApi } from '../../features/productAttributes/api/productAttributesApi';
import { ProductAttributeFilters } from '../../features/productAttributes/ui/ProductAttributeFilters';

const PAGE_SIZE = 12;

type SavedStorefrontFilters = {
  searchDraft?: string;
  search?: string;
  categoryID?: string;
  categoryParentID?: string | null;
  categoryPath?: CategoryPathItem[];
  priceFromDraft?: string;
  priceToDraft?: string;
  priceFrom?: string;
  priceTo?: string;
  attributeFilterValues?: Record<string, string>;
  page?: number;
};

function loadStorefrontFilters(storeSlug: string): SavedStorefrontFilters {
  try {
    return JSON.parse(
      sessionStorage.getItem(`tradeon:storefront-filters:${storeSlug}`) ?? '{}'
    );
  } catch {
    return {};
  }
}

export function StorefrontPage() {
  const navigate = useNavigate();
  const { storeSlug = '' } = useParams();
  const savedFilters = useMemo(() => loadStorefrontFilters(storeSlug), [storeSlug]);
  const [searchDraft, setSearchDraft] = useState(savedFilters.searchDraft ?? '');
  const [search, setSearch] = useState(savedFilters.search ?? '');
  const [categoryID, setCategoryID] = useState(savedFilters.categoryID ?? '');
  const [categoryParentID, setCategoryParentID] = useState<string | null>(
    savedFilters.categoryParentID ?? null
  );
  const [categoryPath, setCategoryPath] = useState<CategoryPathItem[]>(
    savedFilters.categoryPath ?? []
  );
  const [priceFromDraft, setPriceFromDraft] = useState(savedFilters.priceFromDraft ?? '');
  const [priceToDraft, setPriceToDraft] = useState(savedFilters.priceToDraft ?? '');
  const [priceFrom, setPriceFrom] = useState(savedFilters.priceFrom ?? '');
  const [priceTo, setPriceTo] = useState(savedFilters.priceTo ?? '');
  const [priceError, setPriceError] = useState('');
  const [attributeFilterValues, setAttributeFilterValues] = useState<Record<string, string>>(
    savedFilters.attributeFilterValues ?? {}
  );
  const [page, setPage] = useState(savedFilters.page ?? 1);

  const storeQuery = useQuery({
    queryKey: ['public-store', storeSlug],
    queryFn: () => storesApi.getStoreBySlug(storeSlug),
    enabled: Boolean(storeSlug),
  });

  const store = storeQuery.data;
  const isAvailable = store?.status === 'active';

  const categoriesQuery = useQuery({
    queryKey: ['public-store-categories', store?.id],
    queryFn: () => productCategoriesApi.list({ store_id: store?.id }),
    enabled: Boolean(store?.id && isAvailable),
  });

  const attributeFiltersQuery = useQuery({
    queryKey: ['public-product-attribute-filters', store?.id, categoryID],
    queryFn: async () => {
      const data = await productAttributesApi.list(store?.id ?? '');
      const attributes = data.product_attributes.filter(
        (attribute) =>
          attribute.is_filter &&
          (!attribute.category_id ||
            (Boolean(categoryID) && attribute.category_id === categoryID))
      );
      const optionEntries = await Promise.all(
        attributes
          .filter((attribute) => attribute.type === 'select')
          .map(async (attribute) => [
            attribute.id,
            await productAttributesApi.listOptions(attribute.id),
          ] as const)
      );
      return {
        attributes,
        optionsByAttribute: Object.fromEntries(optionEntries),
      };
    },
    enabled: Boolean(store?.id && isAvailable),
  });

  useEffect(() => {
    const availableIDs = new Set(
      (attributeFiltersQuery.data?.attributes ?? []).map((attribute) => attribute.id)
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttributeFilterValues((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => availableIDs.has(id)))
    );
  }, [attributeFiltersQuery.data]);

  const productsQuery = useQuery({
    queryKey: [
      'public-store-products',
      store?.id,
      search,
      categoryID,
      priceFrom,
      priceTo,
      attributeFilterValues,
      page,
    ],
    queryFn: () =>
      productsApi.getProducts({
        store_id: store?.id,
        status: 'active',
        search: search || undefined,
        category_id: categoryID || undefined,
        price_from: priceFrom ? Number(priceFrom) : undefined,
        price_to: priceTo ? Number(priceTo) : undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        attribute_filters: Object.fromEntries(
          Object.entries(attributeFilterValues).filter(([, value]) => value !== '')
        ),
      }),
    enabled: Boolean(store?.id && isAvailable),
    placeholderData: keepPreviousData,
  });

  const categories = useMemo(
    () => (categoriesQuery.data?.product_categories ?? []).filter((category) => category.is_active),
    [categoriesQuery.data]
  );
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.count ?? 0) / PAGE_SIZE));

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeoutID);
  }, [searchDraft]);

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      const from = priceFromDraft ? Number(priceFromDraft) : undefined;
      const to = priceToDraft ? Number(priceToDraft) : undefined;

      if ((from !== undefined && from < 0) || (to !== undefined && to < 0)) {
        setPriceError('Цена не может быть отрицательной');
        return;
      }
      if (from !== undefined && to !== undefined && from > to) {
        setPriceError('Цена «от» не может быть больше цены «до»');
        return;
      }

      setPriceError('');
      setPriceFrom(priceFromDraft);
      setPriceTo(priceToDraft);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeoutID);
  }, [priceFromDraft, priceToDraft]);

  useEffect(() => {
    if (!storeSlug) return;
    sessionStorage.setItem(
      `tradeon:storefront-filters:${storeSlug}`,
      JSON.stringify({
        searchDraft,
        search,
        categoryID,
        categoryParentID,
        categoryPath,
        priceFromDraft,
        priceToDraft,
        priceFrom,
        priceTo,
        attributeFilterValues,
        page,
      } satisfies SavedStorefrontFilters)
    );
  }, [
    storeSlug,
    searchDraft,
    search,
    categoryID,
    categoryParentID,
    categoryPath,
    priceFromDraft,
    priceToDraft,
    priceFrom,
    priceTo,
    attributeFilterValues,
    page,
  ]);

  const resetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setCategoryID('');
    setCategoryParentID(null);
    setCategoryPath([]);
    setPriceFromDraft('');
    setPriceToDraft('');
    setPriceFrom('');
    setPriceTo('');
    setPriceError('');
    setAttributeFilterValues({});
    setPage(1);
  };

  const openProduct = (product: Product) => {
    navigate(`/shop/${encodeURIComponent(storeSlug)}/${encodeURIComponent(product.slug)}`);
  };

  if (storeQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (storeQuery.isError || !store) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">
          {parseApiError(storeQuery.error, 'Магазин не найден').message}
        </Alert>
      </Container>
    );
  }

  if (!isAvailable) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <StorefrontHeader store={store} />
        <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
          <StorefrontOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h2">Магазин временно недоступен</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Попробуйте зайти позже или свяжитесь с магазином.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StorefrontHeader store={store} />

      <Box component="main">
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 320, md: 400 },
            display: 'flex',
            alignItems: 'flex-end',
            color: 'common.white',
            bgcolor: 'primary.main',
            backgroundImage: store.banner_url
              ? `linear-gradient(90deg, rgba(0,0,0,.78), rgba(0,0,0,.28)), url("${store.banner_url}")`
              : 'linear-gradient(135deg, #111 0%, #3f3f46 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.5 }}>
                Добро пожаловать
              </Typography>
              <Typography variant="h1" sx={{ mt: 0.5, fontSize: { xs: '2.25rem', md: '3.5rem' } }}>
                {store.name}
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 620,
                  fontSize: { xs: 15, md: 17 },
                  color: 'rgba(255,255,255,.82)',
                }}
              >
                {store.description || 'Товары магазина с актуальными ценами и подробным описанием.'}
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={4}>
            <Box component="section" aria-labelledby="catalog-title">
              <Typography id="catalog-title" variant="h2" sx={{ mb: 3 }}>
                Каталог товаров
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      md: 'minmax(220px, 1.2fr) minmax(240px, 1.3fr) minmax(130px, 0.65fr) minmax(130px, 0.65fr)',
                    },
                    columnGap: 2,
                    rowGap: 2,
                    alignItems: 'end',
                  }}
                >
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Поиск"
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Название товара"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchOutlinedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                    <CategoryTreePicker
                      label="Категория"
                      categories={categories}
                      selectedCategoryID={categoryID}
                      parentID={categoryParentID}
                      path={categoryPath}
                      loading={categoriesQuery.isLoading}
                      emptyValueLabel="Все категории"
                      onParentChange={setCategoryParentID}
                      onPathChange={setCategoryPath}
                      onSelect={(value) => {
                        setCategoryID(value);
                        setPage(1);
                      }}
                      onClear={() => {
                        setCategoryID('');
                        setCategoryParentID(null);
                        setCategoryPath([]);
                        setPage(1);
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Цена от"
                      type="number"
                      value={priceFromDraft}
                      error={Boolean(priceError)}
                      onChange={(event) => {
                        setPriceFromDraft(event.target.value);
                        setPriceError('');
                      }}
                      slotProps={{
                        htmlInput: { min: 0 },
                        input: {
                          startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Цена до"
                      type="number"
                      value={priceToDraft}
                      error={Boolean(priceError)}
                      onChange={(event) => {
                        setPriceToDraft(event.target.value);
                        setPriceError('');
                      }}
                      slotProps={{
                        htmlInput: { min: 0 },
                        input: {
                          startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                        },
                      }}
                    />
                  </Box>

                  <ProductAttributeFilters
                    attributes={attributeFiltersQuery.data?.attributes ?? []}
                    optionsByAttribute={attributeFiltersQuery.data?.optionsByAttribute ?? {}}
                    values={attributeFilterValues}
                    onChange={(attributeID, value) => {
                      setAttributeFilterValues((current) => ({
                        ...current,
                        [attributeID]: value,
                      }));
                      setPage(1);
                    }}
                  />
                </Box>

                {(categoryPath.length > 1 ||
                  priceError ||
                  search ||
                  categoryID ||
                  priceFrom ||
                  priceTo ||
                  Object.values(attributeFilterValues).some(Boolean)) && (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{
                      mt: 1,
                      alignItems: { sm: 'flex-start' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack spacing={0.5}>
                      {categoryPath.length > 1 && (
                        <Typography variant="caption" color="text.secondary">
                          Путь: {categoryPath.map((item) => item.name).join(' → ')}
                        </Typography>
                      )}
                      {priceError && (
                        <Typography variant="caption" color="error">
                          {priceError}
                        </Typography>
                      )}
                    </Stack>
                    {(search ||
                      categoryID ||
                      priceFrom ||
                      priceTo ||
                      Object.values(attributeFilterValues).some(Boolean)) && (
                      <Button
                        size="small"
                        startIcon={<RestartAltOutlinedIcon />}
                        onClick={resetFilters}
                        sx={{ flexShrink: 0 }}
                      >
                        Сбросить всё
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>

              {productsQuery.isLoading ? (
                <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : productsQuery.isError ? (
                <Alert severity="error">
                  Не удалось загрузить товары. Попробуйте обновить страницу.
                </Alert>
              ) : productsQuery.data?.products.length ? (
                <Grid container spacing={2}>
                  {productsQuery.data.products.map((product) => (
                    <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <StorefrontProductCard
                        product={product}
                        categoryName={categoryNames.get(product.category_id)}
                        onSelect={openProduct}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper variant="outlined" sx={{ py: 8, px: 2, textAlign: 'center' }}>
                  <StorefrontOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="h3">Товары не найдены</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Измените запрос или выберите другую категорию.
                  </Typography>
                </Paper>
              )}

              {totalPages > 1 && (
                <Stack sx={{ alignItems: 'center', mt: 4 }}>
                  <Pagination
                    page={page}
                    count={totalPages}
                    onChange={(_, value) => {
                      setPage(value);
                      window.scrollTo({ top: 420, behavior: 'smooth' });
                    }}
                  />
                </Stack>
              )}
            </Box>
            {store.address && isTwoGisUrl(store.address) && (
              <Paper
                component="section"
                variant="outlined"
                aria-labelledby="store-location-title"
                sx={{ p: { xs: 2.5, sm: 3 } }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 2,
                        bgcolor: 'secondary.main',
                      }}
                    >
                      <LocationOnOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography id="store-location-title" variant="h3">
                        Где находится магазин
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        Посмотрите адрес и постройте маршрут в 2ГИС
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    component="a"
                    href={store.address}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    endIcon={<OpenInNewOutlinedIcon />}
                    sx={{ flexShrink: 0 }}
                  >
                    Открыть в 2ГИС
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          mt: { xs: 4, md: 7 },
          color: 'text.primary',
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F3F6FA 52%, #EEF2F7 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: 3 }}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar
                  src={store.logo_url ?? undefined}
                  alt={store.name}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, .1)',
                  }}
                >
                  <StorefrontOutlinedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3">{store.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Официальный магазин
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ mt: 2, maxWidth: 520, color: 'text.secondary', lineHeight: 1.7 }}>
                {store.description || 'Информация о магазине пока не добавлена.'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Контакты
              </Typography>
              <Stack spacing={1.5}>
                {store.phone && (
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                    <Typography
                      component="a"
                      href={`tel:${store.phone}`}
                      sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {store.phone}
                    </Typography>
                  </Stack>
                )}
                {store.email && (
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <EmailOutlinedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                    <Typography
                      component="a"
                      href={`mailto:${store.email}`}
                      sx={{ color: 'inherit', textDecoration: 'none', overflowWrap: 'anywhere' }}
                    >
                      {store.email}
                    </Typography>
                  </Stack>
                )}
                {store.address && (
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                    <LocationOnOutlinedIcon
                      sx={{ mt: 0.15, fontSize: 19, color: 'text.secondary' }}
                    />
                    {isTwoGisUrl(store.address) ? (
                      <Typography
                        component="a"
                        href={store.address}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'inherit' }}
                      >
                        Посмотреть адрес в 2ГИС
                      </Typography>
                    ) : (
                      <Typography>{store.address}</Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Покупателям
              </Typography>
              <Stack spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <Button component="a" href="#catalog-title" color="inherit" sx={{ px: 0 }}>
                  Каталог товаров
                </Button>
                {store.phone && (
                  <Button
                    component="a"
                    href={buildWhatsAppUrl(
                      store.phone,
                      `Здравствуйте! Хочу уточнить информацию о товарах магазина «${store.name}».`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    startIcon={<WhatsAppIcon />}
                    sx={{ px: 0 }}
                  >
                    Написать в WhatsApp
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} {store.name}. Информация о товарах и ценах предоставлена
            магазином.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
