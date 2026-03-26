import { Suspense, lazy, useEffect } from 'react'
import { useChatGlobe } from '@/contexts/ChatGlobeContext'

const PortfolioChat = lazy(() => import('./PortfolioChat').then((m) => ({ default: m.PortfolioChat })))

const CHAT_ICON = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const CLOSE_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

export function FloatingChatWidget() {
  const { chatOpen: open, setChatOpen: setOpen, disarmSkillsGameSpace } = useChatGlobe()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  return (
    <>
      {/* Expandable panel */}
      {open && (
        <div
          className="fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom,0px))] right-4 left-4 sm:left-auto sm:w-[400px] z-[100] flex flex-col max-h-[min(75vh,520px)] rounded-2xl border border-border overflow-hidden bg-surface/95 backdrop-blur-xl shadow-[0_0_0_1px_rgba(79,140,255,0.08),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200"
          role="dialog"
          aria-label="Chat"
          aria-modal="false"
          onPointerDownCapture={disarmSkillsGameSpace}
        >
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-border bg-black/20">
            <span className="text-sm font-medium text-white">Ask about my work</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close chat"
            >
              {CLOSE_ICON}
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Suspense fallback={<div className="flex-1" aria-hidden />}>
              <PortfolioChat embedded autoFocus />
            </Suspense>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[99] w-14 h-14 rounded-full flex items-center justify-center text-white bg-accent border-2 border-white/20 shadow-[0_4px_24px_rgba(139,92,246,0.45)] hover:bg-accent/90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base transition-transform duration-200"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {CHAT_ICON}
      </button>
    </>
  )
}
