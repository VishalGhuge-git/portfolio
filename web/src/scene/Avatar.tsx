import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Image-to-3D avatar (public/models/avatar.glb). Tunables for fitting the model into the scene:
const URL = `${import.meta.env.BASE_URL}models/avatar.glb`
const SCALE = 2.3 // model is ~1.9 units tall
const OFFSET = new THREE.Vector3(0, -0.43, 0) // moves the model so the face sits near the scene centre
const TURN = 0.3 // how far the head turns toward the cursor (radians)
const TILT = 0.15

// Where sticker rays start (the eye line, centre of the head). Stickers are placed by (theta, phi)
// around this point, and the ray is cast inward so they land on the hair or skin surface.
const HEAD_CENTER = new THREE.Vector3(0, 0.3, 0)

export interface SurfaceFrame {
  position: THREE.Vector3
  normal: THREE.Vector3
}
const SurfaceCtx = createContext<((theta: number, phi: number) => SurfaceFrame | null) | null>(null)
export const useSurface = () => useContext(SurfaceCtx)

export default function Avatar({ children }: { children?: ReactNode }) {
  const gltf = useGLTF(URL)
  const turn = useRef<THREE.Group>(null)
  const model = useMemo(() => {
    const root = gltf.scene.clone(true)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // The export is fully metallic, which renders near-black without an environment map.
      const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial
      mat.metalness = 0
      mat.roughness = 0.75
      mat.metalnessMap = null
      mat.roughnessMap = null
      mat.needsUpdate = true
    })
    root.scale.setScalar(SCALE)
    root.position.copy(OFFSET)
    root.updateMatrixWorld(true)
    return root
  }, [gltf])

  const frameAt = useMemo(() => {
    const meshes: THREE.Mesh[] = []
    model.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh))
    const rc = new THREE.Raycaster()
    return (theta: number, phi: number): SurfaceFrame | null => {
      const dir = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(phi), Math.cos(theta) * Math.cos(phi))
      rc.set(HEAD_CENTER.clone().addScaledVector(dir, 4), dir.clone().negate())
      const hit = rc.intersectObjects(meshes, false)[0]
      if (!hit || !hit.face) return null
      const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
      if (normal.dot(dir) < 0) normal.negate()
      return { position: hit.point.clone(), normal }
    }
  }, [model])

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useFrame((state) => {
    const g = turn.current
    if (!g) return
    const { x, y } = state.pointer
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, x * TURN, 0.06)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -y * TILT, 0.06)
  })

  return (
    <group ref={turn} position={[0, 0, 0]}>
      <primitive object={model} />
      <SurfaceCtx.Provider value={frameAt}>{children}</SurfaceCtx.Provider>
    </group>
  )
}

useGLTF.preload(URL)
