import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { ContactPage } from './ContactPage.tsx'

const auth = vi.hoisted(() => ({
  user: null as { firstName: string; lastName: string; email: string } | null,
}))

const sendContactMessage = vi.hoisted(() => vi.fn())

vi.mock('../auth/auth-context.ts', () => ({
  useAuth: () => auth,
}))

vi.mock('./contact-api.ts', () => ({
  sendContactMessage,
}))

beforeEach(() => {
  auth.user = null
  sendContactMessage.mockReset()
})

test('sends the trimmed contact message', async () => {
  sendContactMessage.mockResolvedValue({ id: 'email-1' })
  const user = userEvent.setup()
  render(<ContactPage />)

  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada Lovelace')
  await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.com')
  await user.type(screen.getByRole('textbox', { name: 'Message' }), '  Hello there  ')
  await user.click(screen.getByRole('button', { name: 'Send message' }))

  expect(sendContactMessage).toHaveBeenCalledWith({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello there',
  })
  expect(await screen.findByText('Message sent.')).toBeInTheDocument()
})
