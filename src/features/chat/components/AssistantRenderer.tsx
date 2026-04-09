import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import 'katex/dist/katex.min.css'
import type { ChatBlock } from '../types'
import { ExampleCard } from './ExampleCard'
import {
  prepareAssistantMathMarkdown,
  stripRagSourceMarkersForDisplay,
} from '../utils/prepareMathMarkdown'

const chatSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [['className', /^language-./, 'math-inline', 'math-display']],
  },
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

function chatMarkdownComponents(tone: 'dark' | 'light'): Components {
  const light = tone === 'light'

  return {
    a: ({ href, children, ...props }) => {
      const safe = typeof href === 'string' ? safeExternalHref(href) : null
      if (!safe) {
        return (
          <span
            {...props}
            className={light ? 'text-[#636366]' : 'text-text-muted'}
          >
            {children}
          </span>
        )
      }
      return (
        <a
          {...props}
          href={safe}
          target="_blank"
          rel="noreferrer"
          className={
            light
              ? 'text-[#007aff] hover:text-[#0066d6] underline underline-offset-2'
              : 'text-accent hover:text-accent/90 underline underline-offset-2'
          }
        >
          {children}
        </a>
      )
    },
    code: ({ className, children, ...props }) => {
      const isBlock = /\n/.test(String(children))
      if (!isBlock) {
        return (
          <code
            {...props}
            className={
              light
                ? 'rounded bg-black/[0.07] px-1.5 py-0.5 text-[0.82rem] border border-black/10 text-[#1c1c1e]'
                : 'rounded bg-black/30 px-1.5 py-0.5 text-[0.82rem] border border-border/70 text-white/95'
            }
          >
            {children}
          </code>
        )
      }
      return (
        <pre
          className={
            light
              ? 'my-2 rounded-lg border border-black/10 bg-black/[0.04] overflow-auto scrollbar-glass p-2.5'
              : 'my-2 rounded-lg border border-border/80 bg-black/30 overflow-auto scrollbar-glass p-2.5'
          }
        >
          <code
            {...props}
            className={className ? className : light ? 'text-[#1c1c1e]' : 'text-white/95'}
          >
            {children}
          </code>
        </pre>
      )
    },
    ul: ({ ...props }) => <ul {...props} className="list-disc list-outside pl-5 space-y-1 my-2" />,
    ol: ({ ...props }) => <ol {...props} className="list-decimal list-outside pl-5 space-y-1 my-2" />,
    li: ({ ...props }) => (
      <li
        {...props}
        className={light ? 'leading-relaxed text-[#1c1c1e]' : 'leading-relaxed text-white/95'}
      />
    ),
    p: ({ ...props }) => (
      <p
        {...props}
        className={
          light
            ? 'leading-relaxed mb-2 last:mb-0 text-[#1c1c1e]'
            : 'leading-relaxed mb-2 last:mb-0 text-white/95'
        }
      />
    ),
    strong: ({ ...props }) => (
      <strong
        {...props}
        className={light ? 'font-semibold text-[#000000]' : 'font-semibold text-white'}
      />
    ),
    em: ({ ...props }) => (
      <em {...props} className={light ? 'text-[#1c1c1e]' : 'text-white/95'} />
    ),
    hr: ({ ...props }) => (
      <hr {...props} className={light ? 'my-3 border-black/12' : 'my-3 border-border/80'} />
    ),
    blockquote: ({ ...props }) => (
      <blockquote
        {...props}
        className={
          light
            ? 'my-2 border-l-2 border-[#007aff]/45 bg-black/[0.04] px-3 py-2 rounded-r-lg text-[#3a3a3c]'
            : 'my-2 border-l-2 border-accent/40 bg-black/20 px-3 py-2 rounded-r-lg text-white/90'
        }
      />
    ),
    h1: ({ ...props }) => (
      <h1
        {...props}
        className={
          light
            ? 'mt-2 mb-1 text-[1.05rem] font-semibold tracking-tight text-[#000000]'
            : 'mt-2 mb-1 text-[1.05rem] font-semibold tracking-tight text-white'
        }
      />
    ),
    h2: ({ ...props }) => (
      <h2
        {...props}
        className={
          light
            ? 'mt-3 mb-1 text-[1.0rem] font-semibold tracking-tight text-[#000000]'
            : 'mt-3 mb-1 text-[1.0rem] font-semibold tracking-tight text-white'
        }
      />
    ),
    h3: ({ ...props }) => (
      <h3
        {...props}
        className={
          light
            ? 'mt-3 mb-1 text-[0.95rem] font-semibold tracking-tight text-[#000000]'
            : 'mt-3 mb-1 text-[0.95rem] font-semibold tracking-tight text-white'
        }
      />
    ),
    table: ({ ...props }) => (
      <div className="my-2 overflow-auto scrollbar-glass">
        <table {...props} className="w-full border-collapse text-[0.85rem]" />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead {...props} className={light ? 'text-[#1c1c1e]' : 'text-white'} />
    ),
    th: ({ ...props }) => (
      <th
        {...props}
        className={
          light
            ? 'border border-black/12 bg-black/[0.05] px-2 py-1 text-left text-[#1c1c1e]'
            : 'border border-border/80 bg-white/[0.06] px-2 py-1 text-left'
        }
      />
    ),
    td: ({ ...props }) => (
      <td
        {...props}
        className={
          light
            ? 'border border-black/12 px-2 py-1 text-[#1c1c1e]'
            : 'border border-border/80 px-2 py-1 text-white/90'
        }
      />
    ),
  }
}

export function AssistantRenderer({
  content,
  blocks,
  tone = 'dark',
}: {
  content: string
  blocks?: ChatBlock[]
  tone?: 'dark' | 'light'
}) {
  const md = stripRagSourceMarkersForDisplay(prepareAssistantMathMarkdown(content))
  const light = tone === 'light'

  return (
    <div className={light ? 'chat-markdown text-[#1c1c1e]' : 'chat-markdown text-text-pri'}>
      {md.trim().length > 0 && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            [rehypeSanitize, chatSanitizeSchema],
            [rehypeKatex, { errorColor: light ? '#dc2626' : '#f87171', strict: 'ignore' }],
          ]}
          components={chatMarkdownComponents(tone)}
        >
          {md}
        </ReactMarkdown>
      )}

      {blocks?.map((b, i) => {
        if (b.type === 'example') return <ExampleCard key={i} block={b} tone={tone} />
        if (b.type === 'callout') {
          return (
            <div
              key={i}
              className={
                'mt-2 rounded-xl border p-3 text-[0.85rem] leading-relaxed ' +
                (b.tone === 'warning'
                  ? light
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-red-500/25 bg-red-500/10 text-red-200'
                  : light
                    ? 'border-[#007aff]/25 bg-[#007aff]/08 text-[#1c1c1e]'
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
              className={
                light
                  ? 'mt-2 block rounded-xl border border-black/10 bg-white/70 p-3 hover:bg-white shadow-sm'
                  : 'mt-2 block rounded-xl border border-border/80 bg-white/[0.06] p-3 hover:bg-white/10'
              }
            >
              <div
                className={
                  light
                    ? 'text-[0.85rem] font-semibold text-[#000000]'
                    : 'text-[0.85rem] font-semibold text-white'
                }
              >
                {b.title}
              </div>
              {b.description && (
                <div
                  className={
                    light
                      ? 'mt-0.5 text-[0.78rem] text-[#636366]'
                      : 'mt-0.5 text-[0.78rem] text-text-muted'
                  }
                >
                  {b.description}
                </div>
              )}
              <div
                className={
                  light
                    ? 'mt-1 text-[0.72rem] text-[#007aff] break-all'
                    : 'mt-1 text-[0.72rem] text-accent break-all'
                }
              >
                {href}
              </div>
            </a>
          )
        }
        return null
      })}
    </div>
  )
}
