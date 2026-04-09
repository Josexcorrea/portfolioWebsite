import { useDesktop } from './DesktopContext'
import type { AppId } from './types'

type Props = { appId: AppId }

/**
 * macOS-style traffic light controls.
 * CSS handles icon glyphs via ::before pseudo-elements on hover.
 */
export function MacWindowControls({ appId }: Props) {
  const { closeApp, minimizeApp, toggleMaximize } = useDesktop()

  return (
    <div className="mac-traffic-lights" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="mac-tl mac-tl--close"
        onClick={(e) => { e.stopPropagation(); closeApp(appId) }}
        aria-label="Close window"
      />
      <button
        type="button"
        className="mac-tl mac-tl--minimize"
        onClick={(e) => { e.stopPropagation(); minimizeApp(appId) }}
        aria-label="Minimize window"
      />
      <button
        type="button"
        className="mac-tl mac-tl--maximize"
        onClick={(e) => { e.stopPropagation(); toggleMaximize(appId) }}
        aria-label="Toggle fullscreen"
      />
    </div>
  )
}
