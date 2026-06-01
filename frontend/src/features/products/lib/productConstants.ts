import type { ProductStatus } from '../model/types';

export const PRODUCT_LIMIT = 10;

export const statusOptions: ProductStatus[] = ['draft', 'active', 'inactive', 'blocked'];

export const statusColorMap: Record<ProductStatus, 'default' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  active: 'success',
  inactive: 'warning',
  blocked: 'error',
};

export const statusLabelMap: Record<ProductStatus, string> = {
  draft: 'Черновик',
  active: 'Активен',
  inactive: 'Неактивен',
  blocked: 'Заблокирован',
};
