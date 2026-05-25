import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import type { UserRole } from '../../features/users/model/types';

export type NavigationItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Overview',
    path: '/dashboard',
    icon: GridViewOutlinedIcon,
    roles: ['admin', 'seller'],
  },
  {
    label: 'Stores',
    path: '/stores',
    icon: StorefrontOutlinedIcon,
    roles: ['admin', 'seller'],
  },
  {
    label: 'Products',
    path: '/products',
    icon: Inventory2OutlinedIcon,
    roles: ['admin', 'seller'],
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: CategoryOutlinedIcon,
    roles: ['admin', 'seller'],
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingCartOutlinedIcon,
    roles: ['admin', 'seller'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: PeopleAltOutlinedIcon,
    roles: ['admin'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsOutlinedIcon,
    roles: ['admin', 'seller'],
  },
];
