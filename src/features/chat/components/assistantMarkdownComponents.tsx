import type { Components } from 'react-markdown'
import { defaultSchema } from 'rehype-sanitize'
import { safeExternalHref } from '../utils/safeExternalHref'

export const chatSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [['className', /^language-./, 'math-inline', 'math-display']],
  },
}

export function chatMarkdownComponents(tone: 'dark' | 'light'): Components {
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
        <div className="chat-rich-card chat-rich-card--code">
          <pre className="chat-rich-code-pre scrollbar-glass">
            <code
              {...props}
              className={className ? className : light ? 'chat-rich-code-text chat-rich-code-text--light' : 'chat-rich-code-text chat-rich-code-text--dark'}
            >
              {children}
            </code>
          </pre>
        </div>
      )
    },
    ul: ({ ...props }) => (
      <ul {...props} className="chat-rich-list chat-rich-list--ul list-disc list-inside space-y-1.5 my-2" />
    ),
    ol: ({ ...props }) => (
      <ol {...props} className="chat-rich-list chat-rich-list--ol list-decimal list-inside space-y-1.5 my-2" />
    ),
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
        className="chat-rich-card chat-rich-card--quote"
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
      <div className="chat-rich-card chat-rich-card--table">
        <div className="chat-rich-table-scroll scrollbar-glass">
          <table {...props} className="chat-rich-table text-[0.85rem]" />
        </div>
      </div>
    ),
    thead: ({ ...props }) => (
      <thead {...props} className={light ? 'chat-rich-table-head chat-rich-table-head--light' : 'chat-rich-table-head chat-rich-table-head--dark'} />
    ),
    th: ({ ...props }) => (
      <th
        {...props}
        className={light ? 'chat-rich-table-th chat-rich-table-th--light' : 'chat-rich-table-th chat-rich-table-th--dark'}
      />
    ),
    td: ({ ...props }) => (
      <td
        {...props}
        className={light ? 'chat-rich-table-td chat-rich-table-td--light' : 'chat-rich-table-td chat-rich-table-td--dark'}
      />
    ),
  }
}

