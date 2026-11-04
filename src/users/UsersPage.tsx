import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { apiUrl } from '../api/client.ts';
import { useAuth } from '../auth/auth-context.ts';
import type { User, UserInput } from './types.ts';
import { UserFormDialog } from './UserFormDialog.tsx';
import { useUsers } from './useUsers.ts';

function formatWhen(value: string) {
  return new Date(value).toLocaleString();
}

export function UsersPage() {
  const { user: session, logout, replaceSession } = useAuth();
  const { users, loading, error, refresh, createUser, updateUser, deleteUser } =
    useUsers(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns = useMemo<GridColDef<User>[]>(
    () => [
      { field: 'firstName', headerName: 'First name', flex: 1, minWidth: 130 },
      { field: 'lastName', headerName: 'Last name', flex: 1, minWidth: 130 },
      { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 200 },
      {
        field: 'age',
        headerName: 'Age',
        width: 90,
        valueFormatter: (value: number | null | undefined) =>
          value == null ? '' : String(value),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        minWidth: 180,
        flex: 1,
        valueFormatter: (value: string) => formatWhen(value),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        minWidth: 180,
        flex: 1,
        valueFormatter: (value: string) => formatWhen(value),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 110,
        renderCell: ({ row }) => (
          <Stack direction="row">
            <IconButton
              aria-label={`Edit ${row.firstName} ${row.lastName}`}
              onClick={() => setEditing(row)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label={`Delete ${row.firstName} ${row.lastName}`}
              onClick={() => setPendingDelete(row)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [],
  );

  async function saveUser(input: UserInput) {
    setActionError(null);
    if (editing) {
      const updated = await updateUser(editing.id, input);
      if (session?.id === updated.id) {
        replaceSession(updated);
      }
      setEditing(null);
      return;
    }

    await createUser(input);
    setCreating(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    setActionError(null);
    try {
      await deleteUser(pendingDelete.id);
      setPendingDelete(null);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Enterprise users
          </Typography>
          {session ? (
            <Typography sx={{ mr: 2 }}>
              {session.firstName} {session.lastName}
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

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography color="text.secondary">
            Records from <code>GET /users</code>. That route requires the access token issued at sign-in.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => void refresh()} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
              Add user
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}

        <Box sx={{ flex: 1, minHeight: 420 }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            showToolbar
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      </Stack>

      <UserFormDialog
        key={editing?.id ?? (creating ? 'create' : 'idle')}
        open={creating || editing !== null}
        user={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={saveUser}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={deleting ? undefined : () => setPendingDelete(null)}
      >
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {pendingDelete?.firstName} {pendingDelete?.lastName}? This removes the account from the API.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
