import { api, resourceUrl, type AuthSession } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { UserInput } from '../users/types.ts'

export type AuthResult = AuthSession

function postAuth<T>(path: string, body: unknown) {
  return api<T>(apiResources.auth, path, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

export function login(email: string, password: string) {
  return postAuth<AuthResult>('login', { email, password })
}

export function register(input: UserInput) {
  return postAuth<AuthResult>('register', input)
}

export function logoutRequest() {
  return fetch(resourceUrl(apiResources.auth, 'logout'), {
    method: 'POST',
    credentials: 'include',
  })
}
