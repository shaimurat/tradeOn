import { Chip } from '@mui/material';

import { storeStatusColor, storeStatusLabel } from '../lib/storeConstants';

import type { StoreStatus } from '../model/types';

type StoreStatusChipProps = {
  status: StoreStatus;
};

export function StoreStatusChip({ status }: StoreStatusChipProps) {
  return (
    <Chip
      label={storeStatusLabel[status]}
      color={storeStatusColor[status]}
      variant="outlined"
      size="small"
    />
  );
}