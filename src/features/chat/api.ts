const CHAT_API = '/api/chat'

import type { ChatMessage, ChatStreamEvent, ChatBlock } from './types'

type LegacyNdjsonLine = { content?: string; done?: boolean; error?: string }
type ChatRequestMessage = Pick<ChatMessage, 'role' | 'content'>
type SendChatStreamOptions = { signal?: AbortSignal }

/**
 * Send chat request and stream the assistant response.
 * Calls onEvent with each NDJSON event; compatible with legacy server format.
 */
export async function sendChatStream(
  messages: ChatRequestMessage[],
  callbacks: {
    onEvent?: (event: ChatStreamEvent) => void
    onChunk?: (text: string) => void
    onBlocks?: (blocks: ChatBlock[]) => void
    onComplete: () => void
    onError: (message: string) => void
  },
  options: SendChatStreamOptions = {}
): Promise<void> {
  const res = await fetch(CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: options.signal,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }))
    callbacks.onError((data as { error?: string }).error || res.statusText)
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError('No response body')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  const emit = (event: ChatStreamEvent) => {
    callbacks.onEvent?.(event)
    if (event.type === 'delta') callbacks.onChunk?.(event.content)
    if (event.type === 'blocks') callbacks.onBlocks?.(event.blocks)
    if (event.type === 'done') callbacks.onComplete()
    if (event.type === 'error') callbacks.onError(event.error)
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const obj = JSON.parse(trimmed) as ChatStreamEvent | LegacyNdjsonLine
          if ('type' in obj && typeof obj.type === 'string') {
            emit(obj as ChatStreamEvent)
            if ((obj as ChatStreamEvent).type === 'done') return
            if ((obj as ChatStreamEvent).type === 'error') return
            continue
          }

          // Legacy: { content }, { done }, { error }
          const legacy = obj as LegacyNdjsonLine
          if (legacy.error) {
            emit({ type: 'error', error: legacy.error })
            return
          }
          if (legacy.content) emit({ type: 'delta', content: legacy.content })
          if (legacy.done) {
            emit({ type: 'done' })
            return
          }
        } catch {
          // ignore parse errors for partial lines
        }
      }
    }
    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer.trim()) as ChatStreamEvent | LegacyNdjsonLine
        if ('type' in obj && typeof obj.type === 'string') {
          emit(obj as ChatStreamEvent)
        } else {
          const legacy = obj as LegacyNdjsonLine
          if (legacy.error) emit({ type: 'error', error: legacy.error })
          if (legacy.content) emit({ type: 'delta', content: legacy.content })
          if (legacy.done) emit({ type: 'done' })
        }
      } catch {
        // ignore
      }
    }
    emit({ type: 'done' })
  } catch (err) {
    // Abort is an expected control-flow (new request, widget closed, etc.)
    if (err instanceof DOMException && err.name === 'AbortError') return
    emit({ type: 'error', error: err instanceof Error ? err.message : 'Stream failed' })
  }
}
