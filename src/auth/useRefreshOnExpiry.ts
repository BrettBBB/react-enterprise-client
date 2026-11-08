import { useEffect } from 'react'
import { refreshAccessToken } from '../api/client.ts'
import { readAccessToken } from '../api/session.ts'
import type { User } from '../users/types.ts'
import { accessTokenRemaining } from './jwt-claims.ts'

export function useRefreshOnExpiry(user: User | null, logout: () => void) {
  useEffect(() => {
    if (!user) {
      return
    }

    let timer = 0
    let cancelled = false
    const refreshIfExpired = () => {
      const remaining = accessTokenRemaining(readAccessToken())
      if (remaining !== null && remaining > 0) {
        window.clearTimeout(timer)
        timer = window.setTimeout(refreshIfExpired, remaining)
        return
      }
      void refreshAccessToken()
        .then((session) => {
          if (!cancelled && !session) {
            logout()
          }
        })
        .catch(() => undefined)
    }

    refreshIfExpired()
    document.addEventListener('visibilitychange', refreshIfExpired)
    window.addEventListener('focus', refreshIfExpired)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', refreshIfExpired)
      window.removeEventListener('focus', refreshIfExpired)
    }
  }, [user, logout])
}
