import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '../api/client.ts';
import type { User, UserInput } from './types.ts';

type UserFormDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
};

function valuesFrom(user: User | null) {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    password: '',
    age: user?.age == null ? '' : String(user.age),
    isAdmin: user?.isAdmin ?? false,
  };
}

export function UserFormDialog({
  open,
  user,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const editing = user !== null;
  const [form, setForm] = useState(() => valuesFrom(user));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof ReturnType<typeof valuesFrom>, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const age = form.age.trim();
    const input: UserInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    };
    if (form.password) {
      input.password = form.password;
    }
    if (age) {
      input.age = Number(age);
    }
    if (editing) {
      input.isAdmin = form.isAdmin;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(input);
    } catch (caught) {
      setError(errorMessage(caught, 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogTitle>{editing ? 'Edit user' : 'Add user'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              required
              autoFocus
              fullWidth
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              required={!editing}
              slotProps={{ htmlInput: { minLength: form.password ? 8 : undefined } }}
              helperText={
                editing
                  ? 'Leave blank to keep the current password.'
                  : 'At least 8 characters.'
              }
              fullWidth
            />
            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(event) => update('age', event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 120 } }}
              helperText={editing ? 'Leave blank to keep the current age.' : 'Optional. 0 to 120.'}
              fullWidth
            />
            {editing ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isAdmin}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isAdmin: event.target.checked }))
                    }
                  />
                }
                label="Administrator"
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
