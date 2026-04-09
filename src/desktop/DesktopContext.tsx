/* eslint-disable react-refresh/only-export-components -- co-located hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import {
  type AppId,
  type DesktopAction,
  type DesktopState,
  type LayoutMetrics,
  type SnapZone,
  type LayoutSlot,
  type WindowAnimPhase,
  type WindowPosition,
  type WindowSize,
  type WindowState,
  DEFAULT_LAYOUT_METRICS,
  DEFAULT_SIZES,
} from './types'

// ─── helpers ──────────────────────────────────────────────────────────────────

const WIN_PADDING = 12 // minimum gap from each edge

/** Clamp a window so at least 80px of the title bar remains inside the viewport. */
function clampPosition(
  pos: WindowPosition,
  size: WindowSize,
  m: LayoutMetrics,
): WindowPosition {
  const TITLE_BAR_H = 40
  const MIN_VISIBLE = 80
  const top = m.menuBarBottom

  const maxX = Math.max(0, window.innerWidth - MIN_VISIBLE)
  const maxY = Math.max(top, window.innerHeight - TITLE_BAR_H)

  return {
    x: Math.min(Math.max(pos.x, -(size.w - MIN_VISIBLE)), maxX),
    y: Math.min(Math.max(pos.y, top), maxY),
  }
}

/**
 * Constrain a window size so it fits within the usable viewport area
 * (below the menu bar, above the dock, with a small padding on each side).
 */
function clampSize(size: WindowSize, m: LayoutMetrics): WindowSize {
  const maxW = Math.max(320, window.innerWidth - WIN_PADDING * 2)
  const maxH = Math.max(240, window.innerHeight - m.menuBarBottom - m.dockReserved)
  return {
    w: Math.min(size.w, maxW),
    h: Math.min(size.h, maxH),
  }
}

/** Cascade offset so stacked windows don't perfectly overlap. */
let spawnOffset = 0
function nextSpawnOffset(): number {
  spawnOffset = (spawnOffset + 22) % 132
  return spawnOffset
}

function centeredPosition(size: WindowSize, m: LayoutMetrics): WindowPosition {
  const offset = nextSpawnOffset()
  const top = m.menuBarBottom
  const usableH = window.innerHeight - top - m.dockReserved
  return {
    x: Math.round((window.innerWidth - size.w) / 2) + offset,
    y: Math.round((usableH - size.h) / 2) + top + offset,
  }
}

/** Compute position + size for a snap zone. */
function snapGeometry(
  zone: SnapZone,
  m: LayoutMetrics,
): { position: WindowPosition; size: WindowSize } | null {
  if (!zone) return null
  const top = m.menuBarBottom
  const availH = window.innerHeight - top - m.dockReserved
  if (zone === 'left') {
    return {
      position: { x: 0, y: top },
      size: { w: Math.round(window.innerWidth / 2), h: availH },
    }
  }
  if (zone === 'right') {
    const w = Math.round(window.innerWidth / 2)
    return {
      position: { x: window.innerWidth - w, y: top },
      size: { w, h: availH },
    }
  }
  if (zone === 'top-left') {
    return {
      position: { x: 0, y: top },
      size: { w: Math.round(window.innerWidth / 2), h: Math.round(availH / 2) },
    }
  }
  if (zone === 'top-right') {
    const w = Math.round(window.innerWidth / 2)
    return {
      position: { x: window.innerWidth - w, y: top },
      size: { w, h: Math.round(availH / 2) },
    }
  }
  if (zone === 'bottom-left') {
    const h = Math.round(availH / 2)
    return {
      position: { x: 0, y: top + (availH - h) },
      size: { w: Math.round(window.innerWidth / 2), h },
    }
  }
  if (zone === 'bottom-right') {
    const w = Math.round(window.innerWidth / 2)
    const h = Math.round(availH / 2)
    return {
      position: { x: window.innerWidth - w, y: top + (availH - h) },
      size: { w, h },
    }
  }
  return null
}

function slotGeometry(
  slot: LayoutSlot,
  m: LayoutMetrics,
): { position: WindowPosition; size: WindowSize } {
  const top = m.menuBarBottom
  const availH = window.innerHeight - top - m.dockReserved
  const halfW = Math.round(window.innerWidth / 2)
  const halfH = Math.round(availH / 2)
  switch (slot) {
    case 'left':
      return { position: { x: 0, y: top }, size: { w: halfW, h: availH } }
    case 'right':
      return { position: { x: window.innerWidth - halfW, y: top }, size: { w: halfW, h: availH } }
    case 'top-left':
      return { position: { x: 0, y: top }, size: { w: halfW, h: halfH } }
    case 'top-right':
      return { position: { x: window.innerWidth - halfW, y: top }, size: { w: halfW, h: halfH } }
    case 'bottom-left':
      return { position: { x: 0, y: top + (availH - halfH) }, size: { w: halfW, h: halfH } }
    case 'bottom-right':
      return {
        position: { x: window.innerWidth - halfW, y: top + (availH - halfH) },
        size: { w: halfW, h: halfH },
      }
  }
}

function measureLayout(): LayoutMetrics {
  if (typeof document === 'undefined') return DEFAULT_LAYOUT_METRICS
  const mb = document.querySelector('.mac-menubar')
  const dock = document.querySelector('.mac-dock-wrapper')
  const iosDock = document.querySelector('.ios-home-dock-wrap')
  const innerH = window.innerHeight
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const menuBarBottom = mb
    ? mb.getBoundingClientRect().bottom
    : mobile
      ? 52
      : DEFAULT_LAYOUT_METRICS.menuBarBottom
  let dockReserved = DEFAULT_LAYOUT_METRICS.dockReserved
  if (dock) {
    if (dock.classList.contains('mac-dock-wrapper--hidden')) {
      dockReserved = 24
    } else {
      const dockTop = dock.getBoundingClientRect().top
      if (dockTop > 0 && dockTop < innerH) {
        dockReserved = Math.max(48, innerH - dockTop)
      }
    }
  } else if (iosDock) {
    const dockTop = iosDock.getBoundingClientRect().top
    if (dockTop > 0 && dockTop < innerH) {
      dockReserved = Math.max(72, innerH - dockTop + 10)
    }
  }
  return { menuBarBottom, dockReserved }
}

function applyLayoutCssVars(metrics: LayoutMetrics) {
  const r = document.documentElement
  r.style.setProperty('--mac-menubar-stack', `${metrics.menuBarBottom}px`)
  r.style.setProperty('--mac-dock-reserved', `${metrics.dockReserved}px`)
}

function isMobileViewport(): boolean {
  return window.matchMedia('(max-width: 767px)').matches
}

function mobileGeometry(m: LayoutMetrics): { position: WindowPosition; size: WindowSize } {
  const top = m.menuBarBottom
  const height = Math.max(240, window.innerHeight - m.menuBarBottom - m.dockReserved)
  return {
    position: { x: 0, y: top },
    size: { w: window.innerWidth, h: height },
  }
}

// ─── initial state ────────────────────────────────────────────────────────────

function makeWindow(appId: AppId): WindowState {
  const defaultSize = DEFAULT_SIZES[appId]
  return {
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    snapZone: null,
    animPhase: 'idle',
    zIndex: 0,
    position: { x: 0, y: DEFAULT_LAYOUT_METRICS.menuBarBottom },
    size: { ...defaultSize },
    defaultSize,
    preMaximizeSnapshot: null,
    preSnapSnapshot: null,
  }
}

const ALL_APP_IDS: AppId[] = [
  'finder', 'about', 'projects', 'experience', 'skills', 'resume', 'contact', 'chat',
]

function buildInitialState(): DesktopState {
  const windows = Object.fromEntries(
    ALL_APP_IDS.map(id => [id, makeWindow(id as AppId)]),
  ) as Record<AppId, WindowState>
  return {
    windows,
    zCounter: 10,
    focusedApp: null,
    layoutMetrics: { ...DEFAULT_LAYOUT_METRICS },
  }
}

// ─── reducer ──────────────────────────────────────────────────────────────────

function patchWindow(
  state: DesktopState,
  appId: AppId,
  patch: Partial<WindowState>,
): DesktopState {
  return {
    ...state,
    windows: {
      ...state.windows,
      [appId]: { ...state.windows[appId], ...patch },
    },
  }
}

function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  const m = state.layoutMetrics
  switch (action.type) {
    case 'SET_LAYOUT_METRICS': {
      const { metrics } = action
      if (
        metrics.menuBarBottom === m.menuBarBottom &&
        metrics.dockReserved === m.dockReserved
      ) {
        return state
      }
      return { ...state, layoutMetrics: metrics }
    }

    case 'OPEN': {
      const win = state.windows[action.appId]
      const nextZ = state.zCounter + 1

      if (win.isOpen && !win.isMinimized) {
        return {
          ...patchWindow(state, action.appId, { zIndex: nextZ, animPhase: 'idle' }),
          zCounter: nextZ,
          focusedApp: action.appId,
        }
      }

      if (win.isOpen && win.isMinimized) {
        return {
          ...patchWindow(state, action.appId, {
            isMinimized: false,
            animPhase: 'restoring',
            zIndex: nextZ,
          }),
          zCounter: nextZ,
          focusedApp: action.appId,
        }
      }

      return {
        ...patchWindow(state, action.appId, {
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          snapZone: null,
          animPhase: 'opening',
          zIndex: nextZ,
          position: action.position,
          size: action.size,
          preMaximizeSnapshot: null,
          preSnapSnapshot: null,
        }),
        zCounter: nextZ,
        focusedApp: action.appId,
      }
    }

    case 'CLOSE': {
      const win = state.windows[action.appId]
      if (!win.isOpen) return state
      const nextFocus =
        state.focusedApp === action.appId ? null : state.focusedApp
      return {
        ...patchWindow(state, action.appId, { animPhase: 'closing' }),
        focusedApp: nextFocus,
      }
    }

    case 'MINIMIZE': {
      const win = state.windows[action.appId]
      if (!win.isOpen || win.isMinimized) return state
      const nextFocus =
        state.focusedApp === action.appId ? null : state.focusedApp
      return {
        ...patchWindow(state, action.appId, { animPhase: 'minimizing' }),
        focusedApp: nextFocus,
      }
    }

    case 'RESTORE': {
      const win = state.windows[action.appId]
      if (!win.isMinimized) return state
      const nextZ = state.zCounter + 1
      return {
        ...patchWindow(state, action.appId, {
          isMinimized: false,
          animPhase: 'restoring',
          zIndex: nextZ,
        }),
        zCounter: nextZ,
        focusedApp: action.appId,
      }
    }

    case 'FOCUS': {
      if (state.focusedApp === action.appId) return state
      const win = state.windows[action.appId]
      const nextZ = state.zCounter + 1
      return {
        ...patchWindow(state, action.appId, { zIndex: nextZ }),
        zCounter: nextZ,
        focusedApp: action.appId,
      }
      void win
    }

    case 'DRAG': {
      const win = state.windows[action.appId]
      if (!win.isOpen || win.isMinimized) return state

      // If the window is snapped or maximized, un-snap/un-maximize and restore geometry
      if (win.snapZone || win.isMaximized) {
        const snap = win.preSnapSnapshot ?? win.preMaximizeSnapshot
        return patchWindow(state, action.appId, {
          isMaximized: false,
          snapZone: null,
          preSnapSnapshot: null,
          preMaximizeSnapshot: null,
          position: clampPosition(action.position, snap?.size ?? win.size, m),
          size: snap?.size ?? win.size,
        })
      }

      return patchWindow(state, action.appId, {
        position: clampPosition(action.position, win.size, m),
      })
    }

    case 'RESIZE': {
      const win = state.windows[action.appId]
      if (!win.isOpen || win.isMinimized || win.isMaximized || win.snapZone) return state
      const clampedPos = {
        x: action.position.x,
        y: Math.max(m.menuBarBottom, action.position.y),
      }
      return patchWindow(state, action.appId, { size: action.size, position: clampedPos })
    }

    case 'SNAP': {
      const win = state.windows[action.appId]
      if (!win.isOpen || win.isMinimized) return state
      const nextZ = state.zCounter + 1

      if (!action.zone) {
        // Un-snap
        const snap = win.preSnapSnapshot
        return {
          ...patchWindow(state, action.appId, {
            snapZone: null,
            preSnapSnapshot: null,
            isMaximized: false,
            position: snap?.position ?? win.position,
            size: snap?.size ?? win.size,
            zIndex: nextZ,
          }),
          zCounter: nextZ,
          focusedApp: action.appId,
        }
      }

      if (action.zone === 'top') {
        // Use existing maximize for top snap
        return {
          ...patchWindow(state, action.appId, {
            isMaximized: true,
            snapZone: 'top',
            preMaximizeSnapshot: { position: win.position, size: win.size },
            preSnapSnapshot: { position: win.position, size: win.size },
            zIndex: nextZ,
          }),
          zCounter: nextZ,
          focusedApp: action.appId,
        }
      }

      const geo = snapGeometry(action.zone, m)
      if (!geo) return state

      return {
        ...patchWindow(state, action.appId, {
          snapZone: action.zone,
          isMaximized: false,
          preSnapSnapshot: { position: win.position, size: win.size },
          position: geo.position,
          size: geo.size,
          zIndex: nextZ,
        }),
        zCounter: nextZ,
        focusedApp: action.appId,
      }
    }

    case 'APPLY_LAYOUT_PRESET': {
      if (action.assignments.length === 0) return state
      let z = state.zCounter
      const newWindows = { ...state.windows }
      for (const { appId, slot } of action.assignments) {
        const win = newWindows[appId]
        if (!win.isOpen || win.isMinimized) continue
        const geo = slotGeometry(slot, m)
        z += 1
        newWindows[appId] = {
          ...win,
          snapZone: slot,
          isMaximized: false,
          preSnapSnapshot: win.preSnapSnapshot ?? { position: win.position, size: win.size },
          position: geo.position,
          size: geo.size,
          zIndex: z,
        }
      }
      return {
        ...state,
        windows: newWindows,
        zCounter: z,
        focusedApp: action.focusAppId,
      }
    }

    case 'TOGGLE_MAXIMIZE': {
      const win = state.windows[action.appId]
      const nextZ = state.zCounter + 1

      if (win.isMaximized || win.snapZone === 'top') {
        const snap = win.preMaximizeSnapshot ?? win.preSnapSnapshot
        return {
          ...patchWindow(state, action.appId, {
            isMaximized: false,
            snapZone: null,
            preMaximizeSnapshot: null,
            preSnapSnapshot: null,
            zIndex: nextZ,
            position: snap?.position ?? win.position,
            size: snap?.size ?? win.size,
          }),
          zCounter: nextZ,
          focusedApp: action.appId,
        }
      }

      return {
        ...patchWindow(state, action.appId, {
          isMaximized: true,
          snapZone: null,
          preMaximizeSnapshot: { position: win.position, size: win.size },
          zIndex: nextZ,
        }),
        zCounter: nextZ,
        focusedApp: action.appId,
      }
    }

    case 'ANIM_DONE': {
      const win = state.windows[action.appId]
      const phase = win.animPhase as WindowAnimPhase
      if (phase === 'closing') {
        return patchWindow(state, action.appId, {
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          snapZone: null,
          animPhase: 'idle',
          preMaximizeSnapshot: null,
          preSnapSnapshot: null,
        })
      }
      if (phase === 'minimizing') {
        return patchWindow(state, action.appId, {
          isMinimized: true,
          animPhase: 'idle',
        })
      }
      return patchWindow(state, action.appId, { animPhase: 'idle' })
    }

    case 'RESTORE_ALL': {
      let z = state.zCounter
      const newWindows = { ...state.windows }
      for (const id of ALL_APP_IDS) {
        if (newWindows[id].isMinimized) {
          z++
          newWindows[id] = { ...newWindows[id], isMinimized: false, animPhase: 'restoring', zIndex: z }
        }
      }
      return { ...state, windows: newWindows, zCounter: z }
    }

    case 'TILE_WINDOWS': {
      const openIds = ALL_APP_IDS.filter(
        id => state.windows[id].isOpen && !state.windows[id].isMinimized,
      )
      if (openIds.length === 0) return state

      const GAP = 8
      const availW = window.innerWidth
      const availH = window.innerHeight - m.menuBarBottom - m.dockReserved

      const cols = Math.ceil(Math.sqrt(openIds.length))
      const rows = Math.ceil(openIds.length / cols)
      const cellW = Math.floor(availW / cols)
      const cellH = Math.floor(availH / rows)

      const newWindows = { ...state.windows }
      openIds.forEach((id, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        newWindows[id] = {
          ...newWindows[id],
          position: { x: col * cellW + GAP, y: m.menuBarBottom + row * cellH + GAP },
          size: { w: cellW - GAP * 2, h: cellH - GAP * 2 },
          isMaximized: false,
          snapZone: null,
          preMaximizeSnapshot: null,
          preSnapSnapshot: null,
        }
      })
      return { ...state, windows: newWindows }
    }

    case 'CLAMP_ALL': {
      const newWindows = { ...state.windows }
      let changed = false
      for (const id of ALL_APP_IDS) {
        const win = newWindows[id]
        if (!win.isOpen || win.isMinimized || win.isMaximized || win.snapZone) continue
        const cSize = clampSize(win.size, m)
        const cPos = clampPosition(win.position, cSize, m)
        if (
          cSize.w !== win.size.w || cSize.h !== win.size.h ||
          cPos.x  !== win.position.x || cPos.y  !== win.position.y
        ) {
          changed = true
          newWindows[id as AppId] = { ...win, size: cSize, position: cPos }
        }
      }
      return changed ? { ...state, windows: newWindows } : state
    }

    case 'FORCE_MOBILE_FIT': {
      if (!isMobileViewport()) return state
      const newWindows = { ...state.windows }
      let changed = false
      const geo = mobileGeometry(m)
      for (const id of ALL_APP_IDS) {
        const win = newWindows[id]
        if (!win.isOpen || win.isMinimized) continue
        const nextWin: WindowState = {
          ...win,
          isMaximized: true,
          snapZone: 'top',
          position: geo.position,
          size: geo.size,
        }
        if (
          win.isMaximized !== nextWin.isMaximized ||
          win.snapZone !== nextWin.snapZone ||
          win.position.x !== nextWin.position.x ||
          win.position.y !== nextWin.position.y ||
          win.size.w !== nextWin.size.w ||
          win.size.h !== nextWin.size.h
        ) {
          changed = true
          newWindows[id] = nextWin
        }
      }
      return changed ? { ...state, windows: newWindows } : state
    }

    default:
      return state
  }
}

// ─── context ──────────────────────────────────────────────────────────────────

type DesktopContextValue = {
  windows: DesktopState['windows']
  focusedApp: AppId | null
  /** Measured menu bar bottom + dock reserve — for drag/resize hooks. */
  layoutMetrics: LayoutMetrics
  openApp: (appId: AppId) => void
  closeApp: (appId: AppId) => void
  minimizeApp: (appId: AppId) => void
  restoreApp: (appId: AppId) => void
  focusApp: (appId: AppId) => void
  dragApp: (appId: AppId, position: WindowPosition) => void
  resizeApp: (appId: AppId, size: WindowSize, position: WindowPosition) => void
  toggleMaximize: (appId: AppId) => void
  snapApp: (appId: AppId, zone: SnapZone) => void
  applyLayoutPreset: (focusAppId: AppId, assignments: Array<{ appId: AppId; slot: LayoutSlot }>) => void
  animDoneApp: (appId: AppId) => void
  isOpen: (appId: AppId) => boolean
  isMinimized: (appId: AppId) => boolean
  isMaximized: (appId: AppId) => boolean
  /** Restore every minimized window to the foreground. */
  bringAllToFront: () => void
  /** Tile all open windows into a grid. */
  tileWindows: () => void
  /** Whether the dock is currently visible. */
  dockVisible: boolean
  /** Toggle the dock on/off. */
  toggleDock: () => void
  /** Current color scheme. */
  theme: 'dark' | 'light'
  /** Toggle between dark and light mode. */
  toggleTheme: () => void
}

const DesktopContext = createContext<DesktopContextValue | null>(null)

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(desktopReducer, undefined, buildInitialState)
  const [dockVisible, setDockVisible] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
  }, [theme])

  // Measure menu bar + dock, sync CSS vars for maximized windows, then clamp windows.
  useLayoutEffect(() => {
    const update = () => {
      const metrics = measureLayout()
      applyLayoutCssVars(metrics)
      dispatch({ type: 'SET_LAYOUT_METRICS', metrics })
      dispatch({ type: 'CLAMP_ALL' })
      if (isMobileViewport()) {
        dispatch({ type: 'FORCE_MOBILE_FIT' })
      }
    }
    update()
    const mb = document.querySelector('.mac-menubar')
    const dock = document.querySelector('.mac-dock-wrapper')
    const iosDock = document.querySelector('.ios-home-dock-wrap')
    const ro = new ResizeObserver(update)
    if (mb) ro.observe(mb)
    if (dock) ro.observe(dock)
    if (iosDock) ro.observe(iosDock)
    window.addEventListener('resize', update, { passive: true })
    window.visualViewport?.addEventListener('resize', update, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [dockVisible])

  const openApp = useCallback((appId: AppId) => {
    const win = state.windows[appId]
    const metrics = state.layoutMetrics
    const size = win.isOpen ? win.size : clampSize(win.defaultSize, metrics)
    const position = win.isOpen
      ? win.position
      : clampPosition(centeredPosition(size, metrics), size, metrics)
    dispatch({ type: 'OPEN', appId, position, size })
    if (isMobileViewport()) {
      dispatch({ type: 'FORCE_MOBILE_FIT' })
    }
  }, [state.windows, state.layoutMetrics])

  const closeApp = useCallback((appId: AppId) => {
    dispatch({ type: 'CLOSE', appId })
  }, [])

  const minimizeApp = useCallback((appId: AppId) => {
    dispatch({ type: 'MINIMIZE', appId })
  }, [])

  const restoreApp = useCallback((appId: AppId) => {
    dispatch({ type: 'RESTORE', appId })
  }, [])

  const focusApp = useCallback((appId: AppId) => {
    dispatch({ type: 'FOCUS', appId })
  }, [])

  const dragApp = useCallback((appId: AppId, position: WindowPosition) => {
    dispatch({ type: 'DRAG', appId, position })
  }, [])

  const resizeApp = useCallback((appId: AppId, size: WindowSize, position: WindowPosition) => {
    dispatch({ type: 'RESIZE', appId, size, position })
  }, [])

  const toggleMaximize = useCallback((appId: AppId) => {
    dispatch({ type: 'TOGGLE_MAXIMIZE', appId })
  }, [])

  const snapApp = useCallback((appId: AppId, zone: SnapZone) => {
    dispatch({ type: 'SNAP', appId, zone })
  }, [])

  const applyLayoutPreset = useCallback(
    (focusAppId: AppId, assignments: Array<{ appId: AppId; slot: LayoutSlot }>) => {
      dispatch({ type: 'APPLY_LAYOUT_PRESET', focusAppId, assignments })
    },
    [],
  )

  const animDoneApp = useCallback((appId: AppId) => {
    dispatch({ type: 'ANIM_DONE', appId })
  }, [])

  const bringAllToFront = useCallback(() => {
    dispatch({ type: 'RESTORE_ALL' })
  }, [])

  const tileWindows = useCallback(() => {
    dispatch({ type: 'TILE_WINDOWS' })
  }, [])

  const toggleDock = useCallback(() => {
    setDockVisible(v => !v)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const isOpen = useCallback(
    (appId: AppId) => state.windows[appId].isOpen && !state.windows[appId].isMinimized,
    [state.windows],
  )

  const isMinimized = useCallback(
    (appId: AppId) => state.windows[appId].isMinimized,
    [state.windows],
  )

  const isMaximized = useCallback(
    (appId: AppId) => state.windows[appId].isMaximized,
    [state.windows],
  )

  const value = useMemo<DesktopContextValue>(
    () => ({
      windows: state.windows,
      focusedApp: state.focusedApp,
      layoutMetrics: state.layoutMetrics,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      focusApp,
      dragApp,
      resizeApp,
      toggleMaximize,
      snapApp,
      applyLayoutPreset,
      animDoneApp,
      isOpen,
      isMinimized,
      isMaximized,
      bringAllToFront,
      tileWindows,
      dockVisible,
      toggleDock,
      theme,
      toggleTheme,
    }),
    [
      state.windows,
      state.focusedApp,
      state.layoutMetrics,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      focusApp,
      dragApp,
      resizeApp,
      toggleMaximize,
      snapApp,
      applyLayoutPreset,
      animDoneApp,
      isOpen,
      isMinimized,
      isMaximized,
      bringAllToFront,
      tileWindows,
      dockVisible,
      toggleDock,
      theme,
      toggleTheme,
    ],
  )

  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>
}

export function useDesktop(): DesktopContextValue {
  const ctx = useContext(DesktopContext)
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider')
  return ctx
}
