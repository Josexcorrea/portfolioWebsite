import { useState } from 'react'
import { projects } from '@/data'
import { ProjectsView } from '@/components'

export function ProjectsWindow() {
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => projects[0]?.id ?? '',
  )

  return (
    <ProjectsView
      selectedProjectId={selectedProjectId}
      onSelectProject={setSelectedProjectId}
    />
  )
}
