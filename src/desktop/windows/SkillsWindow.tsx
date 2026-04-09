import { Suspense, lazy, useState } from 'react'
import { skillBranches } from '@/data/content'
import ClickSpark from '@/components/ui/ClickSpark'

const SkillsDome = lazy(() =>
  import('@/features/skills').then(m => ({ default: m.SkillsDome })),
)

const WIREFRAME_COLOR = '#9FB0CC'

export function SkillsWindow() {
  const [sparksActive, setSparksActive] = useState(false)

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
          wireframeColor={WIREFRAME_COLOR}
          isSectionActive
          onGameStart={() => setSparksActive(true)}
          onGameOver={() => setSparksActive(false)}
        />
      </Suspense>
    </ClickSpark>
  )
}
