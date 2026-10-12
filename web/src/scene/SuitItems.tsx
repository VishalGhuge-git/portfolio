import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { useStore } from '../store'
import { resetView } from './orbit'
import { HEIGHT as H } from './Avatar'
import { track } from '../analytics'

// What he wears and carries: two lapel pins, a briefcase with a luggage tag, and a column of glass badges.
// Each item has an id that matches a résumé `focus` id, so the camera can fly to it while its entry is on screen.

// Live groups by id, so the camera can find where to zoom for the résumé focus.
export const stickerRefs = new Map<string, THREE.Group>()

export const BASE = import.meta.env.BASE_URL
export const GOLD = new THREE.MeshStandardMaterial({ color: 0xd9b45e, metalness: 1, roughness: 0.22 })

const canInteract = () =>
  typeof window !== 'undefined' && window.scrollY < window.innerHeight * 0.7 && !useStore.getState().active

// Wraps an item: registers it for the camera, pulses when its résumé entry is focused, hover label, click action.
export function Hot({ id, label, slug, scrollTo, children, hit, position, quaternion, rotation, labelOffset = [0, 0.3, 0.3], ok = canInteract, grow = 1.3, float = 1 }: {
  ok?: () => boolean
  grow?: number // scale while focused
  float?: number // 0 = no float/sway (items packed close together)
  id: string; label: string; slug?: string; scrollTo?: string; children: ReactNode
  hit: number // radius of the invisible click target
  position: THREE.Vector3 | [number, number, number]
  quaternion?: THREE.Quaternion
  rotation?: [number, number, number]
  labelOffset?: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const setActive = useStore((s) => s.setActive)
  const open = useStore((s) => !!s.active)

  useEffect(() => {
    const g = group.current
    if (g) stickerRefs.set(id, g)
    return () => {
      stickerRefs.delete(id)
      document.body.style.cursor = ''
    }
  }, [id])

  useFrame((state, delta) => {
    if (!group.current) return
    const focused = useStore.getState().focus === id
    const t = focused ? grow : hover ? 1.18 : 1 + 0.025 * Math.sin(state.clock.elapsedTime * 2 + id.length)
    const k = 1 - Math.exp(-6 * Math.min(delta, 0.1))
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, t, k))
    // gentle float and sway while the camera is on it, eased back to rest otherwise
    const a = inner.current
    if (a) {
      const tt = state.clock.elapsedTime
      const amp = focused ? 1 : 0
      // lift off the surface (never tilt into it) and bob a little
      a.position.z = THREE.MathUtils.lerp(a.position.z, amp * float * 0.02 * H, 0.15)
      a.position.y = THREE.MathUtils.lerp(a.position.y, amp * float * 0.005 * H * Math.sin(tt * 2.2), 0.2)
      a.rotation.z = THREE.MathUtils.lerp(a.rotation.z, amp * float * 0.04 * Math.sin(tt * 1.7), 0.2)
    }
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (!ok()) return
    e.stopPropagation()
    setHover(true)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHover(false)
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!ok()) return
    e.stopPropagation()
    document.body.style.cursor = ''
    track('sticker_click', label)
    useStore.setState({ touched: true })
    if (slug) setActive(slug)
    else {
      // In Explore mode the page is hidden and locked, so leave it first, then scroll to the section
      if (useStore.getState().explore) {
        resetView()
        useStore.getState().setExplore(null)
      }
      window.setTimeout(() => (document.getElementById(scrollTo ?? '') ?? document.querySelector('.resume'))?.scrollIntoView({ behavior: 'smooth' }), 80)
    }
  }

  return (
    <group ref={group} position={position} quaternion={quaternion} rotation={rotation} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      <group ref={inner}>{children}</group>
      <mesh>
        <sphereGeometry args={[hit, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hover && !open && (
        <Html position={labelOffset} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
          <div className="sticker-label">
            {label}
            <span aria-hidden="true">↗</span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ---- floating emblems in the space beside him: iqigai (an orb with orbiting agents) and St. Xavier's (a graduation cap) ----

// One slot per object, in order: iqigai orb, St. Xavier's cap, Foyr chair, Total Environment house, MX Player TV.
// Desktop: a zig-zag down the open space on his left, evenly spaced. Phone: two rows in the empty sky above his head.
// Positions are fractions of his height; SIZE evens out how big each object looks.
const SLOTS_DESKTOP: [number, number, number][] = [
  [-0.28, 0.98, 0.08], [-0.52, 0.84, -0.06], [-0.28, 0.7, 0.08], [-0.52, 0.56, -0.06], [-0.28, 0.42, 0.08],
]
const SLOTS_PHONE: [number, number, number][] = [
  [-0.17, 1.25, 0], [0.01, 1.25, 0], [0.19, 1.25, 0], [-0.08, 1.08, 0], [0.1, 1.08, 0],
]
const SIZE = [0.95, 1.0, 1.15, 0.8, 0.9]
const isPhone = () => window.innerWidth / window.innerHeight < 1.05

// Places the object in its slot and fades it: desktop in after the hero and out at the very end; phone visible
// in the hero and gone once the text takes the screen. It scales from 0, so nothing pops.
function useEmblemFade(slot: number): { ref: React.RefObject<THREE.Group>; ok: () => boolean } {
  const ref = useRef<THREE.Group>(null)
  const prog = () => window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const want = () => {
    const ih = window.innerHeight
    if (isPhone()) return 1 - THREE.MathUtils.smoothstep(window.scrollY, ih * 0.12, ih * 0.4)
    return THREE.MathUtils.smoothstep(window.scrollY, ih * 0.3, ih * 0.75) * (1 - THREE.MathUtils.smoothstep(prog(), 0.88, 0.96))
  }
  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return
    const phone = isPhone()
    const sl = (phone ? SLOTS_PHONE : SLOTS_DESKTOP)[slot]
    g.position.set(sl[0] * H, sl[1] * H, sl[2] * H)
    const k = 1 - Math.exp(-8 * Math.min(delta, 0.1))
    const f = THREE.MathUtils.lerp((g.userData.f as number) ?? 0, want(), k)
    g.userData.f = f
    g.scale.setScalar(Math.max(f * SIZE[slot] * (phone ? 0.62 : 1), 0.0001))
    g.visible = f > 0.01
  })
  return {
    ref,
    ok: () => {
      if (useStore.getState().active) return false
      return isPhone() ? window.scrollY < window.innerHeight * 0.3 : window.scrollY > window.innerHeight * 0.5 && prog() < 0.9
    },
  }
}

function IqigaiOrb() {
  const tex = useLoader(THREE.TextureLoader, `${BASE}stickers/iqigai.png`)
  tex.colorSpace = THREE.SRGBColorSpace
  const { ref, ok } = useEmblemFade(0)
  const ring = useRef<THREE.Group>(null)
  const bob = useRef<THREE.Group>(null)
  const R = 0.04 * H
  useFrame((state) => {
    if (ring.current) ring.current.rotation.y = state.clock.elapsedTime * 0.9
    if (bob.current) bob.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.012 * H
  })
  return (
    <group ref={ref}>
      <Hot grow={1.15} float={0} ok={ok} id="iqigai" slug="iqigai" label="iqigai by Fractal" hit={R * 2.6} position={[0, 0, 0]} labelOffset={[0, 0.5, 0.1]}>
        <group ref={bob}>
          <mesh>
            <sphereGeometry args={[R, 40, 40]} />
            <meshStandardMaterial color="#ffd9b3" emissive="#ff9d4d" emissiveIntensity={0.55} roughness={0.25} metalness={0.1} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0, R * 0.98]}>
            <circleGeometry args={[R * 0.62, 40]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, R * 0.98 + 0.002]}>
            <planeGeometry args={[R * 0.9, R * 0.9]} />
            <meshBasicMaterial map={tex} transparent toneMapped={false} />
          </mesh>
          <group ref={ring} rotation={[0.45, 0, 0.25]}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(a) * R * 1.75, 0, Math.sin(a) * R * 1.75]}>
                  <sphereGeometry args={[R * 0.17, 16, 16]} />
                  <meshStandardMaterial color="#fff2dc" emissive="#ffb66e" emissiveIntensity={0.9} />
                </mesh>
              )
            })}
          </group>
        </group>
      </Hot>
    </group>
  )
}

const CAP = new THREE.MeshStandardMaterial({ color: 0x151a24, roughness: 0.55, metalness: 0.15 })

function XaviersCap() {
  const tex = useLoader(THREE.TextureLoader, `${BASE}stickers/xaviers.png`)
  tex.colorSpace = THREE.SRGBColorSpace
  const { ref, ok } = useEmblemFade(1)
  const sway = useRef<THREE.Group>(null)
  const u = 0.1 * H // half-width of the mortarboard
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sway.current) {
      sway.current.position.y = Math.sin(t * 1.1 + 1) * 0.012 * H
      sway.current.rotation.y = Math.sin(t * 0.7) * 0.35
      sway.current.rotation.z = Math.sin(t * 0.9) * 0.05
    }
  })
  return (
    <group ref={ref}>
      <Hot grow={1.15} float={0} ok={ok} id="xaviers" scrollTo="education" label="St. Xavier's College" hit={u * 1.4} position={[0, 0, 0]} labelOffset={[0, 0.5, 0.1]}>
        <group ref={sway} rotation={[0.25, 0, 0]} scale={0.8}>
          {/* mortarboard */}
          <mesh material={CAP} position={[0, 0.04 * H, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[u * 1.5, 0.012 * H, u * 1.5]} />
          </mesh>
          {/* skull cap */}
          <mesh material={CAP} position={[0, 0.012 * H, 0]}>
            <cylinderGeometry args={[u * 0.5, u * 0.58, 0.05 * H, 28]} />
          </mesh>
          {/* button, cord and tassel */}
          <mesh material={GOLD} position={[0, 0.0475 * H, 0]}>
            <sphereGeometry args={[0.008 * H, 16, 16]} />
          </mesh>
          <mesh material={GOLD} position={[u * 0.78, 0.025 * H, 0]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.0022 * H, 0.0022 * H, 0.04 * H, 8]} />
          </mesh>
          <mesh material={GOLD} position={[u * 0.8, -0.008 * H, 0]}>
            <cylinderGeometry args={[0.007 * H, 0.0035 * H, 0.03 * H, 12]} />
          </mesh>
          {/* crest, set on the front of the cap band */}
          <group position={[0, 0.006 * H, u * 0.6]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={GOLD}>
              <cylinderGeometry args={[0.026 * H, 0.026 * H, 0.008 * H, 40]} />
            </mesh>
            <mesh position={[0, 0, 0.0045 * H]}>
              <circleGeometry args={[0.022 * H, 40]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, 0.0055 * H]}>
              <planeGeometry args={[0.036 * H, 0.036 * H]} />
              <meshBasicMaterial map={tex} transparent toneMapped={false} />
            </mesh>
          </group>
        </group>
      </Hot>
    </group>
  )
}

export function Emblems() {
  return (
    <>
      <IqigaiOrb />
      <XaviersCap />
    </>
  )
}

// ---- briefcase with the SDA Bocconi luggage tag ----------------------------------------------------------

export function Briefcase() {
  const logo = useLoader(THREE.TextureLoader, `${BASE}stickers/bocconi.png`)
  logo.colorSpace = THREE.SRGBColorSpace
  const parts = useMemo(() => {
    const bw = 0.19 * H, bh = 0.13 * H, bd = 0.04 * H
    const HR = 0.035 * H, HT = 0.0045 * H
    const ang = Math.PI * 0.4
    const hp = new THREE.Vector3(Math.cos(ang) * HR, bh / 2 + Math.sin(ang) * HR, 0)
    const tw = 0.07 * H, th = 0.045 * H
    const tagTop = new THREE.Vector3(hp.x + 0.006 * H, bh / 2 - 0.022 * H, bd / 2 + 0.0055 * H)
    const curve = new THREE.CatmullRomCurve3([
      hp.clone().add(new THREE.Vector3(0, -0.006 * H, 0.006 * H)),
      new THREE.Vector3(hp.x + 0.002 * H, bh / 2 + 0.006 * H, bd / 2 + 0.004 * H),
      new THREE.Vector3(tagTop.x, bh / 2 - 0.006 * H, bd / 2 + 0.0055 * H),
      tagTop.clone().add(new THREE.Vector3(0, -0.004 * H, 0)),
    ])
    return {
      bw, bh, bd, HR, HT, ang, hp, tw, th, tagTop,
      body: new RoundedBoxGeometry(bw, bh, bd, 6, 0.012 * H),
      tagBody: new RoundedBoxGeometry(tw, th, 0.004 * H, 3, 0.006 * H),
      clasp: new RoundedBoxGeometry(0.022 * H, 0.012 * H, 0.004 * H, 2, 0.002 * H),
      foot: new RoundedBoxGeometry(0.014 * H, 0.006 * H, 0.012 * H, 2, 0.002 * H),
      strap: new THREE.TubeGeometry(curve, 40, 0.0016 * H, 8),
    }
  }, [])
  const p = parts
  return (
    <group position={[0.29 * H, p.bh / 2 + 0.002 * H, 0.05 * H]} rotation={[0, -0.5, 0]}>
      <mesh geometry={p.body}><meshStandardMaterial color="#4a2c1c" roughness={0.45} /></mesh>
      <mesh position={[0, p.bh / 2, 0]}>
        <torusGeometry args={[p.HR, p.HT, 12, 40, Math.PI]} />
        <meshStandardMaterial color="#4a2c1c" roughness={0.45} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={p.foot} material={GOLD} position={[s * p.HR, p.bh / 2 + 0.002 * H, 0]} />
          <mesh geometry={p.clasp} material={GOLD} position={[s * 0.062 * H, p.bh * 0.36, p.bd / 2 + 0.002 * H]} />
        </group>
      ))}
      <mesh position={[0, p.bh * 0.28, p.bd / 2 + 0.0005 * H]}>
        <boxGeometry args={[p.bw * 0.98, 0.0015 * H, 0.001 * H]} />
        <meshStandardMaterial color="#2e1b11" />
      </mesh>
      {/* strap loop around the handle */}
      <mesh position={p.hp} rotation={[0, Math.PI / 2, p.ang - Math.PI / 2]}>
        <torusGeometry args={[0.0085 * H, 0.0016 * H, 10, 32]} />
        <meshStandardMaterial color="#6b4128" roughness={0.5} />
      </mesh>
      <mesh geometry={p.strap}><meshStandardMaterial color="#6b4128" roughness={0.5} /></mesh>
      <Hot grow={1.15} float={1.4} id="bocconi" scrollTo="education" label="SDA Bocconi" hit={p.tw * 0.9}
        position={[p.tagTop.x, p.tagTop.y - p.th / 2 + 0.006 * H, p.tagTop.z]} rotation={[0, 0, -0.05]} labelOffset={[0, 0.4, 0.2]}>
        <mesh geometry={p.tagBody}><meshStandardMaterial color="#6b4128" roughness={0.5} /></mesh>
        <mesh position={[0, p.th / 2 - 0.006 * H, 0.0022 * H]} material={GOLD}><torusGeometry args={[0.003 * H, 0.0009 * H, 8, 20]} /></mesh>
        <mesh position={[0, -0.004 * H, 0.0021 * H]}>
          <planeGeometry args={[p.tw * 0.84, p.th * 0.56]} />
          <meshStandardMaterial color="#f6f4ef" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.004 * H, 0.0024 * H]}>
          <planeGeometry args={[p.tw * 0.76, p.tw * 0.76 * 0.22]} />
          <meshBasicMaterial map={logo} transparent toneMapped={false} />
        </mesh>
      </Hot>
    </group>
  )
}

// ---- three more objects for past work: a chair (Foyr), a house (Total Environment) and a TV (MX Player) -------------
// Scattered in the space around him, not in a column; the fade, bob and click behaviour is shared.

const LOGO_DISC = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.35 })

function Logo({ img, r, position }: { img: string; r: number; position: [number, number, number] }) {
  const tex = useLoader(THREE.TextureLoader, `${BASE}stickers/${img}`)
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={GOLD}>
        <cylinderGeometry args={[r * 1.12, r * 1.12, 0.006 * H, 36]} />
      </mesh>
      <mesh position={[0, 0, 0.0035 * H]} material={LOGO_DISC}>
        <circleGeometry args={[r, 36]} />
      </mesh>
      <mesh position={[0, 0, 0.0045 * H]}>
        <planeGeometry args={[r * 1.5, r * 1.5]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

function Floating({ id, label, slug, slot, phase, children }: { id: string; label: string; slug: string; slot: number; phase: number; children: ReactNode }) {
  const { ref, ok } = useEmblemFade(slot)
  const bob = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime + phase
    if (bob.current) {
      bob.current.position.y = Math.sin(t * 1.0) * 0.01 * H
      bob.current.rotation.y = Math.sin(t * 0.6) * 0.5
    }
  })
  return (
    <group ref={ref}>
      <Hot grow={1.15} float={0} ok={ok} id={id} slug={slug} label={label} hit={0.07 * H} position={[0, 0, 0]} labelOffset={[0, 0.5, 0.1]}>
        <group ref={bob}>{children}</group>
      </Hot>
    </group>
  )
}

const WOOD = new THREE.MeshStandardMaterial({ color: 0xb98a5a, roughness: 0.6 })
const CUSHION = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.85 })

function FoyrChair() {
  const u = 0.04 * H
  return (
    <Floating id="foyr" slug="foyr-ideate" label="Foyr Ideate" slot={2} phase={1.7}>
      <group rotation={[0, 0.3, 0]}>
        <mesh material={CUSHION} position={[0, 0, 0]}>
          <boxGeometry args={[u * 2, 0.016 * H, u * 2]} />
        </mesh>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
          <mesh key={i} material={WOOD} position={[x * u * 0.82, -0.026 * H, z * u * 0.82]}>
            <cylinderGeometry args={[0.0035 * H, 0.0025 * H, 0.05 * H, 8]} />
          </mesh>
        ))}
        <mesh material={WOOD} position={[0, 0.036 * H, -u * 0.95]}>
          <boxGeometry args={[u * 2, 0.07 * H, 0.008 * H]} />
        </mesh>
        <Logo img="foyr.png" r={0.022 * H} position={[0, 0.038 * H, -u * 0.95 + 0.005 * H]} />
      </group>
    </Floating>
  )
}

const WALL = new THREE.MeshStandardMaterial({ color: 0xece4d6, roughness: 0.75 })
const ROOF = new THREE.MeshStandardMaterial({ color: 0xb5532f, roughness: 0.6 })

function TotalEnvHouse() {
  const w = 0.1 * H
  return (
    <Floating id="te" slug="total-environment" label="Total Environment" slot={3} phase={0.4}>
      <group rotation={[0, -0.35, 0]}>
        <mesh material={WALL} position={[0, 0, 0]}>
          <boxGeometry args={[w, w * 0.7, w * 0.8]} />
        </mesh>
        <mesh material={ROOF} position={[0, w * 0.7, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[w * 0.82, w * 0.5, 4]} />
        </mesh>
        <mesh material={WOOD} position={[w * 0.28, -w * 0.12, w * 0.4 + 0.001]}>
          <boxGeometry args={[w * 0.2, w * 0.38, 0.004 * H]} />
        </mesh>
        <Logo img="te.png" r={0.017 * H} position={[-w * 0.18, w * 0.08, w * 0.4 + 0.002]} />
      </group>
    </Floating>
  )
}

const TV_BODY = new THREE.MeshStandardMaterial({ color: 0x121821, roughness: 0.4, metalness: 0.3 })
const TV_SCREEN = new THREE.MeshStandardMaterial({ color: 0x0b1424, emissive: 0x13294f, emissiveIntensity: 0.6, roughness: 0.2 })

function MxTv() {
  const w = 0.13 * H
  const h = 0.085 * H
  const body = useMemo(() => new RoundedBoxGeometry(w, h, 0.02 * H, 4, 0.008 * H), [w, h])
  return (
    <Floating id="mx" slug="mx-player" label="Amazon MX Player" slot={4} phase={2.6}>
      <group rotation={[0, 0.25, 0]}>
        <mesh geometry={body} material={TV_BODY} />
        <mesh material={TV_SCREEN} position={[0, 0, 0.0105 * H]}>
          <planeGeometry args={[w * 0.9, h * 0.86]} />
        </mesh>
        <Logo img="mx.png" r={0.022 * H} position={[0, 0, 0.011 * H]} />
        <mesh material={TV_BODY} position={[0, -h * 0.62, 0]}>
          <cylinderGeometry args={[0.004 * H, 0.004 * H, 0.03 * H, 8]} />
        </mesh>
        <mesh material={TV_BODY} position={[0, -h * 0.78, 0]}>
          <cylinderGeometry args={[0.03 * H, 0.03 * H, 0.004 * H, 24]} />
        </mesh>
      </group>
    </Floating>
  )
}

export function WorkObjects() {
  return (
    <>
      <FoyrChair />
      <TotalEnvHouse />
      <MxTv />
    </>
  )
}
