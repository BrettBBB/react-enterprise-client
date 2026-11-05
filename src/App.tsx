import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { useAuth } from './auth/auth-context.ts';
import { LoginPage } from './auth/LoginPage.tsx';
import { AppShell } from './shell/AppShell.tsx';
import { theme } from './theme.ts';

function AppShellGate() {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShellGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
