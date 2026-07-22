import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { parseApiError } from '../../../shared/lib/apiError';
import { userRoleOptions, userStatusOptions } from '../lib/userConstants';
import type {
  CreateUserRequest,
  PatchUserRequest,
  User,
  UserRole,
  UserStatus,
} from '../model/types';

type UserFormValues = {
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string;
  password: string;
};

type UserFormDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserRequest | PatchUserRequest) => Promise<void>;
};

const createSchema = (isEdit: boolean) =>
  z
    .object({
      username: z.string().trim().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
      email: z.string().trim().email('Введите корректный email').max(255),
      role: z.enum(['admin', 'seller', 'client']),
      status: z.enum(['active', 'inactive', 'blocked']),
      avatar_url: z.union([z.literal(''), z.string().trim().url('Введите корректную ссылку')]),
      password: z.string().max(72, 'Максимум 72 символа'),
    })
    .superRefine((values, context) => {
      if (!isEdit && values.password.length < 8) {
        context.addIssue({ code: 'custom', path: ['password'], message: 'Минимум 8 символов' });
      }
      if (isEdit && values.password.length > 0 && values.password.length < 8) {
        context.addIssue({ code: 'custom', path: ['password'], message: 'Минимум 8 символов' });
      }
    });

const DEFAULT_VALUES: UserFormValues = {
  username: '',
  email: '',
  role: 'client',
  status: 'active',
  avatar_url: '',
  password: '',
};

export function UserFormDialog({ open, user, onClose, onSubmit }: UserFormDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = Boolean(user);
  const schema = useMemo(() => createSchema(isEdit), [isEdit]);
  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (!open) return;

    reset(
      user
        ? {
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar_url: user.avatar_url ?? '',
            password: '',
          }
        : DEFAULT_VALUES
    );
  }, [open, reset, user]);

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const submit = async (values: UserFormValues) => {
    setSubmitError(null);
    const common = {
      username: values.username.trim(),
      email: values.email.trim(),
      role: values.role,
      avatar_url: values.avatar_url.trim() || null,
    };

    const payload: CreateUserRequest | PatchUserRequest = isEdit
      ? {
          ...common,
          status: values.status,
          ...(values.password ? { password: values.password } : {}),
        }
      : { ...common, password: values.password };

    try {
      await onSubmit(payload);
      handleClose();
    } catch (error) {
      const parsed = parseApiError(
        error,
        `Не удалось ${isEdit ? 'обновить' : 'создать'} пользователя`
      );
      Object.entries(parsed.fields).forEach(([field, message]) => {
        if (field in DEFAULT_VALUES) {
          setError(field as keyof UserFormValues, { message });
        }
      });
      setSubmitError(parsed.message);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="user-form"
          spacing={2}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(submit)}
        >
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            label="Имя пользователя"
            autoFocus
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register('username')}
          />
          <TextField
            label="Email"
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.role)}>
                  <InputLabel>Роль</InputLabel>
                  <Select {...field} label="Роль">
                    {userRoleOptions.map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              )}
            />
            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel>Статус</InputLabel>
                    <Select {...field} label="Статус">
                      {userStatusOptions.map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            )}
          </Stack>
          <TextField
            label="Ссылка на аватар"
            placeholder="https://example.com/avatar.jpg"
            error={Boolean(errors.avatar_url)}
            helperText={errors.avatar_url?.message}
            {...register('avatar_url')}
          />
          <TextField
            label={isEdit ? 'Новый пароль' : 'Пароль'}
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message ??
              (isEdit ? 'Оставьте пустым, чтобы не менять пароль' : 'Минимум 8 символов')
            }
            {...register('password')}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button disabled={isSubmitting} onClick={handleClose}>
          Отмена
        </Button>
        <Button type="submit" form="user-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : isEdit ? (
            'Сохранить'
          ) : (
            'Создать'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
