import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { lazy, Suspense, useState } from 'react';
import { apiUrl } from '../api/client.ts';
import { useAuth } from '../auth/auth-context.ts';
import { HomePage } from '../home/HomePage.tsx';

const UsersPage = lazy(() =>
  import('../users/UsersPage.tsx').then((module) => ({ default: module.UsersPage })),
);

const drawerWidth = 240;

const pages = [
  { id: 'home', label: 'Home', icon: <HomeOutlinedIcon /> },
  { id: 'users', label: 'Users', icon: <PeopleOutlinedIcon /> },
] as const;

type PageId = (typeof pages)[number]['id'];

export function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageId>('home');
  const current = pages.find((item) => item.id === page) ?? pages[0];

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {current.label}
          </Typography>
          {user ? (
            <Typography sx={{ mr: 2 }}>
              {user.firstName} {user.lastName}
            </Typography>
          ) : null}
          <Button color="inherit" href={`${apiUrl}/api`} target="_blank" rel="noreferrer">
            API docs
          </Button>
          <Button color="inherit" onClick={logout}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="p">
            Enterprise
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {pages.map((item) => (
            <ListItemButton
              key={item.id}
              selected={item.id === page}
              onClick={() => setPage(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 3 }}>
          <PageFrame page={page} />
        </Box>
      </Box>
    </Box>
  );
}

function PageFrame({ page }: { page: PageId }) {
  if (page === 'home') {
    return <HomePage />;
  }

  return (
    <Suspense fallback={<Typography component="p">Loading directory…</Typography>}>
      <UsersPage />
    </Suspense>
  );
}
