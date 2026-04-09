import { Suspense, lazy } from 'react'

const ComputerCanvas = lazy(() =>
  import('@/features/hero/ComputerCanvas').then((m) => ({ default: m.ComputerCanvas })),
)

/**
 * Full-viewport animated wallpaper layer.
 * Renders behind all windows (z-index 0 via .mac-wallpaper CSS).
 */
export function DesktopWallpaper() {
  return (
    <div className="mac-wallpaper" aria-hidden>
      {/* Atmospheric depth: hero video at ultra-low opacity */}
      <video
        className="mac-wallpaper-video"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Live 3D computer as the animated wallpaper centerpiece */}
      <div className="mac-wallpaper-canvas">
        <Suspense fallback={null}>
          <ComputerCanvas />
        </Suspense>
      </div>
    </div>
  )
}
