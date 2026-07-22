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
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useLocation, useNavigate } from 'react-router-dom';

import { navigationItems } from '../config/navigation';
import { useAuthStore } from '../../features/auth/model/authStore';

type SidebarProps = {
  open: boolean;
  desktopOpen: boolean;
  onClose: () => void;
  width: number;
};

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  seller: 'Продавец',
  user: 'Пользователь',
  client: 'Клиент',
};

const COLLAPSED_WIDTH = 64;
const SIDEBAR_TRANSITION_MS = 240;

const contentTransition = `opacity ${SIDEBAR_TRANSITION_MS - 40}ms ease, max-width ${SIDEBAR_TRANSITION_MS}ms ease`;

export function Sidebar({ open, desktopOpen, onClose, width }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  const availableNavigationItems = navigationItems.filter((item) => {
    if (!user?.role) return false;

    return item.roles.includes(user.role);
  });

  const sidebarContent = (expanded: boolean) => (
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
        spacing={0}
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
            flexShrink: 0,
          }}
        >
          T
        </Box>

        <Box
          sx={{
            minWidth: 0,
            maxWidth: expanded ? 170 : 0,
            ml: expanded ? 1.25 : 0,
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: `${contentTransition}, margin ${SIDEBAR_TRANSITION_MS}ms ease`,
          }}
        >
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
            Платформа для продавцов
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <List
        sx={{
          px: 1,
          py: 2.5,
          flexGrow: 1,
        }}
      >
        {availableNavigationItems.map((item) => {
          const Icon = item.icon;

          const selected =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Tooltip key={item.path} title={expanded ? '' : item.label} placement="right">
              <ListItemButton
                selected={selected}
                aria-label={item.label}
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
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: selected ? 'text.primary' : 'text.secondary',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  sx={{
                    minWidth: 0,
                    maxWidth: expanded ? 160 : 0,
                    ml: expanded ? 0 : 0,
                    opacity: expanded ? 1 : 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: contentTransition,
                    '& .MuiTypography-root': {
                      fontSize: 14,
                      fontWeight: selected ? 700 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box
        onClick={() => navigate('/profile')}
        sx={{
          mx: 1,
          mb: 1.5,
          p: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
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
            flexShrink: 0,
          }}
        >
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </Avatar>

        <Box
          sx={{
            minWidth: 0,
            maxWidth: expanded ? 150 : 0,
            ml: expanded ? 1 : 0,
            flexGrow: expanded ? 1 : 0,
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: `${contentTransition}, margin ${SIDEBAR_TRANSITION_MS}ms ease`,
          }}
        >
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {user?.username ?? 'Пользователь'}
          </Typography>

          <Typography
            variant="caption"
            noWrap
            sx={{
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {user?.role ? (roleLabels[user.role] ?? user.role) : 'Продавец'}
          </Typography>
        </Box>

        <KeyboardArrowRightIcon
          sx={{
            width: expanded ? 18 : 0,
            ml: expanded ? 0.5 : 0,
            opacity: expanded ? 1 : 0,
            fontSize: 18,
            color: 'text.secondary',
            overflow: 'hidden',
            transition: `${contentTransition}, margin ${SIDEBAR_TRANSITION_MS}ms ease`,
          }}
        />
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
          width: desktopOpen ? width : COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create('width', {
              duration: SIDEBAR_TRANSITION_MS,
              easing: theme.transitions.easing.sharp,
            }),

          '& .MuiDrawer-paper': {
            width: desktopOpen ? width : COLLAPSED_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: SIDEBAR_TRANSITION_MS,
                easing: theme.transitions.easing.sharp,
              }),
          },
        }}
      >
        {sidebarContent(desktopOpen)}
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
        {sidebarContent(true)}
      </Drawer>
    </>
  );
}
