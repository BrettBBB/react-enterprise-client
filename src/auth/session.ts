import { storeAccessToken } from '../api/session.ts'
import type { User } from '../users/types.ts'

const storageKey = 'enterprise.session'
const refreshExpiryKey = 'enterprise.refreshExpiresAt'

function sessionChannel(name: string) {
  return {
    emit() {
      window.dispatchEvent(new Event(name))
    },
    subscribe(listener: () => void) {
      window.addEventListener(name, listener)
      return () => window.removeEventListener(name, listener)
    },
  }
}

const expired = sessionChannel('enterprise-session-expired')
const refreshed = sessionChannel('enterprise-session-refreshed')

function clearSession() {
  sessionStorage.removeItem(storageKey)
  sessionStorage.removeItem(refreshExpiryKey)
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

export function readRefreshExpiresAt() {
  return sessionStorage.getItem(refreshExpiryKey)
}

export function expireSession() {
  clearSession()
  expired.emit()
}

export const subscribeSessionExpired = expired.subscribe

export const notifySessionRefreshed = refreshed.emit

export const subscribeSessionRefreshed = refreshed.subscribe

export function storeSession(
  user: User | null,
  accessToken?: string | null,
  refreshExpiresAt?: string | null,
) {
  if (!user) {
    clearSession()
    return
  }

  sessionStorage.setItem(storageKey, JSON.stringify(user))
  if (accessToken !== undefined) {
    storeAccessToken(accessToken)
  }
  if (refreshExpiresAt !== undefined) {
    if (refreshExpiresAt) {
      sessionStorage.setItem(refreshExpiryKey, refreshExpiresAt)
    } else {
      sessionStorage.removeItem(refreshExpiryKey)
    }
  }
}
