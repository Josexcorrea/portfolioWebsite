import { Suspense, lazy, useState } from 'react'
import { skillBranches } from '@/data/content'
import ClickSpark from '@/components/ui/ClickSpark'
import { useDesktop } from '@/desktop/DesktopContext'

const SkillsDome = lazy(() =>
  import('@/features/skills').then(m => ({ default: m.SkillsDome })),
)

const WIREFRAME_COLOR_DARK = '#9FB0CC'
const WIREFRAME_COLOR_LIGHT = '#22D3EE'

export function SkillsWindow() {
  const [sparksActive, setSparksActive] = useState(false)
  const { theme, focusedApp } = useDesktop()

  return (
    <ClickSpark
      sparkColor="#FFFFFF"
      sparkSize={10}
      sparkRadius={18}
      sparkCount={8}
      duration={420}
      active={sparksActive}
      className="w-full h-full bg-transparent overflow-hidden"
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-text-muted/50 text-sm">
            Loading skills globe…
          </div>
        }
      >
        <SkillsDome
          branches={skillBranches}
          wireframeColor={theme === 'light' ? WIREFRAME_COLOR_LIGHT : WIREFRAME_COLOR_DARK}
          isSectionActive={focusedApp === 'skills'}
          onGameStart={() => setSparksActive(true)}
          onGameOver={() => setSparksActive(false)}
        />
      </Suspense>
    </ClickSpark>
  )
}
