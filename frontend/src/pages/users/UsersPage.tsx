import { useState } from 'react';

import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../features/auth/model/authStore';
import { usersApi } from '../../features/users/api/userApi';
import type { CreateUserRequest, PatchUserRequest, User } from '../../features/users/model/types';
import { UserFormDialog } from '../../features/users/ui/UserFormDialog';
import { UsersFiltersCard, type UsersFiltersValue } from '../../features/users/ui/UsersFiltersCard';
import { UsersTable } from '../../features/users/ui/UsersTable';
import { parseApiError } from '../../shared/lib/apiError';
import { useNotification } from '../../shared/lib/useNotification';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { NotificationSnackbar } from '../../shared/ui/NotificationSnackbar';
import { PageHeader } from '../../shared/ui/PageHeader';

const DEFAULT_FILTERS: UsersFiltersValue = { search: '', role: 'all', status: 'all' };

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const { notification, showSuccessNotification, showErrorNotification, closeNotification } =
    useNotification();

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () =>
      usersApi.getUsers({
        search: filters.search.trim() || undefined,
        role: filters.role === 'all' ? undefined : filters.role,
        status: filters.status === 'all' ? undefined : filters.status,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: async () => {
      setDeletingUser(null);
      showSuccessNotification('Пользователь удалён');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) =>
      showErrorNotification(parseApiError(error, 'Не удалось удалить пользователя').message),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const submitUser = async (payload: CreateUserRequest | PatchUserRequest) => {
    if (editingUser) {
      await usersApi.patchUser(editingUser.id, payload as PatchUserRequest);
      showSuccessNotification('Пользователь обновлён');
    } else {
      await usersApi.createUser(payload as CreateUserRequest);
      showSuccessNotification('Пользователь создан');
    }
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Пользователи"
        description="Управление аккаунтами, ролями и доступом пользователей."
        actionLabel="Создать пользователя"
        onAction={() => setFormOpen(true)}
      />
      <UsersFiltersCard
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {usersQuery.isLoading && (
        <Box
          sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress />
        </Box>
      )}
      {usersQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => usersQuery.refetch()}>
              Повторить
            </Button>
          }
        >
          {parseApiError(usersQuery.error, 'Не удалось загрузить пользователей').message}
        </Alert>
      )}
      {usersQuery.data && (
        <UsersTable
          users={usersQuery.data.users}
          currentUserId={currentUser?.id}
          onEdit={(user) => {
            setEditingUser(user);
            setFormOpen(true);
          }}
          onDelete={setDeletingUser}
        />
      )}

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={closeForm}
        onSubmit={submitUser}
      />
      <ConfirmDialog
        open={Boolean(deletingUser)}
        title="Удалить пользователя?"
        description={
          <Typography color="text.secondary">
            Аккаунт <strong>{deletingUser?.username}</strong> будет удалён без возможности
            восстановления.
          </Typography>
        }
        loading={deleteMutation.isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) deleteMutation.mutate(deletingUser.id);
        }}
      />
      <NotificationSnackbar notification={notification} onClose={closeNotification} />
    </Stack>
  );
}
