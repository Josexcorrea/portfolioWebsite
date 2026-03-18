import { useEffect, useRef, useState } from 'react'
import { MessageList } from './components/MessageList'
import { Composer } from './components/Composer'
import { useChatController } from './state/useChatController'

type ChatPanelProps = {
  embedded: boolean
  autoFocus?: boolean
}

export function ChatPanel({ embedded, autoFocus }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const { messages, loading, error, showSuggestions, sendUserText } = useChatController()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    if (autoFocus) {
      // Defer to ensure panel is mounted when inside animated dialog.
      const t = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
  }, [autoFocus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input
    setInput('')
    await sendUserText(text)
  }

  const pickSuggestion = (text: string) => {
    setInput('')
    void sendUserText(text)
  }

  return (
    <div className={`flex flex-col w-full ${embedded ? 'min-h-0 flex-1' : 'max-w-[400px]'}`}>
      <div
        className={
          embedded
            ? 'flex flex-col min-h-0 flex-1 overflow-hidden'
            : 'rounded-2xl border border-border overflow-hidden transition-all duration-300 ' +
              'bg-surface/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(79,140,255,0.06),0_8px_32px_-8px_rgba(0,0,0,0.4)]'
        }
      >
        {!embedded && !hasMessages && !loading && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[0.8rem] text-white font-medium tracking-wide">Ask about projects, experience, or background</p>
          </div>
        )}

        <MessageList messages={messages} loading={loading} embedded={embedded} />

        {error && (
          <p className="px-4 pb-1 text-xs text-red-400/90" role="alert">
            {error}
          </p>
        )}

        <Composer
          value={input}
          disabled={loading}
          embedded={embedded}
          autoFocus={autoFocus}
          showSuggestions={showSuggestions}
          onChange={setInput}
          onSubmit={handleSubmit}
          onPickSuggestion={pickSuggestion}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

