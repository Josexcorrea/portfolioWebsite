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

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          'max-w-[92%] text-[0.875rem] leading-relaxed ' +
          (isUser
            ? lightMode
              ? 'pl-3 pr-3 py-1.5 border-l-2 border-accent/50 bg-black/[0.05] text-[#1d1d1f]'
              : 'pl-3 pr-3 py-1.5 border-l-2 border-accent/60 bg-white/[0.03] text-text-pri'
            : lightMode
              ? 'py-1 text-[#1d1d1f]'
              : 'py-1 text-white/85')
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

