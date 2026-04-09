import { useCallback } from 'react'
import { useDesktop } from './DesktopContext'
import { DockItem } from './DockItem'
import { DOCK_APP_ENTRIES, DOCK_ICONS } from './dockIcons'
import type { AppId } from './types'

/**
 * macOS-style dock.
 *
 * CSS :has rules handle icon magnification — no JavaScript overhead.
 * DockItem handles bounce animation and open-indicator dots.
 */
export function Dock() {
  const { windows, openApp, restoreApp, isMinimized, dockVisible } = useDesktop()

  const handleAppClick = useCallback(
    (appId: AppId) => {
      if (isMinimized(appId)) {
        restoreApp(appId)
      } else {
        openApp(appId)
      }
    },
    [isMinimized, openApp, restoreApp],
  )

  return (
    <nav
      className={`mac-dock-wrapper${dockVisible ? '' : ' mac-dock-wrapper--hidden'}`}
      aria-label="Application dock"
      aria-hidden={!dockVisible}
    >
      <div className="mac-dock" role="list">
        {DOCK_APP_ENTRIES.map(({ id, label, appId }) => (
          <DockItem
            key={id}
            id={id}
            label={label}
            icon={DOCK_ICONS[appId]}
            isOpen={windows[appId].isOpen && !windows[appId].isMinimized}
            onClick={() => handleAppClick(appId)}
          />
        ))}

        <div className="mac-dock-separator" role="separator" aria-hidden="true" />

        <DockItem
          id="github"
          label="GitHub"
          icon={DOCK_ICONS.github}
          href="https://github.com/josexcorrea"
          onClick={() => {}}
        />
        <DockItem
          id="linkedin"
          label="LinkedIn"
          icon={DOCK_ICONS.linkedin}
          href="https://linkedin.com/in/josexcorrea"
          onClick={() => {}}
        />
      </div>
    </nav>
  )
}
