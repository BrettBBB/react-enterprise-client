import { expireSession, notifySessionRefreshed, storeSession } from '../auth/session.ts'
import type { User } from '../users/types.ts'
import { apiResources, type ApiResource } from './resources.ts'
import { readAccessToken } from './session.ts'

export type AuthSession = {
  accessToken: string
  refreshExpiresAt: string
  user: User
}

function apiOrigin() {
  const configured = import.meta.env.VITE_API_URL
  if (!configured) {
    throw new Error('VITE_API_URL is not set. Add it to .env.')
  }
  return configured.replace(/\/$/, '')
}

export const apiUrl = apiOrigin()

export function resourceUrl(resource: ApiResource, path = '') {
  if (path.startsWith('?')) {
    return `${apiUrl}${resource}${path}`
  }
  const suffix = path === '' ? '' : `/${path.replace(/^\//, '')}`
  return `${apiUrl}${resource}${suffix}`
}

export function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message.length > 0 ? caught.message : fallback
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function formatApiMessage(body: unknown, fallback: string) {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return fallback
  }

  const message = body.message
  if (Array.isArray(message)) {
    return message.map(String).join(', ')
  }
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  return fallback
}

const refreshPaths = new Set(['login', 'register', 'refresh', 'logout'])

function skipsRefresh(resource: ApiResource, path: string) {
  return resource === apiResources.auth && refreshPaths.has(path.replace(/^\//, ''))
}

let pendingRefresh: Promise<AuthSession | null> | null = null

export function refreshAccessToken() {
  if (!pendingRefresh) {
    pendingRefresh = requestRefresh().finally(() => {
      pendingRefresh = null
    })
  }
  return pendingRefresh
}

async function requestRefresh() {
  const response = await fetch(resourceUrl(apiResources.auth, 'refresh'), {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    return null
  }

  const session = (await response.json()) as Partial<AuthSession>
  if (!session.accessToken || !session.user || !session.refreshExpiresAt) {
    return null
  }
  const next = session as AuthSession
  storeSession(next.user, next.accessToken, next.refreshExpiresAt)
  notifySessionRefreshed()
  return next
}

async function send(resource: ApiResource, path: string, init: RequestInit | undefined, accessToken: string | null) {
  const headers = new Headers(init?.headers)
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return fetch(resourceUrl(resource, path), { ...init, headers })
}

export async function api<T>(
  resource: ApiResource,
  path = '',
  init?: RequestInit,
): Promise<T> {
  const accessToken = readAccessToken()
  let response = await send(resource, path, init, accessToken)
  if (response.status === 401 && accessToken && !skipsRefresh(resource, path)) {
    const renewed = await refreshAccessToken()
    if (!renewed) {
      expireSession()
    } else {
      response = await send(resource, path, init, renewed.accessToken)
    }
  }
  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      message = formatApiMessage(await response.json(), message)
    } catch {
      // The body was not JSON.
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}
