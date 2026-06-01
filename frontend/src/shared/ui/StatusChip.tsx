import { Chip } from '@mui/material';

import type { ProductStatus } from '../../features/products/model/types';
import { statusColorMap, statusLabelMap } from '../../features/products/lib/productConstants';

type StatusChipProps = {
  status: ProductStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      size="small"
      label={statusLabelMap[status]}
      color={statusColorMap[status]}
      variant={status === 'draft' ? 'outlined' : 'filled'}
      sx={{
        height: 22,
        fontSize: 11,
      }}
    />
  );
}
