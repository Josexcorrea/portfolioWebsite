import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDesktop } from './DesktopContext'
import { MacWindowControls } from './MacWindowControls'
import { useDrag } from './useDrag'
import { useResize, type ResizeEdge } from './useResize'
import type { AppId, SnapZone, WindowAnimPhase } from './types'

type MacWindowProps = {
  appId:    AppId
  title:    string
  children: ReactNode
}

function animClass(phase: WindowAnimPhase): string {
  switch (phase) {
    case 'opening':   return 'mac-window--opening'
    case 'closing':   return 'mac-window--closing'
    case 'minimizing': return 'mac-window--minimizing'
    case 'restoring': return 'mac-window--restoring'
    default:          return ''
  }
}

/** Measured chrome; set on :root by DesktopProvider (see global.css fallbacks). */
const TOP_STACK = 'var(--mac-menubar-stack)'
const DOCK_RESERVED = 'var(--mac-dock-reserved)'

function snapPreviewStyle(zone: SnapZone): React.CSSProperties {
  if (zone === 'left') {
    return { left: 0, top: TOP_STACK, width: '50vw', bottom: DOCK_RESERVED }
  }
  if (zone === 'right') {
    return { right: 0, top: TOP_STACK, width: '50vw', bottom: DOCK_RESERVED }
  }
  if (zone === 'top') {
    return { left: 0, top: TOP_STACK, width: '100vw', bottom: DOCK_RESERVED }
  }
  return {}
}

export function MacWindow({ appId, title, children }: MacWindowProps) {
  const {
    windows,
    focusedApp,
    focusApp,
    dragApp,
    resizeApp,
    snapApp,
    animDoneApp,
    layoutMetrics,
  } = useDesktop()
  const win = windows[appId]
  const [hoverZone, setHoverZone] = useState<SnapZone>(null)

  const { handleDragStart, handleDragMove, handleDragEnd } = useDrag(
    (x, y) => dragApp(appId, { x, y }),
    setHoverZone,
    (finalZone) => {
      if (finalZone === 'top') {
        snapApp(appId, 'top')
      } else if (finalZone) {
        snapApp(appId, finalZone)
      }
      setHoverZone(null)
    },
    layoutMetrics.menuBarBottom,
  )

  const { handleResizeStart, handleResizeMove, handleResizeEnd } = useResize(
    (w, h, x, y) => resizeApp(appId, { w, h }, { x, y }),
    layoutMetrics.menuBarBottom,
  )

  if (!win.isOpen) return null
  if (win.isMinimized && win.animPhase === 'idle') return null

  const isFocused = focusedApp === appId
  const phase = win.animPhase
  const isSnapped = !!win.snapZone
  const isMaximizedOrTop = win.isMaximized || win.snapZone === 'top'

  const windowStyle: React.CSSProperties = isMaximizedOrTop
    ? {
        position: 'fixed',
        top: TOP_STACK,
        left: 0,
        right: 0,
        bottom: DOCK_RESERVED,
        width: '100vw',
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : isSnapped
      ? {
          position: 'fixed',
          left: win.position.x,
          top: win.position.y,
          width: win.size.w,
          height: win.size.h,
          zIndex: win.zIndex,
          borderRadius: 0,
        }
      : {
          position: 'absolute',
          left:   win.position.x,
          top:    win.position.y,
          width:  win.size.w,
          height: win.size.h,
          zIndex: win.zIndex,
        }

  return (
    <>
      {/* Snap preview overlay — portaled to body so .mac-window overflow:hidden doesn't clip it */}
      {hoverZone && createPortal(
        <div
          className="snap-preview"
          style={{
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none',
            borderRadius: hoverZone === 'top' ? 0 : 10,
            ...snapPreviewStyle(hoverZone),
          }}
        />,
        document.body,
      )}

      <div
        className={[
          'mac-window',
          animClass(phase),
          isFocused ? 'mac-window--focused' : '',
          isMaximizedOrTop ? 'mac-window--maximized' : '',
          isSnapped && !isMaximizedOrTop ? 'mac-window--snapped' : '',
        ].filter(Boolean).join(' ')}
        data-app-id={appId}
        style={windowStyle}
        onPointerDown={() => focusApp(appId)}
        onAnimationEnd={() => animDoneApp(appId)}
      >
        {/* Title bar — drag handle */}
        <div
          className="mac-titlebar"
          onPointerDown={(e) => {
            if (!isMaximizedOrTop) {
              handleDragStart(e, win.position.x, win.position.y)
            }
          }}
          onPointerMove={handleDragMove}
          onPointerUp={(e) => handleDragEnd(e)}
          onPointerCancel={() => handleDragEnd()}
        >
          <MacWindowControls appId={appId} />
          <span className="mac-titlebar-title">{title}</span>
          <span className="mac-titlebar-spacer" aria-hidden />
        </div>

        {/* Content area */}
        <div className="mac-window-content">
          {children}
        </div>

        {/* Resize handles — all 8 edges/corners, hidden when maximized or snapped */}
        {!isMaximizedOrTop && !isSnapped && (
          (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as ResizeEdge[]).map(edge => (
            <div
              key={edge}
              className={`mac-resize-handle mac-resize-handle--${edge}`}
              onPointerDown={(e) =>
                handleResizeStart(e, edge, win.size.w, win.size.h, win.position.x, win.position.y)
              }
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
            />
          ))
        )}
      </div>
    </>
  )
}
