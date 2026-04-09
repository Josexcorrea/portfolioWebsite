import type { ChatMessage } from '../types'
import { AssistantRenderer } from './AssistantRenderer'

export function MessageBubble({
  message,
  isTyping,
  lightMode = false,
}: {
  message: ChatMessage
  isTyping?: boolean
  lightMode?: boolean
}) {
  const isUser = message.role === 'user'

  const bubbleClass = lightMode
    ? `chat-imsg-bubble max-w-[min(92%,34rem)] text-[0.9375rem] leading-snug ${
        isUser ? 'chat-imsg-bubble--user' : 'chat-imsg-bubble--assistant'
      }`
    : `max-w-[92%] text-[0.875rem] leading-relaxed ${
        isUser
          ? 'pl-3 pr-3 py-1.5 border-l-2 border-accent/60 bg-white/[0.03] text-text-pri'
          : 'py-1 text-white/85'
      }`

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={bubbleClass}>
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : message.content || (message.blocks && message.blocks.length > 0) ? (
          <AssistantRenderer
            content={message.content}
            blocks={message.blocks}
            tone={lightMode ? 'light' : 'dark'}
          />
        ) : isTyping ? (
          <span className="inline-flex gap-1 py-0.5" aria-label="Assistant is typing">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

