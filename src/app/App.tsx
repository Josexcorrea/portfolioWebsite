import { useState } from 'react'
import { experiences } from '@/data'
import { ScrollNav } from '@/components'
import { FloatingChatWidget } from '@/features/chat'
import { SCROLL_SECTIONS } from './sections'
import { AppBackground } from './components/AppBackground'
import { SectionRenderer } from './components/SectionRenderer'
import { useActiveSection } from './hooks/useActiveSection'

export default function App() {
  const [avatarError, setAvatarError] = useState(false)
  const [selectedWorkId, setSelectedWorkId] = useState<string>(experiences[0].id)
  const [skillsSparksActive, setSkillsSparksActive] = useState(false)
  const { activeIndex: activeSectionIndex, setSectionRef, scrollToSection } = useActiveSection(
    SCROLL_SECTIONS.length
  )

  return (
    <div className="relative min-h-screen min-h-dvh h-full w-full flex flex-col font-sans text-text-pri overflow-x-hidden box-border">
      <AppBackground />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-[env(safe-area-inset-right,0px)] touch-pan-y scroll-smooth overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-transparent">
        <SectionRenderer
          sections={SCROLL_SECTIONS}
          setSectionRef={setSectionRef}
          activeSectionIndex={activeSectionIndex}
          avatarError={avatarError}
          onAvatarError={() => setAvatarError(true)}
          selectedWorkId={selectedWorkId}
          onSelectWork={setSelectedWorkId}
          skillsSparksActive={skillsSparksActive}
          onGameStart={() => setSkillsSparksActive(true)}
          onGameOver={() => setSkillsSparksActive(false)}
        />
      </div>

      <ScrollNav activeIndex={activeSectionIndex} onSelect={scrollToSection} />
      <FloatingChatWidget />
    </div>
  )
}
