import { useMemo } from 'react'

const DEFAULT_SUGGESTIONS = [
  'What are your top projects?',
  'Summarize your experience in 3 bullets.',
  'What’s the weather in New York?',
]

export function Composer({
  value,
  disabled,
  embedded,
  autoFocus,
  suggestions = DEFAULT_SUGGESTIONS,
  showSuggestions,
  onChange,
  onSubmit,
  onPickSuggestion,
  inputRef,
}: {
  value: string
  disabled: boolean
  embedded: boolean
  autoFocus?: boolean
  suggestions?: string[]
  showSuggestions: boolean
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onPickSuggestion: (text: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const canSend = value.trim().length > 0 && !disabled
  const visibleSuggestions = useMemo(() => suggestions.slice(0, 5), [suggestions])

  return (
    <div className={`border-t border-border/80 ${embedded ? 'bg-black/10' : 'bg-black/20'}`}>
      {showSuggestions && (
        <div className="px-3 pt-3 pb-2 flex flex-wrap gap-2">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPickSuggestion(s)}
              className="rounded-full border border-border/80 bg-white/[0.06] px-3 py-1.5 text-[0.78rem] text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-2 p-3">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask anything…"
          disabled={disabled}
          autoFocus={autoFocus}
          className="flex-1 min-w-0 bg-transparent border-0 px-0 py-2 text-[0.9rem] text-text-pri placeholder:text-text-muted/80 focus:outline-none focus:ring-0 disabled:opacity-60"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Send"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </form>
    </div>
  )
}

