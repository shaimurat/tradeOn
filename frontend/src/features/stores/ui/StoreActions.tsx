import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';

import type { Store } from '../model/types';

type StoreActionsProps = {
  store: Store;
  onView?: (store: Store) => void;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
};

export function StoreActions({ store, onView, onEdit, onDelete }: StoreActionsProps) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      sx={{ justifyContent: 'center' }}
    >
      {onView && (
        <Tooltip title="Посмотреть товары">
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              onView(store);
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

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
