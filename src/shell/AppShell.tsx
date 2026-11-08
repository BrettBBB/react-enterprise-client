import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { lazy, Suspense, useState } from 'react';
import { apiUrl } from '../api/client.ts';
import { LoginPage } from '../auth/LoginPage.tsx';
import { useAuth } from '../auth/auth-context.ts';
import { HomePage } from '../home/HomePage.tsx';
import { SessionInspector } from './SessionInspector.tsx';
import './AppShell.css';

const UsersPage = lazy(() =>
  import('../users/UsersPage.tsx').then((module) => ({ default: module.UsersPage })),
);

const drawerWidth = 280;

const pages = [
  { id: 'home', label: 'Home', icon: <HomeOutlinedIcon /> },
  { id: 'users', label: 'Users', icon: <PeopleOutlinedIcon /> },
] as const;

type PageId = (typeof pages)[number]['id'];

export function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageId>('home');
  const [showSignIn, setShowSignIn] = useState(false);
  const needsAuth = !user && (showSignIn || page === 'users');
  const current = pages.find((item) => item.id === page) ?? pages[0];
  const canManageUsers = user?.isAdmin === true;

  function signOut() {
    setShowSignIn(false);
    setPage('home');
    logout();
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <div className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              BB
            </span>
            <span className="app-brand-text">
              <span className="app-brand-name">Brett Brinkhoff</span>
              <span className="app-brand-role">Full-Stack Architect</span>
            </span>
          </div>
          <Typography component="h1" className="app-page-title">
            {needsAuth ? 'Sign in' : current.label}
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </Typography>
          {user ? (
            <Button className="app-account-button" color="inherit" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button className="app-account-button" color="inherit" onClick={() => setShowSignIn(true)}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        <div className="app-sidebar">
          <nav className="app-nav" aria-label="Primary">
            {pages.map((item) => {
              const selected = item.id === page
              return (
                <button
                  key={item.id}
                  type="button"
                  className="app-nav-item"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => setPage(item.id)}
                >
                  {item.icon}
                  <span className="app-nav-label">{item.label}</span>
                  {item.id === 'users' ? (
                    <span className="app-nav-badge" aria-hidden="true">
                      RBAC
                    </span>
                  ) : null}
                  {selected ? <span className="app-nav-dot" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </nav>
          <SessionInspector />
        </div>
      </Drawer>

      <Box
        component="main"
        sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}
      >
        <PageFrame page={page} needsAuth={needsAuth} canManageUsers={canManageUsers} />
      </Box>
      </Box>
      <footer className="app-footer">
        <p className="app-footer-copy">© {new Date().getFullYear()} Brett Brinkhoff</p>
        <nav className="app-footer-links" aria-label="Footer links">
          <a href={`${apiUrl}/api`} target="_blank" rel="noreferrer">
            <DescriptionOutlinedIcon className="app-footer-icon" aria-hidden />
            API docs
          </a>
          <a
            href="https://www.linkedin.com/in/brett-brinkhoff/"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon className="app-footer-icon" aria-hidden />
            LinkedIn
          </a>
          <a href="https://github.com/BrettBBB" target="_blank" rel="noreferrer">
            <GitHubIcon className="app-footer-icon" aria-hidden />
            GitHub
          </a>
        </nav>
      </footer>
    </Box>
  );
}

function PageFrame({
  page,
  needsAuth,
  canManageUsers,
}: {
  page: PageId;
  needsAuth: boolean;
  canManageUsers: boolean;
}) {
  if (needsAuth) {
    return <LoginPage />;
  }

  if (page === 'home') {
    return <HomePage />;
  }

  if (!canManageUsers) {
    return (
      <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
        The user directory is limited to administrators.
      </Typography>
    );
  }

  return (
    <Suspense fallback={<Typography component="p">Loading directory…</Typography>}>
      <UsersPage />
    </Suspense>
  );
}
