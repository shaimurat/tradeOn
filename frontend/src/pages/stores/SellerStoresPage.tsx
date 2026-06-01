import { useEffect, useState } from 'react';

import { Alert, Box, CircularProgress, Grid, Stack } from '@mui/material';

import { storesApi } from '../../features/stores/api/storesApi';
import { StoreCard } from '../../features/stores/ui/StoreCard';
import { StoreDeleteDialog } from '../../features/stores/ui/StoreDeleteDialog';
import {
  StoreFiltersCard,
  type StoreFiltersValue,
} from '../../features/stores/ui/StoreFiltersCard';
import { StoreFormDialog } from '../../features/stores/ui/StoreFormDialog';
import { StoresEmptyState } from '../../features/stores/ui/StoresEmptyState';
import { StoresPageHeader } from '../../features/stores/ui/StoresPageHeader';
import { parseApiError } from '../../shared/lib/apiError';
import { useNotification } from '../../shared/lib/useNotification';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';

import type { Store } from '../../features/stores/model/types';

const DEFAULT_FILTERS: StoreFiltersValue = {
  search: '',
  seller_id: '',
  status: 'all',
  sort_by: 'created_at',
  sort_order: 'desc',
};

export function SellerStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState<StoreFiltersValue>(DEFAULT_FILTERS);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const loadStores = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await storesApi.getSellerStores({
        search: filters.search || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        limit: 20,
        offset: 0,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      });

      setStores(response.stores);
    } catch (err) {
      setError(parseApiError(err, 'Не удалось загрузить магазины').message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, [filters]);

  const handleCreate = () => {
    setEditingStore(null);
    setFormOpen(true);
  };

  const handleFilterChange = (
    key: keyof StoreFiltersValue,
    value: StoreFiltersValue[keyof StoreFiltersValue]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingStore(null);
  };



  const handleDeleteStore = async () => {
    if (!deletingStore) {
      return;
    }

    try {
      setIsDeleting(true);

      await storesApi.sellerDeleteStore(deletingStore.id);

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
        title="Мои площадки"
        description="Управляйте своими магазинами, товарами и заказами на TradeOn."
        createButtonLabel="Создать площадку"
        onCreate={handleCreate}
      />

      <StoreFiltersCard
        filters={filters}
        breakpoint="md"
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading && (
        <Box
          sx={{
            minHeight: 240,
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

      {!isLoading && !error && stores.length === 0 && (
        <StoresEmptyState
          title="Площадок пока нет"
          description="Создайте первую площадку или сбросьте фильтры, если магазины не отображаются по текущим параметрам."
          createButtonLabel="Создать площадку"
          onCreate={handleCreate}
          onResetFilters={handleResetFilters}
        />
      )}

      {!isLoading && !error && stores.length > 0 && (
        <Grid container spacing={2}>
          {stores.map((store) => (
            <Grid key={store.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <StoreCard
                store={store}
                onEdit={(store) => {
                  setEditingStore(store);
                  setFormOpen(true);
                }}
                onDelete={setDeletingStore}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {editingStore ? (
  <StoreFormDialog
    open={formOpen}
    mode="edit"
    role="seller"
    store={editingStore}
    onClose={handleCloseForm}
    onSubmit={async (payload) => {
      try {
        await storesApi.sellerPatchStore(editingStore.id, payload);
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
    role="seller"
    store={null}
    onClose={handleCloseForm}
    onSubmit={async (payload) => {
      try {
        await storesApi.sellerCreateStore(payload);
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