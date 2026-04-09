import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageBubble, useChatController } from '@/features/chat'

// ── Icons ──────────────────────────────────────────────────────────────────

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

// ── Suggestion chips ───────────────────────────────────────────────────────

const WELCOME_SUGGESTIONS = [
  'What are your top projects?',
  'Summarize your experience.',
  'What tech stack do you use?',
  'Tell me about yourself.',
]

const QUICK_SUGGESTIONS = [
  'What stack do you use?',
  'Show me your projects.',
  "What's your background?",
]

// ── Sub-components ─────────────────────────────────────────────────────────

function WelcomeScreen({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="chat-win-welcome">
      <div className="chat-win-avatar">
        <div className="chat-win-avatar-glow" aria-hidden />
        <SparkIcon />
      </div>

      <div className="chat-win-welcome-text">
        <h2 className="chat-win-welcome-title">Portfolio AI</h2>
        <p className="chat-win-welcome-subtitle">
          I know this portfolio inside and out &mdash; ask me about projects,
          experience, skills, or anything else.
        </p>
      </div>

      <div className="chat-win-suggestions-grid">
        {WELCOME_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="chat-win-suggestion-card"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageScroller({
  messages,
  loading,
}: {
  messages: ReturnType<typeof useChatController>['messages']
  loading: boolean
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div
      ref={listRef}
      className="chat-win-messages scrollbar-glass"
      aria-label="Chat messages"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="chat-win-messages-inner">
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isTyping={loading && i === messages.length - 1 && m.role === 'assistant'}
            lightMode
          />
        ))}
      </div>
    </div>
  )
}

// ── Chat content ───────────────────────────────────────────────────────────

function ChatContent() {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, loading, error, sendUserText } = useChatController()
  const hasMessages = messages.length > 0

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || loading) return
      setInput('')
      await sendUserText(text)
    },
    [input, loading, sendUserText],
  )

  const pickSuggestion = useCallback(
    (text: string) => {
      setInput('')
      void sendUserText(text)
    },
    [sendUserText],
  )

  return (
    <div className="chat-win-root">
      {/* ── Identity strip ───────────────────────────────────────────── */}
      <div className="chat-win-header">
        <div className="chat-win-header-avatar">
          <SparkIcon />
        </div>
        <div className="chat-win-header-meta">
          <span className="chat-win-header-name">Portfolio AI</span>
          <span className="chat-win-header-sub">Powered by portfolio data</span>
        </div>
        <div className="chat-win-header-status">
          <span className="chat-win-status-dot" aria-hidden />
          <span className="chat-win-status-label">Active</span>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={() => setInput('')}
            title="Clear input"
            className="chat-win-clear-btn"
            aria-label="Clear input"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="chat-win-body">
        {hasMessages ? (
          <MessageScroller messages={messages} loading={loading} />
        ) : (
          <WelcomeScreen onPick={pickSuggestion} />
        )}
      </div>

      {/* ── Error bar ────────────────────────────────────────────────── */}
      {error && (
        <p className="chat-win-error" role="alert">
          {error}
        </p>
      )}

      {/* ── Quick suggestions after conversation started ─────────────── */}
      {hasMessages && !loading && (
        <div className="chat-win-quick-row">
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pickSuggestion(s)}
              className="chat-win-quick-chip"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Composer ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="chat-win-composer">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={loading}
          autoFocus
          className="chat-win-input"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="chat-win-send-btn"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  )
}

export function ChatWindow() {
  return <ChatContent />
}