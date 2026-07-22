import { Chip } from '@mui/material';

import { userStatusColors, userStatusLabels } from '../lib/userConstants';
import type { UserStatus } from '../model/types';

type UserStatusChipProps = {
  status: UserStatus;
};

export function UserStatusChip({ status }: UserStatusChipProps) {
  return (
    <Chip
      label={userStatusLabels[status]}
      color={userStatusColors[status]}
      variant="outlined"
      size="small"
    />
  );
}
