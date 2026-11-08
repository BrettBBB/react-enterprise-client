import { afterEach, describe, expect, test, vi } from 'vitest'
import { apiResources } from './resources.ts'
import { storeAccessToken } from './session.ts'
import { api, formatApiMessage, resourceUrl } from './client.ts'

describe('formatApiMessage', () => {
  test('returns a string message from a Nest error body', () => {
    expect(formatApiMessage({ message: 'Invalid email or password', statusCode: 401 }, 'Request failed')).toBe(
      'Invalid email or password',
    )
  })

  test('joins class-validator messages into one sentence', () => {
    expect(
      formatApiMessage(
        { message: ['email must be an email', 'password must be longer than or equal to 8 characters'] },
        'Request failed',
      ),
    ).toBe('email must be an email, password must be longer than or equal to 8 characters')
  })

  test('keeps the fallback when the body has no message', () => {
    expect(formatApiMessage(null, 'Request failed')).toBe('Request failed')
    expect(formatApiMessage({ statusCode: 500 }, 'Request failed')).toBe('Request failed')
    expect(formatApiMessage({ message: '' }, 'Request failed')).toBe('Request failed')
  })
})

describe('resourceUrl', () => {
  test('builds a resource address from the configured origin', () => {
    expect(resourceUrl(apiResources.users)).toBe(`${import.meta.env.VITE_API_URL}/users`)
    expect(resourceUrl(apiResources.auth, '/login')).toBe(`${import.meta.env.VITE_API_URL}/auth/login`)
    expect(resourceUrl(apiResources.users, '?page=0')).toBe(`${import.meta.env.VITE_API_URL}/users?page=0`)
  })
})

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    storeAccessToken(null)
  })

  test('throws an ApiError whose message is the formatted response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: ['email must be an email'] }), {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(api(apiResources.auth, 'login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'email must be an email',
      status: 400,
    })
  })

  test('renews an expired access token and retries the original request', async () => {
    storeAccessToken('expired-token')
    sessionStorage.setItem(
      'enterprise.session',
      JSON.stringify({
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        isAdmin: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/auth/refresh')) {
        expect(init?.credentials).toBe('include')
        return new Response(
          JSON.stringify({
            accessToken: 'next-token',
            refreshExpiresAt: '2026-11-14T00:00:00.000Z',
            user: {
              id: 'user-1',
              firstName: 'Ada',
              lastName: 'Lovelace',
              email: 'ada@example.com',
              isAdmin: true,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      const authorization = new Headers(init?.headers).get('Authorization')
      if (authorization === 'Bearer expired-token') {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(api(apiResources.users)).resolves.toEqual({ id: 'user-1' })
    expect(sessionStorage.getItem('enterprise.accessToken')).toBe('next-token')
  })

  test('clears a stored session when the refresh cookie is rejected', async () => {
    storeAccessToken('signed-token')
    sessionStorage.setItem('enterprise.session', JSON.stringify({ id: 'user-1', isAdmin: true }))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () =>
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(api(apiResources.users)).rejects.toMatchObject({ status: 401, message: 'Unauthorized' })
    expect(sessionStorage.getItem('enterprise.accessToken')).toBeNull()
    expect(sessionStorage.getItem('enterprise.session')).toBeNull()
  })

  test('leaves a signed-out session alone when login is unauthorized', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(api(apiResources.auth, 'login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 401,
    })
    expect(sessionStorage.getItem('enterprise.session')).toBeNull()
  })

  test('sends the stored access token and returns the parsed JSON body', async () => {
    storeAccessToken('signed-token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1', email: 'ada@example.com' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(api(apiResources.users)).resolves.toEqual({ id: 'user-1', email: 'ada@example.com' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.headers).toBeInstanceOf(Headers)
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer signed-token')
  })
})
