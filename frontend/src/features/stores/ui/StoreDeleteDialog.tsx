import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';

import type { Store } from '../model/types';

type StoreDeleteDialogProps = {
  store: Store | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function StoreDeleteDialog({ store, loading, onClose, onConfirm }: StoreDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(store)}
      title="Удалить магазин?"
      description={
        <>
          Магазин <strong>{store?.name}</strong> будет удален. Это действие нельзя отменить.
        </>
      }
      loading={loading}
      confirmText="Удалить"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}