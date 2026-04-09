import { useState } from 'react'
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

// ─── Inner shell (needs DesktopProvider in scope) ─────────────────────────────

function Shell() {
  const mobileLauncher = useMobileLauncher()

  return (
    <div className="mac-desktop">
      {/* SVG filter definitions used by LiquidGlass elements */}
      <LiquidGlassFilter />

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
