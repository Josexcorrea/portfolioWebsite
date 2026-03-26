import { useState, useEffect } from 'react'
import { projects } from '@/data/content'
import type { Project } from '@/types'
import { ImpactList, KeyLearningsList, ToolsTechnologies, ListDetailLayout } from '@/components'

type ProjectsViewProps = {
  selectedProjectId: string
  onSelectProject: (id: string) => void
  /** When true, render only the detail content (no list aside). Used by combined Experience & Projects view. */
  detailOnly?: boolean
}

export function ProjectsView({ selectedProjectId, onSelectProject, detailOnly = false }: ProjectsViewProps) {
  const selectedProject: Project = projects.find((p) => p.id === selectedProjectId) ?? projects[0]
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewStage, setPreviewStage] = useState<'paper' | 'preview'>('preview')

  const hasPreview =
    selectedProject.id !== 'portfolio-website' &&
    (Boolean(selectedProject.researchPdfUrl) || Boolean(selectedProject.previewUrl))

  useEffect(() => {
    setPreviewOpen(false)
    setPreviewStage(selectedProject.researchPdfUrl ? 'paper' : 'preview')
  }, [selectedProjectId, selectedProject.researchPdfUrl])

  const togglePreview = () => {
    setPreviewOpen((o) => !o)
  }

  const detailContent = (
    <div
      className="grid min-h-0 min-w-0 gap-4 max-lg:gap-4 transition-[grid-template-rows] duration-300 ease-out"
      style={{
        gridTemplateRows: hasPreview && previewOpen ? 'auto minmax(200px, 50vh)' : 'auto 0fr',
        gridTemplateColumns: '1fr',
      }}
    >
        <div className="flex flex-col min-h-0 min-w-0 glass-card overflow-hidden w-full">
          <div className="scrollbar-glass px-6 py-5 min-w-0">
            <h2 className="text-[1.3rem] md:text-[1.5rem] mb-2 leading-snug font-display font-bold text-text-pri break-words">
              {selectedProject.name}
            </h2>
          {selectedProject.dateMade ? (
            <p className="text-[0.95rem] md:text-[1.05rem] text-accent mb-2 font-semibold break-words">{selectedProject.dateMade}</p>
          ) : null}
          {selectedProject.tagline ? (
            <p className="text-[1rem] md:text-[1.05rem] text-text-sec mb-3 break-words">{selectedProject.tagline}</p>
          ) : null}

          {selectedProject.mission ? (
            <div className="mb-4">
              <div className="font-display text-[0.7rem] font-bold uppercase tracking-widest text-text-soft mb-2">MISSION</div>
              <p className="text-[1.05rem] md:text-[1.1rem] text-white leading-relaxed break-words">{selectedProject.mission}</p>
            </div>
          ) : (
            <p className="text-[1.05rem] md:text-[1.1rem] text-white leading-relaxed mb-4 break-words">{selectedProject.description}</p>
          )}

          {selectedProject.system ? (
            <div className="mb-4">
              <div className="font-display text-[0.7rem] font-bold uppercase tracking-widest text-text-soft mb-2">SYSTEM</div>
              <p className="text-[1.05rem] md:text-[1.1rem] text-white leading-relaxed break-words">{selectedProject.system}</p>
            </div>
          ) : null}

          <ImpactList idPrefix={selectedProject.id} items={selectedProject.impact ?? []} />

            {selectedProject.badges && selectedProject.badges.length > 0 ? (
              <ToolsTechnologies badges={selectedProject.badges} ariaLabel="Technologies used" className="mb-4" />
            ) : null}

            <KeyLearningsList idPrefix={selectedProject.id} items={selectedProject.keyLearnings ?? []} />
            {(selectedProject.link || selectedProject.code) && (
              <div className="flex gap-2 flex-wrap">
                {selectedProject.link && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-target py-2 px-3.5 rounded-[10px] font-display text-[0.85rem] font-bold uppercase tracking-wide border border-border bg-surface transition-colors duration-200 text-text-pri active:scale-[0.98]"
                  >
                    View Live
                  </a>
                )}
                {selectedProject.code && (
                  <a
                    href={selectedProject.code}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-target py-2 px-3.5 rounded-[10px] font-display text-[0.85rem] font-bold uppercase tracking-wide border border-border bg-surface transition-colors duration-200 text-text-pri active:scale-[0.98]"
                  >
                    View Code
                  </a>
                )}
              </div>
            )}
          </div>
          {hasPreview ? (
            <button
              type="button"
              onClick={togglePreview}
              aria-label={previewOpen ? 'Hide preview' : 'View preview'}
              className="flex-shrink-0 w-full py-2.5 flex flex-col items-center justify-center border-t border-border text-text-muted opacity-[0.12] hover:opacity-100 hover:bg-surface hover:text-text-pri transition-all duration-200 cursor-pointer"
            >
              <span
                className="text-lg transition-transform duration-200"
                style={{ transform: previewOpen ? 'rotate(180deg)' : 'none' }}
              >
                ▼
              </span>
            </button>
          ) : null}
        </div>
      {hasPreview ? (
        <div className="overflow-hidden min-h-0 min-w-0 flex flex-col">
          <div className="flex-1 min-h-[200px] glass-card glass-card--subtle overflow-hidden flex flex-col items-stretch justify-stretch bg-black/20">
            {selectedProject.researchPdfUrl ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 min-h-0 w-full bg-black/20">
                  {previewStage === 'paper' ? (
                    <iframe
                      src={selectedProject.researchPdfUrl}
                      title={`${selectedProject.name} research paper`}
                      className="w-full h-full min-h-0 border-0"
                    />
                  ) : selectedProject.previewType === 'video' && selectedProject.previewUrl ? (
                    <video
                      src={selectedProject.previewUrl}
                      controls
                      playsInline
                      className="w-full h-full min-h-0 object-contain bg-black/20"
                    />
                  ) : selectedProject.previewType === 'site' && selectedProject.previewUrl ? (
                    <iframe
                      src={selectedProject.previewUrl}
                      title={selectedProject.name}
                      className="w-full flex-1 min-h-0 border-0"
                      loading="lazy"
                    />
                  ) : selectedProject.previewType === 'image' && selectedProject.previewUrl ? (
                    <img
                      src={selectedProject.previewUrl}
                      alt={`${selectedProject.name} preview`}
                      className="w-full flex-1 min-h-0 object-contain bg-black/20"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full flex-1 min-h-[200px] flex flex-col items-center justify-center gap-2 text-text-muted text-[0.9rem] p-4">
                      <span>Preview</span>
                      <small className="text-[0.75rem] max-w-[85%] text-center break-words">
                        {selectedProject.name}
                      </small>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 w-full border-t border-border/70 bg-black/20 p-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewStage('paper')}
                      aria-label="Show research paper"
                      aria-pressed={previewStage === 'paper'}
                      className={`cursor-target py-2 px-3.5 rounded-[10px] font-display text-[0.85rem] font-bold uppercase tracking-wide border transition-colors duration-200 active:scale-[0.98] ${
                        previewStage === 'paper'
                          ? 'border-accent bg-surface text-text-pri'
                          : 'border-border/70 bg-black/10 text-text-muted opacity-80 hover:opacity-100 hover:bg-surface hover:text-text-pri'
                      }`}
                    >
                      Research Paper
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewStage('preview')}
                      aria-label="Show video demo"
                      aria-pressed={previewStage === 'preview'}
                      className={`cursor-target py-2 px-3.5 rounded-[10px] font-display text-[0.85rem] font-bold uppercase tracking-wide border transition-colors duration-200 active:scale-[0.98] ${
                        previewStage === 'preview'
                          ? 'border-accent bg-surface text-text-pri'
                          : 'border-border/70 bg-black/10 text-text-muted opacity-80 hover:opacity-100 hover:bg-surface hover:text-text-pri'
                      }`}
                    >
                      Video Demo
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedProject.previewType === 'video' && selectedProject.previewUrl ? (
              <video
                src={selectedProject.previewUrl}
                controls
                playsInline
                className="w-full h-full min-h-0 object-contain bg-black/20"
              />
            ) : selectedProject.previewType === 'site' && selectedProject.previewUrl ? (
              <iframe
                src={selectedProject.previewUrl}
                title={selectedProject.name}
                className="w-full flex-1 min-h-0 border-0"
                loading="lazy"
              />
            ) : selectedProject.previewType === 'image' && selectedProject.previewUrl ? (
              <img
                src={selectedProject.previewUrl}
                alt={`${selectedProject.name} preview`}
                className="w-full flex-1 min-h-0 object-contain bg-black/20"
                loading="lazy"
              />
            ) : (
              <div className="w-full flex-1 min-h-[200px] flex flex-col items-center justify-center gap-2 text-text-muted text-[0.9rem] p-4">
                <span>Preview</span>
                <small className="text-[0.75rem] max-w-[85%] text-center break-words">
                  {selectedProject.name}
                </small>
              </div>
            )}
          </div>
        </div>
      ) : null}
      </div>
  )

  if (detailOnly) return detailContent

  return (
    <ListDetailLayout
      asideLabel="PROJECT SELECT"
      listboxAriaLabel="Choose project"
      asideAriaLabel="Project select"
      items={projects.map((p) => ({ id: p.id, label: p.name }))}
      selectedId={selectedProject.id}
      onSelect={onSelectProject}
      asideClassName="max-lg:max-h-[132px] max-lg:pb-1"
    >
      {detailContent}
    </ListDetailLayout>
  )
}
