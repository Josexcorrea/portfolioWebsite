import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize from 'rehype-sanitize'
import 'katex/dist/katex.min.css'
import type { ChatBlock } from '../types'
import { ExampleCard } from './ExampleCard'
import {
  prepareAssistantMathMarkdown,
  stripRagSourceMarkersForDisplay,
} from '../utils/prepareMathMarkdown'
import { safeExternalHref } from '../utils/safeExternalHref'
import { chatMarkdownComponents, chatSanitizeSchema } from './assistantMarkdownComponents'

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
