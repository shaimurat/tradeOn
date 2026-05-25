import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/model/authStore';

import { AdminStoresPage } from './AdminStoresPage';
import { SellerStoresPage } from './SellerStoresPage';

export function StoresPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'admin') {
    return <AdminStoresPage />;
  }

  if (user?.role === 'seller') {
    return <SellerStoresPage />;
  }

  return <Navigate to="/dashboard" replace />;
}