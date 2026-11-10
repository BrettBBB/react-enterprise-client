import { render, screen, within } from '@testing-library/react'
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

test('opens Medical Cost Control on Overview and follows a section link', async () => {
  const user = userEvent.setup()
  render(<AppShell />)

  await user.click(screen.getByRole('button', { name: 'Medical Cost Control' }))

  expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText(/scores billed claims against procedure and diagnosis reference data/)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Cost Control API' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'React display' })).toBeInTheDocument()

  await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Procedures' }))

  expect(screen.getByRole('heading', { name: 'Procedures' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Procedures' })).toHaveAttribute('aria-current', 'page')
})

test('lets a guest read Medical Cost Control without changing it', async () => {
  auth.user = null
  const user = userEvent.setup()
  render(<AppShell />)

  await user.click(screen.getByRole('button', { name: 'Medical Cost Control' }))

  expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument()
  expect(screen.getByText('Guest')).toBeInTheDocument()

  await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Claim Rules' }))

  expect(screen.getByRole('heading', { name: 'Claim Rules' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add rule' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument()
})

test('lets a signed-in member read Medical Cost Control without changing it', async () => {
  auth.user = { ...ada, isAdmin: false }
  const user = userEvent.setup()
  render(<AppShell />)

  await user.click(screen.getByRole('button', { name: 'Medical Cost Control' }))

  expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  expect(screen.queryByText(/limited to administrators/)).not.toBeInTheDocument()

  await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Claim Rules' }))

  expect(screen.getByRole('heading', { name: 'Claim Rules' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add rule' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument()
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
  expect(screen.getByText('401 Unauthenticated')).toBeInTheDocument()
  expect(screen.getByText(/Welcome, Guest/)).toBeInTheDocument()
  expect(screen.getByText(`© ${new Date().getFullYear()} Brett Brinkhoff`)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'API docs' })).toHaveAttribute(
    'href',
    `${import.meta.env.VITE_API_URL}/api`,
  )
  expect(screen.queryByRole('button', { name: 'API docs' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/brett-brinkhoff/',
  )
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/BrettBBB',
  )
  expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Contact' }))

  expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Users' }))

  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument()
})
