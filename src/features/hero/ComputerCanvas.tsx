import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Center } from '@react-three/drei'
import * as THREE from 'three'
import { ComputerModel } from './ComputerModel'

const HERO_MODEL_PIVOT = new THREE.Vector3(0, 0, 0)

function SpinningComputer() {
  const groupRef = useRef<THREE.Group>(null)
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useFrame((_state, delta) => {
    if (!prefersReducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} position={HERO_MODEL_PIVOT.toArray() as [number, number, number]}>
      <Center>
        <ComputerModel rotation={[0.06, Math.PI / 10, 0]} />
      </Center>
    </group>
  )
}

export function ComputerCanvas() {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[380px] lg:min-h-[min(58vh,640px)]">
      <Canvas
        camera={{ position: [0, 0.35, 7.2], fov: 40, near: 0.05, far: 100 }}
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
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
            <SpinningComputer />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  )
}
