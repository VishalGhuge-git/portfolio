import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
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
  slug: string
  label: string
  theta: number
  phi: number
  spin: number
  color: string
}

const STICKERS: StickerDef[] = [
  { slug: 'iqigai', label: 'iqigai', theta: -0.82, phi: 0.05, spin: 0.3, color: '#f2c94c' },
  { slug: 'foyr-ideate', label: 'Foyr Ideate', theta: 0.82, phi: 0.18, spin: -0.4, color: '#eb5757' },
  { slug: 'te-design-tool', label: 'Total Environment', theta: 0.35, phi: -0.62, spin: 0.1, color: '#56ccf2' },
  { slug: 'mx-content-ops', label: 'Amazon MX Player', theta: -0.5, phi: -0.55, spin: 0.6, color: '#6fcf97' },
  { slug: 'companylens', label: 'CompanyLens', theta: 0.85, phi: -0.2, spin: 0.2, color: '#b794f4' },
]

const RADIUS = 0.15 // colour disc
const BORDER = 0.026 // white sticker edge

// Stickers only react near the top of the page; further down the bust sits behind the résumé
// text, and a stray click there should not open a case study.
// They also ignore the pointer while a case study is open, since the open view sits on top.
const canInteract = () =>
  typeof window !== 'undefined' && window.scrollY < window.innerHeight * 0.7 && !useStore.getState().active

function Sticker({ def }: { def: StickerDef }) {
  const group = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const setActive = useStore((s) => s.setActive)

  const { position, quaternion, labelPos } = useMemo(() => {
    const f = surfaceFrame(def.theta, def.phi)
    return {
      position: f.position.clone().addScaledVector(f.normal, 0.012),
      quaternion: faceNormal(f.normal, def.spin),
      labelPos: f.position.clone().addScaledVector(f.normal, 0.3),
    }
  }, [def])

  useFrame((state) => {
    if (!group.current) return
    // gentle pulse to hint they are clickable; grows on hover
    const target = hover ? 1.25 : 1 + 0.04 * Math.sin(state.clock.elapsedTime * 2 + def.theta * 3)
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
    setActive(def.slug)
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
        {/* white sticker edge, then the colour disc just above it */}
        <mesh>
          <circleGeometry args={[RADIUS + BORDER, 40]} />
          <meshStandardMaterial color="#fbf8f1" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[RADIUS, 40]} />
          <meshStandardMaterial color={def.color} roughness={0.4} side={THREE.DoubleSide} />
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
        <Sticker key={s.slug} def={s} />
      ))}
    </>
  )
}
