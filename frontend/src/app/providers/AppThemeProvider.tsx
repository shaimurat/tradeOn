import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { ReactNode } from 'react';

type AppThemeProviderProps = {
  children: ReactNode;
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111111',
      light: '#2A2A2A',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F4F4F5',
      light: '#FAFAFA',
      dark: '#E4E4E7',
      contrastText: '#111111',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111',
      secondary: '#52525B',
      disabled: '#A1A1AA',
    },
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#16A34A',
    },
    warning: {
      main: '#D97706',
    },
    divider: '#E5E7EB',
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.15,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: 1.35,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.8125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.45,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          minHeight: '100%',
        },
        body: {
          width: '100%',
          minHeight: '100vh',
          margin: 0,
          backgroundColor: '#FAFAFA',
        },
        '#root': {
          width: '100%',
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          borderRadius: 14,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}