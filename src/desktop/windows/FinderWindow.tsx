import { useState } from 'react'
import { useDesktop } from '../DesktopContext'
import type { AppId } from '../types'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

const SHORTCUTS: Array<{ appId: AppId; label: string; description: string; color: string }> = [
  { appId: 'about',      label: 'About Me',   description: 'Bio, photo, and tech stack',           color: '#5ac8fa' },
  { appId: 'projects',   label: 'Projects',   description: 'Case studies and demos',               color: '#34d399' },
  { appId: 'experience', label: 'Experience', description: 'Work history and education',            color: '#fb7185' },
  { appId: 'skills',     label: 'Skills',     description: '3D interactive skills globe',          color: '#8e8e93' },
  { appId: 'resume',     label: 'Resume',     description: 'Download or preview the PDF',          color: '#fbbf24' },
  { appId: 'contact',    label: 'Contact',    description: 'Email, LinkedIn, GitHub, and more',    color: '#1a73e8' },
  { appId: 'chat',       label: 'AI Chat',    description: 'Ask anything about this portfolio',    color: '#a855f7' },
]

/**
 * Finder / home window — shows a welcome message and quick-launch shortcuts
 * to every other app. Useful as a "start here" entry point.
 */
export function FinderWindow() {
  const { openApp, theme } = useDesktop()
  const [hoveredApp, setHoveredApp] = useState<AppId | null>(null)
  const isDark = theme === 'dark'

  return (
    <div className="finder-win-root scrollbar-glass">
      {/* Welcome header */}
      <div className="finder-win-header">
        <LiquidGlass
          borderRadius="12px"
          blurIntensity="sm"
          glowIntensity="xs"
          shadowIntensity="sm"
          className="finder-win-header-icon"
          aria-hidden="true"
        >
          <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
              <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <linearGradient id="fw-finder-gr" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5ac8fa" />
                    <stop offset="100%" stopColor="#007aff" />
                  </linearGradient>
                </defs>
                <rect width="60" height="60" fill="url(#fw-finder-gr)" />
                <path d="M7 21 L7 13 Q7 10 10 10 L23 10 Q26.5 10 28 13 L30.5 21 Z" fill="rgba(255,255,255,0.88)" />
                <rect x="7" y="21" width="46" height="30" rx="4" fill="rgba(255,255,255,0.93)" />
                <circle cx="37" cy="35" r="8.5" fill="none" stroke="#1d4ed8" strokeWidth="2.8" />
                <line x1="43" y1="41" x2="49" y2="48" stroke="#1d4ed8" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </LiquidGlass>
        <div>
          <h2 className="finder-win-title">Welcome</h2>
          <p className="finder-win-subtitle">Open any app from the dock — or click a shortcut below.</p>
        </div>
      </div>

      <hr className="mac-divider" />

      {/* Quick-launch grid */}
      <div className="finder-win-grid" role="list" aria-label="Quick launch shortcuts">
        {SHORTCUTS.map(({ appId, label, description, color }) => {
          const active = hoveredApp === appId
          return (
            <div
              key={appId}
              className="finder-win-card-wrap"
              onMouseEnter={() => setHoveredApp(appId)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <LiquidGlass
                borderRadius="12px"
                blurIntensity="sm"
                glowIntensity="xs"
                shadowIntensity="xs"
                className="finder-win-card-glass"
                tint={isDark
                  ? `color-mix(in srgb, ${color} 22%, rgba(12,12,20,0.70))`
                  : `color-mix(in srgb, ${color} 28%, rgba(255,255,255,0.68))`
                }
              >
                <button
                  type="button"
                  role="listitem"
                  className="finder-win-card-inner"
                  onClick={() => openApp(appId)}
                  aria-label={`Open ${label}`}
                >
                  <span
                    className="finder-win-card-dot"
                    style={{ background: color, boxShadow: `0 0 8px 2px ${color}55` }}
                    aria-hidden="true"
                  />
                  <span className="finder-win-card-label">{label}</span>
                  <span className="finder-win-card-desc">{description}</span>
                </button>
              </LiquidGlass>

              {/* Glare overlay — sits above the glass, clips to card shape */}
              <div
                aria-hidden="true"
                className="finder-win-card-glare"
                style={{
                  background: `linear-gradient(-40deg, transparent 55%, ${color} 70%, rgba(255,255,255,0.55) 78%, transparent 90%)`,
                  backgroundSize: '300% 300%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: active ? '100% 100%' : '-100% -100%',
                  opacity: active ? 1 : 0,
                  transition: 'background-position 850ms ease, opacity 600ms ease',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
