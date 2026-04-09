import { useRef, useCallback } from 'react'
import { DEFAULT_LAYOUT_METRICS, type SnapZone } from './types'

type DragState = {
  startMouseX: number
  startMouseY: number
  startElemX:  number
  startElemY:  number
}

const SNAP_THRESHOLD = 24

function detectSnapZone(
  clientX: number,
  clientY: number,
  menuBarBottom: number,
): SnapZone {
  if (clientY <= menuBarBottom + 8) return 'top'
  if (clientX <= SNAP_THRESHOLD) return 'left'
  if (clientX >= window.innerWidth - SNAP_THRESHOLD) return 'right'
  return null
}

/**
 * Minimal pointer-capture drag hook with snap zone detection.
 * Attach the three handlers to the drag-handle element.
 */
export function useDrag(
  onDrag: (x: number, y: number) => void,
  onSnapZoneChange?: (zone: SnapZone) => void,
  onDragEnd?: (finalZone: SnapZone) => void,
  menuBarBottom: number = DEFAULT_LAYOUT_METRICS.menuBarBottom,
) {
  const drag = useRef<DragState | null>(null)
  const currentZone = useRef<SnapZone>(null)

  const handleDragStart = useCallback(
    (e: React.PointerEvent, currentX: number, currentY: number) => {
      if (e.button !== 0) return
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      drag.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startElemX:  currentX,
        startElemY:  currentY,
      }
      currentZone.current = null
    },
    [],
  )

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return
      const dx    = e.clientX - drag.current.startMouseX
      const dy    = e.clientY - drag.current.startMouseY
      const rawX  = drag.current.startElemX + dx
      const rawY  = drag.current.startElemY + dy
      const clampedX = Math.max(-100, Math.min(window.innerWidth  - 100, rawX))
      const clampedY = Math.max(
        menuBarBottom,
        Math.min(window.innerHeight - 48, rawY),
      )
      onDrag(clampedX, clampedY)

      if (onSnapZoneChange) {
        const zone = detectSnapZone(e.clientX, e.clientY, menuBarBottom)
        if (zone !== currentZone.current) {
          currentZone.current = zone
          onSnapZoneChange(zone)
        }
      }
    },
    [onDrag, onSnapZoneChange, menuBarBottom],
  )

  const handleDragEnd = useCallback(
    (e?: React.PointerEvent) => {
      if (drag.current && onDragEnd) {
        const zone = e
          ? detectSnapZone(e.clientX, e.clientY, menuBarBottom)
          : currentZone.current
        onDragEnd(zone)
      }
      drag.current = null
      currentZone.current = null
      if (onSnapZoneChange) onSnapZoneChange(null)
    },
    [onDragEnd, onSnapZoneChange, menuBarBottom],
  )

  return { handleDragStart, handleDragMove, handleDragEnd }
}
