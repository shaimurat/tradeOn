import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/model/authStore';
import type { UserRole } from '../../features/users/model/types';

type RoleRouteProps = {
  allowedRoles: UserRole[];
};

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
