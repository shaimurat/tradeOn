import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';

import type { Store } from '../model/types';

type StoreActionsProps = {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
};

export function StoreActions({ store, onEdit, onDelete }: StoreActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Редактировать">
        <IconButton
          size="small"
          onClick={() => {
            onEdit(store);
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Удалить">
        <IconButton
          size="small"
          color="error"
          onClick={() => {
            onDelete(store);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}