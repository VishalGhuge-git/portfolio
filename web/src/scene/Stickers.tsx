import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { faceNormal, surfaceFrame } from './headShape'
import { useStore } from '../store'
import { useSurface, type SurfaceFrame } from './Avatar'
import { track } from '../analytics'

// Project stickers on the bust. Clicking one opens that project's case study.
//   slug   must match an item `slug` in src/data/works.ts (and a file in src/content/works/)
//   label  text shown on hover
//   theta, phi  where it sits on the head: theta turns left/right from the front, phi is the
//          elevation above the eye line. Keep clear of the eyes, brows, mouth and cheeks.
interface StickerDef {
  id: string
  label: string
  img: string // die-cut PNG in public/stickers/ (logo + white outline, transparent background)
  theta: number
  phi: number
  spin: number
  size?: number // longest side in head units (default 0.75)
  chest?: [number, number] // [x, y] on the hoodie instead of theta/phi (cast straight from the front)
  slug?: string // opens this case study; without it the click scrolls to the résumé
}

const STICKERS: StickerDef[] = [
  // left cheek (as you look at the screen): iqigai above, Total Environment below
  { id: 'iqigai', slug: 'iqigai', label: 'iqigai by Fractal', img: 'iqigai.png', theta: -0.66, phi: -0.36, spin: 0.35, size: 0.27 },
  { id: 'te', slug: 'total-environment', label: 'Total Environment', img: 'te.png', theta: -0.6, phi: -0.62, spin: -0.25, size: 0.27 },
  // right cheek: Foyr above, MX Player below
  { id: 'foyr', slug: 'foyr-ideate', label: 'Foyr Ideate', img: 'foyr.png', theta: 0.66, phi: -0.36, spin: -0.3, size: 0.3 },
  { id: 'mx', slug: 'mx-player', label: 'Amazon MX Player', img: 'mx.png', theta: 0.6, phi: -0.62, spin: 0.3, size: 0.25 },
  // hoodie, left shoulder (clear of the drawstrings)
  { id: 'xaviers', label: "St. Xavier's College", img: 'xaviers.png', theta: 0, phi: 0, spin: 0.12, size: 0.38, chest: [-1.05, -1.5] },
]

const HOVER_SCALE = 1.22
const DEPTH = 0.22 // how deep the decal projection reaches into the surface

// Live sticker groups by id, so the camera can find where to zoom for the résumé focus.
export const stickerRefs = new Map<string, THREE.Group>()

// Stickers only react near the top of the page; further down the bust sits behind the résumé
// text, and a stray click there should not open a case study.
// They also ignore the pointer while a case study is open, since the open view sits on top.
const canInteract = () =>
  typeof window !== 'undefined' && window.scrollY < window.innerHeight * 0.7 && !useStore.getState().active

function Sticker({ def }: { def: StickerDef }) {
  const tex = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}stickers/${def.img}`)
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])
  const img = tex.image as { width: number; height: number }
  const k = (def.size ?? 0.75) / Math.max(img.width, img.height)
  const sw = img.width * k
  const sh = img.height * k

  const group = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const setActive = useStore((s) => s.setActive)
  const open = useStore((s) => !!s.active) // a case study is open: hide the hover label

  const surface = useSurface()
  const { position, quaternion, labelPos, decal } = useMemo(() => {
    const f: SurfaceFrame = (def.chest ? surface?.front(def.chest[0], def.chest[1]) : surface?.angles(def.theta, def.phi)) ??
      surfaceFrame(def.theta, def.phi)
    const quaternion = faceNormal(f.normal, def.spin)
    // Project the sticker onto the real mesh so it wraps the cheek/chest instead of floating flat.
    // Geometry is re-centred on the sticker point so hover scaling grows it in place.
    let decal: THREE.BufferGeometry | null = null
    if (f.mesh) {
      const g = new DecalGeometry(f.mesh, f.position, new THREE.Euler().setFromQuaternion(quaternion), new THREE.Vector3(sw, sh, DEPTH))
      if (g.getAttribute('position')?.count) {
        g.translate(-f.position.x, -f.position.y, -f.position.z)
        decal = g
      }
    }
    return {
      position: decal ? f.position.clone() : f.position.clone().addScaledVector(f.normal, 0.03),
      quaternion: decal ? new THREE.Quaternion() : quaternion,
      labelPos: f.position.clone().addScaledVector(f.normal, 0.3),
      decal,
    }
  }, [def, surface, sw, sh])
  useEffect(() => () => decal?.dispose(), [decal])

  useFrame((state) => {
    if (!group.current) return
    // gentle pulse to hint they are clickable; grows on hover
    const focused = useStore.getState().focus === def.id
    const target = hover || focused ? HOVER_SCALE : 1 + 0.04 * Math.sin(state.clock.elapsedTime * 2 + def.theta * 3)
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, target, 0.15))
  })

  // do not leave a pointer cursor behind if this unmounts while hovered
  useEffect(() => {
    const g = group.current
    if (g) stickerRefs.set(def.id, g)
    return () => {
      stickerRefs.delete(def.id)
      document.body.style.cursor = ''
    }
  }, [def.id])

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (!canInteract()) return
    e.stopPropagation()
    setHover(true)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHover(false)
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!canInteract()) return
    e.stopPropagation()
    document.body.style.cursor = ''
    track('sticker_click', def.label)
    useStore.setState({ touched: true })
    if (def.slug) setActive(def.slug)
    else document.querySelector('.resume')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <group
        ref={group}
        position={position}
        quaternion={quaternion}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        {/* die-cut sticker: the PNG already carries the white outline */}
        {decal ? (
          <mesh geometry={decal} renderOrder={2}>
            <meshBasicMaterial map={tex} toneMapped={false} transparent alphaTest={0.05} depthWrite={false}
              polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
          </mesh>
        ) : (
          <mesh>
            <planeGeometry args={[sw, sh]} />
            <meshBasicMaterial map={tex} toneMapped={false} transparent alphaTest={0.05} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
      {hover && !open && (
        <Html position={labelPos} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
          <div className="sticker-label">
            {def.label}
            <span aria-hidden="true">↗</span>
          </div>
        </Html>
      )}
    </>
  )
}

export default function Stickers() {
  return (
    <>
      {STICKERS.map((s) => (
        <Sticker key={s.id} def={s} />
      ))}
    </>
  )
}
