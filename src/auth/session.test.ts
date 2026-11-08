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

function token(payload: object) {
  const segment = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  return `header.${segment}.signature`
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

test('keeps a profile when the access token is expired so it can be refreshed', () => {
  storeSession(
    ada,
    token({
      sub: ada.id,
      email: ada.email,
      isAdmin: true,
      role: 'admin',
      exp: 1,
    }),
    '2026-11-14T00:00:00.000Z',
  )

  expect(readSession()).toEqual(ada)
  expect(sessionStorage.getItem('enterprise.accessToken')).not.toBeNull()
  expect(sessionStorage.getItem('enterprise.refreshExpiresAt')).toBe('2026-11-14T00:00:00.000Z')
})

test('drops a profile that is not JSON and clears the token', () => {
  sessionStorage.setItem('enterprise.session', '{')
  sessionStorage.setItem('enterprise.accessToken', 'token')

  expect(readSession()).toBeNull()
  expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
})
