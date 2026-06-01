import {
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import type { StoreOption } from '../../products/model/types';

type ProductCategoriesFiltersCardProps = {
  stores: StoreOption[];
  selectedStoreID: string;
  search: string;
  storesLoading: boolean;
  categoriesLoading: boolean;
  onStoreChange: (storeID: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
};

export function ProductCategoriesFiltersCard({
  stores,
  selectedStoreID,
  search,
  storesLoading,
  categoriesLoading,
  onStoreChange,
  onSearchChange,
  onRefresh,
}: ProductCategoriesFiltersCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: 'stretch',
              md: 'center',
            },
          }}
        >
          <TextField
            select
            label="Магазин"
            value={selectedStoreID}
            onChange={(event) => onStoreChange(event.target.value)}
            size="small"
            disabled={storesLoading}
            sx={{
              minWidth: {
                xs: '100%',
                md: 280,
              },
            }}
          >
            {stores.length === 0 && (
              <MenuItem value="" disabled>
                Нет магазинов
              </MenuItem>
            )}

            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Поиск категорий"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            disabled={storesLoading || categoriesLoading}
            onClick={onRefresh}
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            Обновить
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
