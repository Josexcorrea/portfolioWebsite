export type AppId =
  | 'finder'
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'resume'
  | 'contact'
  | 'chat'

export type WindowPosition = { x: number; y: number }
export type WindowSize = { w: number; h: number }

export type SnapZone =
  | 'left'
  | 'right'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null

export type LayoutSlot =
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export type LayoutPresetId =
  | 'left-main-2stack'
  | 'right-main-2stack'
  | 'quad-grid'

export type LayoutPreset = {
  id: LayoutPresetId
  slots: LayoutSlot[]
}

/**
 * Tracks the animation phase of a window so MacWindow can apply the
 * correct CSS class and trigger ANIM_DONE after the animation ends.
 */
export type WindowAnimPhase =
  | 'idle'
  | 'opening'
  | 'closing'
  | 'minimizing'
  | 'restoring'

export type WindowState = {
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  /** Current snap zone — 'left', 'right', or null if not snapped. */
  snapZone: SnapZone
  /** Current animation phase — drives CSS class on the window element. */
  animPhase: WindowAnimPhase
  zIndex: number
  position: WindowPosition
  size: WindowSize
  /** Saved on spawn so reset-to-default is possible. */
  defaultSize: WindowSize
  /** Saved before maximizing so we can restore the previous position/size. */
  preMaximizeSnapshot: { position: WindowPosition; size: WindowSize } | null
  /** Saved before snapping so dragging again restores previous position/size. */
  preSnapSnapshot: { position: WindowPosition; size: WindowSize } | null
}

/** Measured chrome: menu bar bottom Y and space to reserve above the dock. */
export type LayoutMetrics = {
  menuBarBottom: number
  dockReserved: number
}

export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  menuBarBottom: 26,
  dockReserved: 80,
}

export type DesktopState = {
  windows: Record<AppId, WindowState>
  zCounter: number
  focusedApp: AppId | null
  layoutMetrics: LayoutMetrics
}

export type DesktopAction =
  | { type: 'OPEN'; appId: AppId; position: WindowPosition; size: WindowSize }
  | { type: 'CLOSE'; appId: AppId }
  | { type: 'MINIMIZE'; appId: AppId }
  | { type: 'RESTORE'; appId: AppId }
  | { type: 'FOCUS'; appId: AppId }
  | { type: 'DRAG'; appId: AppId; position: WindowPosition }
  | { type: 'RESIZE'; appId: AppId; size: WindowSize; position: WindowPosition }
  | { type: 'TOGGLE_MAXIMIZE'; appId: AppId }
  | { type: 'SNAP'; appId: AppId; zone: SnapZone }
  | {
      type: 'APPLY_LAYOUT_PRESET'
      focusAppId: AppId
      assignments: Array<{ appId: AppId; slot: LayoutSlot }>
    }
  /** Fired by MacWindow once an entry/exit animation finishes. */
  | { type: 'ANIM_DONE'; appId: AppId }
  /** Restore every minimized window to the foreground. */
  | { type: 'RESTORE_ALL' }
  /** Tile all open windows into a grid. */
  | { type: 'TILE_WINDOWS' }
  /** Re-clamp all open window sizes/positions to the current viewport. */
  | { type: 'CLAMP_ALL' }
  /** Sync window geometry with measured menu bar + dock (from ResizeObserver). */
  | { type: 'SET_LAYOUT_METRICS'; metrics: LayoutMetrics }

// ─── Static config ────────────────────────────────────────────────────────────

export const DEFAULT_SIZES: Record<AppId, WindowSize> = {
  finder:     { w: 900, h: 580 },
  about:      { w: 740, h: 520 },
  projects:   { w: 960, h: 640 },
  experience: { w: 900, h: 620 },
  skills:     { w: 840, h: 580 },
  resume:     { w: 780, h: 900 },
  contact:    { w: 720, h: 560 },
  chat:       { w: 500, h: 660 },
}

export const APP_TITLES: Record<AppId, string> = {
  finder:     'Finder',
  about:      'About Me',
  projects:   'Projects',
  experience: 'Experience',
  skills:     'Skills',
  resume:     'Resume',
  contact:    'Contact',
  chat:       'Portfolio AI',
}
