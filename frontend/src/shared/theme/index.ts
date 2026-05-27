import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#4f46e5' : '#6366f1', // Royal Indigo
        light: '#818cf8',
        dark: '#3730a3',
      },
      secondary: {
        main: mode === 'light' ? '#a855f7' : '#c084fc', // Purple Accent
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a', // Sleek slate / deep slate
        paper: mode === 'light' ? '#ffffff' : '#1e293b', // White / sleek dark grey
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      success: {
        main: '#10b981',
      },
      divider: mode === 'light' ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontSize: '1.35rem',
        fontWeight: 600,
        letterSpacing: '-0.015em',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' 
              : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
            border: `1px solid ${mode === 'light' ? '#f1f5f9' : '#334155'}`,
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
};
