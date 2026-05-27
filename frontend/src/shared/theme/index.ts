import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#4f46e5' : '#818cf8', // Indigo / Soft Indigo
        light: mode === 'light' ? '#6366f1' : '#a5b4fc',
        dark: mode === 'light' ? '#3730a3' : '#4f46e5',
      },
      secondary: {
        main: mode === 'light' ? '#9333ea' : '#c084fc', // Elegant purple
        light: mode === 'light' ? '#a855f7' : '#d8b4fe',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#030712', // Warm ash / Ultra deep space black-slate
        paper: mode === 'light' ? '#ffffff' : '#0b0f19',   // Crisp white / Rich high-end dark slate card
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
      error: {
        main: '#f43f5e', // Beautiful rose-red instead of pure standard red
        light: 'rgba(244, 63, 94, 0.1)',
      },
      warning: {
        main: '#f59e0b',
        light: 'rgba(245, 158, 11, 0.1)',
      },
      success: {
        main: '#10b981',
        light: 'rgba(16, 185, 129, 0.1)',
      },
      info: {
        main: '#3b82f6',
        light: 'rgba(59, 130, 246, 0.1)',
      },
      divider: mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
      h1: {
        fontSize: '2.25rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.25,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.2rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.35,
      },
      body1: {
        fontSize: '0.925rem',
        lineHeight: 1.6,
        letterSpacing: '-0.01em',
      },
      body2: {
        fontSize: '0.825rem',
        lineHeight: 1.5,
        letterSpacing: '-0.005em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.MuiButton-containedPrimary': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              color: '#ffffff',
              '&:hover': {
                background: mode === 'light'
                  ? 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#ffffff' : '#0b0f19',
            boxShadow: mode === 'light' 
              ? '0 10px 30px -10px rgba(79, 70, 229, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)' 
              : '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
            border: `1px solid ${mode === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)'}`,
            borderRadius: 14,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#ffffff' : '#0b0f19',
            boxShadow: mode === 'light'
              ? '0 10px 30px -10px rgba(0, 0, 0, 0.04)'
              : '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
            border: `1px solid ${mode === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)'}`,
            borderRadius: 14,
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
            borderRadius: 10,
            '& fieldset': {
              borderColor: mode === 'light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.25)',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#4f46e5' : '#818cf8',
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
  });
};
