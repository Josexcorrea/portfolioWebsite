import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageBubble, useChatController } from '@/features/chat'
import { useDesktop } from '@/desktop/DesktopContext'

// ── Icons ──────────────────────────────────────────────────────────────────

function AssistantLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.5" y="7" width="15" height="11.5" rx="5.5" fill="currentColor" opacity="0.95" />
      <circle cx="10" cy="12.5" r="1.15" fill="rgba(88, 28, 135, 0.9)" />
      <circle cx="14" cy="12.5" r="1.15" fill="rgba(88, 28, 135, 0.9)" />
      <path d="M9.2 15.6c1 .7 4.6.7 5.6 0" stroke="rgba(88, 28, 135, 0.9)" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 7V4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="3.5" r="1.1" fill="currentColor" />
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

const CHAT_INPUT_MAX_HEIGHT = 132

// ── Sub-components ─────────────────────────────────────────────────────────

function WelcomeScreen({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="chat-win-welcome">
      <div className="chat-win-welcome-text">
        <h2 className="chat-win-welcome-title">Portfolio AI</h2>
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
  lightMode,
}: {
  messages: ReturnType<typeof useChatController>['messages']
  loading: boolean
  lightMode: boolean
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const lastUserMessageIdRef = useRef<string | null>(null)

  const isNearBottom = useCallback((el: HTMLDivElement) => {
    const threshold = 24
    return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
  }, [])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    if (!isNearBottom(el)) {
      setAutoScrollEnabled(false)
    }
  }, [isNearBottom])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const lastUserId = lastUser?.id ?? null
    if (lastUserId && lastUserId !== lastUserMessageIdRef.current) {
      lastUserMessageIdRef.current = lastUserId
      setAutoScrollEnabled(true)
      requestAnimationFrame(() => {
        const node = listRef.current
        if (!node) return
        node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
      })
      return
    }

    if (!autoScrollEnabled) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, autoScrollEnabled])

  return (
    <div
      ref={listRef}
      className="chat-win-messages scrollbar-glass"
      onScroll={handleScroll}
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
            lightMode={lightMode}
          />
        ))}
      </div>
    </div>
  )
}

// ── Chat content ───────────────────────────────────────────────────────────

function ChatContent() {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { theme } = useDesktop()
  const { messages, loading, error, ownerModeLatched, sendUserText } = useChatController()
  const hasMessages = messages.length > 0

  const submitCurrentInput = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendUserText(text)
  }, [input, loading, sendUserText])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await submitCurrentInput()
    },
    [submitCurrentInput],
  )

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter') return
      if (e.nativeEvent.isComposing) return
      const coarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
      if (e.shiftKey || coarsePointer) return
      e.preventDefault()
      void submitCurrentInput()
    },
    [submitCurrentInput],
  )

  const pickSuggestion = useCallback(
    (text: string) => {
      setInput('')
      void sendUserText(text)
    },
    [sendUserText],
  )

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, CHAT_INPUT_MAX_HEIGHT)}px`
  }, [input])

  return (
    <div className="chat-win-root">
      {/* ── Identity strip ───────────────────────────────────────────── */}
      <div className="chat-win-header">
        <div className="chat-win-header-avatar">
          <AssistantLogo />
        </div>
        <div className="chat-win-header-meta">
          <span className="chat-win-header-name">Portfolio AI</span>
          <span className="chat-win-header-sub">Powered by portfolio data</span>
        </div>
        <div className="chat-win-header-status">
          <span className="chat-win-status-dot" aria-hidden />
          <span className={ownerModeLatched ? 'chat-win-status-label chat-win-status-label--owner' : 'chat-win-status-label'}>
            {ownerModeLatched ? 'Owner03' : 'Active'}
          </span>
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
          <MessageScroller messages={messages} loading={loading} lightMode={theme === 'light'} />
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
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Ask anything…"
          disabled={loading}
          autoFocus
          rows={1}
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