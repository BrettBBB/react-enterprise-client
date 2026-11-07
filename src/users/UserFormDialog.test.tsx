import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { User } from './types.ts'
import { UserFormDialog } from './UserFormDialog.tsx'

const ada: User = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  isAdmin: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

test('includes the admin flag when editing a user', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(<UserFormDialog open user={ada} onClose={() => undefined} onSubmit={onSubmit} />)

  const admin = screen.getByRole('checkbox', { name: 'Administrator' })
  expect(admin).toBeChecked()

  await user.click(admin)
  await user.click(screen.getByRole('button', { name: 'Save' }))

  expect(onSubmit).toHaveBeenCalledWith({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    isAdmin: false,
  })
})

test('leaves the admin flag off the add-user form', () => {
  render(
    <UserFormDialog open user={null} onClose={() => undefined} onSubmit={vi.fn()} />,
  )

  expect(screen.queryByRole('checkbox', { name: 'Administrator' })).not.toBeInTheDocument()
})
