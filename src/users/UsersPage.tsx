import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  useGridApiRef,
  type GridColDef,
  type GridDataSource,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/auth-context.ts';
import type { User, UserInput } from './types.ts';
import { UserFormDialog } from './UserFormDialog.tsx';
import { useUsers } from './useUsers.ts';

function formatWhen(value: string) {
  return new Date(value).toLocaleString();
}

function formatDateCell(value: Date | string | null | undefined) {
  if (value == null || value === '') {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatWhen(date.toISOString());
}

export function UsersPage() {
  const apiRef = useGridApiRef();
  const { user: session, replaceSession } = useAuth();
  const { error, getRows, createUser, updateUser, deleteUser } = useUsers();
  const dataSource = useMemo<GridDataSource>(() => ({ getRows }), [getRows]);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function reload() {
    apiRef.current?.dataSource.cache.clear();
    await apiRef.current?.dataSource.fetchRows();
  }

  const columns = useMemo<GridColDef<User>[]>(
    () => [
      { field: 'firstName', headerName: 'First name', flex: 1, minWidth: 130 },
      { field: 'lastName', headerName: 'Last name', flex: 1, minWidth: 130 },
      { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 200 },
      {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 90,
        valueFormatter: (value: number | null | undefined) =>
          value == null ? '' : String(value),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        type: 'dateTime',
        minWidth: 180,
        flex: 1,
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        valueFormatter: (value: Date | string | null) => formatDateCell(value),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        type: 'dateTime',
        minWidth: 180,
        flex: 1,
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        valueFormatter: (value: Date | string | null) => formatDateCell(value),
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
      await reload();
      return;
    }

    await createUser(input);
    setCreating(false);
    await reload();
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
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography color="text.secondary">
            Each page, sort, and filter is requested from <code>GET /users</code>.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => void reload()}>Refresh</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
              Add user
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}

        <Box sx={{ flex: 1, minHeight: 420 }}>
          <DataGrid
            apiRef={apiRef}
            columns={columns}
            dataSource={dataSource}
            pagination
            filterDebounceMs={300}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
            }}
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
    </>
  );
}
