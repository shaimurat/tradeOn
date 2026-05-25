import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { storesApi } from '../../features/stores/api/storesApi';

import type {
  SortOrder,
  Store,
  StoreSortBy,
  StoreStatus,
} from '../../features/stores/model/types';

type SellerStoreFilters = {
  search: string;
  status: StoreStatus | 'all';
  sort_by: StoreSortBy;
  sort_order: SortOrder;
};

const DEFAULT_FILTERS: SellerStoreFilters = {
  search: '',
  status: 'all',
  sort_by: 'created_at',
  sort_order: 'desc',
};

const statusLabel: Record<StoreStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
  moderation: 'Moderation',
};

const statusColor: Record<
  StoreStatus,
  'success' | 'default' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'default',
  blocked: 'error',
  moderation: 'warning',
};

export function SellerStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState<SellerStoreFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await storesApi.getSellerStores({
        search: filters.search || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        limit: 20,
        offset: 0,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      });

      setStores(response.stores);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить магазины');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <Box>
          <Typography variant="h2">Мои площадки</Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 0.25,
              color: 'text.secondary',
            }}
          >
            Управляйте своими магазинами, товарами и заказами на TradeOn.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            height: 40,
            px: 2,
          }}
        >
          Создать площадку
        </Button>
      </Stack>

      <SellerStoresFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {isLoading && (
        <Box
          sx={{
            minHeight: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!isLoading && error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && stores.length === 0 && (
        <SellerStoresEmptyState onResetFilters={handleResetFilters} />
      )}

      {!isLoading && !error && stores.length > 0 && (
        <Grid container spacing={2}>
          {stores.map((store) => (
            <Grid key={store.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <StoreCard store={store} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

type SellerStoresFiltersProps = {
  filters: SellerStoreFilters;
  onChange: React.Dispatch<React.SetStateAction<SellerStoreFilters>>;
  onReset: () => void;
};

function SellerStoresFilters({
  filters,
  onChange,
  onReset,
}: SellerStoresFiltersProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <FilterListIcon
              sx={{
                color: 'text.secondary',
                fontSize: 20,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontSize: 18,
              }}
            >
              Фильтры
            </Typography>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              label="Поиск"
              placeholder="Название, slug или описание"
              value={filters.search}
              onChange={(event) => {
                onChange((prev) => ({
                  ...prev,
                  search: event.target.value,
                }));
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 180,
                },
              }}
            >
              <InputLabel>Статус</InputLabel>

              <Select
                label="Статус"
                value={filters.status}
                onChange={(event) => {
                  onChange((prev) => ({
                    ...prev,
                    status: event.target.value as SellerStoreFilters['status'],
                  }));
                }}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="inactive">Неактивные</MenuItem>
                <MenuItem value="moderation">На модерации</MenuItem>
                <MenuItem value="blocked">Заблокированные</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 180,
                },
              }}
            >
              <InputLabel>Сортировка</InputLabel>

              <Select
                label="Сортировка"
                value={filters.sort_by}
                onChange={(event) => {
                  onChange((prev) => ({
                    ...prev,
                    sort_by: event.target.value as SellerStoreFilters['sort_by'],
                  }));
                }}
              >
                <MenuItem value="created_at">По дате</MenuItem>
                <MenuItem value="name">По названию</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 170,
                },
              }}
            >
              <InputLabel>Порядок</InputLabel>

              <Select
                label="Порядок"
                value={filters.sort_order}
                onChange={(event) => {
                  onChange((prev) => ({
                    ...prev,
                    sort_order: event.target
                      .value as SellerStoreFilters['sort_order'],
                  }));
                }}
              >
                <MenuItem value="desc">Сначала новые</MenuItem>
                <MenuItem value="asc">Сначала старые</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 120,
                },
              }}
              onClick={onReset}
            >
              Сбросить
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type SellerStoresEmptyStateProps = {
  onResetFilters: () => void;
};

function SellerStoresEmptyState({
  onResetFilters,
}: SellerStoresEmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          spacing={1.5}
          sx={{
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}
        >
          <StorefrontOutlinedIcon
            sx={{
              fontSize: 44,
              color: 'text.secondary',
            }}
          />

          <Typography variant="h3">Площадок пока нет</Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              maxWidth: 420,
            }}
          >
            Создайте первую площадку или сбросьте фильтры, если магазины не
            отображаются по текущим параметрам.
          </Typography>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <Button variant="contained" startIcon={<AddIcon />}>
              Создать площадку
            </Button>

            <Button variant="outlined" onClick={onResetFilters}>
              Сбросить фильтры
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type StoreCardProps = {
  store: Store;
};

function StoreCard({ store }: StoreCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',

        '&:hover': {
          borderColor: 'text.primary',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <CardActionArea
        sx={{
          height: '100%',
          alignItems: 'stretch',
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            p: 2.5,
          }}
        >
          <Stack spacing={2.25} sx={{ height: '100%' }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'flex-start',
              }}
            >
              <Avatar
                src={store.logo_url ?? undefined}
                variant="rounded"
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {store.name[0]?.toUpperCase() ?? (
                  <StorefrontOutlinedIcon fontSize="small" />
                )}
              </Avatar>

              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="h3"
                  noWrap
                  sx={{
                    mb: 0.25,
                  }}
                >
                  {store.name}
                </Typography>

                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  /{store.slug}
                </Typography>
              </Box>

              <Chip
                label={statusLabel[store.status]}
                color={statusColor[store.status]}
                variant="outlined"
                size="small"
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 38,
              }}
            >
              {store.description || 'Описание не указано'}
            </Typography>

            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 'auto',
                pt: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {store.email ?? 'Email не указан'}
                </Typography>

                {store.phone && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                    }}
                  >
                    {store.phone}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  bgcolor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 17 }} />
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}