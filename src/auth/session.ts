import { storeAccessToken } from '../api/session.ts'
import type { User } from '../users/types.ts'

const storageKey = 'enterprise.session'

function clearSession() {
  sessionStorage.removeItem(storageKey)
  storeAccessToken(null)
}

export function readSession(): User | null {
  const raw = sessionStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<User>
    if (!parsed.id || typeof parsed.isAdmin !== 'boolean') {
      clearSession()
      return null
    }
    return parsed as User
  } catch {
    clearSession()
    return null
  }
}

export function storeSession(user: User | null, accessToken?: string | null) {
  if (!user) {
    clearSession()
    return
  }

  sessionStorage.setItem(storageKey, JSON.stringify(user))
  if (accessToken !== undefined) {
    storeAccessToken(accessToken)
  }
}
