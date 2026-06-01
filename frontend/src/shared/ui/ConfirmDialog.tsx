import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  loading = false,
  confirmColor = 'error',
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>

      <DialogContent>
        {typeof description === 'string' ? (
          <Typography color="text.secondary">{description}</Typography>
        ) : (
          description
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button disabled={loading} onClick={handleClose}>
          {cancelText}
        </Button>

        <Button
          color={confirmColor}
          variant="contained"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}