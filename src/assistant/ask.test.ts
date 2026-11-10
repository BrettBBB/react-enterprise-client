import { expect, test } from 'vitest'
import { takeAssistantEvents } from './ask.ts'

test('reads complete assistant events and keeps a partial chunk', () => {
  const parsed = takeAssistantEvents(
    'data: {"text":"Prisma"}\n\ndata: {"text":" replaced Sequelize."}\n\ndata: {"done":',
  )

  expect(parsed.events).toEqual([
    { text: 'Prisma' },
    { text: ' replaced Sequelize.' },
  ])
  expect(parsed.rest).toBe('data: {"done":')
})
