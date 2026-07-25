import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { IconButton } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import type { ProductCategory } from '../../productCategories/model/types';
import type { ProductStatus, StoreOption } from '../model/types';
import { CategoryTreePicker } from '../../../shared/ui/CategoryTreePicker';
import { statusLabelMap, statusOptions } from '../lib/productConstants';
import type { CategoryPathItem } from '../lib/productForm';
import type {
  ProductAttribute,
  ProductAttributeOption,
} from '../../productAttributes/model/types';
import { ProductAttributeFilters } from '../../productAttributes/ui/ProductAttributeFilters';

type ProductsFiltersCardProps = {
  stores: StoreOption[];
  categories: ProductCategory[];
  selectedStoreID: string;
  search: string;
  status: ProductStatus | '';
  categoryID: string;
  categoryParentID: string | null;
  categoryPath: CategoryPathItem[];
  priceFrom: string;
  priceTo: string;
  storesLoading: boolean;
  categoriesLoading: boolean;
  activeFilterLabels: string[];
  hasActiveFilters: boolean;
  onStoreChange: (storeID: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (status: ProductStatus | '') => void;
  onCategoryChange: (categoryID: string) => void;
  onCategoryParentChange: (parentID: string | null) => void;
  onCategoryPathChange: (path: CategoryPathItem[]) => void;
  onCategoryClear: () => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onResetFilters: () => void;
  filterAttributes: ProductAttribute[];
  filterAttributeOptions: Record<string, ProductAttributeOption[]>;
  attributeFilterValues: Record<string, string>;
  onAttributeFilterChange: (attributeID: string, value: string) => void;
};

export function ProductsFiltersCard({
  stores,
  categories,
  selectedStoreID,
  search,
  status,
  categoryID,
  categoryParentID,
  categoryPath,
  priceFrom,
  priceTo,
  storesLoading,
  categoriesLoading,
  activeFilterLabels,
  hasActiveFilters,
  onStoreChange,
  onSearchChange,
  onSearchSubmit,
  onStatusChange,
  onCategoryChange,
  onCategoryParentChange,
  onCategoryPathChange,
  onCategoryClear,
  onPriceFromChange,
  onPriceToChange,
  onResetFilters,
  filterAttributes,
  filterAttributeOptions,
  attributeFilterValues,
  onAttributeFilterChange,
}: ProductsFiltersCardProps) {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Фильтры каталога</Typography>

            <Typography variant="body2" color="text.secondary">
              Сначала выберите магазин, затем уточните поиск по категории, статусу и цене.
            </Typography>
          </Box>

          {hasActiveFilters && (
            <Button
              size="small"
              variant="text"
              startIcon={<RestartAltIcon />}
              onClick={onResetFilters}
            >
              Сбросить
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Магазин"
              value={selectedStoreID}
              onChange={(event) => onStoreChange(event.target.value)}
              disabled={storesLoading}
              helperText="Категории зависят от выбранного магазина"
            >
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Поиск товара"
              placeholder="Название, slug или SKU"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSearchSubmit();
                }
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={onSearchSubmit}
                        sx={{
                          mr: 0.5,
                          color: 'primary.main',
                        }}
                      >
                        <SearchOutlinedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Статус"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as ProductStatus | '')}
            >
              <MenuItem value="">Все статусы</MenuItem>

              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {statusLabelMap[option]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Цена от"
              type="number"
              value={priceFrom}
              onChange={(event) => onPriceFromChange(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Цена до"
              type="number"
              value={priceTo}
              onChange={(event) => onPriceToChange(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CategoryTreePicker
              label="Категория"
              categories={categories}
              selectedCategoryID={categoryID}
              parentID={categoryParentID}
              path={categoryPath}
              loading={categoriesLoading}
              disabled={!selectedStoreID}
              emptyValueLabel="Все категории"
              onParentChange={onCategoryParentChange}
              onPathChange={onCategoryPathChange}
              onSelect={onCategoryChange}
              onClear={onCategoryClear}
            />
          </Grid>

          <ProductAttributeFilters
            attributes={filterAttributes}
            optionsByAttribute={filterAttributeOptions}
            values={attributeFilterValues}
            onChange={onAttributeFilterChange}
            alignWithCategory
          />

          {activeFilterLabels.length > 0 && (
            <Grid size={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activeFilterLabels.map((label) => (
                  <Chip key={label} size="small" label={label} variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
