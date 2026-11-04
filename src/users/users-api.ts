import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { User, UserInput } from './types.ts'

const users = apiResources.users

export function listUsers() {
  return api<User[]>(users)
}

export function createUser(input: UserInput) {
  return api<User>(users, '', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser(id: string, input: UserInput) {
  return api<User>(users, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string) {
  return api<User>(users, encodeURIComponent(id), { method: 'DELETE' })
}
