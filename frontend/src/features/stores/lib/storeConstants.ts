import type { StoreStatus } from '../model/types';

export const storeStatusLabel: Record<StoreStatus, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
  blocked: 'Заблокирован',
  moderation: 'На модерации',
};

export const storeStatusColor: Record<StoreStatus, 'success' | 'default' | 'error' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  blocked: 'error',
  moderation: 'warning',
};