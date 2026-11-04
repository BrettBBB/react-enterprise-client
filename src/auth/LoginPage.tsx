import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useAuth } from './auth-context.ts';

type Mode = 'sign-in' | 'register';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  age: '',
};

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'sign-in') {
        await login(form.email.trim(), form.password);
        return;
      }

      const age = form.age.trim();
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(age ? { age: Number(age) } : {}),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  const registering = mode === 'register';

  return (
    <Stack
      component="main"
      sx={{ minHeight: '100%', alignItems: 'center', justifyContent: 'center', p: 2 }}
    >
      <Paper sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <div>
            <Typography variant="h4" component="h1">
              Enterprise
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {registering
                ? 'Create an account, then open the user directory.'
                : 'Sign in to view and edit users from the API.'}
            </Typography>
          </div>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {registering ? (
            <>
              <TextField
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={(event) => update('firstName', event.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={(event) => update('lastName', event.target.value)}
                required
                fullWidth
              />
            </>
          ) : null}

          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            required
            autoFocus={!registering}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete={registering ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            required
            slotProps={{ htmlInput: { minLength: 8 } }}
            helperText="At least 8 characters."
            fullWidth
          />

          {registering ? (
            <TextField
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={(event) => update('age', event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 120 } }}
              helperText="Optional. 0 to 120."
              fullWidth
            />
          ) : null}

          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setMode(registering ? 'sign-in' : 'register');
              setError(null);
            }}
          >
            {registering ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
