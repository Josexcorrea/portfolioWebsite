import { useState } from 'react'
import { AVATAR_IMAGE } from '@/data'

const STACK = ['Python', 'TypeScript', 'React', 'Node.js', 'ML / LLMs', 'PostgreSQL', 'Docker', 'AWS']

export function AboutWindow() {
  const [avatarError, setAvatarError] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto scrollbar-glass">
      {/* Profile row */}
      <div className="flex items-center gap-5">
        <div
          className="relative shrink-0 overflow-hidden rounded-2xl"
          style={{
            width: 96,
            height: 118,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          {!avatarError ? (
            <img
              src={AVATAR_IMAGE}
              alt="Portrait of Jose Correa"
              className="absolute inset-0 h-full w-full object-cover object-top"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold tracking-widest"
              style={{ color: 'var(--text-main)' }}
              aria-label="Jose Correa"
            >
              JC
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--text-soft)' }}>
            Hi, I'm
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>
            Jose Correa
          </h2>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--text-soft)' }}>
            Full‑Stack &amp; ML Engineer
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[0.68rem] font-medium tracking-wide" style={{ color: '#059669' }}>
              Open to work · New York
            </span>
          </div>
        </div>
      </div>

      <hr className="mac-divider" />

      {/* Bio */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--text-soft)' }}>
          About
        </h3>
        <p className="text-[0.88rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Computer Engineering graduate who enjoys building systems that combine software, data,
          and real-world applications. My work ranges from full-stack applications to machine
          learning models and real-time systems, with a focus on performance, reliability, and
          practical impact.
        </p>
        <p className="text-[0.88rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Early on, I built the full-stack technical foundation for a growing med spa — translating
          day-to-day workflows into an inventory system staff could actually use. I've built projects
          like a sportsbook pricing engine that learns fair no-vig prices from historical line movement,
          and a real-time telemetry platform for a Formula SAE race car's power distribution module.
        </p>
        <p className="text-[0.88rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Currently looking for roles in New York. Ask the AI Assistant about my projects, experience,
          and how I build things.
        </p>
      </div>

      <hr className="mac-divider" />

      {/* Stack */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--text-soft)' }}>
          Core Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {STACK.map(s => (
            <span key={s} className="mac-pill">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
