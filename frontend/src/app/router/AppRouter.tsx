import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from '../../pages/home/HomePage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { DashboardPage } from '../../pages/dashboard';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { StoresPage } from '../../pages/stores';

import { AuthProvider } from '../../features/auth/ui/AuthProvider';

import { ProtectedRoute } from './ProtectedRouter';
import { GuestRoute } from './GuestRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../../shared/layout/DashboardLayout';
import { ProductsPage } from '../../pages/products';
import { ProductCategoriesPage } from '../../pages/productCategories/ProductCategoriesPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },

  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },

          {
            path: '/profile',
            element: <ProfilePage />,
          },

          {
            element: <RoleRoute allowedRoles={['admin', 'seller']} />,
            children: [
              {
                path: '/stores',
                element: <StoresPage />,
              },
            ],
          },

          // Позже добавишь, когда будут страницы:
          // {
          //   element: <RoleRoute allowedRoles={['admin']} />,
          //   children: [
          //     {
          //       path: '/users',
          //       element: <UsersPage />,
          //     },
          //   ],
          // },

          {
            element: <RoleRoute allowedRoles={['seller']} />,
            children: [
              {
                path: '/products',
                element: <ProductsPage />,
              },
              // {
              //   path: '/orders',
              //   element: <OrdersPage />,
              // },
            ],
          },
          {
            element: <RoleRoute allowedRoles={['seller']} />,
            children: [
              {
                path: '/categories',
                element: <ProductCategoriesPage />,
              },
              // {
              //   path: '/orders',
              //   element: <OrdersPage />,
              // },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
