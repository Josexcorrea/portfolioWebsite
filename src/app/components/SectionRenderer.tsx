import { experiences } from '@/data'
import {
  ClickSpark,
  ContactView,
  ExperienceAndProjectsView,
  HomeView,
  SectionBlock,
  SkillsView,
} from '@/components'
import type { SectionId } from '@/app/sections'

type Section = { id: SectionId; label: string }

type SectionRendererProps = {
  sections: readonly Section[]
  setSectionRef: (index: number) => (el: HTMLElement | null) => void

  activeSectionIndex: number

  avatarError: boolean
  onAvatarError: () => void

  selectedWorkId: string
  onSelectWork: (id: string) => void

  skillsSparksActive: boolean
  onGameStart: () => void
  onGameOver: () => void
}

const SECTION_BASE_CLASS = 'min-h-screen min-h-dvh relative flex flex-col py-[var(--section-padding-y)]'

export function SectionRenderer({
  sections,
  setSectionRef,
  activeSectionIndex,
  avatarError,
  onAvatarError,
  selectedWorkId,
  onSelectWork,
  skillsSparksActive,
  onGameStart,
  onGameOver,
}: SectionRendererProps) {
  // Validate the initial selection defensively; keeps UI stable if content changes.
  const safeSelectedWorkId = selectedWorkId || experiences[0]?.id || ''

  return (
    <>
      {sections.map((section, index) => {
        const isHome = section.id === 'home'
        const isSkills = section.id === 'skillTree'

        return (
          <section
            key={section.id}
            ref={setSectionRef(index)}
            className={`${SECTION_BASE_CLASS} ${isHome ? '[&_.home-video-wrap]:hidden' : ''}`}
            aria-label={section.label}
          >
            {isHome && <HomeView avatarError={avatarError} onAvatarError={onAvatarError} />}

            {isSkills && (
              <ClickSpark
                className="min-h-full w-full"
                sparkColor="#FFFFFF"
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
                active={skillsSparksActive}
              >
                <SectionBlock view="skillTree">
                  <SkillsView
                    isSectionActive={activeSectionIndex === index}
                    onGameStart={onGameStart}
                    onGameOver={onGameOver}
                  />
                </SectionBlock>
              </ClickSpark>
            )}

            {section.id === 'work' && (
              <SectionBlock view="work">
                <ExperienceAndProjectsView selectedWorkId={safeSelectedWorkId} onSelectWork={onSelectWork} />
              </SectionBlock>
            )}

            {section.id === 'contact' && (
              <SectionBlock view="contact">
                <ContactView />
              </SectionBlock>
            )}
          </section>
        )
      })}
    </>
  )
}

