import { experiences, projects } from '@/data/content'
import {
  ExperienceView,
  ProjectsView,
  GroupedListDetailLayout,
  type ListDetailGroup,
} from '@/components'

type ExperienceAndProjectsViewProps = {
  selectedWorkId: string
  onSelectWork: (id: string) => void
}

const WORK_GROUPS: ListDetailGroup[] = [
  {
    groupId: 'projects',
    groupLabel: 'Projects',
    items: projects.map((p) => ({ id: p.id, label: p.name })),
  },
  {
    groupId: 'experience',
    groupLabel: 'Experience',
    items: experiences.map((e) => ({ id: e.id, label: e.title })),
  },
]

export function ExperienceAndProjectsView({ selectedWorkId, onSelectWork }: ExperienceAndProjectsViewProps) {
  const isExperience = experiences.some((e) => e.id === selectedWorkId)
  const experienceId = isExperience ? selectedWorkId : experiences[0].id
  const projectId = !isExperience ? selectedWorkId : projects[0].id

  return (
    <GroupedListDetailLayout
      asideAriaLabel="Experience and project select"
      groups={WORK_GROUPS}
      selectedId={selectedWorkId}
      onSelect={onSelectWork}
      asideClassName="max-lg:max-h-[160px] max-lg:pb-1"
      listItemClassName="max-lg:min-w-[160px]"
    >
      {isExperience ? (
        <ExperienceView
          selectedExperienceId={experienceId}
          onSelectExperience={onSelectWork}
          detailOnly
        />
      ) : (
        <ProjectsView
          selectedProjectId={projectId}
          onSelectProject={onSelectWork}
          detailOnly
        />
      )}
    </GroupedListDetailLayout>
  )
}
