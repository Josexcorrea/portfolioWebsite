/**
 * Scroll section definitions – single source of truth for nav, App, and SectionBlock.
 */

export const SCROLL_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'skillTree', label: 'Skills' },
  { id: 'work', label: 'Experience & Projects' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof SCROLL_SECTIONS)[number]['id']

const SECTION_BY_ID = Object.fromEntries(SCROLL_SECTIONS.map((s) => [s.id, s])) as Record<
  SectionId,
  (typeof SCROLL_SECTIONS)[number]
>

export function getSectionLabel(id: SectionId): string {
  return SECTION_BY_ID[id]?.label ?? id
}
