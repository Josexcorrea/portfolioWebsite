import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SkillBranch } from '@/types'
import { MeteorField } from './MeteorField'

const METEOR_BASE_INTERVAL = 2.2
const METEOR_BASE_MAX = 6
const DESKTOP_BREAKPOINT_PX = 768

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`)
    const set = () => setIsDesktop(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return isDesktop
}

/* Map CSS variable names to hex for Three.js */
const BRANCH_COLORS: Record<string, string> = {
  'var(--skill)': '#6dd4a8',
  'var(--project)': '#7ec8e8',
  'var(--experience)': '#e87a6e',
}

function branchColorToHex(cssColor: string): string {
  return BRANCH_COLORS[cssColor] ?? '#7eb8d4'
}

/* Official brand colors per SimpleIcons (icon slug -> hex) */
const BRAND_COLORS: Record<string, string> = {
  react: '#61DAFB',
  nextdotjs: '#000000',
  tailwindcss: '#06B6D4',
  figma: '#F24E1E',
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  html5: '#E34F26',
  nodedotjs: '#339933',
  express: '#000000',
  fastapi: '#009688',
  flask: '#000000',
  mongodb: '#47A248',
  firebase: '#FFCA28',
  postgresql: '#4169E1',
  python: '#3776AB',
  pytorch: '#EE4C2C',
  tensorflow: '#FF6F00',
  scikitlearn: '#F89939',
  numpy: '#013243',
  pandas: '#150458',
  keras: '#D00000',
}

const THEME_ACCENT = '#4F8CFF'
const WIREFRAME_RADIUS = 1.4
const SECONDS_PER_DAY = 86400
const GLOBE_ROTATION_SPEED = 0.12 // rad/s – visible spin on top of time-sync

type FlatNode = {
  name: string
  position: [number, number, number]
  color: string
  icon: string | undefined
  description: string
  branchName: string
}

/**
 * Fibonacci sphere: evenly spaced points on a sphere (equal spacing, full coverage).
 * phi = inclination, theta = azimuth.
 */
function useSkillNodes(branches: SkillBranch[]) {
  return useMemo(() => {
    const nodes: FlatNode[] = []
    branches.forEach((branch) => {
      const hex = branchColorToHex(branch.color)
      branch.skills.forEach((skill) => {
        nodes.push({
          name: skill.name,
          position: [0, 0, 0],
          color: hex,
          icon: skill.icon,
          description: skill.description,
          branchName: branch.name,
        })
      })
    })
    const n = nodes.length
    const r = WIREFRAME_RADIUS
    const goldenAngle = Math.PI * 2 * (1 - 1 / ((1 + Math.sqrt(5)) / 2))
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
      const theta = goldenAngle * i
      nodes[i].position = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]
    }
    return { nodes }
  }, [branches])
}

function WireframeSphere({ color }: { color: string }) {
  const wireframe = useMemo(() => {
    const g = new THREE.SphereGeometry(WIREFRAME_RADIUS, 24, 24)
    return new THREE.WireframeGeometry(g)
  }, [])
  return (
    <lineSegments geometry={wireframe} onPointerDown={() => {}}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

const REF_DISTANCE = 5.2

function SkillNode({
  position,
  color,
  name,
  icon,
  branchName,
  description,
  visible,
}: {
  position: [number, number, number]
  color: string
  name: string
  icon: string | undefined
  branchName: string
  description: string
  visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [iconError, setIconError] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const iconColor = icon ? (BRAND_COLORS[icon] ?? color) : null
  const iconHex = iconColor ? iconColor.replace('#', '') : ''
  const iconUrl = icon && !iconError ? `https://cdn.simpleicons.org/${icon}/${iconHex}` : null

  useFrame((state) => {
    if (!groupRef.current) return
    const cam = state.camera.position
    const dist = Math.hypot(position[0] - cam.x, position[1] - cam.y, position[2] - cam.z)
    const scale = visible ? REF_DISTANCE / dist : 0
    groupRef.current.scale.setScalar(scale)
  })

  if (!visible) return <group ref={groupRef} position={position} />
  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        distanceFactor={4}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: iconUrl || icon ? '8px 10px' : '6px 10px',
            minWidth: 72,
            maxWidth: 160,
            width: 'max-content',
            boxSizing: 'border-box',
            background: '#121A2B',
            borderRadius: 12,
            border: `1px solid ${color}50`,
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {hovered && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%) translateY(-8px)',
                padding: '8px 10px',
                minWidth: 140,
                maxWidth: 200,
                background: '#121A2B',
                borderRadius: 10,
                border: '1px solid #24324D',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: color,
                  marginBottom: 4,
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                {branchName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: '#EAF2FF',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {description}
              </div>
            </div>
          )}
          {(iconUrl || icon) && (
            iconUrl ? (
              <img
                src={iconUrl}
                alt=""
                width={28}
                height={28}
                style={{ display: 'block', flexShrink: 0 }}
                onError={() => setIconError(true)}
              />
            ) : (
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  background: `${color}30`,
                  color,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Rajdhani, sans-serif',
                  flexShrink: 0,
                }}
              >
                {name.charAt(0)}
              </span>
            )
          )}
          <span
            style={{
              color: '#EAF2FF',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'Rajdhani, sans-serif',
              lineHeight: 1.25,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              display: 'block',
            }}
          >
            {name}
          </span>
        </div>
      </Html>
    </group>
  )
}

function DomeContent({
  branches,
  wireframeColor,
  rightClickOnlyRotate = false,
}: {
  branches: SkillBranch[]
  wireframeColor: string
  /** When true, only right-click rotates (left click free for meteor game). */
  rightClickOnlyRotate?: boolean
}) {
  const { nodes } = useSkillNodes(branches)
  const [visible, setVisible] = useState<boolean[]>(() => nodes.map(() => true))
  const prevRef = useRef<string>('')
  const globeRef = useRef<THREE.Group>(null)
  const camLocalRef = useRef(new THREE.Vector3())
  const invMatrixRef = useRef(new THREE.Matrix4())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- drei OrbitControls ref type
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    const controls = controlsRef.current as { mouseButtons?: Record<string, number | null> } | null
    if (!controls || !('mouseButtons' in controls)) return
    if (rightClickOnlyRotate) {
      controls.mouseButtons = {
        LEFT: null,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }
    } else {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }
    }
  }, [rightClickOnlyRotate])

  useFrame((state) => {
    if (globeRef.current) {
      const d = new Date()
      const secondsSinceMidnight =
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000
      const timeAngle = (secondsSinceMidnight / SECONDS_PER_DAY) * Math.PI * 2
      globeRef.current.rotation.y = timeAngle + state.clock.elapsedTime * GLOBE_ROTATION_SPEED

      invMatrixRef.current.copy(globeRef.current.matrixWorld).invert()
      camLocalRef.current.copy(state.camera.position).applyMatrix4(invMatrixRef.current)
    }
    const camLocal = camLocalRef.current
    const newVisible = nodes.map((node) => {
      const dot =
        node.position[0] * camLocal.x +
        node.position[1] * camLocal.y +
        node.position[2] * camLocal.z
      return dot > 0
    })
    const key = newVisible.join(',')
    if (key !== prevRef.current) {
      prevRef.current = key
      setVisible(newVisible)
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={1.2} />
      <pointLight position={[-5, 4, -5]} intensity={0.4} color={THEME_ACCENT} />
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minDistance={5.2}
        maxDistance={5.2}
        maxPolarAngle={Math.PI * 0.85}
      />
      <group ref={globeRef}>
        <WireframeSphere color={wireframeColor} />
        {nodes.map((node, i) => (
          <SkillNode
            key={node.name}
            position={node.position}
            color={node.color}
            name={node.name}
            icon={node.icon}
            branchName={node.branchName}
            description={node.description}
            visible={visible[i] ?? true}
          />
        ))}
      </group>
    </>
  )
}

type SkillsDomeProps = {
  branches: SkillBranch[]
  wireframeColor: string
  /** True when Skills section is the active (in-view) section. Space only starts game when true. */
  isSectionActive?: boolean
  /** Called when user starts the game (e.g. first Space in this section). */
  onGameStart?: () => void
  /** Called when game resets to default (e.g. after game over). */
  onGameOver?: () => void
}

export function SkillsDome({
  branches,
  wireframeColor,
  isSectionActive = false,
  onGameStart,
  onGameOver,
}: SkillsDomeProps) {
  const isDesktop = useIsDesktop()
  const [gameStarted, setGameStarted] = useState(false)
  const [meteorScore, setMeteorScore] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [wave, setWave] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (!isSectionActive) return
      e.preventDefault()
      setGameStarted((started) => {
        if (started) return started
        onGameStart?.()
        return true
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSectionActive, onGameStart])

  const handleMeteorHit = useCallback(() => {
    setMeteorScore((s) => s + 1)
  }, [])

  const handleGlobeHit = useCallback(() => {
    setGameOver(true)
  }, [])

  const handleWaveCleared = useCallback(() => {
    setWave((w) => w + 1)
  }, [])

  const resetToGlobe = useCallback(() => {
    setGameOver(false)
    setGameStarted(false)
    setMeteorScore(0)
    setTotalClicks(0)
    setWave(0)
    onGameOver?.()
  }, [onGameOver])

  // When game over: keyboard only (not mouse) returns to normal globe
  useEffect(() => {
    if (!gameOver) return
    const onKeyDown = (e: KeyboardEvent) => {
      resetToGlobe()
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameOver, resetToGlobe])

  const spawnIntervalSec = METEOR_BASE_INTERVAL / Math.pow(2, wave)
  const speedMultiplier = 1 + wave * 0.4
  const maxMeteors = Math.min(METEOR_BASE_MAX + wave * 2, 18)

  const handleCanvasClick = useCallback(() => {
    if (gameStarted && !gameOver) setTotalClicks((c) => c + 1)
  }, [gameStarted, gameOver])

  return (
    <div
      className="relative z-[1] flex-1 min-h-[80vh] w-full self-stretch"
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
        className="!absolute !inset-0 !w-full !h-full block"
      >
        <DomeContent
          branches={branches}
          wireframeColor={wireframeColor}
          rightClickOnlyRotate={gameStarted}
        />
        {isDesktop && gameStarted && (
          <MeteorField
            onMeteorHit={handleMeteorHit}
            onGlobeHit={handleGlobeHit}
            onWaveCleared={handleWaveCleared}
            maxMeteors={maxMeteors}
            spawnIntervalSec={spawnIntervalSec}
            speedMultiplier={speedMultiplier}
            gameOver={gameOver}
          />
        )}
      </Canvas>
      {isDesktop && !gameStarted && (
        <p
          className="absolute top-3 right-3 m-0 text-sm text-text-muted pointer-events-none"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          aria-live="polite"
        >
          Press Space to start · Click meteors · Right click + drag to rotate
        </p>
      )}
      {isDesktop && gameStarted && (
        <>
          <div
            className="absolute top-3 right-3 m-0 flex flex-col gap-1.5 text-right pointer-events-none"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            aria-live="polite"
          >
            <p className="m-0 text-sm text-text-pri tabular-nums">
              Meteors: {meteorScore} · Wave {wave + 1}
            </p>
            <div className="m-0 text-[0.65rem] sm:text-xs text-text-sec tracking-wide max-w-[200px] sm:max-w-none flex flex-col gap-0.5 text-right">
              <span className="hidden sm:block">Left click to destroy meteors</span>
              <span className="block sm:hidden">Tap to destroy meteors</span>
              <span className="hidden sm:block">Right click + drag to rotate globe</span>
              <span className="block sm:hidden">Drag to rotate globe</span>
            </div>
          </div>
          {gameOver && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-bg-base/90"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
              aria-live="polite"
            >
              <p className="m-0 text-[2.5rem] sm:text-5xl font-black tracking-[0.25em] text-text-pri uppercase">
                GAME OVER!
              </p>
              <p className="m-0 text-lg text-text-pri tabular-nums font-semibold">
                {meteorScore} / {totalClicks}
              </p>
              <p className="m-0 text-xs text-text-muted tracking-wider">hits / clicks</p>
              <p className="m-0 text-sm text-text-muted">Press any key to return to globe</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
