import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { faceNormal, surfaceFrame } from './headShape'
import { useStore } from '../store'

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
  slug?: string // opens this case study; without it the click scrolls to the résumé
}

const STICKERS: StickerDef[] = [
  { id: 'iqigai', slug: 'iqigai', label: 'iqigai', img: 'iqigai.png', theta: -0.85, phi: 0.12, spin: 0.35 },
  { id: 'foyr', slug: 'foyr-ideate', label: 'Foyr Ideate', img: 'foyr.png', theta: 0.85, phi: 0.25, spin: -0.4, size: 0.6 },
  { id: 'te', slug: 'te-design-tool', label: 'Total Environment', img: 'te.png', theta: 0.5, phi: -0.22, spin: 0.15, size: 0.6 },
  { id: 'mx', slug: 'mx-content-ops', label: 'Amazon MX Player', img: 'mx.png', theta: -0.58, phi: -0.3, spin: -0.2, size: 0.78 },
  { id: 'fractal', label: 'Fractal Analytics', img: 'fractal.png', theta: -0.05, phi: 0.47, spin: 0.1, size: 0.52 },
  { id: 'xaviers', label: "St. Xavier's College", img: 'xaviers.png', theta: 0.95, phi: -0.12, spin: 0.3, size: 0.55 },
]

const HOVER_SCALE = 1.35

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

  const { position, quaternion, labelPos } = useMemo(() => {
    const f = surfaceFrame(def.theta, def.phi)
    return {
      position: f.position.clone().addScaledVector(f.normal, 0.03),
      quaternion: faceNormal(f.normal, def.spin),
      labelPos: f.position.clone().addScaledVector(f.normal, 0.3),
    }
  }, [def])

  useFrame((state) => {
    if (!group.current) return
    // gentle pulse to hint they are clickable; grows on hover
    const target = hover ? HOVER_SCALE : 1 + 0.04 * Math.sin(state.clock.elapsedTime * 2 + def.theta * 3)
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, target, 0.15))
  })

  // do not leave a pointer cursor behind if this unmounts while hovered
  useEffect(() => () => void (document.body.style.cursor = ''), [])

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
        <mesh>
          <planeGeometry args={[sw, sh]} />
          <meshBasicMaterial map={tex} toneMapped={false} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {hover && (
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
