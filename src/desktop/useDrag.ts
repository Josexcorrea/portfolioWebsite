import { useRef, useCallback } from 'react'
import { DEFAULT_LAYOUT_METRICS, type SnapZone } from './types'

type DragState = {
  startMouseX: number
  startMouseY: number
  startElemX:  number
  startElemY:  number
}

const SNAP_THRESHOLD = 24
const CORNER_THRESHOLD = 40
const EDGE_HYSTERESIS = 18
const SNAP_CANCEL_DISTANCE = 56

function detectSnapZone(
  clientX: number,
  clientY: number,
  menuBarBottom: number,
): SnapZone {
  const nearLeft = clientX <= CORNER_THRESHOLD
  const nearRight = clientX >= window.innerWidth - CORNER_THRESHOLD
  const nearTop = clientY <= menuBarBottom + CORNER_THRESHOLD
  const nearBottom = clientY >= window.innerHeight - CORNER_THRESHOLD

  if (nearLeft && nearTop) return 'top-left'
  if (nearRight && nearTop) return 'top-right'
  if (nearLeft && nearBottom) return 'bottom-left'
  if (nearRight && nearBottom) return 'bottom-right'

  if (clientY <= menuBarBottom + 8) return 'top'
  if (clientX <= SNAP_THRESHOLD) return 'left'
  if (clientX >= window.innerWidth - SNAP_THRESHOLD) return 'right'
  return null
}

function stillInsideZoneWithHysteresis(
  zone: SnapZone,
  clientX: number,
  clientY: number,
  menuBarBottom: number,
): boolean {
  if (!zone) return false
  switch (zone) {
    case 'left':
      return clientX <= SNAP_THRESHOLD + EDGE_HYSTERESIS
    case 'right':
      return clientX >= window.innerWidth - SNAP_THRESHOLD - EDGE_HYSTERESIS
    case 'top':
      return clientY <= menuBarBottom + 8 + EDGE_HYSTERESIS
    case 'top-left':
      return (
        clientX <= CORNER_THRESHOLD + EDGE_HYSTERESIS &&
        clientY <= menuBarBottom + CORNER_THRESHOLD + EDGE_HYSTERESIS
      )
    case 'top-right':
      return (
        clientX >= window.innerWidth - CORNER_THRESHOLD - EDGE_HYSTERESIS &&
        clientY <= menuBarBottom + CORNER_THRESHOLD + EDGE_HYSTERESIS
      )
    case 'bottom-left':
      return (
        clientX <= CORNER_THRESHOLD + EDGE_HYSTERESIS &&
        clientY >= window.innerHeight - CORNER_THRESHOLD - EDGE_HYSTERESIS
      )
    case 'bottom-right':
      return (
        clientX >= window.innerWidth - CORNER_THRESHOLD - EDGE_HYSTERESIS &&
        clientY >= window.innerHeight - CORNER_THRESHOLD - EDGE_HYSTERESIS
      )
    default:
      return false
  }
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
  const zoneAnchor = useRef<{ x: number; y: number } | null>(null)
  const commitSuppressed = useRef(false)

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
      zoneAnchor.current = null
      commitSuppressed.current = false
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
        let zone = detectSnapZone(e.clientX, e.clientY, menuBarBottom)
        if (!zone && stillInsideZoneWithHysteresis(
          currentZone.current,
          e.clientX,
          e.clientY,
          menuBarBottom,
        )) {
          zone = currentZone.current
        }

        if (zone !== currentZone.current) {
          currentZone.current = zone
          zoneAnchor.current = zone ? { x: e.clientX, y: e.clientY } : null
          commitSuppressed.current = false
          onSnapZoneChange(zone)
        } else if (zone && zoneAnchor.current) {
          const movedX = e.clientX - zoneAnchor.current.x
          const movedY = e.clientY - zoneAnchor.current.y
          const movedDistance = Math.hypot(movedX, movedY)
          if (movedDistance >= SNAP_CANCEL_DISTANCE) {
            commitSuppressed.current = true
          }
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
        const finalZone = commitSuppressed.current ? null : zone
        onDragEnd(finalZone)
      }
      drag.current = null
      currentZone.current = null
      zoneAnchor.current = null
      commitSuppressed.current = false
      if (onSnapZoneChange) onSnapZoneChange(null)
    },
    [onDragEnd, onSnapZoneChange, menuBarBottom],
  )

  return { handleDragStart, handleDragMove, handleDragEnd }
}
