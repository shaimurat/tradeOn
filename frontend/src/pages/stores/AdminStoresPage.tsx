import { useEffect, useMemo, useState } from 'react';

import { usersApi } from '../../features/users/api/userApi';

import type { User } from '../../features/users/model/types';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { storesApi } from '../../features/stores/api/storesApi';

import type { SortOrder, Store, StoreSortBy, StoreStatus } from '../../features/stores/model/types';

type AdminStoreFilters = {
  search: string;
  seller_id: string;
  status: StoreStatus | 'all';
  sort_by: StoreSortBy;
  sort_order: SortOrder;
};

const DEFAULT_FILTERS: AdminStoreFilters = {
  search: '',
  seller_id: '',
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

const statusColor: Record<StoreStatus, 'success' | 'default' | 'error' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  blocked: 'error',
  moderation: 'warning',
};

export function AdminStoresPage() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [isSellersLoading, setIsSellersLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState<AdminStoreFilters>(DEFAULT_FILTERS);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSellers = async () => {
    try {
      setIsSellersLoading(true);

      const response = await usersApi.getUsers({
        role: 'seller',
      });

      setSellers(response.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSellersLoading(false);
    }
  };
  const loadStores = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await storesApi.getStores({
        search: filters.search || undefined,
        seller_id: filters.seller_id || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        offset: page * limit,
        limit,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      });

      setStores(response.stores);
      setTotalCount(response.count);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить магазины');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSellers();
  }, []);
  useEffect(() => {
    void loadStores();
  }, [filters, page, limit]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handleFilterChange = <K extends keyof AdminStoreFilters>(
    key: K,
    value: AdminStoreFilters[K]
  ) => {
    setPage(0);

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
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
          <Typography variant="h2">Магазины</Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 0.25,
              color: 'text.secondary',
            }}
          >
            Управление магазинами продавцов, статусами и модерацией.
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
          Создать магазин
        </Button>
      </Stack>

      <AdminStoresFilters
        sellers={sellers}
        isSellersLoading={isSellersLoading}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading && (
        <Box
          sx={{
            minHeight: 260,
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

      {!isLoading && !error && (
        <AdminStoresTable
          stores={stores}
          sellers={sellers}
          page={page}
          limit={limit}
          totalCount={totalCount}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(0);
          }}
        />
      )}
    </Stack>
  );
}

type AdminStoresFiltersProps = {
  sellers: User[];
  isSellersLoading: boolean;
  filters: AdminStoreFilters;
  onChange: <K extends keyof AdminStoreFilters>(key: K, value: AdminStoreFilters[K]) => void;
  onReset: () => void;
};

function AdminStoresFilters({
  sellers,
  isSellersLoading,
  filters,
  onChange,
  onReset,
}: AdminStoresFiltersProps) {
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
              lg: 'row',
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
                onChange('search', event.target.value);
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

            <Autocomplete
              size="small"
              options={sellers}
              loading={isSellersLoading}
              value={sellers.find((seller) => seller.id === filters.seller_id) ?? null}
              getOptionLabel={(seller) => {
                return `${seller.username} - ${seller.email}`;
              }}
              isOptionEqualToValue={(option, value) => {
                return option.id === value.id;
              }}
              onChange={(_, seller) => {
                onChange('seller_id', seller?.id ?? '');
              }}
              sx={{
                minWidth: {
                  xs: '100%',
                  lg: 280,
                },
              }}
              renderOption={(props, seller) => (
                <Box component="li" {...props} key={seller.id}>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {seller.username}
                    </Typography>

                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {seller.email}
                    </Typography>
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Продавец" placeholder="Выберите продавца" />
              )}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  lg: 180,
                },
              }}
            >
              <InputLabel>Статус</InputLabel>

              <Select
                label="Статус"
                value={filters.status}
                onChange={(event) => {
                  onChange('status', event.target.value as AdminStoreFilters['status']);
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
                  lg: 180,
                },
              }}
            >
              <InputLabel>Сортировка</InputLabel>

              <Select
                label="Сортировка"
                value={filters.sort_by}
                onChange={(event) => {
                  onChange('sort_by', event.target.value as AdminStoreFilters['sort_by']);
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
                  lg: 170,
                },
              }}
            >
              <InputLabel>Порядок</InputLabel>

              <Select
                label="Порядок"
                value={filters.sort_order}
                onChange={(event) => {
                  onChange('sort_order', event.target.value as AdminStoreFilters['sort_order']);
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
                  lg: 120,
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

type AdminStoresTableProps = {
  stores: Store[];
  sellers: User[];
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

function AdminStoresTable({
  stores,
  sellers,
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}: AdminStoresTableProps) {
  const sellersById = useMemo(() => {
    return new Map(sellers.map((seller) => [seller.id, seller]));
  }, [sellers]);
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Магазин</TableCell>
              <TableCell>Продавец</TableCell>
              <TableCell>Контакты</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack
                    spacing={1}
                    sx={{
                      py: 5,
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <StorefrontOutlinedIcon
                      sx={{
                        fontSize: 42,
                        color: 'text.secondary',
                      }}
                    />

                    <Typography variant="h3">Магазины не найдены</Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      Попробуйте изменить параметры фильтрации.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {stores.map((store) => (
              <TableRow
                key={store.id}
                hover
                sx={{
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      src={store.logo_url ?? undefined}
                      variant="rounded"
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {store.name[0]?.toUpperCase() ?? <StorefrontOutlinedIcon fontSize="small" />}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                          maxWidth: 240,
                          fontWeight: 700,
                        }}
                      >
                        {store.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: 240,
                          color: 'text.secondary',
                        }}
                      >
                        /{store.slug}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 240 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {sellersById.get(store.seller_id)?.username ?? 'Email не найден'}
                    </Typography>

                  
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 220 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: store.email ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {store.email ?? 'Email не указан'}
                    </Typography>

                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                      }}
                    >
                      {store.phone ?? 'Телефон не указан'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statusLabel[store.status]}
                    color={statusColor[store.status]}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{formatDate(store.created_at)}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Посмотреть">
                    <IconButton size="small">
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Редактировать">
                    <IconButton size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="На странице"
        onPageChange={(_, nextPage) => {
          onPageChange(nextPage);
        }}
        onRowsPerPageChange={(event) => {
          onLimitChange(Number(event.target.value));
        }}
      />
    </Paper>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
