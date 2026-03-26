/**
 * Shared types for the portfolio app.
 * View aligns with section ids from @/app/sections (single source of truth).
 */
import type { SectionId } from '@/app/sections'

export type View = SectionId

export type Project = {
  id: string
  name: string
  tagline: string
  description: string
  /**
   * Friend-like detail fields (title + date + mission + system).
   * Optional to avoid breaking existing projects content.
   */
  dateMade?: string
  mission?: string
  system?: string
  /** Outcome / proof bullets (▸ in UI). */
  impact?: string[]
  /** Reflective takeaways (✦ in UI). */
  keyLearnings?: string[]
  /**
   * Optional PDF shown inside the Projects preview pane for specific projects.
   * Used for PDM research paper preview.
   */
  researchPdfUrl?: string
  /** Simple Icons slugs for achievement-style tech badges shown under the description. */
  badges?: string[]
  link?: string
  code?: string
  previewType: 'image' | 'video' | 'site'
  previewUrl?: string
}

export type ExperienceEntry = {
  id: string
  type: 'job' | 'education'
  title: string
  subtitle: string
  period: string
  /** Outcome / proof bullets (▸ in UI). */
  impact: string[]
  /** Reflective takeaways (✦ in UI). */
  keyLearnings: string[]
  /** Short narrative explaining the role/project goal (friend-style layout). */
  mission?: string
  /** Technical summary of the system/architecture/approach (friend-style layout). */
  system?: string
  /** Simple Icons slugs for skill/tech badges shown under the description (same style as project badges). */
  badges?: string[]
}

export type ContactItem = {
  id: string
  label: string
  href: string
  /** Text fallback when emblem is not set (e.g. 'GH', 'IN'). */
  icon: string
  /** When set, show this emblem/logo instead of icon text. */
  emblem?: 'phone' | 'github' | 'linkedin' | 'email' | 'resume' | 'instagram'
}

export type SkillProficiency = 'advanced' | 'intermediate' | 'familiar'

export type SkillNode = {
  name: string
  proficiency: SkillProficiency
  description: string
  icon?: string
}

export type SkillBranch = {
  name: string
  color: string
  skills: SkillNode[]
}
