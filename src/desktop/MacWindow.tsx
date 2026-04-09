import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDesktop } from './DesktopContext'
import { MacWindowControls } from './MacWindowControls'
import { useDrag } from './useDrag'
import { useResize, type ResizeEdge } from './useResize'
import { useMobileLauncher } from './useMobileLauncher'
import {
  type AppId,
  type LayoutSlot,
  type SnapZone,
  type WindowAnimPhase,
} from './types'

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
  if (zone === 'top-left') {
    return { left: 0, top: TOP_STACK, width: '50vw', height: 'calc((100vh - var(--mac-menubar-stack) - var(--mac-dock-reserved)) / 2)' }
  }
  if (zone === 'top-right') {
    return {
      right: 0,
      top: TOP_STACK,
      width: '50vw',
      height: 'calc((100vh - var(--mac-menubar-stack) - var(--mac-dock-reserved)) / 2)',
    }
  }
  if (zone === 'bottom-left') {
    return {
      left: 0,
      bottom: DOCK_RESERVED,
      width: '50vw',
      height: 'calc((100vh - var(--mac-menubar-stack) - var(--mac-dock-reserved)) / 2)',
    }
  }
  if (zone === 'bottom-right') {
    return {
      right: 0,
      bottom: DOCK_RESERVED,
      width: '50vw',
      height: 'calc((100vh - var(--mac-menubar-stack) - var(--mac-dock-reserved)) / 2)',
    }
  }
  return {}
}

function autoLayoutForZone(
  zone: Exclude<SnapZone, 'top' | null>,
  currentAppId: AppId,
  otherWindowIds: AppId[],
): Array<{ appId: AppId; slot: LayoutSlot }> {
  if ((zone === 'top-left' || zone === 'top-right' || zone === 'bottom-left' || zone === 'bottom-right') && otherWindowIds.length >= 3) {
    return [{
      appId: currentAppId,
      slot: zone,
    }]
  }

  const assignments: Array<{ appId: AppId; slot: LayoutSlot }> = []

  if (zone === 'top-left' || zone === 'bottom-left' || zone === 'left') {
    assignments.push({ appId: currentAppId, slot: 'left' })
    if (otherWindowIds[0]) assignments.push({ appId: otherWindowIds[0], slot: 'top-right' })
    if (otherWindowIds[1]) assignments.push({ appId: otherWindowIds[1], slot: 'bottom-right' })
    return assignments
  }

  if (zone === 'top-right' || zone === 'bottom-right' || zone === 'right') {
    assignments.push({ appId: currentAppId, slot: 'right' })
    if (otherWindowIds[0]) assignments.push({ appId: otherWindowIds[0], slot: 'top-left' })
    if (otherWindowIds[1]) assignments.push({ appId: otherWindowIds[1], slot: 'bottom-left' })
    return assignments
  }

  return [{ appId: currentAppId, slot: 'left' }]
}

export function MacWindow({ appId, title, children }: MacWindowProps) {
  const {
    windows,
    focusedApp,
    focusApp,
    dragApp,
    resizeApp,
    snapApp,
    applyLayoutPreset,
    animDoneApp,
    layoutMetrics,
  } = useDesktop()
  const win = windows[appId]
  const mobileLauncher = useMobileLauncher()
  const [hoverZone, setHoverZone] = useState<SnapZone>(null)

  const windowCandidates = Object.entries(windows)
    .filter(([id, w]) => id !== appId && w.isOpen && !w.isMinimized)
    .sort((a, b) => b[1].zIndex - a[1].zIndex) as [AppId, typeof win][]

  const applySnap = (zone: SnapZone) => {
    if (mobileLauncher) return
    if (!zone) {
      return
    }
    if (zone === 'top') {
      snapApp(appId, 'top')
      return
    }
    const otherIds = windowCandidates.map(([candidateId]) => candidateId)

    if (
      (zone === 'top-left' || zone === 'top-right' || zone === 'bottom-left' || zone === 'bottom-right') &&
      otherIds.length >= 3
    ) {
      const quadSlots: LayoutSlot[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      const remainingSlots = quadSlots.filter(slot => slot !== zone)
      applyLayoutPreset(appId, [
        { appId, slot: zone },
        { appId: otherIds[0], slot: remainingSlots[0] },
        { appId: otherIds[1], slot: remainingSlots[1] },
        { appId: otherIds[2], slot: remainingSlots[2] },
      ])
      return
    }

    if ((zone === 'left' || zone === 'right' || zone === 'top-left' || zone === 'top-right' || zone === 'bottom-left' || zone === 'bottom-right') && otherIds.length >= 2) {
      const assignments = autoLayoutForZone(zone, appId, otherIds)
      applyLayoutPreset(appId, assignments)
      return
    }

    snapApp(appId, zone)
  }

  const { handleDragStart, handleDragMove, handleDragEnd } = useDrag(
    (x, y) => dragApp(appId, { x, y }),
    setHoverZone,
    finalZone => {
      applySnap(finalZone)
      setHoverZone(null)
    },
    layoutMetrics.menuBarBottom,
  )

  const { handleResizeStart, handleResizeMove, handleResizeEnd } = useResize(
    (w, h, x, y) => resizeApp(appId, { w, h }, { x, y }),
    layoutMetrics.menuBarBottom,
  )

  if (!win.isOpen) return null

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
      {!mobileLauncher && hoverZone && createPortal(
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
          win.isMinimized && phase === 'idle' ? 'mac-window--minimized' : '',
          isFocused ? 'mac-window--focused' : '',
          isMaximizedOrTop ? 'mac-window--maximized' : '',
          isSnapped && !isMaximizedOrTop ? 'mac-window--snapped' : '',
          mobileLauncher ? 'mac-window--mobile' : '',
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
            if (!mobileLauncher) {
              handleDragStart(e, win.position.x, win.position.y)
            }
          }}
          onPointerMove={mobileLauncher ? undefined : handleDragMove}
          onPointerUp={mobileLauncher ? undefined : (e) => handleDragEnd(e)}
          onPointerCancel={mobileLauncher ? undefined : () => handleDragEnd()}
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
