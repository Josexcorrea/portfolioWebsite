import type { ExampleCardBlock } from '../types'

function copyToClipboard(text: string) {
  if (!text) return
  void navigator.clipboard?.writeText(text)
}

function safeExternalHref(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

export function ExampleCard({ block }: { block: ExampleCardBlock }) {
  return (
    <div className="mt-2 rounded-xl border border-accent/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_0_0_1px_rgba(168,85,247,0.08)]">
      {(block.title || block.summary) && (
        <div className="mb-2">
          {block.title && <div className="text-[0.82rem] font-semibold text-white">{block.title}</div>}
          {block.summary && <div className="mt-0.5 text-[0.78rem] text-text-muted leading-snug">{block.summary}</div>}
        </div>
      )}

      {block.steps && block.steps.length > 0 && (
        <ol className="list-decimal list-outside pl-5 space-y-1 text-[0.85rem] text-white/95">
          {block.steps.map((s, i) => (
            <li key={i} className="leading-relaxed">
              {s}
            </li>
          ))}
        </ol>
      )}

      {block.code?.text && (
        <div className="mt-2 rounded-lg border border-border/80 bg-black/30 overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/70 bg-black/20">
            <span className="text-[0.72rem] text-text-muted">{block.code.language || 'code'}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(block.code?.text || '')}
              className="text-[0.72rem] text-text-muted hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Copy
            </button>
          </div>
          <pre className="p-2.5 text-[0.8rem] leading-relaxed overflow-auto scrollbar-glass">
            <code className="text-white/95">{block.code.text}</code>
          </pre>
        </div>
      )}

      {block.links && block.links.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {block.links.map((l, i) => {
            const href = safeExternalHref(l.url)
            if (!href) return null
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white/[0.06] px-2.5 py-1 text-[0.75rem] text-white hover:bg-white/10"
              >
                <span className="truncate max-w-[240px]">{l.label}</span>
                <span aria-hidden className="text-white/70">
                  ↗
                </span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

