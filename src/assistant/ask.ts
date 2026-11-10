import { ApiError, formatApiMessage, resourceUrl } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'

export type AssistantEvent = {
  text?: string
  done?: boolean
  error?: string
}

export function takeAssistantEvents(buffer: string) {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() ?? ''
  const events: AssistantEvent[] = []
  for (const part of parts) {
    const data = part
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('')
    if (!data) {
      continue
    }
    events.push(JSON.parse(data) as AssistantEvent)
  }
  return { events, rest }
}

export async function askArchitecture(
  question: string,
  onText: (text: string) => void,
  signal?: AbortSignal,
) {
  const response = await fetch(resourceUrl(apiResources.assistant, 'ask'), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
    signal,
  })
  if (!response.ok) {
    let message = 'The assistant could not answer that question.'
    try {
      message = formatApiMessage(await response.json(), message)
    } catch {
      // The body was not JSON.
    }
    throw new ApiError(message, response.status)
  }
  if (!response.body) {
    throw new Error('The assistant did not return a stream.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const parsed = takeAssistantEvents(buffer)
    buffer = parsed.rest
    for (const event of parsed.events) {
      if (event.error) {
        throw new Error(event.error)
      }
      if (event.text) {
        onText(event.text)
      }
    }
    if (done) {
      break
    }
  }
}
