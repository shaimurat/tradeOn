import { Card, Stack } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/model/authStore';
import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { ProductCategory } from '../../features/productCategories/model/types';
import { ProductCategoryDialog } from '../../features/productCategories/ui/ProductCategoryDialog';
import {
  buildCreateCategoryPayload,
  type ProductCategoryDialogMode,
  type ProductCategoryFormState,
} from '../../features/productCategories/lib/productCategoryForm';
import {
  buildCategoriesByParentID,
  flattenCategoryTree,
} from '../../features/productCategories/lib/productCategoryTree';
import { productsApi } from '../../features/products/api/productsApi';
import { storesApi } from '../../features/stores/api/storesApi';
import type { Product, ProductStatus, StoreOption } from '../../features/products/model/types';
import { PRODUCT_LIMIT, statusLabelMap } from '../../features/products/lib/productConstants';
import { formatPrice } from '../../features/products/lib/productFormatters';
import {
  buildCategoryNameMap,
  buildCreatePayload,
  buildPatchPayload,
  initialFormState,
  productToForm,
  type CategoryPathItem,
  type ProductFormState,
} from '../../features/products/lib/productForm';
import { ProductDialog } from '../../features/products/ui/ProductDialog';
import { ProductsFiltersCard } from '../../features/products/ui/ProductsFiltersCard';
import { ProductsListCard } from '../../features/products/ui/ProductsListCard';
import { ProductsPageHeader } from '../../features/products/ui/ProductsPageHeader';

import { parseApiError } from '../../shared/api/error';
import { useNotification } from '../../shared/lib/useNotification';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';
import { productAttributesApi } from '../../features/productAttributes/api/productAttributesApi';
import type {
  ProductAttribute,
  ProductAttributeOption,
  ProductAttributeValuePayload,
} from '../../features/productAttributes/model/types';
import type { ProductAttributeFormValues } from '../../features/productAttributes/ui/ProductAttributeFields';
import {
  ProductAttributeDialog,
  type ProductAttributeForm,
} from '../../features/productAttributes/ui/ProductAttributeDialog';

const initialCategoryFormState: ProductCategoryFormState = {
  name: '',
  description: '',
  parent_id: '',
};

const initialAttributeFormState: ProductAttributeForm = {
  category_id: '',
  name: '',
  code: '',
  type: 'text',
  unit: '',
  is_required: false,
  is_filter: false,
  options: [],
};

const PRODUCTS_FILTERS_STORAGE_KEY = 'tradeon:products-filters';

type SavedProductsFilters = {
  selectedStoreID?: string;
  searchDraft?: string;
  search?: string;
  status?: ProductStatus | '';
  categoryID?: string;
  filterCategoryParentID?: string | null;
  filterCategoryPath?: CategoryPathItem[];
  priceFrom?: string;
  priceTo?: string;
  attributeFilterValues?: Record<string, string>;
  page?: number;
};

function loadSavedProductsFilters(): SavedProductsFilters {
  try {
    return JSON.parse(sessionStorage.getItem(PRODUCTS_FILTERS_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function ProductsPage() {
  const savedFilters = useMemo(() => loadSavedProductsFilters(), []);
  const previousStoreID = useRef(savedFilters.selectedStoreID ?? '');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStoreSlug = searchParams.get('store') ?? '';
  const userRole = useAuthStore((state) => state.user?.role);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [selectedStoreID, setSelectedStoreID] = useState(savedFilters.selectedStoreID ?? '');
  const [searchDraft, setSearchDraft] = useState(savedFilters.searchDraft ?? '');
  const [search, setSearch] = useState(savedFilters.search ?? '');
  const [status, setStatus] = useState<ProductStatus | ''>(savedFilters.status ?? '');
  const [categoryID, setCategoryID] = useState(savedFilters.categoryID ?? '');
  const [filterCategoryParentID, setFilterCategoryParentID] = useState<string | null>(
    savedFilters.filterCategoryParentID ?? null
  );
  const [filterCategoryPath, setFilterCategoryPath] = useState<CategoryPathItem[]>(
    savedFilters.filterCategoryPath ?? []
  );
  const [formCategoryParentID, setFormCategoryParentID] = useState<string | null>(null);
  const [formCategoryPath, setFormCategoryPath] = useState<CategoryPathItem[]>([]);
  const [priceFrom, setPriceFrom] = useState(savedFilters.priceFrom ?? '');
  const [priceTo, setPriceTo] = useState(savedFilters.priceTo ?? '');
  const [filterAttributes, setFilterAttributes] = useState<ProductAttribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<
    Record<string, ProductAttributeOption[]>
  >({});
  const [attributeFilterValues, setAttributeFilterValues] = useState<Record<string, string>>(
    savedFilters.attributeFilterValues ?? {}
  );

  const [page, setPage] = useState(savedFilters.page ?? 1);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<
    Record<string, ProductAttributeOption[]>
  >({});
  const [attributeValues, setAttributeValues] = useState<ProductAttributeFormValues>({});
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false);
  const [attributeSubmitting, setAttributeSubmitting] = useState(false);
  const [attributeForm, setAttributeForm] = useState<ProductAttributeForm>(
    initialAttributeFormState
  );

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<ProductCategoryDialogMode>('create');
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<ProductCategoryFormState>(initialCategoryFormState);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const selectedDialogStore = useMemo(() => {
    return stores.find((store) => store.id === form.store_id);
  }, [stores, form.store_id]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(count / PRODUCT_LIMIT));
  }, [count]);

  const categoryNameByID = useMemo(() => {
    return buildCategoryNameMap(categories);
  }, [categories]);

  const categoriesByParentID = useMemo(() => {
    return buildCategoriesByParentID(categories);
  }, [categories]);

  const categoryParentOptions = useMemo(() => {
    return flattenCategoryTree(categoriesByParentID);
  }, [categoriesByParentID]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      status ||
      categoryID ||
      priceFrom ||
      priceTo ||
      Object.values(attributeFilterValues).some(Boolean)
  );

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (search.trim()) {
      labels.push(`Поиск: ${search.trim()}`);
    }

    if (status) {
      labels.push(`Статус: ${statusLabelMap[status]}`);
    }

    if (categoryID) {
      labels.push(`Категория: ${categoryNameByID[categoryID] || 'Выбрана'}`);
    }

    if (priceFrom) {
      labels.push(`От ₸${formatPrice(Number(priceFrom))}`);
    }

    if (priceTo) {
      labels.push(`До ₸${formatPrice(Number(priceTo))}`);
    }

    return labels;
  }, [categoryID, categoryNameByID, priceFrom, priceTo, search, status]);

  const updateForm = (patch: Partial<ProductFormState>) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const updateCategoryForm = (patch: Partial<ProductCategoryFormState>) => {
    setCategoryForm((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const resetFilterCategoryState = () => {
    setCategoryID('');
    setFilterCategoryParentID(null);
    setFilterCategoryPath([]);
  };

  const resetFormCategoryState = () => {
    setFormCategoryParentID(null);
    setFormCategoryPath([]);
  };

  const fetchCategories = async (storeID?: string) => {
    try {
      setCategoriesLoading(true);

      const data = await productCategoriesApi.list({
        store_id: storeID || undefined,
      });

      setCategories(data.product_categories);
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setStoresLoading(true);

      const data = await storesApi.getMyStores({
        limit: 100,
      });
      let availableStores = data.stores;

      if (
        userRole === 'admin' &&
        requestedStoreSlug &&
        !availableStores.some((store) => store.slug === requestedStoreSlug)
      ) {
        const requestedStore = await storesApi.getStoreBySlug(requestedStoreSlug);
        availableStores = [requestedStore, ...availableStores];
      }

      setStores(availableStores);

      if (!selectedStoreID && availableStores.length > 0) {
        const requestedStore = availableStores.find((store) => store.slug === requestedStoreSlug);
        const initialStore = requestedStore ?? availableStores[0];

        setSelectedStoreID(initialStore.id);
        setSearchParams({ store: initialStore.slug }, { replace: true });
      }
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const data = await productsApi.getProducts({
        store_id: selectedStoreID || undefined,
        search: search.trim() || undefined,
        status: status || undefined,
        category_id: categoryID.trim() || undefined,
        price_from: priceFrom ? Number(priceFrom) : undefined,
        price_to: priceTo ? Number(priceTo) : undefined,
        limit: PRODUCT_LIMIT,
        offset: (page - 1) * PRODUCT_LIMIT,
        attribute_filters: Object.fromEntries(
          Object.entries(attributeFilterValues).filter(([, value]) => value !== '')
        ),
      });

      setProducts(data.products);
      setCount(data.count);
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedStoreID) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories([]);
      resetFilterCategoryState();
      return;
    }

    fetchCategories(selectedStoreID);
    if (previousStoreID.current && previousStoreID.current !== selectedStoreID) {
      resetFilterCategoryState();
      setAttributeFilterValues({});
    }
    previousStoreID.current = selectedStoreID;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreID]);

  useEffect(() => {
    sessionStorage.setItem(
      PRODUCTS_FILTERS_STORAGE_KEY,
      JSON.stringify({
        selectedStoreID,
        searchDraft,
        search,
        status,
        categoryID,
        filterCategoryParentID,
        filterCategoryPath,
        priceFrom,
        priceTo,
        attributeFilterValues,
        page,
      } satisfies SavedProductsFilters)
    );
  }, [
    selectedStoreID,
    searchDraft,
    search,
    status,
    categoryID,
    filterCategoryParentID,
    filterCategoryPath,
    priceFrom,
    priceTo,
    attributeFilterValues,
    page,
  ]);

  useEffect(() => {
    if (!selectedStoreID) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterAttributes([]);
      setFilterAttributeOptions({});
      setAttributeFilterValues({});
      return;
    }
    productAttributesApi
      .list(selectedStoreID)
      .then(async (data) => {
        const applicable = data.product_attributes.filter(
          (attribute) =>
            attribute.is_filter &&
            (!attribute.category_id ||
              (Boolean(categoryID) && attribute.category_id === categoryID))
        );
        const optionEntries = await Promise.all(
          applicable
            .filter((attribute) => attribute.type === 'select')
            .map(async (attribute) => [
              attribute.id,
              await productAttributesApi.listOptions(attribute.id),
            ] as const)
        );
        setFilterAttributes(applicable);
        setFilterAttributeOptions(Object.fromEntries(optionEntries));
        setAttributeFilterValues((current) =>
          Object.fromEntries(
            Object.entries(current).filter(([id]) =>
              applicable.some((attribute) => attribute.id === id)
            )
          )
        );
      })
      .catch((error) => showErrorNotification(parseApiError(error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreID, categoryID]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedStoreID,
    search,
    status,
    categoryID,
    priceFrom,
    priceTo,
    attributeFilterValues,
    page,
  ]);

  const handleSearchSubmit = () => {
    setSearch(searchDraft.trim());
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setStatus('');
    resetFilterCategoryState();
    setPriceFrom('');
    setPriceTo('');
    setAttributeFilterValues({});
    setPage(1);
  };

  const handleStoreFilterChange = (storeID: string) => {
    setSelectedStoreID(storeID);
    const store = stores.find((item) => item.id === storeID);
    setSearchParams(store ? { store: store.slug } : {});
    setPage(1);
  };

  const handleStatusFilterChange = (nextStatus: ProductStatus | '') => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleCategoryFilterChange = (nextCategoryID: string) => {
    setCategoryID(nextCategoryID);
    setPage(1);
  };

  const handleCategoryFilterClear = () => {
    resetFilterCategoryState();
    setPage(1);
  };

  const handlePriceFromChange = (value: string) => {
    setPriceFrom(value);
    setPage(1);
  };

  const handlePriceToChange = (value: string) => {
    setPriceTo(value);
    setPage(1);
  };

  const handleOpenCreateDialog = () => {
    setEditingProduct(null);
    setForm({
      ...initialFormState,
      store_id: selectedStoreID,
    });
    resetFormCategoryState();
    setProductAttributes([]);
    setAttributeOptions({});
    setAttributeValues({});
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormCategoryParentID(product.category_id ?? null);
    setFormCategoryPath([]);
    setAttributeValues(
      Object.fromEntries(
        (product.attributes ?? []).map((value) => [
          value.product_attribute_id,
          value.value_text ??
            (value.value_number !== null && value.value_number !== undefined
              ? String(value.value_number)
              : undefined) ??
            value.value_bool ??
            value.option_id ??
            '',
        ])
      )
    );
    setDialogOpen(true);
  };

  const handleOpenProduct = (product: Product) => {
    const store = stores.find((item) => item.id === product.store_id);

    if (!store) {
      showErrorNotification('Не удалось определить магазин товара');
      return;
    }

    navigate(`/products/${encodeURIComponent(store.slug)}/${encodeURIComponent(product.slug)}`);
  };

  const handleCloseDialog = () => {
    if (submitting) {
      return;
    }

    setDialogOpen(false);
    setEditingProduct(null);
    setForm(initialFormState);
    setProductAttributes([]);
    setAttributeOptions({});
    setAttributeValues({});
    setAttributeDialogOpen(false);
    setAttributeForm(initialAttributeFormState);
    resetFormCategoryState();
  };

  const handleDialogStoreChange = async (storeID: string) => {
    updateForm({
      store_id: storeID,
      category_id: '',
    });

    resetFormCategoryState();

    await fetchCategories(storeID);
  };

  const handleDialogCategoryClear = () => {
    updateForm({ category_id: '' });
    resetFormCategoryState();
  };

  useEffect(() => {
    if (!dialogOpen || !form.store_id || !form.category_id) {
      return;
    }
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttributesLoading(true);
    productAttributesApi
      .list(form.store_id)
      .then(async (data) => {
        const applicable = data.product_attributes.filter(
          (attribute) => !attribute.category_id || attribute.category_id === form.category_id
        );
        const optionEntries = await Promise.all(
          applicable
            .filter((attribute) => attribute.type === 'select')
            .map(async (attribute) => [
              attribute.id,
              await productAttributesApi.listOptions(attribute.id),
            ] as const)
        );
        if (active) {
          setProductAttributes(applicable);
          setAttributeOptions(Object.fromEntries(optionEntries));
          setAttributeValues((current) =>
            Object.fromEntries(
              Object.entries(current).filter(([id]) =>
                applicable.some((attribute) => attribute.id === id)
              )
            )
          );
        }
      })
      .catch((error) => active && showErrorNotification(parseApiError(error).message))
      .finally(() => active && setAttributesLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, form.store_id, form.category_id]);

  const buildAttributeValuePayload = (
    attribute: ProductAttribute,
    value: string | boolean
  ): ProductAttributeValuePayload | null => {
    if (value === '') return null;
    const payload: ProductAttributeValuePayload = { product_attribute_id: attribute.id };
    if (attribute.type === 'text') payload.value_text = String(value);
    if (attribute.type === 'number') payload.value_number = Number(value);
    if (attribute.type === 'bool') payload.value_bool = value === true;
    if (attribute.type === 'select') payload.option_id = String(value);
    return payload;
  };

  const handleOpenAttributeDialog = () => {
    setAttributeForm({
      ...initialAttributeFormState,
      category_id: form.category_id,
    });
    setAttributeDialogOpen(true);
  };

  const handleCreateAttribute = async () => {
    if (!attributeForm.name.trim() || !attributeForm.code.trim()) {
      showErrorNotification('Укажите название и код атрибута');
      return;
    }
    const optionValues = attributeForm.options.map((value) => value.trim()).filter(Boolean);
    if (attributeForm.type === 'select' && optionValues.length === 0) {
      showErrorNotification('Добавьте хотя бы один вариант выбора');
      return;
    }
    if (new Set(optionValues).size !== optionValues.length) {
      showErrorNotification('Варианты выбора не должны повторяться');
      return;
    }
    try {
      setAttributeSubmitting(true);
      const attribute = await productAttributesApi.create({
        store_id: form.store_id,
        category_id: attributeForm.category_id || undefined,
        name: attributeForm.name.trim(),
        code: attributeForm.code.trim(),
        type: attributeForm.type,
        unit: attributeForm.unit.trim() || undefined,
        is_required: attributeForm.is_required,
        is_filter: attributeForm.is_filter,
      });
      const options =
        attributeForm.type === 'select'
          ? await Promise.all(
              optionValues.map((value, position) =>
                  productAttributesApi.createOption(attribute.id, { value, position })
                )
            )
          : [];
      setProductAttributes((current) => [...current, attribute]);
      if (options.length > 0) {
        setAttributeOptions((current) => ({ ...current, [attribute.id]: options }));
      }
      setAttributeDialogOpen(false);
      setAttributeForm(initialAttributeFormState);
      showSuccessNotification('Атрибут создан и добавлен в форму товара');
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setAttributeSubmitting(false);
    }
  };

  const syncAttributeValues = async (product: Product) => {
    const existingByAttribute = new Map(
      (product.attributes ?? []).map((value) => [value.product_attribute_id, value])
    );
    await Promise.all(
      productAttributes.map(async (attribute) => {
        const payload = buildAttributeValuePayload(attribute, attributeValues[attribute.id] ?? '');
        const existing = existingByAttribute.get(attribute.id);
        if (!payload && existing) {
          await productAttributesApi.deleteValue(product.id, existing.id);
        } else if (payload && existing) {
          const patch = {
            value_text: payload.value_text,
            value_number: payload.value_number,
            value_bool: payload.value_bool,
            option_id: payload.option_id,
          };
          await productAttributesApi.updateValue(product.id, existing.id, patch);
        } else if (payload) {
          await productAttributesApi.createValue(product.id, payload);
        }
      })
    );
  };

  const validateForm = () => {
    if (!form.store_id.trim()) {
      showErrorNotification('Выберите магазин');
      return false;
    }

    if (!form.name.trim()) {
      showErrorNotification('Введите название товара');
      return false;
    }

    if (!form.slug.trim()) {
      showErrorNotification('Введите slug товара');
      return false;
    }

    if (!form.category_id.trim()) {
      showErrorNotification('Выберите категорию товара');
      return false;
    }

    if (!form.price || Number(form.price) <= 0) {
      showErrorNotification('Цена должна быть больше 0');
      return false;
    }

    const missingRequiredAttribute = productAttributes.find(
      (attribute) =>
        attribute.is_required &&
        (attributeValues[attribute.id] === undefined || attributeValues[attribute.id] === '')
    );
    if (missingRequiredAttribute) {
      showErrorNotification(`Заполните обязательный атрибут «${missingRequiredAttribute.name}»`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingProduct) {
        const product = await productsApi.updateProduct(editingProduct.id, buildPatchPayload(form));
        product.attributes = editingProduct.attributes ?? [];
        await syncAttributeValues(product);
        showSuccessNotification('Товар успешно обновлен');
      } else {
        const product = await productsApi.createProduct(buildCreatePayload(form));
        await syncAttributeValues(product);
        showSuccessNotification('Товар успешно создан');
      }

      handleCloseDialog();
      await fetchProducts();
      await fetchCategories(form.store_id);
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeletingProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    try {
      setDeleting(true);

      await productsApi.deleteProduct(deletingProduct.id);

      showSuccessNotification('Товар успешно удален');
      setDeletingProduct(null);

      await fetchProducts();
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenCreateCategoryDialog = (parentID: string | null) => {
    if (!form.store_id) {
      showErrorNotification('Сначала выберите магазин');
      return;
    }

    setCategoryDialogMode('create');
    setEditingCategory(null);

    setCategoryForm({
      ...initialCategoryFormState,
      parent_id: parentID ?? '',
    });

    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    if (categorySubmitting) {
      return;
    }

    setCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryForm(initialCategoryFormState);
  };

  const validateCategoryForm = () => {
    if (!form.store_id.trim()) {
      showErrorNotification('Выберите магазин');
      return false;
    }

    if (!categoryForm.name.trim()) {
      showErrorNotification('Введите название категории');
      return false;
    }

    return true;
  };

  const handleCreateCategorySubmit = async () => {
    if (!validateCategoryForm()) {
      return;
    }

    try {
      setCategorySubmitting(true);

      const createdCategory = await productCategoriesApi.create(
        buildCreateCategoryPayload(categoryForm, form.store_id)
      );

      showSuccessNotification('Категория успешно создана');

      await fetchCategories(form.store_id);

      updateForm({
        category_id: createdCategory.id,
      });

      setFormCategoryParentID(createdCategory.parent_id || null);

      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm(initialCategoryFormState);
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setCategorySubmitting(false);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <ProductsPageHeader
          storesLoading={storesLoading}
          storesCount={stores.length}
          onCreate={handleOpenCreateDialog}
        />

        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <ProductsFiltersCard
            stores={stores}
            categories={categories}
            selectedStoreID={selectedStoreID}
            search={searchDraft}
            status={status}
            categoryID={categoryID}
            categoryParentID={filterCategoryParentID}
            categoryPath={filterCategoryPath}
            priceFrom={priceFrom}
            priceTo={priceTo}
            storesLoading={storesLoading}
            categoriesLoading={categoriesLoading}
            activeFilterLabels={activeFilterLabels}
            hasActiveFilters={hasActiveFilters}
            onStoreChange={handleStoreFilterChange}
            onSearchChange={setSearchDraft}
            onSearchSubmit={handleSearchSubmit}
            onStatusChange={handleStatusFilterChange}
            onCategoryChange={handleCategoryFilterChange}
            onCategoryParentChange={setFilterCategoryParentID}
            onCategoryPathChange={setFilterCategoryPath}
            onCategoryClear={handleCategoryFilterClear}
            onPriceFromChange={handlePriceFromChange}
            onPriceToChange={handlePriceToChange}
            onResetFilters={handleResetFilters}
            filterAttributes={filterAttributes}
            filterAttributeOptions={filterAttributeOptions}
            attributeFilterValues={attributeFilterValues}
            onAttributeFilterChange={(attributeID, value) => {
              setAttributeFilterValues((current) => ({ ...current, [attributeID]: value }));
              setPage(1);
            }}
          />

          <ProductsListCard
            products={products}
            loading={loading}
            count={count}
            page={page}
            totalPages={totalPages}
            categoryNameByID={categoryNameByID}
            onPageChange={setPage}
            onSelect={handleOpenProduct}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        </Card>

        <ProductDialog
          open={dialogOpen}
          editingProduct={editingProduct}
          form={form}
          stores={stores}
          categories={categories}
          categoriesLoading={categoriesLoading}
          submitting={submitting}
          formCategoryParentID={formCategoryParentID}
          formCategoryPath={formCategoryPath}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onFormChange={updateForm}
          onStoreChange={handleDialogStoreChange}
          onCategoryParentChange={setFormCategoryParentID}
          onCategoryPathChange={setFormCategoryPath}
          onCategoryClear={handleDialogCategoryClear}
          onCreateCategory={handleOpenCreateCategoryDialog}
          attributes={productAttributes}
          attributeOptions={attributeOptions}
          attributeValues={attributeValues}
          attributesLoading={attributesLoading}
          onAttributeChange={(attributeID, value) =>
            setAttributeValues((current) => ({ ...current, [attributeID]: value }))
          }
          onCreateAttribute={handleOpenAttributeDialog}
        />

        <ProductAttributeDialog
          open={attributeDialogOpen}
          editing={false}
          form={attributeForm}
          categories={categories.filter((category) => category.id === form.category_id)}
          submitting={attributeSubmitting}
          onChange={(patch) => setAttributeForm((current) => ({ ...current, ...patch }))}
          onClose={() => !attributeSubmitting && setAttributeDialogOpen(false)}
          onSubmit={handleCreateAttribute}
        />

        <ProductCategoryDialog
          open={categoryDialogOpen}
          mode={categoryDialogMode}
          editingCategory={editingCategory}
          form={categoryForm}
          selectedStore={selectedDialogStore}
          parentOptions={categoryParentOptions}
          submitting={categorySubmitting}
          onClose={handleCloseCategoryDialog}
          onSubmit={handleCreateCategorySubmit}
          onFormChange={updateCategoryForm}
        />
      </Stack>

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Удалить товар?"
        description={
          <>
            Товар <strong>{deletingProduct?.name}</strong> будет удален. Это действие нельзя
            отменить.
          </>
        }
        loading={deleting}
        confirmText="Удалить"
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <NotificationSnackbar notification={notification} onClose={closeNotification} />
    </>
  );
}
