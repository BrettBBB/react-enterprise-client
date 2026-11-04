import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { User, UserInput } from '../users/types.ts'

export type AuthResult = {
  accessToken: string
  user: User
}

export function login(email: string, password: string) {
  return api<AuthResult>(apiResources.auth, 'login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(input: UserInput) {
  return api<AuthResult>(apiResources.auth, 'register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
