import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { User } from '../../users/model/types';
import type { SortOrder, StoreSortBy, StoreStatus } from '../model/types';

export type StoreFiltersValue = {
  search: string;
  seller_id: string;
  status: StoreStatus | 'all';
  sort_by: StoreSortBy;
  sort_order: SortOrder;
};

type StoreFiltersCardProps = {
  filters: StoreFiltersValue;
  sellers?: User[];
  isSellersLoading?: boolean;
  showSellerFilter?: boolean;
  breakpoint?: 'md' | 'lg';
  onChange: (key: keyof StoreFiltersValue, value: StoreFiltersValue[keyof StoreFiltersValue]) => void;
  onReset: () => void;
};

export function StoreFiltersCard({
  filters,
  sellers = [],
  isSellersLoading = false,
  showSellerFilter = false,
  breakpoint = 'md',
  onChange,
  onReset,
}: StoreFiltersCardProps) {
  const minWidthKey = breakpoint;

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
              [breakpoint]: 'row',
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

            {showSellerFilter && (
              <Autocomplete
                size="small"
                options={sellers}
                loading={isSellersLoading}
                value={sellers.find((seller) => seller.id === filters.seller_id) ?? null}
                getOptionLabel={(seller) => `${seller.username} - ${seller.email}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, seller) => {
                  onChange('seller_id', seller?.id ?? '');
                }}
                sx={{
                  minWidth: {
                    xs: '100%',
                    [minWidthKey]: 280,
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
            )}

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  [minWidthKey]: 180,
                },
              }}
            >
              <InputLabel>Статус</InputLabel>

              <Select
                label="Статус"
                value={filters.status}
                onChange={(event) => {
                  onChange('status', event.target.value as StoreFiltersValue['status']);
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
                  [minWidthKey]: 180,
                },
              }}
            >
              <InputLabel>Сортировка</InputLabel>

              <Select
                label="Сортировка"
                value={filters.sort_by}
                onChange={(event) => {
                  onChange('sort_by', event.target.value as StoreFiltersValue['sort_by']);
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
                  [minWidthKey]: 170,
                },
              }}
            >
              <InputLabel>Порядок</InputLabel>

              <Select
                label="Порядок"
                value={filters.sort_order}
                onChange={(event) => {
                  onChange('sort_order', event.target.value as StoreFiltersValue['sort_order']);
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
                  [minWidthKey]: 120,
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