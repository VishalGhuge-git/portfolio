import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { useStore } from '../store'
import { HEIGHT as H } from './Avatar'
import { Hot, BASE, GOLD } from './SuitItems'

// A small floating designer's studio corner that holds the five projects, so they read as one place:
//   iqigai   -> the pendant light (an orb with six orbiting agents)
//   Foyr     -> the chair pulled up to the desk (interior design)
//   Total Env-> the architect's model on the desk
//   MX Player-> the monitor
//   St. Xavier's -> the cap resting on a stack of books
// Everything is in units of the avatar height H. Warm Scandinavian palette.

const mat = (color: number | string, rough = 0.6, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
const OAK = mat(0xd9bc8f, 0.55)
const OAK_D = mat(0xb98f5e, 0.6)
const CREAM = mat(0xefe6d6, 0.85)
const BRASS = mat(0xc9a24a, 0.3, 0.85)
const TERRA = mat(0xc46a45, 0.75)
const SAGE = mat(0x7f9b7a, 0.7)
const NAVY = mat(0x2a3a63, 0.6)
const MUSTARD = mat(0xd6a53a, 0.6)
const WINE = mat(0x7a2f3a, 0.6)
const INK = mat(0x151a24, 0.45, 0.25)
const WALL = mat(0xf1eadc, 0.75)
const ROOF = mat(0xb5532f, 0.6)
const SCREEN = new THREE.MeshStandardMaterial({ color: 0x0b1424, emissive: 0x16305c, emissiveIntensity: 0.7, roughness: 0.2 })
const LAMP_GLOW = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffb866, emissiveIntensity: 1.0 })
const RUG = new THREE.MeshStandardMaterial({ color: 0xcdbb9c, roughness: 1, transparent: true, opacity: 0.28, depthWrite: false })

// Desktop: open space on his left. Phone: the empty sky above his head (shown in the hero only).
const DESK_POS: [number, number, number] = [-0.44 * H, 0.6 * H, 0]
const PHONE_POS: [number, number, number] = [0, 1.1 * H, 0]
const isPhone = () => window.innerWidth / window.innerHeight < 1.05
// Clickable only while the studio is actually showing
const studioOk = () => {
  if (useStore.getState().active) return false
  const p = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return isPhone() ? window.scrollY < window.innerHeight * 0.3 : window.scrollY > window.innerHeight * 0.5 && p < 0.9
}

function Logo({ img, r, position }: { img: string; r: number; position: [number, number, number] }) {
  const tex = useLoader(THREE.TextureLoader, `${BASE}stickers/${img}`)
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={BRASS}>
        <cylinderGeometry args={[r * 1.12, r * 1.12, 0.004 * H, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.0025 * H]} material={CREAM}>
        <circleGeometry args={[r, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.0035 * H]}>
        <planeGeometry args={[r * 1.5, r * 1.5]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

type V3 = [number, number, number]
const Box = ({ s, p, m, r }: { s: V3; p: V3; m: THREE.Material; r?: V3 }) => (
  <mesh material={m} position={[p[0] * H, p[1] * H, p[2] * H]} rotation={r}>
    <boxGeometry args={[s[0] * H, s[1] * H, s[2] * H]} />
  </mesh>
)
const Cyl = ({ r, h, p, m, rot, r2 }: { r: number; h: number; p: V3; m: THREE.Material; rot?: V3; r2?: number }) => (
  <mesh material={m} position={[p[0] * H, p[1] * H, p[2] * H]} rotation={rot}>
    <cylinderGeometry args={[r2 !== undefined ? r2 * H : r * H, r * H, h * H, 24]} />
  </mesh>
)

// ---- the five targets ---------------------------------------------------------------------------------------

function PendantOrb() {
  const tex = useLoader(THREE.TextureLoader, `${BASE}stickers/iqigai.png`)
  tex.colorSpace = THREE.SRGBColorSpace
  const ring = useRef<THREE.Group>(null)
  const R = 0.034 * H
  useFrame((st) => {
    if (ring.current) ring.current.rotation.y = st.clock.elapsedTime * 0.9
  })
  return (
    <group position={[0, 0.27 * H, 0]}>
      <Cyl r={0.0012} h={0.1} p={[0, 0.07, 0]} m={BRASS} />
      <Hot grow={1.45} float={1} ok={studioOk} id="iqigai" slug="iqigai" label="iqigai by Fractal" hit={R * 2.4} position={[0, 0, 0]} labelOffset={[0, 0.5, 0.1]}>
        <mesh>
          <sphereGeometry args={[R, 36, 36]} />
          <meshStandardMaterial color="#ffd9b3" emissive="#ff9d4d" emissiveIntensity={0.6} roughness={0.25} transparent opacity={0.94} />
        </mesh>
        <mesh position={[0, 0, R * 0.97]}>
          <circleGeometry args={[R * 0.62, 36]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, R * 0.97 + 0.002]}>
          <planeGeometry args={[R * 0.9, R * 0.9]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
        <group ref={ring} rotation={[0.45, 0, 0.25]}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * R * 1.7, 0, Math.sin(a) * R * 1.7]}>
                <sphereGeometry args={[R * 0.16, 14, 14]} />
                <meshStandardMaterial color="#fff2dc" emissive="#ffb66e" emissiveIntensity={0.9} />
              </mesh>
            )
          })}
        </group>
      </Hot>
    </group>
  )
}

function Monitor() {
  const w = 0.12 * H
  const h = 0.078 * H
  const body = useMemo(() => new RoundedBoxGeometry(w, h, 0.012 * H, 4, 0.006 * H), [w, h])
  return (
    <group position={[-0.16 * H, 0.0, -0.06 * H]}>
      <Cyl r={0.026} h={0.004} p={[0, 0.008, 0]} m={INK} />
      <Cyl r={0.004} h={0.03} p={[0, 0.024, 0]} m={INK} />
      <Hot grow={1.45} float={1} ok={studioOk} id="mx" slug="mx-player" label="Amazon MX Player" hit={w * 0.7} position={[0, 0.07 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
        <mesh geometry={body} material={INK} />
        <mesh material={SCREEN} position={[0, 0, 0.0065 * H]}>
          <planeGeometry args={[w * 0.92, h * 0.88]} />
        </mesh>
        <Logo img="mx.png" r={0.02 * H} position={[0, 0, 0.007 * H]} />
      </Hot>
    </group>
  )
}

function Model() {
  const w = 0.07 * H
  return (
    <group position={[0.0, 0.006 * H, 0.055 * H]} rotation={[0, -0.4, 0]}>
      <Hot grow={1.45} float={1} ok={studioOk} id="te" slug="total-environment" label="Total Environment" hit={w * 0.9} position={[0, 0.035 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
        <mesh material={CREAM} position={[0, 0, 0]}>
          <boxGeometry args={[w * 1.5, 0.004 * H, w * 1.2]} />
        </mesh>
        <group position={[-w * 0.15, w * 0.3, 0]}>
          <mesh material={WALL}>
            <boxGeometry args={[w * 0.7, w * 0.5, w * 0.6]} />
          </mesh>
          <mesh material={ROOF} position={[0, w * 0.45, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[w * 0.62, w * 0.36, 4]} />
          </mesh>
          <Box s={[0.013, 0.02, 0.003]} p={[0.008, -0.005, 0.0217]} m={OAK_D} />
          <Logo img="te.png" r={0.011 * H} position={[-w * 0.17, w * 0.04, w * 0.3 + 0.001 * H]} />
        </group>
      </Hot>
    </group>
  )
}

function Books() {
  return (
    <group position={[0.17 * H, 0.0, -0.03 * H]}>
      <Box s={[0.06, 0.012, 0.042]} p={[0, 0.012, 0]} m={NAVY} r={[0, 0.1, 0]} />
      <Box s={[0.055, 0.011, 0.04]} p={[0.002, 0.0235, 0]} m={WINE} r={[0, -0.15, 0]} />
      <Box s={[0.05, 0.01, 0.038]} p={[-0.001, 0.034, 0]} m={MUSTARD} r={[0, 0.2, 0]} />
      <Cap />
    </group>
  )
}

function Cap() {
  const u = 0.036 * H
  return (
    <Hot grow={1.45} float={1} ok={studioOk} id="xaviers" scrollTo="education" label="St. Xavier's College" hit={u * 1.4} position={[0, 0.056 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
      <group rotation={[0.08, 0.3, 0]}>
        <mesh material={INK} position={[0, 0.016 * H, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[u * 1.55, 0.005 * H, u * 1.55]} />
        </mesh>
        <mesh material={INK} position={[0, 0.005 * H, 0]}>
          <cylinderGeometry args={[u * 0.5, u * 0.58, 0.02 * H, 24]} />
        </mesh>
        <mesh material={BRASS} position={[0, 0.0195 * H, 0]}>
          <sphereGeometry args={[0.003 * H, 12, 12]} />
        </mesh>
        <mesh material={BRASS} position={[u * 0.75, 0.002 * H, 0]}>
          <cylinderGeometry args={[0.003 * H, 0.0015 * H, 0.016 * H, 10]} />
        </mesh>
        <group position={[0, 0.003 * H, u * 0.58]}>
          <Logo img="xaviers.png" r={0.011 * H} position={[0, 0, 0]} />
        </group>
      </group>
    </Hot>
  )
}

function Lamp() {
  return (
    <group position={[0.27 * H, 0, -0.08 * H]}>
      <Cyl r={0.016} h={0.004} p={[0, 0.008, 0]} m={BRASS} />
      <Cyl r={0.0022} h={0.07} p={[0, 0.045, 0]} m={BRASS} />
      <mesh material={BRASS} position={[-0.01 * H, 0.088 * H, 0]} rotation={[0, 0, 0.55]}>
        <coneGeometry args={[0.02 * H, 0.026 * H, 20, 1, true]} />
      </mesh>
      <mesh material={LAMP_GLOW} position={[-0.014 * H, 0.081 * H, 0]}>
        <sphereGeometry args={[0.007 * H, 12, 12]} />
      </mesh>
    </group>
  )
}

function Plant() {
  return (
    <group position={[-0.27 * H, -0.175 * H, 0.1 * H]} scale={1.5}>
      <Cyl r={0.014} r2={0.011} h={0.026} p={[0, 0.019, 0]} m={TERRA} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} material={SAGE} position={[Math.cos(a) * 0.01 * H, 0.05 * H + (i % 2) * 0.006 * H, Math.sin(a) * 0.01 * H]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]} scale={[0.5, 1.5, 0.3]}>
            <sphereGeometry args={[0.012 * H, 12, 12]} />
          </mesh>
        )
      })}
    </group>
  )
}

function Mug() {
  const steam = useRef<THREE.Group>(null)
  useFrame((st) => {
    if (!steam.current) return
    steam.current.children.forEach((c, i) => {
      const t = (st.clock.elapsedTime * 0.35 + i / 3) % 1
      c.position.y = (0.03 + t * 0.05) * H
      c.position.x = Math.sin(t * 6 + i) * 0.004 * H
      ;(c as THREE.Mesh).scale.setScalar(0.6 + t * 0.9)
      ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - t)
    })
  })
  return (
    <group position={[-0.23 * H, 0.0, 0.07 * H]}>
      <Cyl r={0.009} h={0.02} p={[0, 0.016, 0]} m={CREAM} />
      <mesh material={CREAM} position={[0.0105 * H, 0.016 * H, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.005 * H, 0.0016 * H, 8, 16]} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.004 * H, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Chair() {
  return (
    <group position={[0.0, -0.105 * H, 0.17 * H]} rotation={[0, 0.4, 0]}>
      <Box s={[0.07, 0.014, 0.07]} p={[0, 0, 0]} m={CREAM} />
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} material={OAK_D} position={[x * 0.027 * H, -0.04 * H, z * 0.027 * H]}>
          <cylinderGeometry args={[0.0028 * H, 0.002 * H, 0.08 * H, 8]} />
        </mesh>
      ))}
      <Hot grow={1.45} float={1} ok={studioOk} id="foyr" slug="foyr-ideate" label="Foyr Ideate" hit={0.05 * H} position={[0, 0.04 * H, -0.032 * H]} labelOffset={[0, 0.4, 0.1]}>
        <Box s={[0.07, 0.07, 0.008]} p={[0, 0, 0]} m={OAK_D} />
        <Logo img="foyr.png" r={0.02 * H} position={[0, 0.002 * H, 0.0055 * H]} />
      </Hot>
    </group>
  )
}

// ---- the studio ----------------------------------------------------------------------------------------------

export function Studio() {
  const ref = useRef<THREE.Group>(null)
  const sway = useRef<THREE.Group>(null)
  const extras = useRef<THREE.Group>(null)
  const prog = () => window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  useFrame((st, delta) => {
    const g = ref.current
    if (!g) return
    const phone = isPhone()
    const ih = window.innerHeight
    const want = phone
      ? 1 - THREE.MathUtils.smoothstep(window.scrollY, ih * 0.12, ih * 0.4)
      : THREE.MathUtils.smoothstep(window.scrollY, ih * 0.3, ih * 0.75) * (1 - THREE.MathUtils.smoothstep(prog(), 0.88, 0.96))
    const p = phone ? PHONE_POS : DESK_POS
    g.position.set(p[0], p[1], p[2])
    const f = THREE.MathUtils.lerp((g.userData.f as number) ?? 0, want, 1 - Math.exp(-8 * Math.min(delta, 0.1)))
    g.userData.f = f
    g.scale.setScalar(Math.max(f * (phone ? 0.46 : 0.82), 0.0001))
    g.visible = f > 0.01
    if (extras.current) extras.current.visible = !phone
    if (sway.current) {
      const t = st.clock.elapsedTime
      sway.current.position.y = Math.sin(t * 0.9) * 0.008 * H
      sway.current.rotation.y = 0.35 + Math.sin(t * 0.5) * 0.16
    }
  })
  return (
    <group ref={ref}>
      <group ref={sway}>
        {/* rug */}
        <mesh material={RUG} position={[0, -0.175 * H, 0.03 * H]}>
          <cylinderGeometry args={[0.34 * H, 0.34 * H, 0.003 * H, 48]} />
        </mesh>
        {/* desk */}
        <Box s={[0.6, 0.012, 0.25]} p={[0, -0.006, 0]} m={OAK} />
        <Box s={[0.6, 0.03, 0.006]} p={[0, -0.027, 0.115]} m={OAK_D} />
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([x, z], i) => (
          <mesh key={i} material={OAK_D} position={[x * 0.28 * H, -0.09 * H, z * 0.1 * H]}>
            <cylinderGeometry args={[0.005 * H, 0.0035 * H, 0.16 * H, 10]} />
          </mesh>
        ))}
        <Monitor />
        <Model />
        <Books />
        <group ref={extras}>
          <Lamp />
          <Plant />
          <Mug />
        </group>
        <Chair />
        <PendantOrb />
      </group>
    </group>
  )
}
