import { useState, type ReactNode } from 'react'

type SelectableWindowViewProps = {
  initialId: string
  children: (selectedId: string, onSelect: (id: string) => void) => ReactNode
}

export function SelectableWindowView({ initialId, children }: SelectableWindowViewProps) {
  const [selectedId, setSelectedId] = useState(() => initialId)
  return <>{children(selectedId, setSelectedId)}</>
}

