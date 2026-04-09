import React, { useState } from 'react'
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// ─── SVG filter definition (render once in DesktopShell) ─────────────────────

export function LiquidGlassFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id="glass-blur"
          x="0"
          y="0"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.003 0.007"
            numOctaves="1"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="200"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

// ─── LiquidGlass (simple wrapper, no motion) ──────────────────────────────────

export type LiquidGlassProps = {
  children?: React.ReactNode;
  className?: string;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl';
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: string;
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  liquidFilter?: boolean;
  tint?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

export function LiquidGlass({
  children,
  className,
  blurIntensity = 'md',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  borderRadius = '20px',
  liquidFilter = false,
  tint,
  style,
  ...rest
}: LiquidGlassProps) {
  return (
    <LiquidGlassCard
      className={className}
      blurIntensity={blurIntensity}
      glowIntensity={glowIntensity}
      shadowIntensity={shadowIntensity}
      borderRadius={borderRadius}
      liquidFilter={liquidFilter}
      draggable={false}
      expandable={false}
      tint={tint}
      style={style}
      {...rest}
    >
      {children}
    </LiquidGlassCard>
  )
}

// ─── LiquidGlassCard (full-featured, with motion) ─────────────────────────────

interface LiquidGlassCardProps {
  children?: React.ReactNode
  className?: string
  draggable?: boolean
  expandable?: boolean
  width?: string
  height?: string
  expandedWidth?: string
  expandedHeight?: string
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl'
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  borderRadius?: string
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** When true, applies SVG filter `#glass-blur` from `LiquidGlassFilter`. */
  liquidFilter?: boolean
  tint?: string
  style?: React.CSSProperties
  [key: string]: unknown
}

const glowOuterPx: Record<NonNullable<LiquidGlassCardProps['glowIntensity']>, number> = {
  none: 0,
  xs: 10,
  sm: 18,
  md: 26,
  lg: 34,
  xl: 44,
}

export const LiquidGlassCard = ({
  children,
  className = '',
  draggable = true,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'xl',
  borderRadius = '32px',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  liquidFilter = false,
  tint,
  style,
  ...props
}: LiquidGlassCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpansion = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!expandable) return
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea')) return
    setIsExpanded(!isExpanded)
  }

  // Blur pixel values for inline styles
  const blurPx = { sm: '16px', md: '28px', lg: '44px', xl: '64px' };

  // Apple-style drop shadow — layered for depth
  const shadowStyles = {
    none: 'none',
    xs: '0 1px 3px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
    sm: '0 2px 8px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.08)',
    md: '0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
    lg: '0 8px 24px rgba(0,0,0,0.14), 0 16px 48px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
    xl: '0 12px 36px rgba(0,0,0,0.18), 0 24px 72px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.10)',
  };

  const containerVariants = expandable
    ? {
        collapsed: {
          width: width || 'auto',
          height: height || 'auto',
          transition: { duration: 0.4, ease: [0.5, 1.5, 0.5, 1] as const },
        },
        expanded: {
          width: expandedWidth || 'auto',
          height: expandedHeight || 'auto',
          transition: { duration: 0.4, ease: [0.5, 1.5, 0.5, 1] as const },
        },
      }
    : undefined

  const glowPx = glowOuterPx[glowIntensity]
  const outerGlow =
    glowPx > 0 ? `0 0 ${glowPx}px rgba(255,255,255,0.22)` : null

  const bg = tint ?? 'rgba(255, 255, 255, 0.68)'

  return (
    <motion.div
      className={cn(
        `relative ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${expandable ? 'cursor-pointer' : ''}`,
        className,
      )}
      style={{
        borderRadius,
        ...(width && !expandable && { width }),
        ...(height && !expandable && { height }),
        ...(liquidFilter ? { filter: 'url(#glass-blur)' } : {}),
        ...style,
      }}
      variants={containerVariants}
      animate={expandable ? (isExpanded ? 'expanded' : 'collapsed') : undefined}
      onClick={expandable ? handleToggleExpansion : undefined}
      drag={draggable}
      dragConstraints={draggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
      dragElastic={draggable ? 0.3 : undefined}
      dragTransition={
        draggable
          ? { bounceStiffness: 300, bounceDamping: 10, power: 0.3 }
          : undefined
      }
      whileDrag={draggable ? { scale: 1.02 } : undefined}
      whileHover={draggable || expandable ? { scale: 1.01 } : undefined}
      whileTap={draggable || expandable ? { scale: 0.98 } : undefined}
      {...props}
    >
      {/* ── Layer 1: Frosted backdrop ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          backdropFilter: `blur(${blurPx[blurIntensity]}) saturate(1.8) brightness(1.04)`,
          WebkitBackdropFilter: `blur(${blurPx[blurIntensity]}) saturate(1.8) brightness(1.04)`,
          background: bg,
        }}
      />

      {/* ── Layer 2: Glass face — light-catching gradient from top ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          background:
            'linear-gradient(175deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.04) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Layer 3: Border + specular highlight + drop shadow ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          // bright top specular edge + subtle side edges + soft bottom
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.95)',    // bright top highlight
            'inset 0 -0.5px 0 rgba(0,0,0,0.07)',       // subtle bottom rim
            'inset 1px 0 0 rgba(255,255,255,0.55)',     // left rim
            'inset -1px 0 0 rgba(255,255,255,0.55)',    // right rim
            shadowStyles[shadowIntensity],              // outer drop shadow
            outerGlow,
          ]
            .filter(Boolean)
            .join(', '),
          border: '0.5px solid rgba(255,255,255,0.60)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content — above all glass layers ── */}
      <div style={{ position: 'relative', zIndex: 30 }}>
        {children}
      </div>
    </motion.div>
  )
}
