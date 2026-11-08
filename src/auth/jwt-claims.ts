export type AccessRole = 'admin' | 'user'

export type AccessClaims = {
  sub: string
  email: string
  isAdmin: boolean
  role: AccessRole
  exp: number
}

export function decodeAccessToken(token: string): AccessClaims | null {
  const segment = token.split('.')[1]
  if (!segment) {
    return null
  }

  try {
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Partial<AccessClaims>
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.isAdmin !== 'boolean' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }

    return {
      sub: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      role: payload.role === 'admin' || payload.role === 'user'
        ? payload.role
        : payload.isAdmin
          ? 'admin'
          : 'user',
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

export function formatRemaining(milliseconds: number) {
  const remaining = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const clock = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return hours > 0 ? `${hours}:${clock}` : clock
}
