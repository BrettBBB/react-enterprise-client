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
