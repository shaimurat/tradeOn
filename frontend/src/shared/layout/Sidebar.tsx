import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useLocation, useNavigate } from 'react-router-dom';

import { navigationItems } from '../config/navigation';
import { useAuthStore } from '../../features/auth/model/authStore';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  width: number;
};

export function Sidebar({ open, onClose, width }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const availableNavigationItems = navigationItems.filter((item) => {
  if (!user?.role) return false;

  return item.roles.includes(user.role);
});

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          px: 2,
          py: 2,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          T
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            TradeOn
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Seller Platform
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <List
        sx={{
          px: 1.5,
          py: 2.5,
          flexGrow: 1,
        }}
      >
{availableNavigationItems.map((item) => {
            const Icon = item.icon;

          const selected =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                mb: 0.5,
                minHeight: 38,
                borderRadius: 1.5,
                px: 1,
                color: 'text.primary',

                '&:hover': {
                  bgcolor: 'secondary.main',
                },

                '&.Mui-selected': {
                  bgcolor: 'secondary.main',
                  color: 'text.primary',

                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },

                  '& .MuiListItemIcon-root': {
                    color: 'text.primary',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: selected ? 'text.primary' : 'text.secondary',
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: 14,
                    fontWeight: selected ? 700 : 500,
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box
        onClick={() => navigate('/profile')}
        sx={{
          mx: 1.5,
          mb: 1.5,
          p: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',

          '&:hover': {
            bgcolor: 'secondary.main',
          },
        }}
      >
        <Avatar
          src={user?.avatar_url ?? undefined}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {user?.username?.[0]?.toUpperCase() ?? 'N'}
        </Avatar>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {user?.username ?? 'John Doe'}
          </Typography>

          <Typography
            variant="caption"
            noWrap
            sx={{
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {user?.role ?? 'Seller'}
          </Typography>
        </Box>

        <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },
          width,
          flexShrink: 0,

          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },

          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}