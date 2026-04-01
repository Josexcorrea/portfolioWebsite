import { Suspense, useEffect, useRef, type ElementRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Center } from '@react-three/drei'
import * as THREE from 'three'
import { ComputerModel } from './ComputerModel'

/** Model center in world space (right column). */
const HERO_MODEL_PIVOT = new THREE.Vector3(0.45, 0.32, 0)

/**
 * Framing tuned for a ~1.5–1.8 aspect desktop hero column; narrow/tall canvases need more distance + wider FOV.
 * Returns distance multiplier (relative to base) and vertical FOV in degrees.
 */
function heroFramingForAspect(canvasAspect: number): { distMult: number; fov: number } {
  const a = THREE.MathUtils.clamp(canvasAspect, 0.35, 4)
  // Portrait-ish / stacked mobile: a < ~1.2 → pull back and widen FOV
  const narrow = Math.max(0, 1.25 - a)
  // Ultrawide hero column: a > ~2 → slightly closer so the rig doesn’t look tiny
  const wide = Math.max(0, a - 1.85)

  const distMult = THREE.MathUtils.clamp(1 + narrow * 0.52 - wide * 0.1, 0.92, 1.58)
  const fov = THREE.MathUtils.clamp(40 + narrow * 11 - Math.min(wide * 4, 5), 36, 54)

  return { distMult, fov }
}

/** Same as SkillsDome: drag orbits *around the computer*, not empty space off to the side. */
function GlobeStyleOrbitControls() {
  const ref = useRef<ElementRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  useEffect(() => {
    /* Three.js mutates camera and controls in place; R3F exposes the same instances. */
    /* eslint-disable react-hooks/immutability */
    const ctrl = ref.current
    if (!ctrl) return
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    if (width < 16 || height < 16) return

    const pivot = HERO_MODEL_PIVOT.clone()
    const legacyTarget = new THREE.Vector3(0, -0.1, 0)
    const defaultCam = new THREE.Vector3(2.3, 1.65, 3.55)
    const dir = defaultCam.clone().sub(legacyTarget).normalize()
    const baseDist = defaultCam.distanceTo(legacyTarget)
    const canvasAspect = width / height
    const { distMult, fov } = heroFramingForAspect(canvasAspect)
    const dist = baseDist * 1.12 * distMult

    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      persp.fov = fov
      persp.aspect = canvasAspect
      persp.updateProjectionMatrix()
    }

    camera.position.copy(pivot).addScaledVector(dir, dist)
    camera.lookAt(pivot)
    ctrl.target.copy(pivot)
    ctrl.minDistance = dist
    ctrl.maxDistance = dist
    ctrl.update()
    if ('mouseButtons' in ctrl) {
      ctrl.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }
    }
    if ('touches' in ctrl) {
      ctrl.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }
    }

    // Auto-orbit: pause while the user interacts, resume shortly after.
    // OrbitControls emits 'start'/'end' events when interaction begins/ends.
    if (!prefersReducedMotion) {
      ctrl.autoRotate = true
      ctrl.autoRotateSpeed = 0.35
    }

    let resumeTimer: number | null = null
    const onStart = () => {
      if (prefersReducedMotion) return
      ctrl.autoRotate = false
      if (resumeTimer !== null) window.clearTimeout(resumeTimer)
      resumeTimer = null
    }
    const onEnd = () => {
      if (prefersReducedMotion) return
      if (resumeTimer !== null) window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        ctrl.autoRotate = true
      }, 1200)
    }
    ctrl.addEventListener('start', onStart)
    ctrl.addEventListener('end', onEnd)

    return () => {
      if (resumeTimer !== null) window.clearTimeout(resumeTimer)
      ctrl.removeEventListener('start', onStart)
      ctrl.removeEventListener('end', onEnd)
    }
    /* eslint-enable react-hooks/immutability */
  }, [camera, width, height])

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableRotate
      rotateSpeed={0.85}
      maxPolarAngle={Math.PI * 0.88}
      minPolarAngle={0.15}
      enableDamping
      dampingFactor={0.06}
    />
  )
}

export function ComputerCanvas() {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[380px] lg:min-h-[min(58vh,640px)]">
      <Canvas
        camera={{ position: [2.3, 1.65, 3.55], fov: 40, near: 0.05, far: 100 }}
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          touchAction: 'none',
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            intensity={1.3}
            position={[4, 5, 3]}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Environment preset="city" />

          <Float
            speed={0.95}
            rotationIntensity={0.14}
            floatIntensity={0.16}
            floatingRange={[-0.015, 0.05]}
          >
            {/* Offset the entire centered model to a bit more right */}
            <group position={HERO_MODEL_PIVOT.toArray() as [number, number, number]}>
              <Center>
                <ComputerModel rotation={[0.06, Math.PI / 10, 0]} />
              </Center>
            </group>
          </Float>

          <GlobeStyleOrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
