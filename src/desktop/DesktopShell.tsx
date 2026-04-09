import { useEffect, useState } from 'react'
import { DesktopProvider } from './DesktopContext'
import { ChatGlobeProvider } from '@/contexts/ChatGlobeContext'
import { DesktopWallpaper } from './DesktopWallpaper'
import { MenuBar } from './MenuBar'
import { MacWindow } from './MacWindow'
import { Dock } from './Dock'
import { MobileIOSHome } from './MobileIOSHome'
import { useMobileLauncher } from './useMobileLauncher'
import { BootScreen } from './BootScreen'
import { LiquidGlassFilter } from '@/components/ui/LiquidGlass'
import { AboutWindow } from './windows/AboutWindow'
import { ProjectsWindow } from './windows/ProjectsWindow'
import { ExperienceWindow } from './windows/ExperienceWindow'
import { SkillsWindow } from './windows/SkillsWindow'
import { ResumeWindow } from './windows/ResumeWindow'
import { ContactWindow } from './windows/ContactWindow'
import { ChatWindow } from './windows/ChatWindow'
import { FinderWindow } from './windows/FinderWindow'

// ─── Window registry ──────────────────────────────────────────────────────────

const WINDOWS = [
  { appId: 'finder',     title: 'Finder',               content: <FinderWindow /> },
  { appId: 'about',      title: 'About — Jose Correa',   content: <AboutWindow /> },
  { appId: 'projects',   title: 'Projects',              content: <ProjectsWindow /> },
  { appId: 'experience', title: 'Experience',            content: <ExperienceWindow /> },
  { appId: 'skills',     title: 'Skills',                content: <SkillsWindow /> },
  { appId: 'resume',     title: 'Resume',                content: <ResumeWindow /> },
  { appId: 'contact',    title: 'Contact',               content: <ContactWindow /> },
  { appId: 'chat',       title: 'Portfolio AI',           content: <ChatWindow /> },
] as const

const AMBIENT_PALETTES = ['dusk', 'ocean', 'violet', 'forest'] as const

type AmbientPalette = (typeof AMBIENT_PALETTES)[number]

function getAmbientPalette(): AmbientPalette {
  const hourBucket = Math.floor(Date.now() / (60 * 60 * 1000))
  return AMBIENT_PALETTES[hourBucket % AMBIENT_PALETTES.length]
}

// ─── Inner shell (needs DesktopProvider in scope) ─────────────────────────────

function Shell() {
  const mobileLauncher = useMobileLauncher()
  const [ambientPalette, setAmbientPalette] = useState<AmbientPalette>(() => getAmbientPalette())

  useEffect(() => {
    let hourIntervalId: number | null = null
    const syncPalette = () => setAmbientPalette(getAmbientPalette())
    const millisToNextHour = 60 * 60 * 1000 - (Date.now() % (60 * 60 * 1000))

    const hourBoundaryTimeoutId = window.setTimeout(() => {
      syncPalette()
      hourIntervalId = window.setInterval(syncPalette, 60 * 60 * 1000)
    }, millisToNextHour)

    return () => {
      window.clearTimeout(hourBoundaryTimeoutId)
      if (hourIntervalId !== null) window.clearInterval(hourIntervalId)
    }
  }, [])

  return (
    <div className="mac-desktop">
      {/* SVG filter definitions used by LiquidGlass elements */}
      <LiquidGlassFilter />

      {/* Layer 0.5: soft ambient glow + frosted veil */}
      <div className="desktop-ambient" data-palette={ambientPalette} aria-hidden>
        <span className="desktop-ambient-ball desktop-ambient-ball--one" />
        <span className="desktop-ambient-ball desktop-ambient-ball--two" />
        <span className="desktop-ambient-ball desktop-ambient-ball--three" />
        <span className="desktop-ambient-ball desktop-ambient-ball--four" />
        <span className="desktop-ambient-glass" />
      </div>

      {/* Layer 0: animated wallpaper (z-0) — 3D model + video unchanged */}
      <DesktopWallpaper />

      {/* Layer 1: macOS chrome OR iPhone-style home (mutually exclusive — avoids duplicate SVG ids) */}
      {!mobileLauncher && <MenuBar />}
      {mobileLauncher && <MobileIOSHome />}

      {/* Layer 2: windows — above home grid */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}
        className="[&>*]:pointer-events-auto"
        aria-label="Desktop"
      >
        {WINDOWS.map(({ appId, title, content }) => (
          <MacWindow key={appId} appId={appId} title={title}>
            {content}
          </MacWindow>
        ))}
      </div>

      {!mobileLauncher && <Dock />}
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function DesktopShell() {
  const [booted, setBooted] = useState(false)

  return (
    // ChatGlobeProvider is needed for ChatWindow's useChatController hook.
    <ChatGlobeProvider>
      <DesktopProvider>
        {!booted && <BootScreen onEnter={() => setBooted(true)} />}
        <Shell />
      </DesktopProvider>
    </ChatGlobeProvider>
  )
}
