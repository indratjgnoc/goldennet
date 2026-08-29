import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#15803D',
      contrastText: '#050505',
    },

    secondary: {
      main: '#A3E635',
      light: '#BEF264',
      dark: '#65A30D',
      contrastText: '#050505',
    },

    background: {
      default: '#050705',
      paper: '#0D120F',
    },

    text: {
      primary: '#F5F7F6',
      secondary: '#A7B0AA',
    },

    divider: 'rgba(255,255,255,0.08)',
  },

  typography: {
    fontFamily: 'var(--font-inter), Arial, sans-serif',

    h1: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },

    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },

    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },

    h4: {
      fontWeight: 700,
    },

    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.07)',
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
  },
});

export default theme;