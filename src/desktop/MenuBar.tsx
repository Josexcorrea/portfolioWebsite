import { useState, useRef, useEffect, useCallback } from 'react'
import { useDesktop } from './DesktopContext'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import type { AppId } from './types'

const APP_LABELS: Record<AppId, string> = {
  finder:     'Finder',
  about:      'About',
  projects:   'Projects',
  experience: 'Experience',
  skills:     'Skills',
  resume:     'Resume',
  contact:    'Contact',
  chat:       'AI Assistant',
}

type MenuId = 'file' | 'edit' | 'view'

type MenuItem =
  | { kind: 'action'; label: string; shortcut?: string; disabled?: boolean; onClick: () => void }
  | { kind: 'separator' }
  | { kind: 'header'; label: string }

// ─── Sub-components ───────────────────────────────────────────────────────────

function SiteLogo() {
  return (
    <img
      src="/favicon.svg"
      width="18"
      height="18"
      alt=""
      aria-hidden
      draggable={false}
      style={{ display: 'block', borderRadius: 4 }}
    />
  )
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 2200)
    return () => window.clearTimeout(id)
  }, [onDone])

  return (
    <div className="mac-toast" role="status" aria-live="polite">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  )
}

function DropdownMenu({ items, theme }: { items: MenuItem[]; theme: 'dark' | 'light' }) {
  const tint = theme === 'dark'
    ? 'rgba(28, 28, 34, 0.88)'
    : undefined

  return (
    <LiquidGlass
      className="mac-menu-dropdown"
      role="menu"
      blurIntensity="md"
      glowIntensity="none"
      shadowIntensity="none"
      borderRadius="8px"
      tint={tint}
    >
      {items.map((item, i) => {
        if (item.kind === 'separator') {
          return <div key={i} className="mac-menu-separator" role="separator" />
        }
        if (item.kind === 'header') {
          return (
            <div key={i} className="mac-menu-section-header" aria-hidden>
              {item.label}
            </div>
          )
        }
        return (
          <button
            key={i}
            role="menuitem"
            className={`mac-menu-item${item.disabled ? ' mac-menu-item--disabled' : ''}`}
            onClick={item.disabled ? undefined : item.onClick}
            disabled={item.disabled}
            tabIndex={item.disabled ? -1 : 0}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="mac-menu-shortcut" aria-hidden>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      })}
    </LiquidGlass>
  )
}

// ─── Main MenuBar ─────────────────────────────────────────────────────────────

export function MenuBar() {
  const {
    focusedApp,
    openApp,
    closeApp,
    toggleMaximize,
    tileWindows,
    bringAllToFront,
    toggleDock,
    dockVisible,
    windows,
    theme,
    toggleTheme,
  } = useDesktop()

  const [now, setNow] = useState(() => new Date())
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Close dropdown when clicking/tapping outside the menu bar
  useEffect(() => {
    if (!openMenu) return
    const handlePointerDown = (e: PointerEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [openMenu])

  // Close on Escape
  useEffect(() => {
    if (!openMenu) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [openMenu])

  const showToast = useCallback((msg: string) => setToast(msg), [])
  const closeMenu = useCallback(() => setOpenMenu(null), [])

  const handleMenuClick = (id: MenuId) => {
    setOpenMenu(prev => (prev === id ? null : id))
  }

  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit' })
  const activeLabel = focusedApp ? (APP_LABELS[focusedApp] ?? 'Desktop') : 'Desktop'

  const hasOpenWindows = Object.values(windows).some(w => w.isOpen && !w.isMinimized)
  const hasMinimized = Object.values(windows).some(w => w.isMinimized)

  // ── Menu definitions ──────────────────────────────────────────────────────

  const fileItems: MenuItem[] = [
    { kind: 'header', label: 'Open Window' },
    ...(
      ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'chat', 'finder'] as AppId[]
    ).map(id => ({
      kind: 'action' as const,
      label: APP_LABELS[id],
      onClick: () => { openApp(id); closeMenu() },
    })),
    { kind: 'separator' },
    {
      kind: 'action',
      label: 'Download Resume',
      onClick: () => {
        const a = document.createElement('a')
        a.href = '/resume.pdf'
        a.download = 'Jose_Correa_Resume.pdf'
        a.click()
        closeMenu()
      },
    },
    { kind: 'separator' },
    {
      kind: 'action',
      label: 'Close Window',
      shortcut: '⌘W',
      disabled: !focusedApp,
      onClick: () => {
        if (focusedApp) { closeApp(focusedApp); closeMenu() }
      },
    },
  ]

  const editItems: MenuItem[] = [
    {
      kind: 'action',
      label: 'Copy Email Address',
      shortcut: '⌘E',
      onClick: () => {
        navigator.clipboard.writeText('Josexcorrea03@gmail.com').then(() => {
          showToast('Email copied to clipboard')
        })
        closeMenu()
      },
    },
    {
      kind: 'action',
      label: 'Copy Page Link',
      onClick: () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Link copied to clipboard')
        })
        closeMenu()
      },
    },
  ]

  const viewItems: MenuItem[] = [
    {
      kind: 'action',
      label: 'Tile Windows',
      disabled: !hasOpenWindows,
      onClick: () => { tileWindows(); closeMenu() },
    },
    {
      kind: 'action',
      label: 'Bring All to Front',
      disabled: !hasMinimized,
      onClick: () => { bringAllToFront(); closeMenu() },
    },
    { kind: 'separator' },
    {
      kind: 'action',
      label: 'Zoom',
      shortcut: '⌘↑',
      disabled: !focusedApp,
      onClick: () => {
        if (focusedApp) { toggleMaximize(focusedApp); closeMenu() }
      },
    },
    { kind: 'separator' },
    {
      kind: 'action',
      label: dockVisible ? 'Hide Dock' : 'Show Dock',
      onClick: () => { toggleDock(); closeMenu() },
    },
    { kind: 'separator' },
    {
      kind: 'action',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      onClick: () => { toggleTheme(); closeMenu() },
    },
  ]

  const MENUS: { id: MenuId; label: string; items: MenuItem[] }[] = [
    { id: 'file', label: 'File', items: fileItems },
    { id: 'edit', label: 'Edit', items: editItems },
    { id: 'view', label: 'View', items: viewItems },
  ]

  return (
    <>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="mac-menubar" aria-label="Menu bar" role="menubar" ref={menuBarRef}>
        {/* ── Left: logo + app name + menus ── */}
        <div className="mac-menubar-section mac-menubar-section--left">
          <div className="mac-menubar-leading">
            <span className="mac-menubar-apple" aria-hidden>
              <SiteLogo />
            </span>
            <span className="mac-menubar-item mac-menubar-item--app">{activeLabel}</span>
          </div>

          {MENUS.map(({ id, label, items }) => (
            <div key={id} className="mac-menu-trigger-wrapper">
              <button
                type="button"
                className={`mac-menubar-item${openMenu === id ? ' mac-menubar-item--active' : ''}`}
                onClick={() => handleMenuClick(id)}
                onMouseEnter={() => openMenu !== null && openMenu !== id && setOpenMenu(id)}
                aria-haspopup="menu"
                aria-expanded={openMenu === id}
              >
                {label}
              </button>
              {openMenu === id && <DropdownMenu items={items} theme={theme} />}
            </div>
          ))}
        </div>

        {/* ── Right: Open to Work + date + clock ── */}
        <div className="mac-menubar-section mac-menubar-section--right">
          <span className="mac-menubar-otw" aria-label="Open to Work">
            <span className="mac-status-dot" aria-hidden />
            <span className="mac-menubar-otw-full">Open to Work</span>
            <span className="mac-menubar-otw-short" aria-hidden>OTW</span>
          </span>
          <span className="mac-menubar-item mac-menubar-item--muted" aria-hidden>
            {dateStr}
          </span>
          <span className="mac-menubar-clock" aria-label={`Time: ${timeStr}`}>
            {timeStr}
          </span>
        </div>
      </div>
    </>
  )
}
