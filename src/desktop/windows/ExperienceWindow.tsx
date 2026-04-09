import { useState } from 'react'
import { experiences } from '@/data'
import { ExperienceView } from '@/components'

export function ExperienceWindow() {
  const [selectedExperienceId, setSelectedExperienceId] = useState(
    () => experiences[0]?.id ?? '',
  )

  return (
    <ExperienceView
      selectedExperienceId={selectedExperienceId}
      onSelectExperience={setSelectedExperienceId}
    />
  )
}
