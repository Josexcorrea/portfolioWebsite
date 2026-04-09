import { experiences } from '@/data'
import { ExperienceView } from '@/components'
import { SelectableWindowView } from './SelectableWindowView'

export function ExperienceWindow() {
  return (
    <SelectableWindowView initialId={experiences[0]?.id ?? ''}>
      {(selectedExperienceId, setSelectedExperienceId) => (
        <ExperienceView
          selectedExperienceId={selectedExperienceId}
          onSelectExperience={setSelectedExperienceId}
        />
      )}
    </SelectableWindowView>
  )
}
