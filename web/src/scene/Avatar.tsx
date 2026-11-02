import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Full-body suited avatar (public/models/suit.glb, Meshy). Feet stand on y = 0, centred on x/z.
const URL = `${import.meta.env.BASE_URL}models/suit.glb`
export const HEIGHT = 4.2 // world height of the avatar
const TURN = 0.22 // how far the body turns toward the cursor (radians)

// Glow on the suit: a warm gold edge light (rim) plus a soft cool sheen. Suit fabric only, not skin or hair.
const GLOW = { color: new THREE.Color('#ffc58a'), dark: 1.0, light: 0.5 } // light mode: half strength, so it stays subtle
const glowK = { value: GLOW.dark } // shared by the shader; eased between dark and light in useFrame
const CURSOR_LIGHT = { color: '#ffd2a1', intensity: 7, dark: 1, light: 0.55 } // warm light that follows the cursor (desktop only)

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
    sh.uniforms.uGlow = { value: GLOW.color }
    sh.uniforms.uGlowK = glowK
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = transformed;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nuniform float uK;\nuniform vec3 uGlow;\nuniform float uGlowK;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
      { vec3 dc = diffuseColor.rgb;
        float suit = step(dc.r + 0.02, dc.b) * (1.0 - smoothstep(0.10, 0.22, dot(dc, vec3(0.3,0.5,0.2))));
        float f = (vObj.x + vObj.y + vObj.z * 0.5) * uK; float aa = clamp(1.0 - fwidth(f) * 0.35, 0.0, 1.0);
        float w = cos(f) * 0.5 + 0.5 * cos((vObj.x - vObj.y) * uK * 0.5);
        normal = normalize(normal + suit * aa * 0.09 * w * normalize(vec3(1.0, 1.0, 0.0))); }`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
      { vec3 vd = normalize(vViewPosition);
        float fr = 1.0 - clamp(dot(normal, vd), 0.0, 1.0);
        vec3 dc0 = diffuseColor.rgb;
        float suitM = step(dc0.r + 0.02, dc0.b) * (1.0 - smoothstep(0.10, 0.22, dot(dc0, vec3(0.3,0.5,0.2))));
        totalEmissiveRadiance += uGlow * pow(fr, 3.2) * 1.1 * suitM * uGlowK;
        totalEmissiveRadiance += vec3(0.55, 0.6, 0.75) * pow(fr, 2.0) * 0.07 * suitM * uGlowK; }`
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
      mat.roughness = 0.9 // a little softer fabric
      m.geometry = smoothNormals(m.geometry) // smooth shading hides the faceted patches of the low-poly mesh
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

  const lamp = useRef<THREE.PointLight>(null)
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const light = document.documentElement.dataset.theme === 'light'
    glowK.value = THREE.MathUtils.damp(glowK.value, light ? GLOW.light : GLOW.dark, 4, dt)
    const g = turn.current
    if (!g) return
    // no turning (or cursor light) on phones: there is no hover, and a tap would make the body swing toward the button
    const phone = state.size.width / state.size.height < 1.05
    if (lamp.current) {
      const l = lamp.current
      const tx = phone ? 0 : state.pointer.x * 2.6
      const ty = HEIGHT * 0.62 + (phone ? 0 : state.pointer.y * 1.8)
      l.position.x = THREE.MathUtils.damp(l.position.x, tx, 4, dt)
      l.position.y = THREE.MathUtils.damp(l.position.y, ty, 4, dt)
      l.intensity = phone ? 0 : CURSOR_LIGHT.intensity * (light ? CURSOR_LIGHT.light : CURSOR_LIGHT.dark)
    }
    const aim = phone ? 0 : state.pointer.x
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, aim * TURN, 3.6, Math.min(delta, 0.1))
  })

  return (
    <group ref={turn}>
      <pointLight ref={lamp} color={CURSOR_LIGHT.color} intensity={0} distance={9} decay={2} position={[0, HEIGHT * 0.62, 2.4]} />
      <primitive object={model} />
      <SurfaceCtx.Provider value={surface}>{children}</SurfaceCtx.Provider>
    </group>
  )
}

useGLTF.preload(URL)

// Area-weighted normals shared between vertices at the same position, so UV seams and faceted patches shade
// smoothly. Works on a copy; the loaded mesh is left untouched.
function smoothNormals(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = src.clone()
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const idx = g.index
  const n = pos.count
  const key = (i: number) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`
  const keys = new Array<string>(n)
  const acc = new Map<string, THREE.Vector3>()
  for (let i = 0; i < n; i++) {
    keys[i] = key(i)
    if (!acc.has(keys[i])) acc.set(keys[i], new THREE.Vector3())
  }
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), f = new THREE.Vector3()
  const tris = idx ? idx.count / 3 : n / 3
  for (let t = 0; t < tris; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3
    const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1
    const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2)
    f.subVectors(c, b).cross(a.sub(b))
    acc.get(keys[i0])!.add(f); acc.get(keys[i1])!.add(f); acc.get(keys[i2])!.add(f)
  }
  const nor = new Float32Array(n * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    v.copy(acc.get(keys[i])!).normalize()
    nor[i * 3] = v.x; nor[i * 3 + 1] = v.y; nor[i * 3 + 2] = v.z
  }
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  return g
}
