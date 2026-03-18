import { useState, useEffect } from 'react'
import { experiences } from '@/data/content'
import type { ExperienceEntry } from '@/types'
import { SkillBadges, ListDetailLayout, GlareHover } from '@/components'

type ExperienceViewProps = {
  selectedExperienceId: string
  onSelectExperience: (id: string) => void
  /** When true, render only the detail content (no list aside). Used by combined Experience & Projects view. */
  detailOnly?: boolean
}

export function ExperienceView({ selectedExperienceId, onSelectExperience, detailOnly = false }: ExperienceViewProps) {
  const selected: ExperienceEntry =
    experiences.find((e) => e.id === selectedExperienceId) ?? experiences[0]
  const [previewOpen, setPreviewOpen] = useState(false)
  const [hoveredConcentration, setHoveredConcentration] = useState<'I' | 'II' | null>(null)

  const mlEducationStats = [
    { label: 'Algorithms & Data Structures', value: 8 },
    { label: 'Machine Learning & Modeling', value: 9 },
    { label: 'Systems / OS / Embedded', value: 7 },
  ]

  const fsEducationStats = [
    { label: 'Backend & APIs', value: 9 },
    { label: 'Frontend & UX Engineering', value: 10 },
    { label: 'Data & Cloud Fundamentals', value: 7 },
  ]

  useEffect(() => setPreviewOpen(false), [selectedExperienceId])

  const hasPreview = selected.id !== 'mercor'

  const detailContent = (
    <div
      className="grid min-h-0 min-w-0 gap-4 max-lg:gap-3 transition-[grid-template-rows] duration-300 ease-out"
      style={{
        gridTemplateRows: hasPreview && previewOpen ? 'auto minmax(120px, 50vh)' : 'auto 0fr',
        gridTemplateColumns: '1fr',
      }}
    >
        <div className="flex flex-col min-h-0 min-w-0 glass-card overflow-hidden w-full">
          <div className="scrollbar-glass px-6 py-5 min-w-0">
            <h2 className="text-[1.3rem] md:text-[1.5rem] mb-2 leading-snug font-display font-bold text-text-pri">
              {selected.title}
            </h2>
            <p className="text-[1rem] md:text-[1.05rem] text-text-muted mb-1">{selected.subtitle}</p>
            <p className="text-[1rem] md:text-[1.05rem] text-accent mb-4 font-semibold">{selected.period}</p>
            <ul className="m-0 pl-5 text-[1.05rem] md:text-[1.1rem] text-text-main leading-relaxed [&_li]:mb-2.5">
              {selected.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            {selected.badges && selected.badges.length > 0 && (
              <SkillBadges badges={selected.badges} className="mt-3.5" ariaLabel="Skills applied" glareHover />
            )}
          </div>
          {hasPreview && (
            <button
              type="button"
              onClick={() => setPreviewOpen((o) => !o)}
              aria-label={previewOpen ? 'Hide preview' : 'View preview'}
              className="flex-shrink-0 w-full py-2.5 flex flex-col items-center justify-center border-t border-[color:var(--glass-border)] text-text-soft opacity-[0.22] hover:opacity-100 hover:bg-[rgba(28,22,52,0.92)] hover:text-text-main transition-all duration-200 cursor-pointer"
            >
              <span
                className="text-lg transition-transform duration-200"
                style={{ transform: previewOpen ? 'rotate(180deg)' : 'none' }}
              >
                ▼
              </span>
            </button>
          )}
        </div>
        {hasPreview && (
          <div className="overflow-hidden min-h-0 min-w-0 flex flex-col">
            <div className="flex-1 min-h-[120px] glass-card glass-card--subtle overflow-hidden flex flex-col">
            {selected.id === 'jyj' ? (
              <div className="w-full flex-1 min-h-[120px] flex items-center justify-center bg-black/40">
                <img
                  src="/jyj-experience-preview.png"
                  alt="JYJ Med & Spas experience preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : selected.type === 'education' ? (
              <div className="w-full flex-1 min-h-[120px] grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 px-6 pt-14 pb-10 text-text-soft text-[0.95rem] sm:text-[1rem]">
                <div className="flex items-center justify-center min-h-0">
                  <img
                    src="/playerCard.png"
                    alt="Education player card"
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="mb-2">
                    <div className="grid grid-cols-2 gap-3 text-[0.8rem] sm:text-[0.9rem]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[0.8rem] sm:text-[0.85rem] font-display uppercase tracking-wide text-text-soft">
                          Concentration I
                        </span>
                        <GlareHover
                          width="100%"
                          height="80px"
                          borderRadius="12px"
                          background="linear-gradient(135deg,#4c1d95,#6d28d9,#7c3aed)"
                          borderColor="rgba(255,255,255,0.18)"
                          glareColor="#e9d5ff"
                          glareOpacity={0.5}
                          glareSize={220}
                          transitionDuration={600}
                          className="group w-full rounded-[12px] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                          style={{ borderWidth: '1px' }}
                          title="Machine Learning Archetype"
                          hovered={hoveredConcentration === 'I'}
                          onHoverChange={(active) => setHoveredConcentration(active ? 'I' : null)}
                        >
                          <div className="flex h-full w-full items-center justify-center gap-2 px-2">
                            <span className="h-9 w-9 shrink-0 text-white/95" aria-hidden>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                                <circle cx="7" cy="9" r="2.5" />
                                <circle cx="17" cy="9" r="2.5" />
                                <circle cx="12" cy="17" r="2.5" />
                                <path d="M9.5 11.2 11 15M14.5 11.2 13 15M9.5 11.2a3 3 0 0 1 5 0" />
                              </svg>
                            </span>
                            <div className="flex flex-col text-left">
                              <span className="text-[1rem] font-semibold text-white">
                                Machine Learning
                              </span>
                            </div>
                          </div>
                        </GlareHover>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[0.8rem] sm:text-[0.85rem] font-display uppercase tracking-wide text-text-soft">
                          Concentration II
                        </span>
                        <GlareHover
                          width="100%"
                          height="80px"
                          borderRadius="12px"
                          background="linear-gradient(135deg,#5b21b6,#7c3aed,#a78bfa)"
                          borderColor="rgba(255,255,255,0.18)"
                          glareColor="#ddd6fe"
                          glareOpacity={0.5}
                          glareSize={220}
                          transitionDuration={600}
                          className="group w-full rounded-[12px] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                          style={{ borderWidth: '1px' }}
                          title="Full Stack Engineering Archetype"
                          hovered={hoveredConcentration === 'II'}
                          onHoverChange={(active) => setHoveredConcentration(active ? 'II' : null)}
                        >
                          <div className="flex h-full w-full items-center justify-center gap-2 px-2">
                            <span className="h-9 w-9 shrink-0 text-white/95" aria-hidden>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                                <rect x="3" y="3" width="18" height="5" rx="1" />
                                <rect x="3" y="11" width="18" height="5" rx="1" />
                                <rect x="3" y="19" width="18" height="5" rx="1" />
                              </svg>
                            </span>
                            <div className="flex flex-col text-left">
                              <span className="text-[1rem] font-semibold text-white">
                                Full Stack Engineering
                              </span>
                            </div>
                          </div>
                        </GlareHover>
                      </div>
                    </div>
                  </div>
                    <div className="mt-4 sm:mt-5 flex-1 flex flex-col items-center">
                      <div className="text-[0.8rem] sm:text-[0.9rem] font-display uppercase tracking-wide text-text-soft mb-1.5 text-center">
                        Attributes
                      </div>
                      <div className="w-full max-w-[540px] grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 justify-items-center">
                        {/* Left column — Machine Learning attributes */}
                        <div className="flex flex-col items-center">
                          {mlEducationStats.map((stat) => (
                            <div key={stat.label} className="w-full max-w-[240px] mb-2 last:mb-0 text-center">
                              <div className="text-[0.8rem] sm:text-[0.9rem] text-text-main">
                                {stat.label}
                              </div>
                              <div className="text-[0.8rem] sm:text-[0.9rem] text-text-muted">{stat.value}/10</div>
                              <div className="mt-1 h-2.5 w-full rounded-full bg-[rgba(15,23,42,0.9)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))]"
                                  style={{ width: `${(stat.value / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Right column — Full Stack attributes */}
                        <div className="flex flex-col items-center">
                          {fsEducationStats.map((stat) => (
                            <div key={stat.label} className="w-full max-w-[240px] mb-2 last:mb-0 text-center">
                              <div className="text-[0.8rem] sm:text-[0.9rem] text-text-main">
                                {stat.label}
                              </div>
                              <div className="text-[0.8rem] sm:text-[0.9rem] text-text-muted">{stat.value}/10</div>
                              <div className="mt-1 h-2.5 w-full rounded-full bg-[rgba(15,23,42,0.9)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))]"
                                  style={{ width: `${(stat.value / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    <div className="mt-6 sm:mt-7 text-[0.85rem] sm:text-[0.9rem] text-text-main leading-snug text-center sm:text-left">
                      Developed a strong engineering foundation through FIU Computer Engineering
                      coursework in Machine Learning, Data Structures &amp; Algorithms, Systems
                      Programming, Embedded Systems, and Cloud Analytics. Leveraged these technical
                      skills to deliver real-world solutions for businesses—designing digital
                      infrastructure, developing modern web platforms, and implementing data-driven
                      systems that helped organizations establish their technical presence and
                      accelerate early-stage growth.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="scrollbar-glass w-full flex-1 min-h-[120px] overflow-auto flex flex-col items-center justify-center gap-3 text-text-soft text-[0.9rem] p-6">
                <span className="font-display text-accent font-bold uppercase tracking-widest text-sm">
                  Role
                </span>
                <span className="text-text-main font-display font-semibold text-center">
                  {selected.subtitle}
                </span>
                <small className="text-[0.75rem] max-w-[80%] text-center">{selected.period}</small>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
  )

  if (detailOnly) return detailContent

  return (
    <ListDetailLayout
      asideLabel="ROLE SELECT"
      listboxAriaLabel="Choose experience"
      asideAriaLabel="Experience select"
      items={experiences.map((e) => ({ id: e.id, label: e.title }))}
      selectedId={selected.id}
      onSelect={onSelectExperience}
      asideClassName="max-lg:max-h-[140px] max-lg:pb-1"
      listItemClassName="max-lg:min-w-[160px]"
    >
      {detailContent}
    </ListDetailLayout>
  )
}
