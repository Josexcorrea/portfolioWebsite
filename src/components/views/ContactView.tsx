import { useState, useMemo, useRef, useCallback } from 'react'
import { contactItems } from '@/data/content'
import type { ContactItem } from '@/types'

const EMBLEM_SIZE = 42
const HUB_SIZE = 580
const CENTER = HUB_SIZE / 2
const ORB_SIZE = 104
const NODE_RADIUS = 232

/** Even layout around the hub: 0 = right, 90 = bottom, -90 = top, 180 = left */
const NODE_POSITIONS: Record<string, { angle: number; radius: number }> = {
  github: { angle: -90, radius: NODE_RADIUS }, // top
  email: { angle: -30, radius: NODE_RADIUS }, // upper-right
  resume: { angle: 30, radius: NODE_RADIUS }, // lower-right
  phone: { angle: 90, radius: NODE_RADIUS }, // bottom
  instagram: { angle: 150, radius: NODE_RADIUS }, // lower-left
  linkedin: { angle: 210, radius: NODE_RADIUS }, // upper-left
}

function getNodeXY(id: string) {
  const { angle, radius } = NODE_POSITIONS[id] ?? { angle: 0, radius: NODE_RADIUS }
  const rad = (angle * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function ContactEmblem({ emblem }: { emblem: NonNullable<ContactItem['emblem']> }) {
  const svgProps = {
    width: EMBLEM_SIZE,
    height: EMBLEM_SIZE,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }
  const strokeProps = {
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const fillProps = { fill: 'currentColor' as const }

  switch (emblem) {
    case 'phone':
      return (
        <svg {...svgProps}>
          <path
            {...strokeProps}
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
          />
        </svg>
      )
    case 'github':
      return (
        <svg {...svgProps} {...fillProps}>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...svgProps} {...fillProps}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'email':
      return (
        <svg {...svgProps} {...strokeProps}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      )
    case 'resume':
      return (
        <svg {...svgProps} {...strokeProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...svgProps} {...strokeProps}>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" ry="5" />
          <path d="M16 11.5a4 4 0 1 1-2.34-3.65" />
          <path d="M17.5 6.5h.01" />
        </svg>
      )
    default:
      return null
  }
}

export function ContactView() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [orbExpanded, setOrbExpanded] = useState(false)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)
  const [ripple, setRipple] = useState<{ id: string; x: number; y: number } | null>(null)
  const hubRef = useRef<HTMLDivElement>(null)

  const lineSegments = useMemo(
    () =>
      contactItems.map((item) => {
        const end = getNodeXY(item.id)
        return { id: item.id, x2: end.x, y2: end.y }
      }),
    []
  )

  const handleHubMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = hubRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleHubMouseLeave = useCallback(() => {
    setMouse(null)
    setHoveredId(null)
  }, [])

  const getCardTilt = useCallback(
    (itemId: string) => {
      if (!mouse || hoveredId !== itemId) return 0
      const pos = getNodeXY(itemId)
      const dx = mouse.x - pos.x
      const dy = mouse.y - pos.y
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      return angle * 0.15
    },
    [mouse, hoveredId]
  )

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: ContactItem) => {
      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      setRipple({
        id: item.id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setTimeout(() => setRipple(null), 650)
    },
    []
  )

  const handleOrbClick = useCallback(() => {
    setOrbExpanded(true)
    setTimeout(() => setOrbExpanded(false), 1600)
  }, [])

  return (
    <div className="relative flex flex-col items-center w-full min-h-full flex-1 px-4 py-6">
      {/* Subtle background life: drifting dots (no extra background layer) */}
      <div className="contact-bg-dots z-0" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="contact-bg-dot"
            style={{
              left: `${10 + ((i * 7) % 80)}%`,
              top: `${15 + ((i * 11) % 70)}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        <div
          className="contact-shooting-star w-24"
          style={{ top: '20%', left: '10%', animationDelay: '0.5s' }}
        />
      </div>

      {/* Hub centered in viewport */}
      <div className="relative z-[1] flex-1 flex items-center justify-center min-h-[calc(100dvh-8rem)] w-full">
        <div
          ref={hubRef}
          className="relative flex items-center justify-center"
          style={{ width: HUB_SIZE, height: HUB_SIZE }}
          aria-label="Contact hub"
          onMouseMove={handleHubMouseMove}
          onMouseLeave={handleHubMouseLeave}
        >
          {/* Lines: always visible, glow, energy pulse; brighter on card hover */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {lineSegments.map((seg) => (
              <line
                key={seg.id}
                x1={CENTER}
                y1={CENTER}
                x2={seg.x2}
                y2={seg.y2}
                className={`contact-hub-line ${hoveredId === seg.id ? 'contact-hub-line-visible' : ''}`}
              />
            ))}
          </svg>

          {/* Central orb: white, expands on hover/click; line appears on icon hover */}
          <button
            type="button"
            className={`contact-orb-wrapper absolute rounded-full cursor-pointer border-0 p-0 bg-transparent focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${orbExpanded ? 'contact-orb-expanded' : ''}`}
            style={{
              left: CENTER - ORB_SIZE / 2,
              top: CENTER - ORB_SIZE / 2,
              width: ORB_SIZE,
              height: ORB_SIZE,
            }}
            onClick={handleOrbClick}
            aria-label="Contact hub center"
          >
            <span
              className={`contact-orb absolute inset-0 rounded-full pointer-events-none ${hoveredId ? 'contact-orb-pulse' : ''}`}
              key={hoveredId ?? 'idle'}
            />
            {/* Solid core circle in the center */}
            <span className="contact-orb-core pointer-events-none" />
            {/* Symmetric glowing dots around the orb */}
            <span
              className="contact-orb-particle pointer-events-none"
              style={{ left: '50%', top: '6%' }}
            />
            <span
              className="contact-orb-particle pointer-events-none"
              style={{ left: '90%', top: '50%' }}
            />
            <span
              className="contact-orb-particle pointer-events-none"
              style={{ left: '50%', top: '94%' }}
            />
            <span
              className="contact-orb-particle pointer-events-none"
              style={{ left: '10%', top: '50%' }}
            />
          </button>

          {/* Orbital contact cards */}
          {contactItems.map((item, index) => {
            const pos = getNodeXY(item.id)
            const tilt = getCardTilt(item.id)
            const isHovered = hoveredId === item.id
            return (
              <a
                key={item.id}
                href={item.href}
                target={item.id === 'resume' || item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                className="contact-hub-node absolute z-[1] flex flex-col items-center justify-center gap-2 no-underline text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-full"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${isHovered ? 1.1 : 1})`,
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleCardClick(e, item)}
                aria-label={item.label}
                title={item.label}
              >
                {/* Click ripple */}
                {ripple?.id === item.id && (
                  <div
                    className="contact-hub-node-ripple"
                    style={
                      {
                        '--ripple-x': `${ripple.x}px`,
                        '--ripple-y': `${ripple.y}px`,
                      } as React.CSSProperties
                    }
                  />
                )}
                <span
                  className="contact-hub-node-icon contact-icon-float flex items-center justify-center text-text-muted transition-colors duration-200 [.contact-hub-node:hover_&]:text-accent"
                  style={{ animationDelay: `${index * 0.35}s` }}
                >
                  {item.emblem ? (
                    <ContactEmblem emblem={item.emblem} />
                  ) : (
                    <span className="font-display text-sm font-bold tracking-wide">
                      {item.icon}
                    </span>
                  )}
                </span>
                <span className="font-display text-[0.65rem] font-bold uppercase tracking-widest text-text-soft opacity-90 [.contact-hub-node:hover_&]:text-accent [.contact-hub-node:hover_&]:opacity-100">
                  {item.label}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
