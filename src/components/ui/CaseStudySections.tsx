import { SkillBadges } from './SkillBadges'

const sectionLabelClass =
  'font-display text-[0.7rem] font-bold uppercase tracking-widest text-text-soft mb-2'

const bodyTextClass = 'text-[1.05rem] md:text-[1.1rem] text-white leading-relaxed break-words'

type ImpactListProps = {
  idPrefix: string
  items: string[]
}

/** Outcome-focused bullets with ▸ markers (matches portfolio case-study style). */
export function ImpactList({ idPrefix, items }: ImpactListProps) {
  if (!items.length) return null
  return (
    <div className="mb-4">
      <div className={sectionLabelClass}>IMPACT</div>
      <ul className={`${bodyTextClass} space-y-2 list-none pl-0 m-0`} role="list">
        {items.map((item, idx) => (
          <li key={`${idPrefix}-impact-${idx}`} className="flex gap-2.5 break-words">
            <span className="shrink-0 text-accent select-none pt-[0.05rem]" aria-hidden>
              ▸
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type KeyLearningsListProps = {
  idPrefix: string
  items: string[]
}

/** Reflective bullets with ✦ markers. */
export function KeyLearningsList({ idPrefix, items }: KeyLearningsListProps) {
  if (!items.length) return null
  return (
    <div className="mb-4">
      <div className={sectionLabelClass}>KEY LEARNINGS</div>
      <ul className={`${bodyTextClass} space-y-2 list-none pl-0 m-0`} role="list">
        {items.map((item, idx) => (
          <li key={`${idPrefix}-learning-${idx}`} className="flex gap-2.5 break-words">
            <span className="shrink-0 text-text-muted select-none pt-[0.05rem]" aria-hidden>
              ✦
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type ToolsTechnologiesProps = {
  badges: string[]
  ariaLabel?: string
  className?: string
}

export function ToolsTechnologies({ badges, ariaLabel = 'Technologies used', className }: ToolsTechnologiesProps) {
  if (!badges.length) return null
  return (
    <div className={className ?? 'mb-4'}>
      <div className={sectionLabelClass}>TOOLS & TECHNOLOGIES</div>
      <SkillBadges badges={badges} ariaLabel={ariaLabel} glareHover />
    </div>
  )
}
