import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Full-body suited avatar (public/models/suit.glb, Meshy). Feet stand on y = 0, centred on x/z.
const URL = `${import.meta.env.BASE_URL}models/suit.glb`
export const HEIGHT = 4.2 // world height of the avatar
const TURN = 0.22 // how far the body turns toward the cursor (radians)

export interface SurfaceFrame {
  position: THREE.Vector3
  normal: THREE.Vector3
}
interface Surface {
  front: (x: number, y: number) => SurfaceFrame | null // straight in from the front (lapel pins)
}
const SurfaceCtx = createContext<Surface | null>(null)
export const useSurface = () => useContext(SurfaceCtx)

// Fine diagonal suit weave, drawn in the shader so it stays crisp at any zoom and fades with distance.
function weave(mat: THREE.MeshStandardMaterial, nativeHeight: number) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uK = { value: (2 * Math.PI) / (0.0025 * nativeHeight) }
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = transformed;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nuniform float uK;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
      { vec3 dc = diffuseColor.rgb;
        float suit = step(dc.r + 0.02, dc.b) * (1.0 - smoothstep(0.10, 0.22, dot(dc, vec3(0.3,0.5,0.2))));
        float f = (vObj.x + vObj.y + vObj.z * 0.5) * uK; float aa = clamp(1.0 - fwidth(f) * 0.35, 0.0, 1.0);
        float w = cos(f) * 0.5 + 0.5 * cos((vObj.x - vObj.y) * uK * 0.5);
        normal = normalize(normal + suit * aa * 0.09 * w * normalize(vec3(1.0, 1.0, 0.0))); }`
      )
  }
  mat.needsUpdate = true
}

export default function Avatar({ children }: { children?: ReactNode }) {
  const gltf = useGLTF(URL)
  const turn = useRef<THREE.Group>(null)
  const model = useMemo(() => {
    const root = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial
      mat.metalness = 0
      mat.roughness = 0.82
      weave(mat, size.y)
    })
    const k = HEIGHT / size.y
    root.scale.setScalar(k)
    root.position.set(-center.x * k, -box.min.y * k, -center.z * k)
    root.updateMatrixWorld(true)
    return root
  }, [gltf])

  const surface = useMemo<Surface>(() => {
    const meshes: THREE.Mesh[] = []
    model.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh))
    const rc = new THREE.Raycaster()
    return {
      front: (x, y) => {
        rc.set(new THREE.Vector3(x, y, 6), new THREE.Vector3(0, 0, -1))
        const hit = rc.intersectObjects(meshes, false)[0]
        if (!hit || !hit.face) return null
        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
        if (normal.z < 0) normal.negate()
        return { position: hit.point.clone(), normal }
      },
    }
  }, [model])

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useFrame((state, delta) => {
    const g = turn.current
    if (!g) return
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * TURN, 3.6, Math.min(delta, 0.1))
  })

  return (
    <group ref={turn}>
      <primitive object={model} />
      <SurfaceCtx.Provider value={surface}>{children}</SurfaceCtx.Provider>
    </group>
  )
}

useGLTF.preload(URL)
