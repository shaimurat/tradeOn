import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_WIDTH = 256;

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        display: 'flex',
      }}
    >
      <Sidebar
        width={SIDEBAR_WIDTH}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: {
              xs: 2,
              md: 3,
            },
            py: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}