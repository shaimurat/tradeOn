import { useRef, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import Grid from '@mui/material/Grid';

import { cloudinaryApi } from '../../../shared/api/cloudinaryApi';
import { CategoryTreePicker } from '../../../shared/ui/CategoryTreePicker';
import { FormSection } from '../../../shared/ui/FormSection';

import type { ProductCategory } from '../../productCategories/model/types';
import type { Product, ProductStatus, StoreOption } from '../model/types';
import type { CategoryPathItem, ProductFormState } from '../lib/productForm';

import { statusLabelMap, statusOptions } from '../lib/productConstants';
import type {
  ProductAttribute,
  ProductAttributeOption,
} from '../../productAttributes/model/types';
import {
  ProductAttributeFields,
  type ProductAttributeFormValues,
} from '../../productAttributes/ui/ProductAttributeFields';

type ProductDialogProps = {
  open: boolean;
  editingProduct: Product | null;
  form: ProductFormState;
  stores: StoreOption[];
  categories: ProductCategory[];
  categoriesLoading: boolean;
  submitting: boolean;
  formCategoryParentID: string | null;
  formCategoryPath: CategoryPathItem[];
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (patch: Partial<ProductFormState>) => void;
  onStoreChange: (storeID: string) => Promise<void>;
  onCategoryParentChange: (parentID: string | null) => void;
  onCategoryPathChange: (path: CategoryPathItem[]) => void;
  onCategoryClear: () => void;
  onCreateCategory: (parentID: string | null) => void;
  attributes: ProductAttribute[];
  attributeOptions: Record<string, ProductAttributeOption[]>;
  attributeValues: ProductAttributeFormValues;
  attributesLoading: boolean;
  onAttributeChange: (attributeID: string, value: string | boolean) => void;
  onCreateAttribute: () => void;
};

export function ProductDialog({
  open,
  editingProduct,
  form,
  stores,
  categories,
  categoriesLoading,
  submitting,
  formCategoryParentID,
  formCategoryPath,
  onClose,
  onSubmit,
  onFormChange,
  onStoreChange,
  onCategoryParentChange,
  onCategoryPathChange,
  onCategoryClear,
  onCreateCategory,
  attributes,
  attributeOptions,
  attributeValues,
  attributesLoading,
  onAttributeChange,
  onCreateAttribute,
}: ProductDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleProductImageUpload = async (file: File) => {
    setImageUploading(true);
    setImageUploadError(null);

    try {
      const imageUrl = await cloudinaryApi.uploadProductImage(file);

      onFormChange({
        main_image_url: imageUrl,
      });
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : 'Не удалось загрузить изображение'
      );
    } finally {
      setImageUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Выберите файл изображения');
      return;
    }

    handleProductImageUpload(file);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
          {editingProduct ? 'Редактировать товар' : 'Создать товар'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Заполните обязательные поля: магазин, название, slug, категория и цена.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack>
          <FormSection
            title="Основная информация"
            description="Эти данные помогают пользователю найти товар в каталоге."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Магазин"
                  value={form.store_id}
                  onChange={(event) => onStoreChange(event.target.value)}
                  disabled={Boolean(editingProduct)}
                  required
                >
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Статус"
                  value={form.status}
                  onChange={(event) =>
                    onFormChange({
                      status: event.target.value as ProductStatus,
                    })
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {statusLabelMap[option]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Название товара"
                  placeholder="Например: iPhone 15 Pro 256GB"
                  value={form.name}
                  onChange={(event) =>
                    onFormChange({
                      name: event.target.value,
                    })
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Slug"
                  placeholder="iphone-15-pro-256gb"
                  value={form.slug}
                  onChange={(event) =>
                    onFormChange({
                      slug: event.target.value,
                    })
                  }
                  helperText="Используется в ссылке товара"
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                  label="Описание"
                  placeholder="Кратко опишите характеристики, комплектацию и особенности товара"
                  value={form.description}
                  onChange={(event) =>
                    onFormChange({
                      description: event.target.value,
                    })
                  }
                />
              </Grid>

              <Grid size={12}>
                <CategoryTreePicker
                  label="Категория товара"
                  helperText="Выберите существующую категорию или создайте новую"
                  categories={categories}
                  selectedCategoryID={form.category_id}
                  parentID={formCategoryParentID}
                  path={formCategoryPath}
                  loading={categoriesLoading}
                  disabled={!form.store_id}
                  emptyValueLabel="Выберите категорию"
                  allowClear={false}
                  onParentChange={onCategoryParentChange}
                  onPathChange={onCategoryPathChange}
                  onSelect={(categoryID) =>
                    onFormChange({
                      category_id: categoryID,
                    })
                  }
                  onClear={onCategoryClear}
                  onCreateCategory={onCreateCategory}
                />
              </Grid>
            </Grid>
          </FormSection>

          {form.store_id && form.category_id && (
            <FormSection
              title="Характеристики"
              description="Набор полей зависит от магазина и выбранной категории."
            >
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  onClick={onCreateAttribute}
                  disabled={submitting || attributesLoading}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Добавить новый атрибут
                </Button>
                <ProductAttributeFields
                  attributes={attributes}
                  optionsByAttribute={attributeOptions}
                  values={attributeValues}
                  loading={attributesLoading}
                  disabled={submitting}
                  onChange={onAttributeChange}
                />
              </Stack>
            </FormSection>
          )}

          <FormSection
            title="Цена и учет"
            description="Цена обязательна. Старая цена, SKU и ссылка поставщика нужны для учета товара."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Цена"
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    onFormChange({
                      price: event.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                    },
                  }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Старая цена"
                  type="number"
                  value={form.old_price}
                  onChange={(event) =>
                    onFormChange({
                      old_price: event.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                    },
                  }}
                  helperText="Можно оставить пустым"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="SKU"
                  placeholder="Артикул товара"
                  value={form.sku}
                  onChange={(event) =>
                    onFormChange({
                      sku: event.target.value,
                    })
                  }
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL поставщика"
                  placeholder="https://..."
                  value={form.supplier_url}
                  onChange={(event) =>
                    onFormChange({
                      supplier_url: event.target.value,
                    })
                  }
                  helperText="Внутренняя ссылка на товар у поставщика"
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            title="Медиа"
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={imageUploading || submitting}
                    >
                      {imageUploading ? 'Загрузка...' : 'Загрузить изображение'}

                      <input
                        ref={fileInputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                      />
                    </Button>

                    {form.main_image_url ? (
                      <Button
                        color="error"
                        variant="text"
                        disabled={imageUploading || submitting}
                        onClick={() =>
                          onFormChange({
                            main_image_url: '',
                          })
                        }
                      >
                        Удалить
                      </Button>
                    ) : null}
                  </Stack>

                  {imageUploadError ? (
                    <Typography variant="caption" color="error">
                      {imageUploadError}
                    </Typography>
                  ) : null}

                  {form.main_image_url ? (
                    <Box
                      component="img"
                      src={form.main_image_url}
                      alt={form.name || 'Изображение товара'}
                      sx={{
                        width: '100%',
                        maxHeight: 260,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    />
                  ) : null}
                </Stack>
              </Grid>
            </Grid>
          </FormSection>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button onClick={onClose} disabled={submitting || imageUploading}>
          Отмена
        </Button>

        <Button variant="contained" onClick={onSubmit} disabled={submitting || imageUploading}>
          {submitting ? 'Сохранение...' : editingProduct ? 'Сохранить изменения' : 'Создать товар'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
