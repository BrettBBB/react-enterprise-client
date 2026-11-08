import { expect, test } from 'vitest'
import { decodeAccessToken, formatRemaining } from './jwt-claims.ts'

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

test('formats the remaining lifetime as a clock', () => {
  expect(formatRemaining(65_000)).toBe('01:05')
  expect(formatRemaining(3_661_000)).toBe('1:01:01')
  expect(formatRemaining(0)).toBe('00:00')
})
