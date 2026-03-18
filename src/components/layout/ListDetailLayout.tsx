/**
 * Shared layout: sticky aside list + detail panel. Used by Projects and Experience views.
 */

import type { ReactNode } from 'react'
import { LIST_DETAIL_LIST_BUTTON_BASE, LIST_DETAIL_LIST_ITEM_DEFAULT_CLASS } from './listDetailShared'

export type ListDetailItem = { id: string; label: string }

type ListDetailLayoutProps = {
  asideLabel: string
  listboxAriaLabel: string
  asideAriaLabel: string
  items: ListDetailItem[]
  selectedId: string
  onSelect: (id: string) => void
  asideClassName?: string
  listItemClassName?: string
  children: ReactNode
}

export function ListDetailLayout({
  asideLabel,
  listboxAriaLabel,
  asideAriaLabel,
  items,
  selectedId,
  onSelect,
  asideClassName = '',
  listItemClassName = LIST_DETAIL_LIST_ITEM_DEFAULT_CLASS,
  children,
}: ListDetailLayoutProps) {
  return (
    <div className="w-full max-w-[72rem] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_1fr] gap-4 min-h-0 items-stretch lg:grid-rows-1 max-lg:pb-6">
      <aside
        className={`sticky top-0 z-[1] flex flex-col gap-2 min-h-0 flex-1 lg:max-h-full max-lg:flex-initial bg-transparent ${asideClassName}`.trim()}
        aria-label={asideAriaLabel}
      >
        <h2 className="font-display text-[0.7rem] font-bold tracking-widest text-text-soft m-0 pb-1.5 border-b border-[color:var(--glass-border)] flex-shrink-0 max-lg:sr-only max-lg:m-0 max-lg:border-0 max-lg:p-0">
          {asideLabel}
        </h2>
        <ul
          className="scrollbar-glass list-none m-0 p-0 flex flex-col gap-2 overflow-y-auto overflow-x-hidden min-h-0 flex-1 touch-pan-y max-lg:flex-row max-lg:max-h-[100px] max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:gap-3 max-lg:snap-x max-lg:snap-mandatory"
          role="listbox"
          aria-label={listboxAriaLabel}
        >
          {items.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={item.id === selectedId}
              className={`m-0 flex-shrink-0 ${listItemClassName}`.trim()}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`${LIST_DETAIL_LIST_BUTTON_BASE} max-lg:min-h-[48px] max-lg:py-3.5 max-lg:px-4 max-lg:active:scale-[0.98] ${item.id === selectedId ? '!border-accent' : ''}`}
              >
                <span className="font-display text-[0.95rem] font-bold text-text-pri line-clamp-2 block">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="grid min-h-0 min-w-0 items-start">{children}</div>
    </div>
  )
}
