import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { productAttributesApi } from '../../features/productAttributes/api/productAttributesApi';
import type {
  ProductAttribute,
  ProductAttributeOption,
} from '../../features/productAttributes/model/types';
import {
  ProductAttributeDialog,
  type ProductAttributeForm,
} from '../../features/productAttributes/ui/ProductAttributeDialog';
import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { ProductCategory } from '../../features/productCategories/model/types';
import { storesApi } from '../../features/stores/api/storesApi';
import type { StoreOption } from '../../features/products/model/types';
import { parseApiError } from '../../shared/api/error';
import { useNotification } from '../../shared/lib/useNotification';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';
import { PageHeader } from '../../shared/ui/PageHeader';

const emptyForm: ProductAttributeForm = {
  category_id: '',
  name: '',
  code: '',
  type: 'text',
  unit: '',
  is_required: false,
  is_filter: false,
  options: [],
};

export function ProductAttributesPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeID, setStoreID] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [optionsByAttribute, setOptionsByAttribute] = useState<
    Record<string, ProductAttributeOption[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAttribute | null>(null);
  const [deleting, setDeleting] = useState<ProductAttribute | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  useEffect(() => {
    storesApi
      .getMyStores({ limit: 100 })
      .then((data) => {
        setStores(data.stores);
        setStoreID((current) => current || data.stores[0]?.id || '');
      })
      .catch((error) => showErrorNotification(parseApiError(error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (!storeID) {
      setCategories([]);
      setAttributes([]);
      return;
    }
    setLoading(true);
    try {
      const [categoryData, attributeData] = await Promise.all([
        productCategoriesApi.list({ store_id: storeID }),
        productAttributesApi.list(storeID),
      ]);
      setCategories(categoryData.product_categories);
      setAttributes(attributeData.product_attributes);
      const selectAttributes = attributeData.product_attributes.filter(
        (attribute) => attribute.type === 'select'
      );
      const optionEntries = await Promise.all(
        selectAttributes.map(async (attribute) => [
          attribute.id,
          await productAttributesApi.listOptions(attribute.id),
        ] as const)
      );
      setOptionsByAttribute(Object.fromEntries(optionEntries));
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeID]);

  const openEdit = (attribute: ProductAttribute) => {
    setEditing(attribute);
    setForm({
      category_id: attribute.category_id ?? '',
      name: attribute.name,
      code: attribute.code,
      type: attribute.type,
      unit: attribute.unit ?? '',
      is_required: attribute.is_required,
      is_filter: attribute.is_filter,
      options: (optionsByAttribute[attribute.id] ?? []).map((option) => option.value),
    });
    setDialogOpen(true);
  };

  const saveOptions = async (attributeID: string, values: string[]) => {
    const existing = optionsByAttribute[attributeID] ?? [];
    const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
    const nextValueSet = new Set(normalizedValues);
    await Promise.all(
      existing
        .filter((option) => !nextValueSet.has(option.value))
        .map((option) => productAttributesApi.deleteOption(attributeID, option.id))
    );
    await Promise.all(
      normalizedValues.map((value, position) => {
        const current = existing.find((option) => option.value === value);
        return current
          ? productAttributesApi.updateOption(attributeID, current.id, { position })
          : productAttributesApi.createOption(attributeID, { value, position });
      })
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attribute = editing
        ? await productAttributesApi.update(editing.id, {
            name: form.name.trim(),
            code: form.code.trim(),
            type: form.type,
            unit: form.unit.trim() || undefined,
            is_required: form.is_required,
            is_filter: form.is_filter,
          })
        : await productAttributesApi.create({
            store_id: storeID,
            category_id: form.category_id || undefined,
            name: form.name.trim(),
            code: form.code.trim(),
            type: form.type,
            unit: form.unit.trim() || undefined,
            is_required: form.is_required,
            is_filter: form.is_filter,
          });
      if (form.type === 'select') {
        await saveOptions(attribute.id, form.options);
      }
      showSuccessNotification(editing ? 'Атрибут обновлён' : 'Атрибут создан');
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = useMemo(() => {
    const result = new Map<string, ProductAttribute[]>();
    attributes.forEach((attribute) => {
      const key = attribute.category_id ?? '';
      result.set(key, [...(result.get(key) ?? []), attribute]);
    });
    return [...result.entries()];
  }, [attributes]);

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          title="Атрибуты товаров"
          description="Настройте характеристики магазина для всех товаров или отдельных категорий."
          actionLabel="Добавить атрибут"
          onAction={() => {
            setEditing(null);
            setForm(emptyForm);
            setDialogOpen(true);
          }}
        />
        <TextField
          select
          label="Магазин"
          value={storeID}
          onChange={(event) => setStoreID(event.target.value)}
          sx={{ maxWidth: 420 }}
        >
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.name}
            </MenuItem>
          ))}
        </TextField>
        {loading ? (
          <CircularProgress />
        ) : grouped.length === 0 ? (
          <Alert severity="info">Для этого магазина атрибуты ещё не настроены.</Alert>
        ) : (
          grouped.map(([categoryID, items]) => (
            <Card key={categoryID || 'all'} variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {categoryID ? categoryName[categoryID] ?? 'Категория' : 'Все категории'}
                </Typography>
                <Stack spacing={1}>
                  {items.map((attribute) => (
                    <Stack
                      key={attribute.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      sx={{ alignItems: { sm: 'center' }, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}
                    >
                      <Stack sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>{attribute.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {attribute.code} · {attribute.type}
                          {attribute.unit ? ` · ${attribute.unit}` : ''}
                        </Typography>
                      </Stack>
                      {attribute.is_required && <Chip size="small" label="Обязательный" />}
                      {attribute.is_filter && <Chip size="small" label="Фильтр" />}
                      <IconButton aria-label={`Изменить ${attribute.name}`} onClick={() => openEdit(attribute)}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton color="error" aria-label={`Удалить ${attribute.name}`} onClick={() => setDeleting(attribute)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
      <ProductAttributeDialog
        open={dialogOpen}
        editing={Boolean(editing)}
        form={form}
        categories={categories}
        submitting={submitting}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onClose={() => !submitting && setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Удалить атрибут?"
        description={`Атрибут «${deleting?.name ?? ''}» и его значения у товаров будут удалены.`}
        confirmText="Удалить"
        loading={submitting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          setSubmitting(true);
          try {
            await productAttributesApi.delete(deleting.id);
            setDeleting(null);
            showSuccessNotification('Атрибут удалён');
            await load();
          } catch (error) {
            showErrorNotification(parseApiError(error).message);
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <NotificationSnackbar notification={notification} onClose={closeNotification} />
    </>
  );
}
