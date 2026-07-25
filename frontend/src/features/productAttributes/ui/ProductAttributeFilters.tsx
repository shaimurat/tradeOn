import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { ProductAttribute, ProductAttributeOption } from '../model/types';

type Props = {
  attributes: ProductAttribute[];
  optionsByAttribute: Record<string, ProductAttributeOption[]>;
  values: Record<string, string>;
  onChange: (attributeID: string, value: string) => void;
  alignWithCategory?: boolean;
};

export function ProductAttributeFilters({
  attributes,
  optionsByAttribute,
  values,
  onChange,
  alignWithCategory = false,
}: Props) {
  if (attributes.length === 0) return null;

  return (
    <>
      {attributes.map((attribute) => {
        const isSelect = attribute.type === 'select' || attribute.type === 'bool';
        return (
          <Grid
            key={attribute.id}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Stack spacing={0.5}>
              {alignWithCategory && (
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: 'text.primary', fontWeight: 700 }}
                >
                  {attribute.name}
                </Typography>
              )}
              <TextField
                select={isSelect}
                fullWidth
                size="small"
                type={attribute.type === 'number' ? 'number' : 'text'}
                label={alignWithCategory ? undefined : attribute.name}
                placeholder={alignWithCategory ? attribute.name : undefined}
                value={values[attribute.id] ?? ''}
                onChange={(event) => onChange(attribute.id, event.target.value)}
                helperText={attribute.unit ? `Единица: ${attribute.unit}` : undefined}
              >
                {isSelect && <MenuItem value="">Все значения</MenuItem>}
                {attribute.type === 'bool' && [
                  <MenuItem key="true" value="true">Да</MenuItem>,
                  <MenuItem key="false" value="false">Нет</MenuItem>,
                ]}
                {attribute.type === 'select' &&
                  (optionsByAttribute[attribute.id] ?? []).map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.value}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </Grid>
        );
      })}
    </>
  );
}
