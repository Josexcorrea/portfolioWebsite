/**
 * Fixed vertical line with section dots. Shows current section and allows
 * jumping to a section by click.
 */
import { SCROLL_SECTIONS } from '@/app/sections'

type ScrollNavProps = {
  activeIndex: number
  onSelect: (index: number) => void
}

export function ScrollNav({ activeIndex, onSelect }: ScrollNavProps) {
  return (
    <nav
      className="fixed right-4 top-1/2 z-10 -translate-y-1/2 flex flex-col items-center gap-1.5 py-2 sm:right-6"
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
            relative z-10 h-4 w-4 rounded-full border border-[color:var(--glass-border)]
            transition-all duration-200
            hover:scale-110 hover:border-accent hover:bg-accent
            focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
            ${
              activeIndex === index
                ? 'scale-110 border-accent bg-accent shadow-[0_0_0_4px_rgba(168,85,247,0.35)]'
                : 'bg-[var(--glass-bg)]/70'
            }
          `}
        />
      ))}
    </nav>
  )
}
