import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { LoginPage } from './LoginPage.tsx'

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}))

vi.mock('./auth-context.ts', () => ({
  useAuth: () => auth,
}))

beforeEach(() => {
  auth.login.mockReset()
  auth.register.mockReset()
})

test('submits the trimmed email and password', async () => {
  auth.login.mockResolvedValue(undefined)
  const user = userEvent.setup()
  render(<LoginPage />)

  await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@example.com')
  await user.type(screen.getByLabelText(/password/i), 'ChangeMe123')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))

  expect(auth.login).toHaveBeenCalledWith('ada@example.com', 'ChangeMe123')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('shows the API error when sign-in fails', async () => {
  auth.login.mockRejectedValue(new Error('Invalid email or password'))
  const user = userEvent.setup()
  render(<LoginPage />)

  await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@example.com')
  await user.type(screen.getByLabelText(/password/i), 'ChangeMe123')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  expect(auth.login).toHaveBeenCalledOnce()
})
