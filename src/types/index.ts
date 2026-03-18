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
  details: string[]
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
