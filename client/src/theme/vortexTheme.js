import { createTheme } from '@mui/material/styles';

// Helper to get CSS variable value (only works at runtime, so we might need hardcoded values for some MUI internals if they need JS access immediately, but for palette we can often use var())
// However, MUI palette often expects hex strings for calculations (like alpha). 
// For best results, I will use the hex values provided in the prompt directly in the JS theme, 
// ensuring consistency with the CSS variables.

const vortexColors = {
  primary: '#0066CC',
  primaryDark: '#004C99',
  primaryLight: '#3399FF',
  accent: '#00A8E8',
  accentLight: '#33BFEF',
  gray900: '#1A1A1A',
  gray800: '#2C3E50',
  gray700: '#495057',
  gray100: '#F8F9FA',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',
  textPrimaryLight: '#2C3E50',
  textSecondaryLight: '#6C757D',
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#ADB5BD',
  bgPrimaryLight: '#FFFFFF',
  bgSecondaryLight: '#F8F9FA',
  bgPrimaryDark: '#1A1A1A',
  bgSecondaryDark: '#2C3E50',
};

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: vortexColors.primary,
      dark: vortexColors.primaryDark,
      light: vortexColors.primaryLight,
    },
    secondary: {
      main: vortexColors.accent,
      light: vortexColors.accentLight,
    },
    error: {
      main: vortexColors.danger,
    },
    warning: {
      main: vortexColors.warning,
    },
    info: {
      main: vortexColors.info,
    },
    success: {
      main: vortexColors.success,
    },
    background: {
      default: mode === 'dark' ? vortexColors.bgPrimaryDark : vortexColors.bgPrimaryLight,
      paper: mode === 'dark' ? vortexColors.bgSecondaryDark : vortexColors.bgSecondaryLight,
    },
    text: {
      primary: mode === 'dark' ? vortexColors.textPrimaryDark : vortexColors.textPrimaryLight,
      secondary: mode === 'dark' ? vortexColors.textSecondaryDark : vortexColors.textSecondaryLight,
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif" },
    h2: { fontFamily: "'Poppins', sans-serif" },
    h3: { fontFamily: "'Poppins', sans-serif" },
    h4: { fontFamily: "'Poppins', sans-serif" },
    h5: { fontFamily: "'Poppins', sans-serif" },
    h6: { fontFamily: "'Poppins', sans-serif" },
  },
  shape: {
    borderRadius: 8, // radius-md
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.5rem',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default gradient in dark mode
        },
      },
    },
  },
});
