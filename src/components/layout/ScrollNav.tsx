/**
 * Fixed vertical line with section dots. Shows current section and allows
 * jumping to a section by click.
 */
import { SCROLL_SECTIONS } from '@/app/sections'

type ScrollNavProps = {
  activeIndex: number
  onSelect: (index: number) => void
}

/**
 * Same visual language as scrollbar-glass on Experience/Projects horizontal strips:
 * thumb ~invisible until you interact with the strip; then dots read clearly.
 */
const DOT_BASE =
  'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-transparent bg-clip-padding transition-all duration-200'
/** Inactive: scrollbar-glass thumb rest (~0.1); stronger when hovering the nav rail */
const DOT_INACTIVE = `
  bg-[rgba(168,85,247,0.09)] max-lg:bg-[rgba(168,85,247,0.06)]
  group-hover/nav:bg-[rgba(168,85,247,0.22)] group-hover/nav:max-lg:bg-[rgba(168,85,247,0.2)]
  hover:!bg-[rgba(168,85,247,0.32)] hover:scale-110 active:scale-105
  focus-visible:!bg-[rgba(168,85,247,0.32)]
`
const DOT_ACTIVE = `
  bg-[rgba(168,85,247,0.38)] max-lg:bg-[rgba(168,85,247,0.28)]
  group-hover/nav:bg-[rgba(168,85,247,0.48)] border-[rgba(168,85,247,0.15)]
  scale-110 hover:bg-[rgba(168,85,247,0.55)] hover:scale-[1.15]
`

export function ScrollNav({ activeIndex, onSelect }: ScrollNavProps) {
  return (
    <nav
      className="group/nav fixed right-3 top-1/2 z-10 -translate-y-1/2 flex flex-col items-center gap-1 rounded-full px-1 py-1.5 sm:right-5 sm:gap-1.5 sm:px-1.5 sm:py-2"
      aria-label="Page sections"
    >
      {SCROLL_SECTIONS.map((section, index) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Go to ${section.label}`}
          title={section.label}
          className={`
            ${DOT_BASE}
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(168,85,247,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
            ${activeIndex === index ? DOT_ACTIVE : DOT_INACTIVE}
          `}
        />
      ))}
    </nav>
  )
}
