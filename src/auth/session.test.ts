import { beforeEach, expect, test } from 'vitest'
import { readSession, storeSession } from './session.ts'
import type { User } from '../users/types.ts'

const ada: User = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  isAdmin: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  sessionStorage.clear()
})

test('keeps a profile whose admin claim is a boolean', () => {
  storeSession(ada, 'token')

  expect(readSession()).toEqual(ada)
  expect(sessionStorage.getItem('enterprise.accessToken')).toBe('token')
})

test('drops a profile without an admin claim and clears the token', () => {
  sessionStorage.setItem('enterprise.session', JSON.stringify({ id: '1' }))
  sessionStorage.setItem('enterprise.accessToken', 'token')

  expect(readSession()).toBeNull()
  expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
  expect(sessionStorage.getItem('enterprise.session')).toBeNull()
})

test('drops a profile that is not JSON and clears the token', () => {
  sessionStorage.setItem('enterprise.session', '{')
  sessionStorage.setItem('enterprise.accessToken', 'token')

  expect(readSession()).toBeNull()
  expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
})
