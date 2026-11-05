import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import type { User } from '../users/types.ts'
import { AppShell } from './AppShell.tsx'

const ada: User = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  isAdmin: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const auth = vi.hoisted(() => ({
  user: null as User | null,
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  replaceSession: vi.fn(),
}))

vi.mock('../auth/auth-context.ts', () => ({
  useAuth: () => auth,
}))

vi.mock('../users/users-api.ts', () => ({
  listUsers: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

beforeEach(() => {
  auth.user = ada
  auth.logout.mockReset()
  auth.login.mockReset()
  auth.register.mockReset()
})

test('opens on Home and keeps the navigation while switching to Users', async () => {
  const user = userEvent.setup()
  render(<AppShell />)

  expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  expect(screen.getByText(/Welcome, Ada Lovelace/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Users' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Users' }))

  expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument()
  expect(await screen.findByRole('button', { name: 'Add user' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
})

test('keeps a signed-in user who is not an administrator out of Users', async () => {
  auth.user = { ...ada, isAdmin: false }
  const user = userEvent.setup()
  render(<AppShell />)

  await user.click(screen.getByRole('button', { name: 'Users' }))

  expect(screen.getByText(/limited to administrators/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()
})

test('shows a guest on Home and asks them to sign in before Users', async () => {
  auth.user = null
  const user = userEvent.setup()
  render(<AppShell />)

  expect(screen.getByText('Guest')).toBeInTheDocument()
  expect(screen.getByText(/Welcome, Guest/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Users' }))

  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()
})
