import { Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

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

const initialCategoryFormState: ProductCategoryFormState = {
  name: '',
  description: '',
  parent_id: '',
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [selectedStoreID, setSelectedStoreID] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [categoryID, setCategoryID] = useState('');
  const [filterCategoryParentID, setFilterCategoryParentID] = useState<string | null>(null);
  const [filterCategoryPath, setFilterCategoryPath] = useState<CategoryPathItem[]>([]);
  const [formCategoryParentID, setFormCategoryParentID] = useState<string | null>(null);
  const [formCategoryPath, setFormCategoryPath] = useState<CategoryPathItem[]>([]);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  const [page, setPage] = useState(1);
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

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<ProductCategoryDialogMode>('create');
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<ProductCategoryFormState>(initialCategoryFormState);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const selectedStore = useMemo(() => {
    return stores.find((store) => store.id === selectedStoreID);
  }, [stores, selectedStoreID]);

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

  const hasActiveFilters = Boolean(search.trim() || status || categoryID || priceFrom || priceTo);

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

      const data = await productsApi.getSellerStores();

      setStores(data.stores);

      if (!selectedStoreID && data.stores.length > 0) {
        setSelectedStoreID(data.stores[0].id);
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
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedStoreID) {
      setCategories([]);
      resetFilterCategoryState();
      return;
    }

    fetchCategories(selectedStoreID);
    resetFilterCategoryState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreID]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreID, search, status, categoryID, priceFrom, priceTo, page]);

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
    setPage(1);
  };

  const handleStoreFilterChange = (storeID: string) => {
    setSelectedStoreID(storeID);
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
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormCategoryParentID(product.category_id ?? null);
    setFormCategoryPath([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) {
      return;
    }

    setDialogOpen(false);
    setEditingProduct(null);
    setForm(initialFormState);
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

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, buildPatchPayload(form));
        showSuccessNotification('Товар успешно обновлен');
      } else {
        await productsApi.createProduct(buildCreatePayload(form));
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
        />

        <ProductsListCard
          products={products}
          loading={loading}
          count={count}
          page={page}
          totalPages={totalPages}
          selectedStore={selectedStore}
          categoryNameByID={categoryNameByID}
          onPageChange={setPage}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />

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
