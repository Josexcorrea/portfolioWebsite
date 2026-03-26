import { Suspense, useEffect, useRef, type ElementRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Center } from '@react-three/drei'
import * as THREE from 'three'
import { ComputerModel } from './ComputerModel'

/** Model center in world space (right column). */
const HERO_MODEL_PIVOT = new THREE.Vector3(0.45, 0.32, 0)

/** Same as SkillsDome: drag orbits *around the computer*, not empty space off to the side. */
function GlobeStyleOrbitControls() {
  const ref = useRef<ElementRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const ctrl = ref.current
    if (!ctrl) return
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    const pivot = HERO_MODEL_PIVOT.clone()
    // Preserve original viewing angle (from when target was near origin) but pivot on the model
    const legacyTarget = new THREE.Vector3(0, -0.1, 0)
    const defaultCam = new THREE.Vector3(2.3, 1.65, 3.55)
    const dir = defaultCam.clone().sub(legacyTarget).normalize()
    const baseDist = defaultCam.distanceTo(legacyTarget)
    // Lower = camera closer = larger on screen (tweak 0.82–1.0)
    const dist = baseDist * 0.9
    camera.position.copy(pivot).addScaledVector(dir, dist)
    camera.lookAt(pivot)
    camera.updateProjectionMatrix()
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
  }, [camera])

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
        camera={{ position: [2.3, 1.65, 3.55], fov: 36, near: 0.05, far: 100 }}
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
