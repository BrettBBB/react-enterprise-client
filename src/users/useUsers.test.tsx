import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import type { User } from './types.ts'
import { useUsers } from './useUsers.ts'

vi.mock('./users-api.ts', () => ({
  listUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

import { listUsers } from './users-api.ts'

const ada: User = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const grace: User = {
  id: '2',
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.mocked(listUsers).mockReset()
})

test('loads users newest first and clears the loading flag', async () => {
  vi.mocked(listUsers).mockResolvedValue([ada, grace])

  const { result } = renderHook(() => useUsers(true))

  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.error).toBeNull()
  expect(result.current.users.map((user) => user.email)).toEqual(['grace@example.com', 'ada@example.com'])
})

test('keeps the error message when the request fails', async () => {
  vi.mocked(listUsers).mockRejectedValue(new Error('Unauthorized'))

  const { result } = renderHook(() => useUsers(true))

  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.error).toBe('Unauthorized')
  expect(result.current.users).toEqual([])
})

test('does not request users while the directory is disabled', () => {
  renderHook(() => useUsers(false))

  expect(listUsers).not.toHaveBeenCalled()
})
