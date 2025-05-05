import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 600, letterSpacing: '-0.25px' },
    body1: { lineHeight: 1.6 }
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  transitions: {
    duration: { standard: 300 }
  }
});

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#1a73e8' },
    secondary: { main: '#6c5ce7' },
    background: { 
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  }
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#4dabf5' },
    secondary: { main: '#7c4dff' },
    background: { 
      default: '#121212',
      paper: '#1e1e1e'
    }
  }
});

export default lightTheme;