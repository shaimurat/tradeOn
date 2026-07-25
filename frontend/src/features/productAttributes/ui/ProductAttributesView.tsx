import { Alert, Box, Divider, Stack, Typography } from '@mui/material';
import type {
  ProductAttribute,
  ProductAttributeOption,
  ProductAttributeValue,
} from '../model/types';

type Props = {
  attributes?: ProductAttribute[];
  optionsByAttribute?: Record<string, ProductAttributeOption[]>;
  values?: ProductAttributeValue[];
  emptyMessage?: string;
};

function formatAttributeValue(
  attribute: ProductAttribute,
  value: ProductAttributeValue,
  options: ProductAttributeOption[]
) {
  if (attribute.type === 'bool' && value.value_bool !== undefined && value.value_bool !== null) {
    return value.value_bool ? 'Да' : 'Нет';
  }
  if (attribute.type === 'number' && value.value_number !== undefined && value.value_number !== null) {
    return `${value.value_number}${attribute.unit ? ` ${attribute.unit}` : ''}`;
  }
  if (attribute.type === 'select' && value.option_id) {
    return options.find((option) => option.id === value.option_id)?.value ?? 'Вариант удалён';
  }
  return value.value_text ?? '—';
}

export function ProductAttributesView({
  attributes = [],
  optionsByAttribute = {},
  values = [],
  emptyMessage = 'Характеристики товара не указаны.',
}: Props) {
  const valueByAttribute = new Map(values.map((value) => [value.product_attribute_id, value]));
  const populatedAttributes = attributes.filter((attribute) => valueByAttribute.has(attribute.id));

  if (populatedAttributes.length === 0) {
    return <Alert severity="info">{emptyMessage}</Alert>;
  }

  return (
    <Stack divider={<Divider flexItem />}>
      {populatedAttributes.map((attribute) => {
        const value = valueByAttribute.get(attribute.id);
        if (!value) return null;
        return (
          <Stack
            key={attribute.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0.5}
            sx={{ justifyContent: 'space-between', py: 1.25 }}
          >
            <Typography variant="body2" color="text.secondary">
              {attribute.name}
            </Typography>
            <Box sx={{ minWidth: 0, textAlign: { sm: 'right' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                {formatAttributeValue(
                  attribute,
                  value,
                  optionsByAttribute[attribute.id] ?? []
                )}
              </Typography>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
