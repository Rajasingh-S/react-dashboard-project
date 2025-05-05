import { createTheme } from '@mui/material/styles';

export const dashboardTheme = createTheme({
  palette: {
    primary: {
      main: '#4e79a7',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f28e2b',
      contrastText: '#ffffff'
    },
    error: {
      main: '#e15759'
    },
    success: {
      main: '#59a14f'
    },
    warning: {
      main: '#edc948'
    },
    info: {
      main: '#76b7b2'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.3rem',
      fontWeight: 500
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '0.95rem'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease-in-out'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8f9fa'
        },
        root: {
          borderBottom: '1px solid #e0e0e0'
        }
      }
    }
  }
});