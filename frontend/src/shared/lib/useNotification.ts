import { useState } from 'react';

import type { AppNotification } from '../ui/NotificationSnackbar';

export function useNotification() {
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const showNotification = (notification: AppNotification) => {
    setNotification(notification);
  };

  const showSuccessNotification = (message: string) => {
    setNotification({
      severity: 'success',
      message,
    });
  };

  const showErrorNotification = (message: string) => {
    setNotification({
      severity: 'error',
      message,
    });
  };

  const showInfoNotification = (message: string) => {
    setNotification({
      severity: 'info',
      message,
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    closeNotification,
  };
}