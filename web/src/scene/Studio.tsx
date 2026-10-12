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
const phys = (color: number | string, rough: number, clearcoat: number, map?: THREE.Texture | null) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat, clearcoatRoughness: 0.35, map: map ?? null })

// Procedural wood grain: warm base with long soft streaks, so the desk reads as real oak, not a flat colour
function woodTexture(base: string, dark: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = base
  g.fillRect(0, 0, 512, 256)
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 256
    g.strokeStyle = dark
    g.globalAlpha = 0.04 + Math.random() * 0.1
    g.lineWidth = 0.6 + Math.random() * 2.2
    g.beginPath()
    g.moveTo(0, y)
    g.bezierCurveTo(170, y + (Math.random() - 0.5) * 9, 340, y + (Math.random() - 0.5) * 9, 512, y + (Math.random() - 0.5) * 6)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}
// Soft round contact shadow (radial gradient alpha) so objects sit ON the surface instead of hovering
function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62)
  gr.addColorStop(0, 'rgba(8,6,4,0.5)')
  gr.addColorStop(1, 'rgba(8,6,4,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}
function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const g = c.getContext('2d')!
  const gr = g.createLinearGradient(0, 0, 256, 160)
  gr.addColorStop(0, '#1b3a78')
  gr.addColorStop(1, '#081226')
  g.fillStyle = gr
  g.fillRect(0, 0, 256, 160)
  g.fillStyle = 'rgba(255,255,255,0.06)'
  g.beginPath()
  g.moveTo(0, 0)
  g.lineTo(150, 0)
  g.lineTo(0, 100)
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const OAK = phys(0xffffff, 0.5, 0.25, woodTexture('#dcc196', '#9a6f3e'))
const OAK_D = phys(0xffffff, 0.55, 0.2, woodTexture('#bd935f', '#6e4a22'))
const CREAM = phys(0xf1e9da, 0.7, 0.15)
const BRASS = mat(0xcfa64e, 0.22, 0.95)
const STEEL = mat(0xb9bfc9, 0.28, 0.9)
const TERRA = mat(0xc46a45, 0.7)
const SAGE = mat(0x7f9b7a, 0.65)
const SAGE_D = mat(0x5f7f5d, 0.65)
const NAVY = phys(0x2a3a63, 0.5, 0.3)
const MUSTARD = phys(0xd6a53a, 0.55, 0.3)
const WINE = phys(0x7a2f3a, 0.5, 0.3)
const PAPER = mat(0xf4efe3, 0.9)
const INK = mat(0x151a24, 0.4, 0.3)
const WALL = phys(0xf3ecdf, 0.7, 0.1)
const ROOF = phys(0xb5532f, 0.55, 0.2)
const GLASS = new THREE.MeshStandardMaterial({ color: 0x6fa8d8, roughness: 0.1, metalness: 0.4, emissive: 0x1d3a5c, emissiveIntensity: 0.4 })
const GRASS = mat(0x6f9a5a, 0.85)
const COFFEE = mat(0x3a2412, 0.3)
const LAMP_GLOW = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffb866, emissiveIntensity: 1.2 })
const RUG = new THREE.MeshStandardMaterial({ color: 0xcdbb9c, roughness: 1, transparent: true, opacity: 0.28, depthWrite: false })
const SHADOW_TEX = shadowTexture()
const SHADOW = new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false })
const SCREEN_TEX = screenTexture()
const SCREEN = new THREE.MeshStandardMaterial({ map: SCREEN_TEX, emissiveMap: SCREEN_TEX, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.15 })

// Desktop: open space on his left. Phone: the empty sky above his head (shown in the hero only).
const DESK_POS: [number, number, number] = [-0.44 * H, 0.6 * H, 0]
const PHONE_POS: [number, number, number] = [0, 1.1 * H, 0]
const isPhone = () => window.innerWidth / window.innerHeight < 1.05
// Clickable only while the studio is actually showing
const studioOk = () => {
  if (useStore.getState().active) return false
  if (useStore.getState().explore) return true
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
const rbCache = new Map<string, RoundedBoxGeometry>()
const rbox = (w: number, h: number, d: number, r: number) => {
  const k = [w, h, d, r].map((n) => n.toFixed(5)).join()
  let g = rbCache.get(k)
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1))
    rbCache.set(k, g)
  }
  return g
}
// Rounded box in H-fraction units: soft edges catch the light, which is most of what reads as "premium"
const Box = ({ s, p, m, r, round = 0.18 }: { s: V3; p: V3; m: THREE.Material; r?: V3; round?: number }) => (
  <mesh material={m} position={[p[0] * H, p[1] * H, p[2] * H]} rotation={r} geometry={rbox(s[0] * H, s[1] * H, s[2] * H, Math.min(...s) * H * round)} />
)
const Cyl = ({ r, h, p, m, rot, r2 }: { r: number; h: number; p: V3; m: THREE.Material; rot?: V3; r2?: number }) => (
  <mesh material={m} position={[p[0] * H, p[1] * H, p[2] * H]} rotation={rot}>
    <cylinderGeometry args={[r2 !== undefined ? r2 * H : r * H, r * H, h * H, 32]} />
  </mesh>
)
// Contact shadow on a surface: x, y(surface height), z, radius (all H fractions)
const Shadow = ({ p, r, sx = 1, sz = 1 }: { p: V3; r: number; sx?: number; sz?: number }) => (
  <mesh material={SHADOW} position={[p[0] * H, p[1] * H + 0.0006 * H, p[2] * H]} rotation={[-Math.PI / 2, 0, 0]} scale={[sx, sz, 1]} renderOrder={1}>
    <planeGeometry args={[r * 2 * H, r * 2 * H]} />
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
      <Hot grow={1.22} float={0.5} ok={studioOk} id="iqigai" slug="iqigai" label="iqigai by Fractal" hit={R * 2.4} position={[0, 0, 0]} labelOffset={[0, 0.5, 0.1]}>
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
  const w = 0.13 * H
  const h = 0.085 * H
  const body = useMemo(() => new RoundedBoxGeometry(w, h, 0.012 * H, 4, 0.005 * H), [w, h])
  return (
    <group position={[-0.17 * H, 0.0, -0.065 * H]}>
      <Shadow p={[0.004, 0, 0.006]} r={0.07} sx={1.1} />
      {/* stand: weighted round base, slim neck */}
      <Cyl r={0.026} r2={0.024} h={0.0045} p={[0, 0.00225, 0]} m={STEEL} />
      <Box s={[0.009, 0.034, 0.005]} p={[0, 0.021, -0.006]} m={STEEL} round={0.3} />
      <Hot grow={1.22} float={0.5} ok={studioOk} id="mx" slug="mx-player" label="Amazon MX Player" hit={w * 0.7} position={[0, 0.075 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
        <group position={[0, -0.075 * H, 0]}>
          <Cyl r={0.026} r2={0.024} h={0.0045} p={[0, 0.00225, 0]} m={STEEL} />
          <Box s={[0.009, 0.034, 0.005]} p={[0, 0.021, -0.006]} m={STEEL} round={0.3} />
        </group>
        <mesh geometry={body} material={INK} />
        <mesh material={SCREEN} position={[0, 0.0015 * H, 0.0065 * H]}>
          <planeGeometry args={[w * 0.93, h * 0.84]} />
        </mesh>
        <Logo img="mx.png" r={0.021 * H} position={[0, 0.001 * H, 0.0072 * H]} />
      </Hot>
    </group>
  )
}

function Model() {
  const w = 0.075 * H
  return (
    <group position={[0.0, 0.0, 0.055 * H]} rotation={[0, -0.35, 0]}>
      <Shadow p={[0, 0, 0]} r={0.075} sx={1.2} />
      <Hot grow={1.22} float={0.5} ok={studioOk} id="te" slug="total-environment" label="Total Environment" hit={w * 0.9} position={[0, 0.04 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
        <group position={[0, -0.04 * H, 0]}>
          {/* plinth + lawn */}
          <Box s={[0.115, 0.007, 0.092]} p={[0, 0.0035, 0]} m={CREAM} round={0.3} />
          <Box s={[0.105, 0.003, 0.082]} p={[0, 0.0085, 0]} m={GRASS} round={0.4} />
          {/* walls, roof, chimney */}
          <group position={[-0.012 * H, 0.0105 * H, 0]}>
            <Box s={[0.055, 0.034, 0.045]} p={[0, 0.017, 0]} m={WALL} round={0.08} />
            <mesh material={ROOF} position={[0, 0.0455 * H, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.046 * H, 0.03 * H, 4]} />
            </mesh>
            <Box s={[0.007, 0.016, 0.007]} p={[0.016, 0.056, -0.006]} m={ROOF} round={0.1} />
            {/* door + windows */}
            <Box s={[0.011, 0.02, 0.003]} p={[0.012, 0.01, 0.0225]} m={OAK_D} round={0.2} />
            <mesh material={BRASS} position={[0.0155 * H, 0.0105 * H, 0.0243 * H]}>
              <sphereGeometry args={[0.0013 * H, 10, 10]} />
            </mesh>
            <Box s={[0.012, 0.011, 0.003]} p={[-0.017, 0.024, 0.0225]} m={GLASS} round={0.2} />
            <Box s={[0.012, 0.011, 0.003]} p={[0.017, 0.026, 0.0225]} m={GLASS} round={0.2} />
            <Logo img="te.png" r={0.0105 * H} position={[-0.012 * H, 0.0085 * H, 0.0238 * H]} />
          </group>
          {/* tiny tree */}
          <Cyl r={0.0016} h={0.012} p={[0.04, 0.016, 0.02]} m={OAK_D} />
          <mesh material={SAGE} position={[0.04 * H, 0.03 * H, 0.02 * H]}>
            <icosahedronGeometry args={[0.009 * H, 1]} />
          </mesh>
        </group>
      </Hot>
    </group>
  )
}

function Books() {
  const book = (w: number, h: number, d: number, y: number, rot: number, m: THREE.Material, x = 0) => (
    <group position={[x * H, y * H, 0]} rotation={[0, rot, 0]}>
      <Box s={[w, h, d]} p={[0, 0, 0]} m={m} round={0.12} />
      {/* page block visible on the open edge */}
      <Box s={[w * 0.96, h * 0.7, d * 0.02]} p={[0, 0, d * 0.5]} m={PAPER} round={0.05} />
    </group>
  )
  return (
    <group position={[0.18 * H, 0.0, -0.03 * H]}>
      <Shadow p={[0, 0, 0]} r={0.055} sx={1.15} />
      {book(0.062, 0.012, 0.044, 0.006, 0.1, NAVY)}
      {book(0.057, 0.011, 0.041, 0.0175, -0.15, WINE, 0.002)}
      {book(0.052, 0.01, 0.038, 0.028, 0.2, MUSTARD, -0.001)}
      <Cap />
    </group>
  )
}

function Cap() {
  const u = 0.036 * H
  return (
    <Hot grow={1.22} float={0.5} ok={studioOk} id="xaviers" scrollTo="education" label="St. Xavier's College" hit={u * 1.4} position={[0, 0.041 * H, 0]} labelOffset={[0, 0.4, 0.1]}>
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
    <group position={[0.275 * H, 0, -0.08 * H]}>
      <Shadow p={[0, 0, 0]} r={0.032} />
      <Cyl r={0.017} r2={0.015} h={0.005} p={[0, 0.0025, 0]} m={BRASS} />
      <Cyl r={0.0021} h={0.075} p={[0, 0.0425, 0]} m={BRASS} />
      <mesh material={BRASS} position={[0, 0.082 * H, 0]}>
        <sphereGeometry args={[0.004 * H, 12, 12]} />
      </mesh>
      <group position={[-0.008 * H, 0.088 * H, 0]} rotation={[0, 0, 0.55]}>
        <mesh>
          <coneGeometry args={[0.021 * H, 0.028 * H, 28, 1, true]} />
          <meshStandardMaterial color={0xcfa64e} roughness={0.25} metalness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh material={LAMP_GLOW} position={[0, -0.004 * H, 0]}>
          <sphereGeometry args={[0.0075 * H, 14, 14]} />
        </mesh>
      </group>
    </group>
  )
}

function Plant() {
  return (
    <group position={[-0.27 * H, -0.175 * H, 0.1 * H]} scale={1.5}>
      <Shadow p={[0, 0.0005, 0]} r={0.025} />
      <Cyl r={0.014} r2={0.011} h={0.026} p={[0, 0.016, 0]} m={TERRA} />
      <Cyl r={0.0152} r2={0.0152} h={0.004} p={[0, 0.0305, 0]} m={TERRA} />
      <Cyl r={0.0125} r2={0.0125} h={0.001} p={[0, 0.0322, 0]} m={COFFEE} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        const tall = i % 3 === 0
        const rr = tall ? 0.004 : 0.011
        return (
          <mesh key={i} material={i % 2 ? SAGE : SAGE_D} position={[Math.cos(a) * rr * H, (tall ? 0.062 : 0.052) * H, Math.sin(a) * rr * H]} rotation={[Math.sin(a) * (tall ? 0.25 : 0.7), 0, -Math.cos(a) * (tall ? 0.25 : 0.7)]} scale={[0.45, tall ? 1.9 : 1.5, 0.25]}>
            <sphereGeometry args={[0.012 * H, 14, 14]} />
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
      c.position.y = (0.028 + t * 0.05) * H
      c.position.x = Math.sin(t * 6 + i) * 0.004 * H
      ;(c as THREE.Mesh).scale.setScalar(0.6 + t * 0.9)
      ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - t)
    })
  })
  return (
    <group position={[-0.23 * H, 0.0, 0.07 * H]}>
      <Shadow p={[0.003, 0, 0]} r={0.022} />
      <Cyl r={0.009} h={0.02} p={[0, 0.01, 0]} m={CREAM} />
      <Cyl r={0.0078} h={0.0008} p={[0, 0.0196, 0]} m={COFFEE} />
      <mesh material={CREAM} position={[0.0105 * H, 0.011 * H, 0]} rotation={[0, 0, 0]}>
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
      <Hot grow={1.22} float={0.5} ok={studioOk} id="foyr" slug="foyr-ideate" label="Foyr Ideate" hit={0.05 * H} position={[0, 0.04 * H, -0.032 * H]} labelOffset={[0, 0.4, 0.1]}>
        <group position={[0, -0.04 * H, 0.032 * H]}>
          {/* upholstered seat on a slim frame */}
          <Box s={[0.072, 0.016, 0.072]} p={[0, 0.002, 0]} m={CREAM} round={0.4} />
          <Box s={[0.066, 0.006, 0.066]} p={[0, -0.0075, 0]} m={OAK_D} round={0.2} />
          {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([x, z], i) => (
            <group key={i} position={[x * 0.029 * H, -0.045 * H, z * 0.029 * H]} rotation={[z * 0.06, 0, -x * 0.06]}>
              <mesh material={OAK_D}>
                <cylinderGeometry args={[0.0028 * H, 0.0019 * H, 0.078 * H, 12]} />
              </mesh>
              <mesh material={BRASS} position={[0, -0.0385 * H, 0]}>
                <cylinderGeometry args={[0.002 * H, 0.002 * H, 0.003 * H, 12]} />
              </mesh>
            </group>
          ))}
        </group>
        <Box s={[0.072, 0.074, 0.009]} p={[0, 0.002, 0]} m={OAK_D} round={0.3} />
        <Logo img="foyr.png" r={0.021 * H} position={[0, 0.003 * H, 0.0062 * H]} />
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
    const ex = useStore.getState().explore
    const phone = ex ? false : isPhone()
    const ih = window.innerHeight
    const want = ex ? 1 : phone
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
        {/* desk: thick rounded oak top, apron, drawer with brass pull, tapered legs, floor shadow */}
        <Shadow p={[0, -0.1795, 0.03]} r={0.34} sx={1.1} sz={0.55} />
        <Box s={[0.6, 0.014, 0.25]} p={[0, -0.007, 0]} m={OAK} round={0.25} />
        <Box s={[0.56, 0.026, 0.006]} p={[0, -0.027, 0.112]} m={OAK_D} round={0.2} />
        <Box s={[0.17, 0.022, 0.004]} p={[0.17, -0.029, 0.116]} m={OAK} round={0.2} />
        <Box s={[0.05, 0.003, 0.004]} p={[0.17, -0.029, 0.1195]} m={BRASS} round={0.4} />
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([x, z], i) => (
          <mesh key={i} material={OAK_D} position={[x * 0.28 * H, -0.09 * H, z * 0.1 * H]}>
            <cylinderGeometry args={[0.0055 * H, 0.0035 * H, 0.16 * H, 14]} />
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
