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

  const bubbleClass = `chat-imsg-bubble max-w-[min(92%,34rem)] ${
    isUser ? 'chat-imsg-bubble--user' : 'chat-imsg-bubble--assistant'
  } ${lightMode ? 'text-[0.9375rem] leading-snug' : 'text-[0.92rem] leading-relaxed'}`

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

