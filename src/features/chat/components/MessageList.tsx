import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'

export function MessageList({
  messages,
  loading,
  embedded,
}: {
  messages: ChatMessage[]
  loading: boolean
  embedded: boolean
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages])

  if (messages.length === 0) return null

  return (
    <div
      ref={listRef}
      className={`min-h-[120px] overflow-y-auto px-4 pt-4 pb-2 scrollbar-glass ${
        embedded ? 'flex-1 max-h-none' : 'max-h-[min(50vh,320px)]'
      }`}
      aria-label="Chat messages"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={m.id} message={m} isTyping={loading && i === messages.length - 1 && m.role === 'assistant'} />
        ))}
      </div>
    </div>
  )
}

