import { Alert, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import type { ProductAttribute, ProductAttributeOption } from '../model/types';

export type ProductAttributeFormValues = Record<string, string | boolean>;

type Props = {
  attributes: ProductAttribute[];
  optionsByAttribute: Record<string, ProductAttributeOption[]>;
  values: ProductAttributeFormValues;
  loading: boolean;
  disabled: boolean;
  onChange: (attributeID: string, value: string | boolean) => void;
};

export function ProductAttributeFields({
  attributes,
  optionsByAttribute,
  values,
  loading,
  disabled,
  onChange,
}: Props) {
  if (loading) {
    return <CircularProgress size={24} />;
  }
  if (attributes.length === 0) {
    return (
      <Alert severity="info">
        Для выбранной категории атрибуты не настроены. Их можно добавить на странице «Атрибуты».
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {attributes.map((attribute) => {
        const value = values[attribute.id] ?? '';
        if (attribute.type === 'bool' || attribute.type === 'select') {
          return (
            <TextField
              key={attribute.id}
              select
              fullWidth
              size="small"
              label={attribute.name}
              value={String(value)}
              required={attribute.is_required}
              disabled={disabled}
              helperText={attribute.unit ? `Единица: ${attribute.unit}` : undefined}
              onChange={(event) =>
                onChange(
                  attribute.id,
                  attribute.type === 'bool' ? event.target.value === 'true' : event.target.value
                )
              }
            >
              {!attribute.is_required && <MenuItem value="">Не указано</MenuItem>}
              {attribute.type === 'bool' ? (
                [
                  <MenuItem key="true" value="true">Да</MenuItem>,
                  <MenuItem key="false" value="false">Нет</MenuItem>,
                ]
              ) : (
                (optionsByAttribute[attribute.id] ?? []).map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.value}
                  </MenuItem>
                ))
              )}
            </TextField>
          );
        }
        return (
          <TextField
            key={attribute.id}
            fullWidth
            size="small"
            type={attribute.type === 'number' ? 'number' : 'text'}
            label={attribute.name}
            value={String(value)}
            required={attribute.is_required}
            disabled={disabled}
            helperText={attribute.unit ? `Единица: ${attribute.unit}` : undefined}
            onChange={(event) => onChange(attribute.id, event.target.value)}
          />
        );
      })}
    </Stack>
  );
}
