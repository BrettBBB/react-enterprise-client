import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { User } from '../users/types.ts'
import { AuthProvider } from './AuthProvider.tsx'
import { useAuth } from './auth-context.ts'
import { storeSession } from './session.ts'

const ada: User = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  isAdmin: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function token(exp: number) {
  const segment = btoa(
    JSON.stringify({
      sub: ada.id,
      email: ada.email,
      isAdmin: true,
      role: 'admin',
      exp,
    }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  return `header.${segment}.signature`
}

function SessionProbe() {
  const { user } = useAuth()
  return <p>{user ? user.firstName : 'Guest'}</p>
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test('renews an expired access token from the refresh cookie', async () => {
  storeSession(ada, token(1), '2026-11-14T00:00:00.000Z')
  const renewed = token(Math.floor(Date.now() / 1000) + 900)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: renewed,
          refreshExpiresAt: '2026-11-14T00:00:00.000Z',
          user: ada,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ),
  )

  render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  )

  await waitFor(() => expect(sessionStorage.getItem('enterprise.accessToken')).toBe(renewed))
  expect(screen.getByText('Ada')).toBeInTheDocument()
})

test('signs out when the refresh cookie is rejected', async () => {
  storeSession(ada, token(1), '2026-11-14T00:00:00.000Z')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
  )

  render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  )

  await waitFor(() => expect(screen.getByText('Guest')).toBeInTheDocument())
  expect(sessionStorage.getItem('enterprise.session')).toBeNull()
  expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
})

test('renews the access token when it reaches exp', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  storeSession(ada, token(Math.floor(Date.now() / 1000) + 5))
  const renewed = token(Math.floor(Date.now() / 1000) + 900)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: renewed,
          refreshExpiresAt: '2026-01-08T00:00:00.000Z',
          user: ada,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ),
  )

  render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  )

  expect(screen.getByText('Ada')).toBeInTheDocument()

  await act(async () => {
    await vi.advanceTimersByTimeAsync(4_999)
  })
  expect(sessionStorage.getItem('enterprise.accessToken')).not.toBe(renewed)

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
  expect(sessionStorage.getItem('enterprise.accessToken')).toBe(renewed)
  expect(screen.getByText('Ada')).toBeInTheDocument()
})

test('signs out when an authenticated request is unauthorized', async () => {
  storeSession(ada, token(Math.floor(Date.now() / 1000) + 3_600))
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )

  render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  )
  expect(screen.getByText('Ada')).toBeInTheDocument()

  await act(async () => {
    await api(apiResources.users).catch(() => undefined)
  })

  expect(screen.getByText('Guest')).toBeInTheDocument()
  expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
})
