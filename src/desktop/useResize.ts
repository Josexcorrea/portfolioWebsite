import { useRef, useCallback } from 'react'
import { DEFAULT_LAYOUT_METRICS } from './types'

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

type ResizeState = {
  edge: ResizeEdge
  startMouseX: number
  startMouseY: number
  startW: number
  startH: number
  startX: number
  startY: number
}

const MIN_W = 320
const MIN_H = 240

/**
 * Pointer-capture resize hook supporting all 8 edges and corners.
 * Callback receives new (w, h, x, y) — position changes when resizing
 * from the north or west edges since those edges move the window origin.
 */
export function useResize(
  onResize: (w: number, h: number, x: number, y: number) => void,
  menuBarBottom: number = DEFAULT_LAYOUT_METRICS.menuBarBottom,
) {
  const resize = useRef<ResizeState | null>(null)

  const handleResizeStart = useCallback(
    (
      e: React.PointerEvent,
      edge: ResizeEdge,
      currentW: number,
      currentH: number,
      currentX: number,
      currentY: number,
    ) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      resize.current = {
        edge,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startW: currentW,
        startH: currentH,
        startX: currentX,
        startY: currentY,
      }
    },
    [],
  )

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resize.current) return
      const { edge, startMouseX, startMouseY, startW, startH, startX, startY } = resize.current
      const dx = e.clientX - startMouseX
      const dy = e.clientY - startMouseY

      let newW = startW
      let newH = startH
      let newX = startX
      let newY = startY

      // East — grow/shrink right edge
      if (edge.includes('e')) {
        newW = Math.max(MIN_W, startW + dx)
      }

      // West — grow/shrink left edge; position follows
      if (edge.includes('w')) {
        newW = Math.max(MIN_W, startW - dx)
        newX = startX + startW - newW
      }

      // South — grow/shrink bottom edge
      if (edge.includes('s')) {
        newH = Math.max(MIN_H, startH + dy)
      }

      // North — grow/shrink top edge; position follows
      if (edge.includes('n')) {
        newH = Math.max(MIN_H, startH - dy)
        newY = startY + startH - newH
        // Prevent window top from going above the menu bar
        if (newY < menuBarBottom) {
          newY = menuBarBottom
          newH = startY + startH - menuBarBottom
        }
      }

      onResize(newW, newH, newX, newY)
    },
    [onResize, menuBarBottom],
  )

  const handleResizeEnd = useCallback(() => {
    resize.current = null
  }, [])

  return { handleResizeStart, handleResizeMove, handleResizeEnd }
}
