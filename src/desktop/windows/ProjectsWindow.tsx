import { projects } from '@/data'
import { ProjectsView } from '@/components'
import { SelectableWindowView } from './SelectableWindowView'

export function ProjectsWindow() {
  return (
    <SelectableWindowView initialId={projects[0]?.id ?? ''}>
      {(selectedProjectId, setSelectedProjectId) => (
        <ProjectsView
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      )}
    </SelectableWindowView>
  )
}
