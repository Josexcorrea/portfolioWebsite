import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

type ModelProps = React.ComponentPropsWithoutRef<'group'>

export function ComputerModel(props: ModelProps) {
  const root = useRef<THREE.Group | null>(null)
  const { scene } = useGLTF('/computerModel.glb')

  useLayoutEffect(() => {
    if (!root.current) return
    // Compute bounds of the loaded GLB
    const box = new THREE.Box3().setFromObject(root.current)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    // Recenter the model around origin (0,0,0)
    root.current.position.sub(center)

    // Large hero presence; Bounds margin in ComputerCanvas frames the full rig.
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      const target = 6
      const s = target / maxDim
      root.current.scale.setScalar(s)
    }
  }, [])

  return (
    <group {...props} dispose={null}>
      {/* Render full GLTF scene so all sub-meshes (monitor, keyboard, mouse, etc.) appear */}
      <group ref={root}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload('/computerModel.glb')

