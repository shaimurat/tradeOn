import type { AlertColor } from '@mui/material';
import { Alert, Snackbar } from '@mui/material';

export type AppNotification = {
  message: string;
  severity: AlertColor;
};

type NotificationSnackbarProps = {
  notification: AppNotification | null;
  autoHideDuration?: number;
  onClose: () => void;
};

export function NotificationSnackbar({
  notification,
  autoHideDuration = 4000,
  onClose,
}: NotificationSnackbarProps) {
  return (
    <Snackbar
      open={Boolean(notification)}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Alert
        severity={notification?.severity || 'info'}
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
}