import { useEffect, useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import { productCategoriesApi } from '../../features/productCategories/api/productCategoriesApi';
import type { ProductCategory } from '../../features/productCategories/model/types';

import { productsApi } from '../../features/products/api/productsApi';
import type { StoreOption } from '../../features/products/model/types';

import { parseApiError } from '../../shared/api/error';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';
import { useNotification } from '../../shared/lib/useNotification';
import {
  buildCategoryNameMap,
  buildCreateCategoryPayload,
  buildPatchCategoryPayload,
  categoryToForm,
  initialCategoryFormState,
  type ProductCategoryDialogMode,
  type ProductCategoryFormState,
} from '../../features/productCategories/lib/productCategoryForm';

import {
  buildCategoriesByParentID,
  buildCategoryByID,
  flattenCategoryTree,
  flattenSearchCategories,
  getDescendantCategoryIDs,
  mergeCategoriesWithParents,
} from '../../features/productCategories/lib/productCategoryTree';

import { ProductCategoriesFiltersCard } from '../../features/productCategories/ui/ProductCategoriesFiltersCard';
import { ProductCategoriesListCard } from '../../features/productCategories/ui/ProductCategoriesListCard';
import { ProductCategoriesPageHeader } from '../../features/productCategories/ui/ProductCategoriesPageHeader';
import { ProductCategoryDialog } from '../../features/productCategories/ui/ProductCategoryDialog';

const SEARCH_DEBOUNCE_MS = 500;

export function ProductCategoriesPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [parentCategoriesByID, setParentCategoriesByID] = useState<Record<string, ProductCategory>>(
    {}
  );

  const [selectedStoreID, setSelectedStoreID] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');

  const [count, setCount] = useState(0);

  const [storesLoading, setStoresLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ProductCategoryDialogMode>('create');
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState<ProductCategoryFormState>(initialCategoryFormState);

  const selectedStore = useMemo(() => {
    return stores.find((store) => store.id === selectedStoreID);
  }, [stores, selectedStoreID]);

  const isSearchActive = Boolean(search.trim());

  const categoriesWithParents = useMemo(() => {
    return mergeCategoriesWithParents(categories, parentCategoriesByID);
  }, [categories, parentCategoriesByID]);

  const categoriesByParentID = useMemo(() => {
    return buildCategoriesByParentID(categories);
  }, [categories]);

  const categoryNameByID = useMemo(() => {
    return buildCategoryNameMap(categoriesWithParents);
  }, [categoriesWithParents]);

  const categoryByID = useMemo(() => {
    return buildCategoryByID(categoriesWithParents);
  }, [categoriesWithParents]);

  const treeCategories = useMemo(() => {
    if (isSearchActive) {
      return flattenSearchCategories(categories, categoryByID);
    }

    return flattenCategoryTree(categoriesByParentID);
  }, [categories, categoriesByParentID, categoryByID, isSearchActive]);

  const parentOptions = useMemo(() => {
    if (!editingCategory) {
      return treeCategories;
    }

    const blockedIDs = new Set([
      editingCategory.id,
      ...getDescendantCategoryIDs(editingCategory.id, categoriesByParentID),
    ]);

    return treeCategories.filter((category) => !blockedIDs.has(category.id));
  }, [categoriesByParentID, editingCategory, treeCategories]);

  const rootCount = categoriesByParentID.root?.length || 0;

  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const updateForm = (patch: Partial<ProductCategoryFormState>) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const fetchParentCategoryByID = async (categoryID: string) => {
    const data = await productCategoriesApi.getByID(categoryID);

    if ('product_category' in data && data.product_category) {
      return data.product_category;
    }

    return data as ProductCategory;
  };

  const fetchMissingParentCategories = async (nextCategories: ProductCategory[]) => {
    const loadedParents: Record<string, ProductCategory> = {};
    const knownIDs = new Set(nextCategories.map((category) => category.id));

    const queue = Array.from(
      new Set(
        nextCategories
          .map((category) => category.parent_id)
          .filter((parentID): parentID is string => Boolean(parentID))
      )
    );

    while (queue.length > 0) {
      const parentID = queue.shift();

      if (!parentID || knownIDs.has(parentID) || loadedParents[parentID]) {
        continue;
      }

      try {
        const parent = await fetchParentCategoryByID(parentID);

        loadedParents[parent.id] = parent;
        knownIDs.add(parent.id);

        if (
          parent.parent_id &&
          !knownIDs.has(parent.parent_id) &&
          !loadedParents[parent.parent_id]
        ) {
          queue.push(parent.parent_id);
        }
      } catch (error) {
        showErrorNotification(parseApiError(error).message);
      }
    }

    setParentCategoriesByID(loadedParents);
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

  const fetchCategories = async () => {
    if (!selectedStoreID) {
      setCategories([]);
      setParentCategoriesByID({});
      setCount(0);
      return;
    }

    try {
      setCategoriesLoading(true);

      const data = await productCategoriesApi.list({
        store_id: selectedStoreID,
        search: search.trim() || undefined,
      });

      setCategories(data.product_categories);
      setCount(data.count);

      if (search.trim()) {
        await fetchMissingParentCategories(data.product_categories);
      } else {
        setParentCategoriesByID({});
      }
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      setSearch(searchDraft.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutID);
    };
  }, [searchDraft]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreID, search]);

  const handleStoreFilterChange = (storeID: string) => {
    setSelectedStoreID(storeID);
    setSearchDraft('');
    setSearch('');
    setCategories([]);
    setParentCategoriesByID({});
    setCount(0);
  };

  const handleRefresh = () => {
    fetchStores();
    fetchCategories();
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setEditingCategory(null);
    setForm(initialCategoryFormState);
    setDialogOpen(true);
  };

  const handleOpenCreateChildDialog = (category: ProductCategory) => {
    setDialogMode('create');
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      parent_id: category.id,
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (category: ProductCategory) => {
    setDialogMode('edit');
    setEditingCategory(category);
    setForm(categoryToForm(category));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) {
      return;
    }

    setDialogOpen(false);
    setDialogMode('create');
    setEditingCategory(null);
    setForm(initialCategoryFormState);
  };

  const validateForm = () => {
    if (!selectedStoreID.trim()) {
      showErrorNotification('Выберите магазин');
      return false;
    }

    if (!form.name.trim()) {
      showErrorNotification('Введите название категории');
      return false;
    }

    return true;
  };
  const validateCategoryDepth = () => {
    const selectedParent = parentOptions.find((category) => category.id === form.parent_id);

    if (!selectedParent) {
      return true;
    }

    if (selectedParent.level >= 2) {
      showErrorNotification('Нельзя добавить подкатегорию глубже третьего уровня.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !validateCategoryDepth()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingCategory) {
        await productCategoriesApi.update(editingCategory.id, buildPatchCategoryPayload(form));

        showSuccessNotification('Категория успешно обновлена');
      } else {
        await productCategoriesApi.create(buildCreateCategoryPayload(form, selectedStoreID));

        showSuccessNotification('Категория успешно создана');
      }

      handleCloseDialog();
      await fetchCategories();
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleOpenDeleteDialog = (category: ProductCategory) => {
    setDeletingCategory(category);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeletingCategory(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) {
      return;
    }

    try {
      setDeleting(true);

      await productCategoriesApi.delete(deletingCategory.id);

      showSuccessNotification('Категория успешно удалена');
      setDeletingCategory(null);

      await fetchCategories();
    } catch (error) {
      showErrorNotification(parseApiError(error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <ProductCategoriesPageHeader
          storesLoading={storesLoading}
          storesCount={stores.length}
          onCreate={handleOpenCreateDialog}
        />

        <ProductCategoriesFiltersCard
          stores={stores}
          selectedStoreID={selectedStoreID}
          search={searchDraft}
          storesLoading={storesLoading}
          categoriesLoading={categoriesLoading}
          onStoreChange={handleStoreFilterChange}
          onSearchChange={setSearchDraft}
          onRefresh={handleRefresh}
        />

        <ProductCategoriesListCard
          stores={stores}
          selectedStoreID={selectedStoreID}
          selectedStore={selectedStore}
          loading={categoriesLoading}
          count={count}
          rootCount={rootCount}
          isSearchActive={isSearchActive}
          categories={treeCategories}
          categoriesByParentID={categoriesByParentID}
          categoryNameByID={categoryNameByID}
          onCreateChild={handleOpenCreateChildDialog}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />

        <ProductCategoryDialog
          open={dialogOpen}
          mode={dialogMode}
          editingCategory={editingCategory}
          form={form}
          selectedStore={selectedStore}
          parentOptions={parentOptions}
          submitting={submitting}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onFormChange={updateForm}
        />
        <ConfirmDialog
          open={Boolean(deletingCategory)}
          title="Удалить категорию?"
          description={
            <>
              Категория <strong>{deletingCategory?.name}</strong> будет удалена. Это действие нельзя
              отменить.
            </>
          }
          loading={deleting}
          confirmText="Удалить"
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />

        <NotificationSnackbar notification={notification} onClose={closeNotification} />
      </Stack>
    </>
  );
}
