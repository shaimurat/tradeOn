import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/model/authStore';
import { authApi } from '../../features/auth/api/authApi';
import { navigationItems } from '../config/navigation';

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const activeItem = navigationItems.find((item) => {
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  });

  const title = activeItem?.label ?? 'Панель управления';
  const sidebarButtonLabel =
    isDesktop && sidebarOpen ? 'Свернуть боковую панель' : 'Развернуть боковую панель';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 56,
          px: {
            xs: 1.5,
            md: 2.5,
          },
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Tooltip title={sidebarButtonLabel} placement="bottom">
            <IconButton
              onClick={onToggleSidebar}
              aria-label={sidebarButtonLabel}
              aria-expanded={isDesktop ? sidebarOpen : undefined}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'secondary.main' },
              }}
            >
              {isDesktop && sidebarOpen ? (
                <MenuOpenIcon sx={{ fontSize: 21 }} />
              ) : (
                <MenuIcon sx={{ fontSize: 21 }} />
              )}
            </IconButton>
          </Tooltip>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="Уведомления">
            <IconButton aria-label="Уведомления">
              <Badge
                variant="dot"
                color="primary"
                overlap="circular"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Аккаунт">
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ p: 0.25 }}
              aria-label="Аккаунт"
            >
              <Avatar
                src={user?.avatar_url ?? undefined}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'secondary.main',
                  color: 'text.primary',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {user?.username?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 220,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{user?.username ?? 'Пользователь'}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {user?.email ?? 'user@tradeon.kz'}
              </Typography>
            </Box>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/profile');
              }}
            >
              <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
              Профиль
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/settings');
              }}
            >
              <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
              Настройки
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              Выйти
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </Box>
  );
}
