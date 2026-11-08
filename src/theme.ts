import { createTheme } from '@mui/material/styles';

const slate = {
  background: '#0F172A',
  container: '#1E293B',
  accent: '#38BDF8',
  border: '#334155',
} as const;

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: slate.accent, contrastText: slate.background },
    divider: slate.border,
    background: {
      default: slate.background,
      paper: slate.container,
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: slate.border,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: slate.border,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid',
          borderColor: slate.border,
        },
      },
    },
  },
});
