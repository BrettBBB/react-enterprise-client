import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { useAuth } from './auth/auth-context.ts';
import { LoginPage } from './auth/LoginPage.tsx';
import { theme } from './theme.ts';

const UsersPage = lazy(() =>
  import('./users/UsersPage.tsx').then((module) => ({ default: module.UsersPage })),
);

function AppShell() {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }

  return (
    <Suspense
      fallback={
        <Typography component="p" sx={{ p: 3 }}>
          Loading directory…
        </Typography>
      }
    >
      <UsersPage />
    </Suspense>
  );
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
