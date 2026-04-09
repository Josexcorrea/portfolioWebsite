import { DesktopShell } from '@/desktop'

/**
 * The macOS desktop experience is the single UI for all devices.
 * Mobile and desktop both use the same dock + windows layout —
 * windows auto-maximize on small viewports (handled in DesktopContext).
 */
export default function App() {
  return <DesktopShell />
}
