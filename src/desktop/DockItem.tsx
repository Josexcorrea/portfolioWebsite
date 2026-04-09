import { memo, useCallback, useRef, useState, type ReactNode } from 'react'

interface DockItemProps {
  id: string
  label: string
  icon: ReactNode
  /** App is open in the shell lifecycle (includes minimized). */
  isOpen?: boolean
  /** Window is open but minimized to the dock. */
  isMinimized?: boolean
  href?: string
  onClick: () => void
}

/**
 * Individual dock icon with bounce animation, open-indicator dot, and tooltip.
 * Rendered as <button> for app items and <a> for external links.
 * Wrapped in React.memo: re-renders when dock state props change.
 */
export const DockItem = memo(function DockItem({
  id,
  label,
  icon,
  isOpen = false,
  isMinimized = false,
  href,
  onClick,
}: DockItemProps) {
  const [bouncing, setBouncing] = useState(false)
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(() => {
    setBouncing(true)
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => setBouncing(false), 680)
    onClick()
  }, [onClick])

  const cls = [
    'mac-dock-item',
    isOpen ? 'mac-dock-item--open' : '',
    isMinimized ? 'mac-dock-item--minimized' : '',
    bouncing ? 'mac-dock-item--bouncing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <div className="mac-dock-icon" aria-hidden="true">
        {icon}
      </div>
      {isOpen && (
        <span
          className={`mac-dock-dot${isMinimized ? ' mac-dock-dot--minimized' : ''}`}
          aria-hidden="true"
        />
      )}
      <span className="mac-dock-tooltip" role="tooltip" id={`dock-tip-${id}`}>
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={`${label} — opens in new tab`}
        aria-describedby={`dock-tip-${id}`}
        onClick={handleClick}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      aria-label={
        isMinimized ? `${label} (minimized)` : isOpen ? `${label} (open)` : label
      }
      aria-describedby={`dock-tip-${id}`}
      aria-pressed={isOpen}
      onClick={handleClick}
    >
      {inner}
    </button>
  )
})
