import { useAuthStore } from '../../features/auth/model/authStore';

import { AdminDashboardPage } from './AdminDashboardPage';
import { SellerDashboardPage } from './SellerDashboardPage';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'admin') {
    return <AdminDashboardPage />;
  }

  if (user?.role === 'seller') {
    return <SellerDashboardPage />;
  }

  return null;
}
