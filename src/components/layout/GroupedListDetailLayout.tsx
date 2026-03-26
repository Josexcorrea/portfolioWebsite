/**
 * List+detail layout with a single scrollable aside that has multiple groups
 * (e.g. Experience + Projects). Used for combined Experience & Projects view.
 */

import type { ReactNode } from 'react'
import type { ListDetailItem } from './ListDetailLayout'
import { LIST_DETAIL_LIST_BUTTON_BASE, LIST_DETAIL_LIST_ITEM_DEFAULT_CLASS } from './listDetailShared'

export type ListDetailGroup = {
  groupLabel: string
  groupId: string
  items: ListDetailItem[]
}

type GroupedListDetailLayoutProps = {
  asideLabel?: string
  asideAriaLabel: string
  groups: ListDetailGroup[]
  selectedId: string
  onSelect: (id: string) => void
  asideClassName?: string
  listItemClassName?: string
  children: ReactNode
}

export function GroupedListDetailLayout({
  asideLabel,
  asideAriaLabel,
  groups,
  selectedId,
  onSelect,
  asideClassName = '',
  listItemClassName = LIST_DETAIL_LIST_ITEM_DEFAULT_CLASS,
  children,
}: GroupedListDetailLayoutProps) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(240px,min(32vw,320px))_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10 min-h-0 items-start lg:items-start max-lg:pb-10">
      <aside
        className={`z-[1] flex w-full min-w-0 flex-col gap-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[min(100dvh-7rem,820px)] min-h-0 flex-1 max-lg:flex-initial bg-transparent ${asideClassName}`.trim()}
        aria-label={asideAriaLabel}
      >
        {asideLabel ? (
          <h2 className="font-display text-[0.7rem] font-bold tracking-widest text-text-soft m-0 pb-1.5 border-b border-[color:var(--glass-border)] flex-shrink-0 max-lg:sr-only max-lg:m-0 max-lg:border-0 max-lg:p-0">
            {asideLabel}
          </h2>
        ) : null}
        <div className="scrollbar-glass flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto touch-pan-y max-lg:max-h-[140px] max-lg:flex-row max-lg:gap-6 max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:snap-x max-lg:snap-mandatory">
          {groups.map((group) => (
            <div
              key={group.groupId}
              className="flex flex-col gap-3 flex-shrink-0 max-lg:flex-col max-lg:items-center max-lg:gap-2"
              role="group"
              aria-labelledby={`group-${group.groupId}`}
            >
              <h3
                id={`group-${group.groupId}`}
                className="font-display text-[0.65rem] font-bold tracking-widest text-text-muted uppercase flex-shrink-0 w-full max-lg:text-center lg:text-left"
              >
                {group.groupLabel}
              </h3>
              <ul
                className="list-none m-0 p-0 flex flex-col gap-3 max-lg:flex-row max-lg:gap-3"
                role="listbox"
                aria-label={group.groupLabel}
              >
                {group.items.map((item) => (
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
                      <span className="font-display text-[0.95rem] font-bold text-text-pri line-clamp-2 block w-full text-center">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
      <div className="grid min-h-0 min-w-0 items-start">{children}</div>
    </div>
  )
}
