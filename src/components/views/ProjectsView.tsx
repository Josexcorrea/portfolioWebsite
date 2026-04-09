import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { projects } from '@/data/content'
import type { Project } from '@/types'
import { ImpactList, KeyLearningsList, ToolsTechnologies } from '@/components'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

// ─── Finder-style hover variants ──────────────────────────────────────────────

const navItemVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.013 },
  tap:  { scale: 0.975 },
}

const navOverlayVariants = {
  idle: { opacity: 0 },
  hover: { opacity: 1 },
  tap:  { opacity: 0.5 },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  )
}

function FilePdfIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectsViewProps = {
  selectedProjectId: string
  onSelectProject: (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectsView({ selectedProjectId, onSelectProject }: ProjectsViewProps) {
  const selectedProject: Project = projects.find((p) => p.id === selectedProjectId) ?? projects[0]
  const [mediaTab, setMediaTab] = useState<'paper' | 'demo'>('paper')

  const hasPaper = Boolean(selectedProject.researchPdfUrl)
  const hasVideo =
    Boolean(selectedProject.previewUrl) && selectedProject.previewType === 'video'
  const hasImage =
    Boolean(selectedProject.previewUrl) && selectedProject.previewType === 'image'
  const hasMedia =
    selectedProject.id !== 'portfolio-website' && (hasPaper || hasVideo || hasImage)
  const hasBothTabs = hasPaper && (hasVideo || hasImage)
  const hasLive = Boolean(selectedProject.link)
  const hasCode = Boolean(selectedProject.code)

  useEffect(() => {
    setMediaTab(hasPaper ? 'paper' : 'demo')
  }, [selectedProjectId, hasPaper])

  // ── Sidebar nav ─────────────────────────────────────────────────────────────

  const sidebarContent = (
    <aside className="pw-sidebar" aria-label="Project select">
      <p className="pw-sidebar-label">Project Select</p>
      <ul role="listbox" aria-label="Choose project" className="pw-sidebar-list scrollbar-glass">
        {projects.map((p) => {
          const isActive = p.id === selectedProjectId
          return (
            <li key={p.id} role="option" aria-selected={isActive} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => onSelectProject(p.id)}
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
                        style={isActive ? { color: '#34d399' } : undefined}
                      >
                        {p.name}
                      </span>
                      {p.dateMade && <span className="pw-nav-year">{p.dateMade}</span>}
                      <span className="pw-nav-tag">{p.tagline}</span>
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
      {/* Header */}
      <div className="pw-detail-header">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <h2 className="pw-detail-title">{selectedProject.name}</h2>
          {selectedProject.dateMade && (
            <span className="pw-detail-year">{selectedProject.dateMade}</span>
          )}
        </div>
        {selectedProject.tagline && (
          <p className="pw-detail-tagline">{selectedProject.tagline}</p>
        )}
      </div>

      {/* Mission or description */}
      {selectedProject.mission ? (
        <div className="pw-section">
          <div className="pw-section-label">Mission</div>
          <p className="pw-section-body">{selectedProject.mission}</p>
        </div>
      ) : (
        <div className="pw-section">
          <p className="pw-section-body">{selectedProject.description}</p>
        </div>
      )}

      {/* System */}
      {selectedProject.system && (
        <div className="pw-section">
          <div className="pw-section-label">System</div>
          <p className="pw-section-body">{selectedProject.system}</p>
        </div>
      )}

      {/* Impact, tools, learnings */}
      <div className="pw-section">
        <ImpactList idPrefix={selectedProject.id} items={selectedProject.impact ?? []} />
        {selectedProject.badges?.length ? (
          <ToolsTechnologies
            badges={selectedProject.badges}
            ariaLabel="Technologies used"
            className="mb-4"
          />
        ) : null}
        <KeyLearningsList idPrefix={selectedProject.id} items={selectedProject.keyLearnings ?? []} />
      </div>

      {/* External links */}
      {(hasLive || hasCode) && (
        <div className="pw-links-row">
          {hasLive && (
            <a
              href={selectedProject.link}
              target="_blank"
              rel="noreferrer"
              className="pw-link-btn pw-link-btn--primary"
            >
              <ExternalLinkIcon /> View Live
            </a>
          )}
          {hasCode && (
            <a
              href={selectedProject.code}
              target="_blank"
              rel="noreferrer"
              className="pw-link-btn pw-link-btn--secondary"
            >
              <GitHubIcon /> GitHub
            </a>
          )}
        </div>
      )}
    </>
  )

  // ── Media panel ──────────────────────────────────────────────────────────────

  const mediaPanel = hasMedia ? (
    <div className="pw-media">
      {hasBothTabs && (
        <div className="pw-tabs">
          <button
            type="button"
            onClick={() => setMediaTab('paper')}
            className={`pw-tab${mediaTab === 'paper' ? ' pw-tab--active' : ''}`}
          >
            <FilePdfIcon /> Research Paper
          </button>
          <button
            type="button"
            onClick={() => setMediaTab('demo')}
            className={`pw-tab${mediaTab === 'demo' ? ' pw-tab--active' : ''}`}
          >
            <VideoIcon /> Video Demo
          </button>
        </div>
      )}
      <div className="pw-media-content">
        {(mediaTab === 'paper' || (!hasBothTabs && hasPaper)) && selectedProject.researchPdfUrl ? (
          <>
            <iframe
              src={selectedProject.researchPdfUrl}
              title={`${selectedProject.name} research paper`}
              className="pw-media-iframe hidden lg:block"
            />
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full lg:hidden">
              <p className="text-[0.85rem] text-text-muted max-w-xs">
                PDF is best viewed on a larger screen.
              </p>
              <a
                href={selectedProject.researchPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pw-link-btn pw-link-btn--primary"
              >
                Open PDF ↗
              </a>
            </div>
          </>
        ) : selectedProject.previewType === 'video' && selectedProject.previewUrl ? (
          <video
            src={selectedProject.previewUrl}
            controls
            playsInline
            className="pw-media-video"
          />
        ) : selectedProject.previewType === 'image' && selectedProject.previewUrl ? (
          <img
            src={selectedProject.previewUrl}
            alt={`${selectedProject.name} preview`}
            className="pw-media-image"
          />
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
