import { useCallback, useEffect, useState } from 'react'
import { useDesktop } from './DesktopContext'
import { DOCK_APP_ENTRIES, DOCK_ICONS, IosDockThemeGlyph } from './dockIcons'
import type { AppId } from './types'

function IosStatusBar() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }),
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(
        new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }),
      )
    }, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="ios-home-status" aria-hidden>
      <span className="ios-home-status-time">{time}</span>
    </header>
  )
}

/**
 * iPhone-style home screen: app grid + dock over the live 3D wallpaper (z below windows).
 */
export function MobileIOSHome() {
  const { windows, openApp, restoreApp, isMinimized, toggleTheme, theme } = useDesktop()

  const handleApp = useCallback(
    (appId: AppId) => {
      if (isMinimized(appId)) restoreApp(appId)
      else openApp(appId)
    },
    [isMinimized, openApp, restoreApp],
  )

  return (
    <div className="ios-home-root" aria-label="Home screen">
      <div className="ios-home-bezel">
        <div className="ios-home-notch" aria-hidden />
        <div className="ios-home-inner">
          <IosStatusBar />

          <div className="ios-home-grid" role="list">
            {DOCK_APP_ENTRIES.map(({ id, label, appId }) => {
              const w = windows[appId]
              const running = w.isOpen
              const minimized = w.isOpen && w.isMinimized
              const foreground = w.isOpen && !w.isMinimized
              return (
                <button
                  key={id}
                  type="button"
                  role="listitem"
                  className="ios-app-tile"
                  onClick={() => handleApp(appId)}
                  aria-label={
                    minimized ? `${label}, minimized` : foreground ? `${label}, open` : label
                  }
                >
                  <span
                    className={[
                      'ios-app-icon',
                      running ? 'ios-app-icon--open' : '',
                      minimized ? 'ios-app-icon--minimized' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {DOCK_ICONS[appId]}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="ios-home-dock-wrap">
            <nav className="ios-home-dock" aria-label="Quick links">
              <a
                className="ios-dock-icon-link"
                href="https://github.com/josexcorrea"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <span className="ios-dock-icon">{DOCK_ICONS.github}</span>
              </a>
              <a
                className="ios-dock-icon-link"
                href="https://linkedin.com/in/josexcorrea"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <span className="ios-dock-icon">{DOCK_ICONS.linkedin}</span>
              </a>
              <button
                type="button"
                className="ios-dock-icon-link ios-dock-theme"
                onClick={() => toggleTheme()}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="ios-dock-icon ios-dock-icon--glyph" aria-hidden>
                  <IosDockThemeGlyph mode={theme === 'dark' ? 'sun' : 'moon'} />
                </span>
              </button>
            </nav>
          </div>

          <div className="ios-home-indicator" aria-hidden />
        </div>
      </div>
    </div>
  )
}
