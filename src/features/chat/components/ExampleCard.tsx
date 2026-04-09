import type { ExampleCardBlock } from '../types'
import { safeExternalHref } from '../utils/safeExternalHref'

function copyToClipboard(text: string) {
  if (!text) return
  void navigator.clipboard?.writeText(text)
}

export function ExampleCard({
  block,
  tone = 'dark',
}: {
  block: ExampleCardBlock
  tone?: 'dark' | 'light'
}) {
  const light = tone === 'light'

  return (
    <div
      className={
        light
          ? 'mt-2 rounded border border-black/10 bg-white/75 p-3 shadow-sm'
          : 'mt-2 rounded border border-white/[0.08] bg-white/[0.03] p-3'
      }
    >
      {(block.title || block.summary) && (
        <div className="mb-2">
          {block.title && (
            <div
              className={
                light
                  ? 'text-[0.8rem] font-medium text-[#000000]'
                  : 'text-[0.8rem] font-medium text-white/80'
              }
            >
              {block.title}
            </div>
          )}
          {block.summary && (
            <div
              className={
                light
                  ? 'mt-0.5 text-[0.75rem] text-[#636366] leading-snug'
                  : 'mt-0.5 text-[0.75rem] text-white/45 leading-snug'
              }
            >
              {block.summary}
            </div>
          )}
        </div>
      )}

      {block.steps && block.steps.length > 0 && (
        <ol
          className={
            light
              ? 'list-decimal list-outside pl-5 space-y-1 text-[0.82rem] text-[#3a3a3c]'
              : 'list-decimal list-outside pl-5 space-y-1 text-[0.82rem] text-white/75'
          }
        >
          {block.steps.map((s, i) => (
            <li key={i} className="leading-relaxed">
              {s}
            </li>
          ))}
        </ol>
      )}

      {block.code?.text && (
        <div
          className={
            light
              ? 'mt-2 rounded border border-black/10 bg-[#f2f2f7] overflow-hidden'
              : 'mt-2 rounded border border-white/[0.07] bg-black/40 overflow-hidden'
          }
        >
          <div
            className={
              light
                ? 'flex items-center justify-between px-2.5 py-1.5 border-b border-black/[0.08] bg-black/[0.03]'
                : 'flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.06] bg-black/20'
            }
          >
            <span
              className={
                light
                  ? 'text-[0.68rem] text-[#636366] font-mono'
                  : 'text-[0.68rem] text-white/35 font-mono'
              }
            >
              {block.code.language || 'code'}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(block.code?.text || '')}
              className={
                light
                  ? 'text-[0.68rem] text-[#636366] hover:text-[#1c1c1e] px-2 py-0.5 rounded hover:bg-black/[0.06] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#007aff]/40 transition-colors'
                  : 'text-[0.68rem] text-white/35 hover:text-white/70 px-2 py-0.5 rounded hover:bg-white/[0.06] focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 transition-colors'
              }
            >
              copy
            </button>
          </div>
          <pre className="p-2.5 text-[0.78rem] leading-relaxed overflow-auto scrollbar-glass">
            <code
              className={light ? 'text-[#1c1c1e] font-mono' : 'text-white/75 font-mono'}
            >
              {block.code.text}
            </code>
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
                className={
                  light
                    ? 'inline-flex items-center gap-1.5 rounded border border-black/10 bg-white/90 px-2.5 py-1 text-[0.72rem] text-[#007aff] hover:bg-white transition-colors'
                    : 'inline-flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[0.72rem] text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-colors'
                }
              >
                <span className="truncate max-w-[240px]">{l.label}</span>
                <span aria-hidden className={light ? 'text-[#007aff]/80' : 'text-white/70'}>
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

