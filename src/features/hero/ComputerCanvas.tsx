import { Suspense, useEffect, useRef, type ElementRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Center } from '@react-three/drei'
import * as THREE from 'three'
import { ComputerModel } from './ComputerModel'

/** Model center in world space (right column). */
const HERO_MODEL_PIVOT = new THREE.Vector3(0.45, 0.32, 0)

/**
 * Framing tuned for a ~1.5–1.8 aspect desktop hero column.
 * Narrow/tall: pull back + wider FOV. Wide: pull back (was incorrectly moving camera in = too zoomed on big hero columns).
 */
function heroFramingForAspect(canvasAspect: number): { distMult: number; fov: number } {
  const a = THREE.MathUtils.clamp(canvasAspect, 0.35, 4)
  const narrow = Math.max(0, 1.25 - a)
  const wide = Math.max(0, a - 1.85)

  const distMult = THREE.MathUtils.clamp(1 + narrow * 0.52 + wide * 0.16, 0.95, 1.75)
  const fov = THREE.MathUtils.clamp(40 + narrow * 11 - Math.min(wide * 2, 3), 36, 54)

  return { distMult, fov }
}

/** Same as SkillsDome: drag orbits *around the computer*, not empty space off to the side. */
function GlobeStyleOrbitControls() {
  const ref = useRef<ElementRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  useEffect(() => {
    const ctrl = ref.current
    if (!ctrl) return
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    let cancelled = false
    let rafId = 0
    let resumeTimer: number | null = null

    const applyFraming = (w: number, h: number) => {
      if (w < 16 || h < 16) return false
      const pivot = HERO_MODEL_PIVOT.clone()
      const legacyTarget = new THREE.Vector3(0, -0.1, 0)
      const defaultCam = new THREE.Vector3(2.3, 1.65, 3.55)
      const dir = defaultCam.clone().sub(legacyTarget).normalize()
      const baseDist = defaultCam.distanceTo(legacyTarget)
      const canvasAspect = w / h
      const { distMult, fov } = heroFramingForAspect(canvasAspect)
      const dist = baseDist * 1.2 * distMult

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

      if (!prefersReducedMotion) {
        ctrl.autoRotate = true
        ctrl.autoRotateSpeed = 0.35
      }
      return true
    }

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

    const run = () => {
      if (cancelled) return
      const domW = gl.domElement.clientWidth
      const domH = gl.domElement.clientHeight
      const w = Math.max(width, domW)
      const h = Math.max(height, domH)
      if (applyFraming(w, h)) {
        ctrl.addEventListener('start', onStart)
        ctrl.addEventListener('end', onEnd)
        return
      }
      rafId = window.requestAnimationFrame(() => {
        if (cancelled) return
        const w2 = gl.domElement.clientWidth
        const h2 = gl.domElement.clientHeight
        if (applyFraming(w2, h2)) {
          ctrl.addEventListener('start', onStart)
          ctrl.addEventListener('end', onEnd)
        }
      })
    }

    run()

    return () => {
      cancelled = true
      if (rafId) window.cancelAnimationFrame(rafId)
      if (resumeTimer !== null) window.clearTimeout(resumeTimer)
      ctrl.removeEventListener('start', onStart)
      ctrl.removeEventListener('end', onEnd)
    }
  }, [camera, gl, width, height])

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
