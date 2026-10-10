import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useStore } from '../store'
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
  mesh?: THREE.Mesh // the hit mesh (in the avatar's own space), so stickers can be projected onto it as decals
}
interface Surface {
  angles: (theta: number, phi: number) => SurfaceFrame | null // around the head centre
  front: (x: number, y: number) => SurfaceFrame | null // straight in from the front, for the chest
  back: (x: number, y: number) => SurfaceFrame | null // straight in from behind, for the back of the hoodie
}
const SurfaceCtx = createContext<Surface | null>(null)
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

  const surface = useMemo<Surface>(() => {
    // Raycast against a detached copy, so hits are in the avatar's own space (the same space the
    // stickers live in) whatever the head turn is at the moment the stickers mount.
    const probe = model.clone(true)
    probe.updateMatrixWorld(true)
    const meshes: THREE.Mesh[] = []
    probe.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh))
    const rc = new THREE.Raycaster()
    const hitOne = (origin: THREE.Vector3, dir: THREE.Vector3) => {
      rc.set(origin, dir)
      const hit = rc.intersectObjects(meshes, false)[0]
      if (!hit || !hit.face) return null
      const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
      if (normal.dot(dir) > 0) normal.negate() // face the ray origin
      return { point: hit.point, normal, mesh: hit.object as THREE.Mesh }
    }
    // One triangle's normal is noisy on a scanned-style mesh, so average a small ring of hits
    const cast = (origin: THREE.Vector3, dir: THREE.Vector3): SurfaceFrame | null => {
      const c = hitOne(origin, dir)
      if (!c) return null
      const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize()
      const up = new THREE.Vector3().crossVectors(side, dir).normalize()
      const n = c.normal.clone()
      for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]]) {
        const h = hitOne(origin.clone().addScaledVector(side, u * 0.06).addScaledVector(up, v * 0.06), dir)
        if (h) n.add(h.normal)
      }
      return { position: c.point.clone(), normal: n.normalize(), mesh: c.mesh }
    }
    return {
      angles: (theta, phi) => {
        const dir = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(phi), Math.cos(theta) * Math.cos(phi))
        return cast(HEAD_CENTER.clone().addScaledVector(dir, 4), dir.clone().negate())
      },
      front: (x, y) => cast(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1)),
      back: (x, y) => cast(new THREE.Vector3(x, y, -5), new THREE.Vector3(0, 0, 1)),
    }
  }, [model])

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useFrame((state) => {
    const g = turn.current
    if (!g) return
    const { x, y } = state.pointer
    // Scrolling to the SDA Bocconi entry turns him round to show the logo on the back of the hoodie
    const showBack = useStore.getState().focus === 'bocconi' && window.scrollY > window.innerHeight * 0.7
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, (showBack ? Math.PI : 0) + x * TURN * (showBack ? -1 : 1), 0.06)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -y * TILT, 0.06)
  })

  return (
    <group ref={turn} position={[0, 0, 0]}>
      <primitive object={model} />
      <SurfaceCtx.Provider value={surface}>{children}</SurfaceCtx.Provider>
    </group>
  )
}

useGLTF.preload(URL)
