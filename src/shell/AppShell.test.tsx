import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { AppShell } from './AppShell.tsx'

vi.mock('../auth/auth-context.ts', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    logout: vi.fn(),
    replaceSession: vi.fn(),
  }),
}))

vi.mock('../users/users-api.ts', () => ({
  listUsers: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

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
