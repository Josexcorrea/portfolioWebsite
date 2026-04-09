import { motion } from 'motion/react'
import { experiences } from '@/data/content'
import type { ExperienceEntry } from '@/types'
import { ImpactList, KeyLearningsList, ToolsTechnologies } from '@/components'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import GlareHover from '@/components/ui/GlareHover'

// ─── Finder-style hover variants ──────────────────────────────────────────────

const navItemVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.013 },
  tap: { scale: 0.975 },
}

const navOverlayVariants = {
  idle: { opacity: 0 },
  hover: { opacity: 1 },
  tap: { opacity: 0.5 },
}

/** Organization / school name from subtitle ("Org — Location"). */
function organizationFromSubtitle(subtitle: string) {
  return subtitle.split(' —')[0]
}

// ─── Mercor languages panel ───────────────────────────────────────────────────

const MERCOR_LANGS = [
  { name: 'Python', slug: 'python', cdnSlug: 'python', color: '#3776AB' },
  { name: 'C', slug: 'c', cdnSlug: 'c', color: '#A8B9CC' },
  { name: 'C++', slug: 'cplusplus', cdnSlug: 'cplusplus', color: '#00599C' },
  { name: 'Java', slug: 'java', cdnSlug: 'openjdk', color: '#ED8B00' },
  { name: 'TypeScript', slug: 'typescript', cdnSlug: 'typescript', color: '#3178C6' },
]

function MercorPanel() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-5 py-5 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[0.62rem] font-bold tracking-[0.22em] uppercase" style={{ color: '#fca5a5' }}>
          Languages Evaluated
        </span>
        <p className="text-[0.78rem] text-text-muted max-w-xs leading-relaxed">
          Reviewed math, science, and coding answers from OpenAI LLMs—correcting mistakes in
          code, formulas, and reasoning. Solved coding questions in Python, C, C++, Java, and
          TypeScript.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {MERCOR_LANGS.map((lang) => (
          <div key={lang.slug} className="flex flex-col items-center gap-1.5">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{
                background: `${lang.color}22`,
                border: `1px solid ${lang.color}44`,
              }}
            >
              <img
                src={`https://cdn.simpleicons.org/${lang.cdnSlug}/${lang.color.replace('#', '')}`}
                alt={lang.name}
                width={22}
                height={22}
                loading="lazy"
                className="object-contain"
              />
            </div>
            <span className="text-[0.65rem] text-text-muted">{lang.name}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 flex-wrap justify-center">
        <div className="flex flex-col items-center">
          <span className="font-display text-[1.15rem] font-bold" style={{ color: '#f87171' }}>200+</span>
          <span className="text-[0.65rem] text-text-muted">Solutions Reviewed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-display text-[1.15rem] font-bold" style={{ color: '#f87171' }}>5</span>
          <span className="text-[0.65rem] text-text-muted">Languages</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-display text-[1.15rem] font-bold" style={{ color: '#f87171' }}>Boundary</span>
          <span className="text-[0.65rem] text-text-muted">Test Focus</span>
        </div>
      </div>
    </div>
  )
}

// ─── FIU education stats panel ────────────────────────────────────────────────

const ML_STATS = [
  { label: 'Algorithms & Data Structures', value: 8 },
  { label: 'Machine Learning & Modeling', value: 9 },
  { label: 'Systems / OS / Embedded', value: 7 },
]

const FS_STATS = [
  { label: 'Backend & APIs', value: 9 },
  { label: 'Frontend & UX Engineering', value: 10 },
  { label: 'Data & Cloud Fundamentals', value: 7 },
]

function FiuPanel() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-start overflow-y-auto scrollbar-glass px-4 py-6 sm:px-5 sm:py-8">
      <div className="grid w-full max-w-[min(100%,42rem)] grid-cols-1 gap-6 md:mx-auto md:max-w-[min(100%,56rem)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-5 md:items-start">

        <div className="flex min-h-0 min-w-0 items-center justify-center py-1 md:py-0">
          <img
            src="/playerCard.png"
            alt="Education player card"
            className="h-auto w-full max-w-[min(100%,300px)] object-contain object-center md:max-h-[min(60dvh,440px)] md:max-w-full"
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col items-center md:items-stretch gap-3">

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 text-[0.8rem] sm:text-[0.9rem]">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.75rem] font-display uppercase tracking-wide" style={{ color: '#fca5a5' }}>
                Concentration I
              </span>
              <GlareHover
                width="100%"
                height="76px"
                borderRadius="12px"
                background="linear-gradient(135deg,#7f1d1d,#b91c1c,#dc2626)"
                borderColor="rgba(255,255,255,0.18)"
                glareColor="#fecaca"
                glareOpacity={0.5}
                glareSize={220}
                transitionDuration={600}
                className="group w-full rounded-[12px]"
                style={{ borderWidth: '1px' }}
                title="Machine Learning Archetype"
              >
                <div className="flex h-full w-full items-center justify-center gap-2 px-2">
                  <span className="h-8 w-8 shrink-0 text-white/95" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                      <circle cx="7" cy="9" r="2.5" />
                      <circle cx="17" cy="9" r="2.5" />
                      <circle cx="12" cy="17" r="2.5" />
                      <path d="M9.5 11.2 11 15M14.5 11.2 13 15M9.5 11.2a3 3 0 0 1 5 0" />
                    </svg>
                  </span>
                  <span className="text-[0.95rem] font-semibold text-white">Machine Learning</span>
                </div>
              </GlareHover>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.75rem] font-display uppercase tracking-wide" style={{ color: '#fca5a5' }}>
                Concentration II
              </span>
              <GlareHover
                width="100%"
                height="76px"
                borderRadius="12px"
                background="linear-gradient(135deg,#991b1b,#dc2626,#f87171)"
                borderColor="rgba(255,255,255,0.18)"
                glareColor="#fecaca"
                glareOpacity={0.5}
                glareSize={220}
                transitionDuration={600}
                className="group w-full rounded-[12px]"
                style={{ borderWidth: '1px' }}
                title="Full Stack Engineering Archetype"
              >
                <div className="flex h-full w-full items-center justify-center gap-2 px-2">
                  <span className="h-8 w-8 shrink-0 text-white/95" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                      <rect x="3" y="3" width="18" height="5" rx="1" />
                      <rect x="3" y="11" width="18" height="5" rx="1" />
                      <rect x="3" y="19" width="18" height="5" rx="1" />
                    </svg>
                  </span>
                  <span className="text-[0.95rem] font-semibold text-white">Full Stack Eng.</span>
                </div>
              </GlareHover>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-2">
            <div className="text-[0.72rem] font-display uppercase tracking-wide text-center" style={{ color: '#fca5a5' }}>
              Attributes
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
              <div className="flex flex-col gap-2">
                {ML_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[0.72rem] text-text-main">{stat.label}</span>
                      <span className="text-[0.68rem] text-text-muted tabular-nums">{stat.value}/10</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[rgba(15,23,42,0.9)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(stat.value / 10) * 100}%`, background: 'linear-gradient(90deg,#dc2626,#f87171)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {FS_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[0.72rem] text-text-main">{stat.label}</span>
                      <span className="text-[0.68rem] text-text-muted tabular-nums">{stat.value}/10</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[rgba(15,23,42,0.9)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(stat.value / 10) * 100}%`, background: 'linear-gradient(90deg,#dc2626,#f87171)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ExperienceViewProps = {
  selectedExperienceId: string
  onSelectExperience: (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExperienceView({ selectedExperienceId, onSelectExperience }: ExperienceViewProps) {
  const selected: ExperienceEntry =
    experiences.find((e) => e.id === selectedExperienceId) ?? experiences[0]

  const hasMedia =
    selected.id === 'jyj' || selected.id === 'mercor' || selected.type === 'education'

  // ── Sidebar nav ─────────────────────────────────────────────────────────────

  const sidebarContent = (
    <aside className="pw-sidebar" aria-label="Experience select">
      <p className="pw-sidebar-label">Experience Select</p>
      <ul role="listbox" aria-label="Choose experience" className="pw-sidebar-list scrollbar-glass">
        {experiences.map((exp) => {
          const isActive = exp.id === selectedExperienceId
          return (
            <li key={exp.id} role="option" aria-selected={isActive} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => onSelectExperience(exp.id)}
                className="pw-nav-btn"
                aria-current={isActive ? 'true' : undefined}
              >
                <motion.div
                  className="relative w-full"
                  variants={navItemVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div
                    variants={navOverlayVariants}
                    transition={{ duration: 0.13, ease: 'easeOut' }}
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '13px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      pointerEvents: 'none',
                      zIndex: 50,
                    }}
                  />
                  <LiquidGlass
                    className="w-full"
                    blurIntensity="md"
                    shadowIntensity="none"
                    borderRadius="13px"
                  >
                    {isActive && <span className="pw-nav-accent-rail" aria-hidden />}
                    <div className="pw-nav-content">
                      <span
                        className="pw-nav-name"
                        style={isActive ? { color: '#f87171' } : undefined}
                      >
                        {organizationFromSubtitle(exp.subtitle)}
                      </span>
                      {exp.period && <span className="pw-nav-year">{exp.period}</span>}
                      <span className="pw-nav-tag">{exp.title}</span>
                    </div>
                  </LiquidGlass>
                </motion.div>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )

  const infoContent = (
    <>
      <div className="pw-detail-header">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <h2 className="pw-detail-title">{selected.title}</h2>
          {selected.period && (
            <span className="pw-detail-year">{selected.period}</span>
          )}
        </div>
        {selected.subtitle && (
          <p className="pw-detail-tagline">{selected.subtitle}</p>
        )}
      </div>

      {selected.mission ? (
        <div className="pw-section">
          <div className="pw-section-label">Mission</div>
          <p className="pw-section-body">{selected.mission}</p>
        </div>
      ) : null}

      {selected.system && (
        <div className="pw-section">
          <div className="pw-section-label">System</div>
          <p className="pw-section-body">{selected.system}</p>
        </div>
      )}

      <div className="pw-section">
        <ImpactList idPrefix={selected.id} items={selected.impact} />
        {selected.badges?.length ? (
          <ToolsTechnologies
            badges={selected.badges}
            ariaLabel="Technologies used"
            className="mb-4"
          />
        ) : null}
        <KeyLearningsList idPrefix={selected.id} items={selected.keyLearnings} />
      </div>
    </>
  )

  const mediaPanel = hasMedia ? (
    <div className="pw-media">
      <div className="pw-media-content">
        {selected.id === 'jyj' ? (
          <video
            src="/jyj-website-demo.mp4"
            controls
            playsInline
            preload="metadata"
            className="pw-media-video"
          />
        ) : selected.id === 'mercor' ? (
          <MercorPanel />
        ) : selected.type === 'education' ? (
          <FiuPanel />
        ) : null}
      </div>
    </div>
  ) : null

  return (
    <div className="pw-win">
      {sidebarContent}
      <div className="pw-detail">
        <div className="pw-info scrollbar-glass glass-card glass-card--no-shadow" style={{ borderRadius: 20 }}>
          {infoContent}
        </div>
        {mediaPanel}
      </div>
    </div>
  )
}
