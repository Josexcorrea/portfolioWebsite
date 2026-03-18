import { Suspense, lazy } from 'react'
import { skillBranches } from '@/data/content'

const SkillsDome = lazy(() => import('@/features/skills').then((m) => ({ default: m.SkillsDome })))

const WIREFRAME_COLOR = '#9FB0CC'

type SkillsViewProps = {
  isSectionActive?: boolean
  onGameStart?: () => void
  onGameOver?: () => void
}

export function SkillsView({ isSectionActive, onGameStart, onGameOver }: SkillsViewProps) {
  return (
    <div className="relative m-0 -mb-px flex-1 min-h-0 flex flex-col w-full bg-transparent">
      <div className="relative z-[1] flex-1 min-h-0 flex flex-col items-center justify-center w-full">
        <Suspense fallback={<div className="w-full h-full" aria-hidden />}>
          <SkillsDome
            branches={skillBranches}
            wireframeColor={WIREFRAME_COLOR}
            isSectionActive={isSectionActive}
            onGameStart={onGameStart}
            onGameOver={onGameOver}
          />
        </Suspense>
      </div>
    </div>
  )
}
