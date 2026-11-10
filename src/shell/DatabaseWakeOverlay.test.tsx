import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { DatabaseWakeOverlay } from './DatabaseWakeOverlay.tsx'

afterEach(() => {
  vi.useRealTimers()
})

test('explains a slow database after the request keeps waiting', async () => {
  vi.useFakeTimers()
  render(<DatabaseWakeOverlay />)

  expect(screen.getByRole('progressbar')).toBeInTheDocument()
  expect(screen.getByText('Loading')).toBeInTheDocument()
  expect(screen.queryByText('The sample database is waking up')).not.toBeInTheDocument()

  await act(async () => {
    vi.advanceTimersByTime(700)
  })

  expect(screen.getByText('The sample database is waking up')).toBeInTheDocument()
  expect(screen.getByText(/Neon Postgres sleeps when it is idle/)).toBeInTheDocument()
})
