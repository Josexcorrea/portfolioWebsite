import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import type { ChatBlock } from '../types'
import { ExampleCard } from './ExampleCard'

function safeExternalHref(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

export function AssistantRenderer({ content, blocks }: { content: string; blocks?: ChatBlock[] }) {
  return (
    <div className="text-white">
      {content.trim().length > 0 && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:text-accent/90 underline underline-offset-2"
              />
            ),
            code: ({ className, children, ...props }) => {
              const isBlock = /\n/.test(String(children))
              if (!isBlock) {
                return (
                  <code
                    {...props}
                    className="rounded bg-black/30 px-1.5 py-0.5 text-[0.82rem] border border-border/70"
                  >
                    {children}
                  </code>
                )
              }
              return (
                <pre className="my-2 rounded-lg border border-border/80 bg-black/30 overflow-auto scrollbar-glass p-2.5">
                  <code {...props} className={className ? className : 'text-white/95'}>
                    {children}
                  </code>
                </pre>
              )
            },
            ul: ({ ...props }) => <ul {...props} className="list-disc list-outside pl-5 space-y-1 my-2" />,
            ol: ({ ...props }) => <ol {...props} className="list-decimal list-outside pl-5 space-y-1 my-2" />,
            p: ({ ...props }) => <p {...props} className="leading-relaxed mb-2 last:mb-0" />,
            strong: ({ ...props }) => <strong {...props} className="font-semibold text-white" />,
          }}
        >
          {content}
        </ReactMarkdown>
      )}

      {blocks?.map((b, i) => {
        if (b.type === 'example') return <ExampleCard key={i} block={b} />
        if (b.type === 'callout') {
          return (
            <div
              key={i}
              className={
                'mt-2 rounded-xl border p-3 text-[0.85rem] leading-relaxed ' +
                (b.tone === 'warning'
                  ? 'border-red-500/25 bg-red-500/10 text-red-200'
                  : 'border-accent/20 bg-accent/10 text-white/90')
              }
            >
              {b.text}
            </div>
          )
        }
        if (b.type === 'linkCard') {
          const href = safeExternalHref(b.url)
          if (!href) return null
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block rounded-xl border border-border/80 bg-white/[0.06] p-3 hover:bg-white/10"
            >
              <div className="text-[0.85rem] font-semibold text-white">{b.title}</div>
              {b.description && <div className="mt-0.5 text-[0.78rem] text-text-muted">{b.description}</div>}
              <div className="mt-1 text-[0.72rem] text-accent break-all">{href}</div>
            </a>
          )
        }
        return null
      })}
    </div>
  )
}

