import type { ChatMessage } from '../types'
import { AssistantRenderer } from './AssistantRenderer'

export function MessageBubble({
  message,
  isTyping,
}: {
  message: ChatMessage
  isTyping?: boolean
}) {
  const isUser = message.role === 'user'

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          'max-w-[92%] rounded-xl px-3.5 py-2.5 text-[0.9rem] border ' +
          (isUser ? 'bg-accent/15 text-text-pri border-accent/25' : 'bg-white/[0.06] text-white border-border/80')
        }
      >
        {isUser ? (
          message.content
        ) : message.content || (message.blocks && message.blocks.length > 0) ? (
          <AssistantRenderer content={message.content} blocks={message.blocks} />
        ) : isTyping ? (
          <span className="inline-flex gap-1" aria-label="Assistant is typing">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

