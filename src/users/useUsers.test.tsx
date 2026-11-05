import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import type { GridGetRowsParams } from '@mui/x-data-grid'
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
  isAdmin: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const params: GridGetRowsParams = {
  start: 0,
  end: 10,
  paginationModel: { page: 0, pageSize: 10 },
  sortModel: [{ field: 'createdAt', sort: 'desc' }],
  filterModel: { items: [], quickFilterValues: ['ada'] },
}

beforeEach(() => {
  vi.mocked(listUsers).mockReset()
})

test('passes the grid request through and keeps the server row order', async () => {
  vi.mocked(listUsers).mockResolvedValue({ rows: [ada], rowCount: 12 })

  const { result } = renderHook(() => useUsers())
  let page: Awaited<ReturnType<typeof result.current.getRows>> | undefined
  await act(async () => {
    page = await result.current.getRows(params)
  })

  expect(listUsers).toHaveBeenCalledWith(params)
  expect(page?.rows.map((user) => user.email)).toEqual(['ada@example.com'])
  expect(page?.rowCount).toBe(12)
  expect(result.current.error).toBeNull()
})

test('keeps the error message when the request fails', async () => {
  vi.mocked(listUsers).mockRejectedValue(new Error('Unauthorized'))

  const { result } = renderHook(() => useUsers())
  await act(async () => {
    await expect(result.current.getRows(params)).rejects.toThrow('Unauthorized')
  })

  await waitFor(() => expect(result.current.error).toBe('Unauthorized'))
})
