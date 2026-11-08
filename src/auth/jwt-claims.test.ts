import { expect, test } from 'vitest'
import { accessTokenRemaining, decodeAccessToken, formatLifetime, formatRemaining } from './jwt-claims.ts'

function token(payload: object) {
  const segment = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  return `header.${segment}.signature`
}

test('reads the role and expiry claims from an access token', () => {
  const claims = decodeAccessToken(
    token({
      sub: 'user-1',
      email: 'ada@example.com',
      isAdmin: true,
      role: 'admin',
      exp: 1_800_000_000,
    }),
  )

  expect(claims).toEqual({
    sub: 'user-1',
    email: 'ada@example.com',
    isAdmin: true,
    role: 'admin',
    exp: 1_800_000_000,
  })
})

test('derives the role from the admin claim when an older token omits it', () => {
  const claims = decodeAccessToken(
    token({ sub: 'user-1', email: 'ada@example.com', isAdmin: false, exp: 10 }),
  )

  expect(claims?.role).toBe('user')
})

test('rejects a token that is not a payload', () => {
  expect(decodeAccessToken('not-a-jwt')).toBeNull()
})

test('measures the remaining lifetime from exp', () => {
  const accessToken = token({
    sub: 'user-1',
    email: 'ada@example.com',
    isAdmin: true,
    role: 'admin',
    exp: 1_800,
  })

  expect(accessTokenRemaining(accessToken, 1_700_000)).toBe(100_000)
  expect(accessTokenRemaining(accessToken, 1_800_000)).toBe(0)
  expect(accessTokenRemaining(null)).toBeNull()
  expect(accessTokenRemaining('not-a-jwt')).toBeNull()
})

test('formats a multi-day lifetime in days and hours', () => {
  expect(formatLifetime(6 * 86_400_000 + 3 * 3_600_000)).toBe('6d 3h')
  expect(formatLifetime(65_000)).toBe('01:05')
})

test('formats the remaining lifetime as a clock', () => {
  expect(formatRemaining(65_000)).toBe('01:05')
  expect(formatRemaining(3_661_000)).toBe('1:01:01')
  expect(formatRemaining(0)).toBe('00:00')
})
