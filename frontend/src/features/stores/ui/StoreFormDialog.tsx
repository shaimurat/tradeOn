import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { parseApiError } from '../../../shared/lib/apiError';
import { uploadStoreMedia } from '../api/uploadStoreMedia';

import type { User } from '../../users/model/types';
import type {
  AdminCreateStoreRequest,
  AdminPatchStoreRequest,
  SellerCreateStoreRequest,
  SellerPatchStoreRequest,
  Store,
  StoreStatus,
} from '../model/types';

type StoreFormValues = {
  name: string;
  description: string;
  slug: string;
  logo_url: string;
  banner_url: string;
  phone: string;
  email: string;
  address: string;
  seller_id: string;
  status: StoreStatus;
};

type StoreFormDialogBaseProps = {
  open: boolean;
  store?: Store | null;
  onClose: () => void;
};

type SellerCreateDialogProps = StoreFormDialogBaseProps & {
  role: 'seller';
  mode: 'create';
  onSubmit: (payload: SellerCreateStoreRequest) => Promise<void>;
};

type SellerEditDialogProps = StoreFormDialogBaseProps & {
  role: 'seller';
  mode: 'edit';
  onSubmit: (payload: SellerPatchStoreRequest) => Promise<void>;
};

type AdminCreateDialogProps = StoreFormDialogBaseProps & {
  role: 'admin';
  mode: 'create';
  sellers: User[];
  isSellersLoading?: boolean;
  onSubmit: (payload: AdminCreateStoreRequest) => Promise<void>;
};

type AdminEditDialogProps = StoreFormDialogBaseProps & {
  role: 'admin';
  mode: 'edit';
  sellers: User[];
  isSellersLoading?: boolean;
  onSubmit: (payload: AdminPatchStoreRequest) => Promise<void>;
};

type StoreFormDialogProps =
  | SellerCreateDialogProps
  | SellerEditDialogProps
  | AdminCreateDialogProps
  | AdminEditDialogProps;

const DEFAULT_VALUES: StoreFormValues = {
  name: '',
  description: '',
  slug: '',
  logo_url: '',
  banner_url: '',
  phone: '',
  email: '',
  address: '',
  seller_id: '',
  status: 'moderation',
};

const toNullableString = (value: string) => {
  const trimmed = value.trim();

  return trimmed || null;
};

const statusOptions: Array<{
  value: StoreStatus;
  label: string;
}> = [
  {
    value: 'active',
    label: 'Активный',
  },
  {
    value: 'inactive',
    label: 'Неактивный',
  },
  {
    value: 'moderation',
    label: 'На модерации',
  },
  {
    value: 'blocked',
    label: 'Заблокированный',
  },
];

export function StoreFormDialog(props: StoreFormDialogProps) {
  const { open, mode, role, store, onClose } = props;

  const sellers = role === 'admin' ? props.sellers : [];
  const isSellersLoading = role === 'admin' ? (props.isSellersLoading ?? false) : false;

  const [values, setValues] = useState<StoreFormValues>(DEFAULT_VALUES);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEdit = mode === 'edit';
  const isAdmin = role === 'admin';
  const isAdminCreate = role === 'admin' && mode === 'create';

  const selectedSeller = useMemo(() => {
    return sellers.find((seller) => seller.id === values.seller_id) ?? null;
  }, [sellers, values.seller_id]);

  useEffect(() => {
    if (!open) return;

    if (store) {
      setValues({
        name: store.name ?? '',
        description: store.description ?? '',
        slug: store.slug ?? '',
        logo_url: store.logo_url ?? '',
        banner_url: store.banner_url ?? '',
        phone: store.phone ?? '',
        email: store.email ?? '',
        address: store.address ?? '',
        seller_id: store.seller_id ?? '',
        status: store.status ?? 'moderation',
      });
    } else {
      setValues(DEFAULT_VALUES);
    }

    setLogoFile(null);
    setBannerFile(null);
    setLogoPreviewUrl(null);
    setBannerPreviewUrl(null);
    setError(null);
    setFieldErrors({});
  }, [open, store]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(bannerFile);
    setBannerPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [bannerFile]);

  const handleChange = <K extends keyof StoreFormValues>(key: K, value: StoreFormValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFieldErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];

      return next;
    });
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!values.name.trim()) {
      errors.name = 'Введите название магазина';
    }

    if (!values.description.trim()) {
      errors.description = 'Введите описание магазина';
    }

    if (!values.slug.trim()) {
      errors.slug = 'Введите slug магазина';
    }

    if (isAdminCreate && !values.seller_id) {
      errors.seller_id = 'Выберите продавца';
    }

    return errors;
  };

  const buildSellerCreatePayload = (
    mediaValues: Pick<StoreFormValues, 'logo_url' | 'banner_url'>
  ): SellerCreateStoreRequest => ({
    name: values.name.trim(),
    description: values.description.trim(),
    slug: values.slug.trim(),
    logo_url: toNullableString(mediaValues.logo_url),
    banner_url: toNullableString(mediaValues.banner_url),
    phone: toNullableString(values.phone),
    email: toNullableString(values.email),
    address: toNullableString(values.address),
  });

  const buildSellerPatchPayload = (
    mediaValues: Pick<StoreFormValues, 'logo_url' | 'banner_url'>
  ): SellerPatchStoreRequest => ({
    name: values.name.trim(),
    description: values.description.trim(),
    slug: values.slug.trim(),
    logo_url: toNullableString(mediaValues.logo_url),
    banner_url: toNullableString(mediaValues.banner_url),
    phone: toNullableString(values.phone),
    email: toNullableString(values.email),
    address: toNullableString(values.address),
  });

  const buildAdminCreatePayload = (
    mediaValues: Pick<StoreFormValues, 'logo_url' | 'banner_url'>
  ): AdminCreateStoreRequest => ({
    name: values.name.trim(),
    description: values.description.trim(),
    slug: values.slug.trim(),
    logo_url: toNullableString(mediaValues.logo_url),
    banner_url: toNullableString(mediaValues.banner_url),
    phone: toNullableString(values.phone),
    email: toNullableString(values.email),
    address: toNullableString(values.address),
    seller_id: values.seller_id,
    status: values.status,
  });

  const buildAdminPatchPayload = (
    mediaValues: Pick<StoreFormValues, 'logo_url' | 'banner_url'>
  ): AdminPatchStoreRequest => ({
    name: values.name.trim(),
    description: values.description.trim(),
    slug: values.slug.trim(),
    logo_url: toNullableString(mediaValues.logo_url),
    banner_url: toNullableString(mediaValues.banner_url),
    phone: toNullableString(values.phone),
    email: toNullableString(values.email),
    address: toNullableString(values.address),
    status: values.status,
  });

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setError('Проверьте правильность заполнения полей');
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});

      const uploadedMedia = await uploadStoreMedia({
        logoFile,
        bannerFile,
      });

      const mediaValues = {
        logo_url: uploadedMedia.logo_url ?? values.logo_url,
        banner_url: uploadedMedia.banner_url ?? values.banner_url,
      };

      if (props.role === 'seller' && props.mode === 'create') {
        await props.onSubmit(buildSellerCreatePayload(mediaValues));
      }

      if (props.role === 'seller' && props.mode === 'edit') {
        await props.onSubmit(buildSellerPatchPayload(mediaValues));
      }

      if (props.role === 'admin' && props.mode === 'create') {
        await props.onSubmit(buildAdminCreatePayload(mediaValues));
      }

      if (props.role === 'admin' && props.mode === 'edit') {
        await props.onSubmit(buildAdminPatchPayload(mediaValues));
      }

      onClose();
    } catch (err) {
      console.error(err);

      const apiError = parseApiError(err, 'Не удалось сохранить магазин');

      setError(apiError.message);
      setFieldErrors(apiError.fields);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Редактировать магазин' : 'Создать магазин'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {isAdminCreate && (
            <Autocomplete
              size="small"
              options={sellers}
              loading={isSellersLoading}
              value={selectedSeller}
              getOptionLabel={(seller) => `${seller.username} - ${seller.email}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, seller) => {
                handleChange('seller_id', seller?.id ?? '');
              }}
              renderOption={(optionProps, seller) => (
                <Box component="li" {...optionProps} key={seller.id}>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {seller.username}
                    </Typography>

                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                      {seller.email}
                    </Typography>
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Продавец"
                  placeholder="Выберите продавца"
                  required
                  error={Boolean(fieldErrors.seller_id)}
                  helperText={fieldErrors.seller_id}
                />
              )}
            />
          )}

          <TextField
            size="small"
            label="Название"
            value={values.name}
            required
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            onChange={(event) => {
              handleChange('name', event.target.value);
            }}
          />

          <TextField
            size="small"
            label="Описание"
            value={values.description}
            required
            multiline
            minRows={3}
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description}
            onChange={(event) => {
              handleChange('description', event.target.value);
            }}
          />

          <TextField
            size="small"
            label="Slug"
            value={values.slug}
            required
            error={Boolean(fieldErrors.slug)}
            helperText={fieldErrors.slug ?? 'Например: my-store'}
            onChange={(event) => {
              handleChange('slug', event.target.value);
            }}
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Логотип
            </Typography>

            {(logoPreviewUrl || values.logo_url) && (
              <Box
                component="img"
                src={logoPreviewUrl ?? values.logo_url}
                alt="Логотип магазина"
                sx={{
                  width: 96,
                  height: 96,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="outlined" component="label" disabled={isSubmitting}>
                Выбрать логотип
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setLogoFile(event.target.files?.[0] ?? null);
                  }}
                />
              </Button>

              {logoFile && (
                <Button
                  color="inherit"
                  onClick={() => {
                    setLogoFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Убрать файл
                </Button>
              )}
            </Stack>

            {logoFile && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Выбран файл: {logoFile.name}
              </Typography>
            )}

            <TextField
              size="small"
              label="Logo URL"
              value={values.logo_url}
              error={Boolean(fieldErrors.logo_url)}
              helperText={
                fieldErrors.logo_url ?? 'Можно вставить ссылку вручную или выбрать файл выше'
              }
              onChange={(event) => {
                handleChange('logo_url', event.target.value);
              }}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Баннер
            </Typography>

            {(bannerPreviewUrl || values.banner_url) && (
              <Box
                component="img"
                src={bannerPreviewUrl ?? values.banner_url}
                alt="Баннер магазина"
                sx={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="outlined" component="label" disabled={isSubmitting}>
                Выбрать баннер
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setBannerFile(event.target.files?.[0] ?? null);
                  }}
                />
              </Button>

              {bannerFile && (
                <Button
                  color="inherit"
                  onClick={() => {
                    setBannerFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Убрать файл
                </Button>
              )}
            </Stack>

            {bannerFile && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Выбран файл: {bannerFile.name}
              </Typography>
            )}

            <TextField
              size="small"
              label="Banner URL"
              value={values.banner_url}
              error={Boolean(fieldErrors.banner_url)}
              helperText={
                fieldErrors.banner_url ?? 'Можно вставить ссылку вручную или выбрать файл выше'
              }
              onChange={(event) => {
                handleChange('banner_url', event.target.value);
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              value={values.email}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              onChange={(event) => {
                handleChange('email', event.target.value);
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Телефон"
              value={values.phone}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone}
              onChange={(event) => {
                handleChange('phone', event.target.value);
              }}
            />
          </Stack>

          <TextField
            size="small"
            label="Адрес"
            value={values.address}
            error={Boolean(fieldErrors.address)}
            helperText={fieldErrors.address}
            onChange={(event) => {
              handleChange('address', event.target.value);
            }}
          />

          {isAdmin && (
            <FormControl size="small" error={Boolean(fieldErrors.status)}>
              <InputLabel>Статус</InputLabel>

              <Select
                label="Статус"
                value={values.status}
                onChange={(event) => {
                  handleChange('status', event.target.value as StoreStatus);
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>

              {fieldErrors.status && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                  {fieldErrors.status}
                </Typography>
              )}
            </FormControl>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>

        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}