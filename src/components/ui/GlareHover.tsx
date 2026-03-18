import { useState } from 'react'

export interface GlareHoverProps {
  width?: string
  height?: string
  background?: string
  borderRadius?: string
  borderColor?: string
  children?: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
  style?: React.CSSProperties
  title?: string
  /**
   * When provided, allows an external parent to control
   * whether the glare is active (e.g. to ensure only one
   * item in a list has glare at a time).
   */
  hovered?: boolean
  /**
   * Optional callback fired when hover state changes.
   * True on mouse enter, false on mouse leave.
   */
  onHoverChange?: (active: boolean) => void
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = '500px',
  height = '500px',
  background = '#000',
  borderRadius = '10px',
  borderColor = '#333',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {},
  title,
  hovered,
  onHoverChange,
}) => {
  const hex = glareColor.replace('#', '')
  let rgba = glareColor
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  const [internalActive, setInternalActive] = useState(false)
  const positionEnd = '100% 100%, 0 0'
  const positionStart = '-100% -100%, 0 0'

  const onEnter = () => {
    const current = hovered ?? internalActive
    if (playOnce && current) return
    if (hovered === undefined) {
      setInternalActive(true)
    }
    onHoverChange?.(true)
  }

  const onLeave = () => {
    if (!playOnce && hovered === undefined) {
      setInternalActive(false)
    }
    onHoverChange?.(false)
  }

  const glareActive = hovered ?? internalActive

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: glareActive ? positionEnd : positionStart,
    opacity: glareActive ? 1 : 0,
    transition: `background-position ${transitionDuration}ms ease, opacity ${transitionDuration}ms ease`,
    pointerEvents: 'none',
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden border cursor-pointer ${className}`.trim()}
      style={{
        width,
        height,
        background,
        borderRadius,
        borderColor,
        ...style,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      title={title}
    >
      <div style={overlayStyle} />
      {children}
    </div>
  )
}

export default GlareHover
