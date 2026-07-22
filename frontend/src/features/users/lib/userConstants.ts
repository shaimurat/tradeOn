import type { UserRole, UserStatus } from '../model/types';

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  seller: 'Продавец',
  client: 'Клиент',
};

export const userStatusLabels: Record<UserStatus, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
  blocked: 'Заблокирован',
};

export const userStatusColors: Record<UserStatus, 'success' | 'default' | 'error'> = {
  active: 'success',
  inactive: 'default',
  blocked: 'error',
};

export const userRoleOptions = Object.entries(userRoleLabels) as Array<[UserRole, string]>;
export const userStatusOptions = Object.entries(userStatusLabels) as Array<[UserStatus, string]>;
