import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type MeteorData = {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  spawnTime: number
}

const BASE_MAX_METEORS = 6
const BASE_SPAWN_INTERVAL_SEC = 2.2
const BASE_METEOR_SPEED = 0.45
/** Spawn on a sphere around the globe so meteors attack from random angles toward center. */
const SPAWN_RADIUS = 5.5
const CULL_DIST = 12
/** Match SkillsDome WIREFRAME_RADIUS. Game ends when a meteor reaches the globe. */
const GLOBE_RADIUS = 1.4

/** Single meteor: one white mesh. */
function MeteorMesh({
  meteorRef,
  index,
  onHit,
}: {
  meteorRef: React.MutableRefObject<MeteorData[]>
  index: number
  onHit: (id: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const m = meteorRef.current[index]
  const id = m?.id ?? -1

  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.1, 0.4, 8)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        toneMapped: false,
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const list = meteorRef.current
    const meteor = list[index]
    if (!meteor) return
    groupRef.current.position.copy(meteor.position)
    groupRef.current.lookAt(state.camera.position)
  })

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        material={material}
        onPointerDown={(e) => {
          e.stopPropagation()
          onHit(id)
        }}
      />
    </group>
  )
}

type MeteorFieldProps = {
  onMeteorHit?: () => void
  onGlobeHit?: () => void
  onWaveCleared?: () => void
  maxMeteors?: number
  spawnIntervalSec?: number
  speedMultiplier?: number
  gameOver?: boolean
}

export function MeteorField({
  onMeteorHit,
  onGlobeHit,
  onWaveCleared,
  maxMeteors = BASE_MAX_METEORS,
  spawnIntervalSec = BASE_SPAWN_INTERVAL_SEC,
  speedMultiplier = 1,
  gameOver = false,
}: MeteorFieldProps) {
  const meteorsRef = useRef<MeteorData[]>([])
  const nextIdRef = useRef(0)
  const spawnAccRef = useRef(spawnIntervalSec * 0.5)
  const gameOverPrevRef = useRef(false)
  const [renderCount, setRenderCount] = useState(0)

  const removeMeteor = useCallback(
    (id: number) => {
      const list = meteorsRef.current.filter((m) => m.id !== id)
      meteorsRef.current = list
      setRenderCount(list.length)
      onMeteorHit?.()
      if (list.length === 0) onWaveCleared?.()
    },
    [onMeteorHit, onWaveCleared]
  )

  useFrame((state, delta) => {
    if (gameOver) {
      if (!gameOverPrevRef.current) {
        gameOverPrevRef.current = true
        meteorsRef.current = []
        setRenderCount(0)
      }
      return
    }
    gameOverPrevRef.current = false
    const t = state.clock.elapsedTime
    const list = meteorsRef.current

    spawnAccRef.current += delta
    while (spawnAccRef.current >= spawnIntervalSec && list.length < maxMeteors) {
      spawnAccRef.current -= spawnIntervalSec
      // Random point on sphere: meteors attack the globe from random angles
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = SPAWN_RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = SPAWN_RADIUS * Math.sin(phi) * Math.sin(theta)
      const z = SPAWN_RADIUS * Math.cos(phi)
      const pos = new THREE.Vector3(x, y, z)
      const speed = BASE_METEOR_SPEED * speedMultiplier * (0.85 + Math.random() * 0.3)
      const vel = pos.clone().negate().normalize().multiplyScalar(speed)
      meteorsRef.current.push({
        id: nextIdRef.current++,
        position: pos,
        velocity: vel,
        spawnTime: t,
      })
      setRenderCount(meteorsRef.current.length)
    }

    list.forEach((m) => m.position.addScaledVector(m.velocity, delta))

    const before = list.length
    let globeHit = false
    meteorsRef.current = list.filter((m) => {
      const dist = m.position.length()
      if (dist <= GLOBE_RADIUS) {
        globeHit = true
        return false
      }
      return dist < CULL_DIST
    })
    if (globeHit) onGlobeHit?.()
    if (meteorsRef.current.length !== before) setRenderCount(meteorsRef.current.length)
  })

  return (
    <group>
      {Array.from({ length: renderCount }, (_, i) => meteorsRef.current[i])
        .filter((m): m is MeteorData => m != null)
        .map((m, i) => (
          <MeteorMesh key={m.id} meteorRef={meteorsRef} index={i} onHit={removeMeteor} />
        ))}
    </group>
  )
}
