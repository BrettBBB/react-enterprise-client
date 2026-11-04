import { type ApiResource } from './resources.ts'
import { readAccessToken } from './session.ts'

function apiOrigin() {
  const configured = import.meta.env.VITE_API_URL
  if (!configured) {
    throw new Error('VITE_API_URL is not set. Add it to .env.')
  }
  return configured.replace(/\/$/, '')
}

export const apiUrl = apiOrigin()

export function resourceUrl(resource: ApiResource, path = '') {
  const suffix = path === '' ? '' : `/${path.replace(/^\//, '')}`
  return `${apiUrl}${resource}${suffix}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function errorMessage(body: unknown, fallback: string) {
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

export async function api<T>(
  resource: ApiResource,
  path = '',
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const accessToken = readAccessToken()
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(resourceUrl(resource, path), { ...init, headers })
  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      message = errorMessage(await response.json(), message)
    } catch {
      // The body was not JSON.
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}
