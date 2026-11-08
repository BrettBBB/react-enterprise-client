import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'

export type ContactMessage = {
  name: string
  email: string
  message: string
}

export function sendContactMessage(input: ContactMessage) {
  return api<{ id: string }>(apiResources.email, '', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
