import { useEffect, useState } from 'react';

import { Alert, Box, CircularProgress, Stack } from '@mui/material';

import { storesApi } from '../../features/stores/api/storesApi';
import { AdminStoresTable } from '../../features/stores/ui/AdminStoresTable';
import { StoreDeleteDialog } from '../../features/stores/ui/StoreDeleteDialog';
import {
  StoreFiltersCard,
  type StoreFiltersValue,
} from '../../features/stores/ui/StoreFiltersCard';
import { StoreFormDialog } from '../../features/stores/ui/StoreFormDialog';
import { StoresPageHeader } from '../../features/stores/ui/StoresPageHeader';
import { usersApi } from '../../features/users/api/userApi';
import { parseApiError } from '../../shared/lib/apiError';
import { useNotification } from '../../shared/lib/useNotification';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';

import type { Store } from '../../features/stores/model/types';
import type { User } from '../../features/users/model/types';

const DEFAULT_FILTERS: StoreFiltersValue = {
  search: '',
  seller_id: '',
  status: 'all',
  sort_by: 'created_at',
  sort_order: 'desc',
};

export function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [filters, setFilters] = useState<StoreFiltersValue>(DEFAULT_FILTERS);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSellersLoading, setIsSellersLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();
const handleCloseForm = () => {
  setFormOpen(false);
  setEditingStore(null);
};
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
      setError(parseApiError(err, 'Не удалось загрузить магазины').message);
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

  const handleCreate = () => {
    setEditingStore(null);
    setFormOpen(true);
  };

  const handleFilterChange = (
    key: keyof StoreFiltersValue,
    value: StoreFiltersValue[keyof StoreFiltersValue]
  ) => {
    setPage(0);

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };




  const handleDeleteStore = async () => {
    if (!deletingStore) {
      return;
    }

    try {
      setIsDeleting(true);

      await storesApi.adminDeleteStore(deletingStore.id);

      showSuccessNotification('Магазин успешно удален');
      setDeletingStore(null);

      await loadStores();
    } catch (err) {
      showErrorNotification(parseApiError(err, 'Не удалось удалить магазин').message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <StoresPageHeader
        title="Магазины"
        description="Управление магазинами продавцов, статусами и модерацией."
        createButtonLabel="Создать магазин"
        onCreate={handleCreate}
      />

      <StoreFiltersCard
        filters={filters}
        sellers={sellers}
        isSellersLoading={isSellersLoading}
        showSellerFilter
        breakpoint="lg"
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
          onEdit={(store) => {
            setEditingStore(store);
            setFormOpen(true);
          }}
          onDelete={setDeletingStore}
        />
      )}

      {editingStore ? (
  <StoreFormDialog
    open={formOpen}
    mode="edit"
    role="admin"
    store={editingStore}
    sellers={sellers}
    isSellersLoading={isSellersLoading}
    onClose={handleCloseForm}
    onSubmit={async (payload) => {
      try {
        await storesApi.adminPatchStore(editingStore.id, payload);
        showSuccessNotification('Магазин успешно обновлен');

        await loadStores();
      } catch (err) {
        showErrorNotification(parseApiError(err, 'Не удалось обновить магазин').message);
        throw err;
      }
    }}
  />
) : (
  <StoreFormDialog
    open={formOpen}
    mode="create"
    role="admin"
    store={null}
    sellers={sellers}
    isSellersLoading={isSellersLoading}
    onClose={handleCloseForm}
    onSubmit={async (payload) => {
      try {
        await storesApi.adminCreateStore(payload);
        showSuccessNotification('Магазин успешно создан');

        await loadStores();
      } catch (err) {
        showErrorNotification(parseApiError(err, 'Не удалось создать магазин').message);
        throw err;
      }
    }}
  />
)}

      <StoreDeleteDialog
        store={deletingStore}
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletingStore(null);
          }
        }}
        onConfirm={handleDeleteStore}
      />

      <NotificationSnackbar notification={notification} onClose={closeNotification} />
    </Stack>
  );
}