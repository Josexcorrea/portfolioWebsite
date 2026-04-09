import { useState } from 'react'

const EMAIL = 'Josexcorrea03@gmail.com'
const SUBJECT = 'Hello from your portfolio'
const DEFAULT_BODY = 'Hi Jose,\n\nI came across your portfolio and wanted to reach out...'

export function ContactWindow() {
  const [copied, setCopied] = useState(false)
  const [body, setBody] = useState(DEFAULT_BODY)

  const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`
  const gmailHref = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="contact-win-body flex flex-col h-full overflow-y-auto scrollbar-glass">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 pt-6 pb-5"
        style={{ borderBottom: '1px solid var(--color-line)' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl shadow-md"
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(145deg, #1a73e8, #0d47a1)',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }} fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.5" />
            <path d="M2 7.5 L12 13.5 L22 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            New Message
          </h2>
          <p className="text-[0.72rem] font-medium" style={{ color: 'var(--text-soft)' }}>
            A draft will be pre-filled and ready to send
          </p>
        </div>
      </div>

      {/* Draft preview card */}
      <div className="px-6 pt-5 pb-4">
        <div
          className="contact-win-card rounded-2xl overflow-hidden shadow-sm"
          style={{ border: '1px solid var(--color-line)' }}
        >
          {/* Compose toolbar */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--color-line)', background: 'var(--color-surface)' }}
          >
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
              Draft
            </span>
          </div>

          {/* To field */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <span className="text-[0.72rem] font-semibold w-14 shrink-0" style={{ color: 'var(--text-soft)' }}>To:</span>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-medium"
                style={{ background: 'rgba(26,115,232,0.12)', color: '#1a73e8', border: '1px solid rgba(26,115,232,0.25)' }}
              >
                <svg viewBox="0 0 16 16" style={{ width: 11, height: 11, flexShrink: 0 }} fill="none">
                  <circle cx="8" cy="6" r="3.5" fill="#1a73e8" />
                  <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#1a73e8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                </svg>
                {EMAIL}
              </span>
              <button
                onClick={copyEmail}
                className="ml-auto shrink-0 flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-medium transition-all"
                style={{
                  color: copied ? '#059669' : 'var(--text-soft)',
                  background: copied ? 'rgba(5,150,105,0.08)' : 'transparent',
                  border: copied ? '1px solid rgba(5,150,105,0.2)' : '1px solid transparent',
                }}
              >
                {copied ? (
                  <>
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }} fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }} fill="none">
                      <rect x="4" y="1" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                      <rect x="1" y="3.5" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="var(--color-bg-panel)" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject field */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <span className="text-[0.72rem] font-semibold w-14 shrink-0" style={{ color: 'var(--text-soft)' }}>Subject:</span>
            <span className="text-[0.8rem] font-medium" style={{ color: 'var(--text-muted)' }}>{SUBJECT}</span>
          </div>

          {/* Body — editable */}
          <div className="px-4 py-3">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              className="w-full resize-none bg-transparent outline-none text-[0.78rem] leading-relaxed"
              style={{ color: 'var(--text-muted)', caretColor: '#1a73e8' }}
            />
          </div>
        </div>
      </div>

      {/* Open options */}
      <div className="px-6 pb-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-soft)' }}>
          Open with
        </p>
        <div className="flex flex-col gap-2.5">

          {/* Mail App button */}
          <a
            href={mailtoHref}
            className="contact-win-action flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all group"
            style={{ textDecoration: 'none' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 4px 18px rgba(26,115,232,0.18)'
              el.style.borderColor = 'rgba(26,115,232,0.35)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = ''
              el.style.borderColor = ''
              el.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(145deg, #1a73e8, #0d47a1)',
                boxShadow: '0 2px 8px rgba(26,115,232,0.30)',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }} fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5" />
                <path d="M2 7.5 L12 13.5 L22 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[0.88rem] font-semibold" style={{ color: 'var(--text-main)' }}>Open Mail App</span>
              <span className="text-[0.72rem]" style={{ color: 'var(--text-soft)' }}>Opens your default email client</span>
            </div>
            <svg
              viewBox="0 0 16 16"
              style={{ width: 14, height: 14, marginLeft: 'auto', flexShrink: 0, color: 'var(--text-soft)' }}
              fill="none"
            >
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Gmail button */}
          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-win-action flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all"
            style={{ textDecoration: 'none' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 4px 18px rgba(234,67,53,0.18)'
              el.style.borderColor = 'rgba(234,67,53,0.35)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = ''
              el.style.borderColor = ''
              el.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0 overflow-hidden"
              style={{
                width: 44,
                height: 44,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }} fill="none">
                <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" fill="none" />
                <rect x="2" y="6" width="20" height="14" rx="2" stroke="none" fill="none" />
                <path d="M2 6v12a2 2 0 002 2h4V10l4 3 4-3v10h4a2 2 0 002-2V6l-10 7L2 6z" fill="#EA4335" />
                <path d="M2 6v12a2 2 0 002 2h4V10" fill="#C5221F" />
                <path d="M18 10v10h4a2 2 0 002-2V6" fill="#C5221F" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[0.88rem] font-semibold" style={{ color: 'var(--text-main)' }}>Open in Gmail</span>
              <span className="text-[0.72rem]" style={{ color: 'var(--text-soft)' }}>Opens in browser, draft pre-filled</span>
            </div>
            <svg
              viewBox="0 0 16 16"
              style={{ width: 14, height: 14, marginLeft: 'auto', flexShrink: 0, color: 'var(--text-soft)' }}
              fill="none"
            >
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 pt-4 pb-6 mt-auto">
        <div
          className="flex items-start gap-2 rounded-xl px-3.5 py-3"
          style={{ background: 'rgba(26,115,232,0.08)', border: '1px solid rgba(26,115,232,0.18)' }}
        >
          <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#1a73e8" strokeWidth="1.2" />
            <path d="M8 7v5" stroke="#1a73e8" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.8" fill="#1a73e8" />
          </svg>
          <p className="text-[0.7rem] leading-relaxed" style={{ color: '#1a73e8' }}>
            The recipient, subject, and a starter message are pre-filled. Just add your message and hit send!
          </p>
        </div>
      </div>
    </div>
  )
}
