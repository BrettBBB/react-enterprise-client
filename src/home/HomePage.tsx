import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '../auth/auth-context.ts';

export function HomePage() {
  const { user } = useAuth();
  const name = user ? `${user.firstName} ${user.lastName}` : 'Guest';

  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      <Typography variant="h5" component="p">
        Welcome, {name}
      </Typography>
      <Typography color="text.secondary">
        {user?.isAdmin
          ? 'Open Users in the left navigation to work with the directory. The grid asks the API for each page, sort, and filter.'
          : 'This is the home page. The user directory is limited to administrators.'}
      </Typography>
    </Stack>
  );
}
