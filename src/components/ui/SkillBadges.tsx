/**
 * Shared tech/skill badges (Simple Icons). Used by Projects and Experience.
 * Single source for colors, labels, and layout — keeps flow simple.
 */

import { useState } from 'react'
import GlareHover from './GlareHover'

const BADGE_COLORS: Record<string, string> = {
  react: '#61DAFB',
  typescript: '#3178C6',
  python: '#3776AB',
  flask: '#000000',
  electron: '#47848F',
  pytorch: '#EE4C2C',
  numpy: '#013243',
  scikitlearn: '#F89939',
  html5: '#E34F26',
  css3: '#1572B6',
  firebase: '#FFCA28',
  c: '#A8B9CC',
  cplusplus: '#00599C',
  linux: '#FCC624',
  amazonaws: '#232F3E',
  tailwindcss: '#06B6D4',
  java: '#ED8B00',
  postgresql: '#4169E1',
  azure: '#0078D4',
  fastapi: '#009688',
  pandas: '#150458',
  keras: '#D00000',
}

const BADGE_NAMES: Record<string, string> = {
  react: 'React',
  typescript: 'TypeScript',
  python: 'Python',
  flask: 'Flask',
  electron: 'Electron',
  pytorch: 'PyTorch',
  numpy: 'NumPy',
  scikitlearn: 'scikit-learn',
  html5: 'HTML5',
  css3: 'CSS3',
  firebase: 'Firebase',
  c: 'C',
  cplusplus: 'C++',
  linux: 'Linux',
  amazonaws: 'AWS',
  tailwindcss: 'Tailwind CSS',
  java: 'Java',
  postgresql: 'SQL',
  azure: 'Azure',
  fastapi: 'FastAPI',
  pandas: 'Pandas',
  keras: 'Keras',
}

/** Map our badge keys to Simple Icons CDN slugs when they differ (e.g. scikit-learn). */
const CDN_SLUG: Record<string, string> = {
  scikitlearn: 'scikit-learn',
  java: 'openjdk',
}

function badgeLabel(slug: string): string {
  return BADGE_NAMES[slug] ?? slug.replace(/dot/g, '.').replace(/([a-z])([A-Z])/g, '$1 $2')
}

function cdnSlug(slug: string): string {
  return CDN_SLUG[slug] ?? slug
}

const BADGE_BOX_CLASS =
  'relative w-10 h-10 rounded-[10px] border border-border bg-surface flex items-center justify-center transition-all duration-200 hover:border-accent hover:scale-[1.08] group'

const TOOLTIP_CLASS =
  'absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 translate-y-0.5 py-1 px-2 font-display text-[0.7rem] font-semibold text-text-pri bg-surface border border-border rounded-md whitespace-nowrap opacity-0 invisible transition-all duration-150 pointer-events-none z-[2] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'

function BadgeIcon({ slug, label }: { slug: string; label: string }) {
  const [error, setError] = useState(false)
  const hex = BADGE_COLORS[slug] ?? '#4F8CFF'
  const iconHex = hex.replace('#', '')
  const src = `https://cdn.simpleicons.org/${cdnSlug(slug)}/${iconHex}`
  if (error) {
    return (
      <span
        className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded bg-accent/20 text-[10px] font-bold text-accent"
        aria-hidden
      >
        {label.charAt(0)}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      width={22}
      height={22}
      loading="lazy"
      className="pointer-events-none object-contain"
      onError={() => setError(true)}
    />
  )
}

export type SkillBadgesProps = {
  badges: string[]
  /** Optional spacing/position (e.g. "mb-3.5" for projects, "mt-3.5" for experience). */
  className?: string
  /** Accessible label (e.g. "Technologies used", "Skills applied"). */
  ariaLabel?: string
  /** When true, wrap each badge in GlareHover (used in Projects and Experience only). */
  glareHover?: boolean
}

export function SkillBadges({
  badges,
  className = '',
  ariaLabel = 'Skills and technologies',
  glareHover = false,
}: SkillBadgesProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  const badgeContent = (slug: string) => {
    const label = badgeLabel(slug)
    return (
      <>
        <span className={TOOLTIP_CLASS}>{label}</span>
        <BadgeIcon slug={slug} label={label} />
      </>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()} aria-label={ariaLabel}>
      {badges.map((slug) => {
        const label = badgeLabel(slug)
        if (glareHover) {
          return (
            <GlareHover
              key={slug}
              width="40px"
              height="40px"
              borderRadius="10px"
              background="var(--color-surface)"
              borderColor="var(--color-border)"
              glareColor="#ffffff"
              glareOpacity={0.45}
              glareSize={200}
              transitionDuration={550}
              className="group rounded-[10px] transition-all duration-200 hover:border-accent hover:scale-[1.08]"
              style={{ borderWidth: '1px' }}
              title={label}
              hovered={hoveredSlug === slug}
              onHoverChange={(active) => {
                setHoveredSlug(active ? slug : null)
              }}
            >
              {badgeContent(slug)}
            </GlareHover>
          )
        }
        return (
          <div key={slug} className={BADGE_BOX_CLASS} title={label}>
            {badgeContent(slug)}
          </div>
        )
      })}
    </div>
  )
}
