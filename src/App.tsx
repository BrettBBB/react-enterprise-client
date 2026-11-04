import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { useAuth } from './auth/auth-context.ts';
import { LoginPage } from './auth/LoginPage.tsx';
import { theme } from './theme.ts';
import { UsersPage } from './users/UsersPage.tsx';

function AppShell() {
  const { user } = useAuth();
  return user ? <UsersPage /> : <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
