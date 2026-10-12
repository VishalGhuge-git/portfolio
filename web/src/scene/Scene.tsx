import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Avatar, { HEIGHT } from './Avatar'
import { Briefcase, stickerRefs } from './SuitItems'
import { Studio, Platform, PLATFORM, DESK_X, DESK_TOP_Y } from './Studio'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useStore } from '../store'
import { orbit } from './orbit'
import { TOUR } from './tour'

// Hero scene: gradient backdrop, lights, the clay bust (Bust.tsx) wearing project stickers
// (Stickers.tsx), and a camera that moves with page scroll.
// Phase 2: swap <Bust /> for a real avatar (glb) if wanted; the stickers and camera carry over.

// Vertical gradient backdrop (sage -> sand), wraps the camera
const BG: Record<string, [string, string]> = {
  sage: ['#6f906f', '#dbd3b5'], // current
  slate: ['#2b3a4f', '#9fb0c4'],
  ink: ['#141a26', '#3b4a63'],
  warm: ['#c9b79c', '#f1e9dc'],
  indigo: ['#3a3f6b', '#b9b4d6'],
  // AI-themed, minimal (compare with ?bg=midnight etc.)
  midnight: ['#0b1220', '#1d3557'],
  graphite: ['#12161c', '#2a3440'],
  mist: ['#e8edf3', '#f8fafc'],
  paper: ['#eef0f6', '#fbfbfd'],
}
const bgKey = new URLSearchParams(location.search).get('bg') || 'graphite'

function GradientBackground() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color((BG[bgKey] || BG.sage)[0]) },
      uBottom: { value: new THREE.Color((BG[bgKey] || BG.sage)[1]) },
      uSteep: { value: 1.4 },
    }),
    []
  )
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uSteep;
          varying vec3 vDir;
          void main() {
            float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
            vec3 col = mix(uBottom, uTop, t);
            // faint grid on the far wall, fades out toward the poles
            vec2 g = vec2(atan(vDir.x, vDir.z) * 24.0, vDir.y * 24.0);
            vec2 f = abs(fract(g) - 0.5);
            float line = smoothstep(0.47, 0.5, max(f.x, f.y)) * (1.0 - abs(vDir.y)) * 0.06;
            float lum = dot(col, vec3(0.299, 0.587, 0.114));
            col += (lum < 0.5 ? 1.0 : -1.0) * line;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      {/* soft sky/ground fill keeps the clay shadows warm instead of black */}
      <hemisphereLight args={['#fff4ea', '#5b5a4a', 1.0]} />
      {/* warm key from the front-right */}
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#ffd9c0" />
      {/* cool fill from the left */}
      <directionalLight position={[-6, 2, 4]} intensity={1.0} color="#a9c8ff" />
      {/* rim light from behind lifts the silhouette off the background */}
      <directionalLight position={[0, 4, -6]} intensity={1.6} color="#ffffff" />
    </>
  )
}

// Soft studio reflections so the gold pins and leather read as metal and leather.
function Env() {
  const gl = useThree((t) => t.gl)
  const scene = useThree((t) => t.scene)
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = tex
    scene.environmentIntensity = 0.5
    pm.dispose()
  }, [gl, scene])
  return null
}

// Scroll-driven camera: hero frames the face and shoulders, drifts down the body as you scroll, and pulls
// back to show the whole figure at the end. While a résumé block is on screen it flies in to that item.
const FACE_Y = 3.4
const FOCUS: Record<string, { dist: number; side: number }> = {
  iqigai: { dist: 1.9, side: 0.35 },
  xaviers: { dist: 1.7, side: 0.35 },
  foyr: { dist: 1.4, side: -2.2 },
  te: { dist: 1.7, side: 0.35 },
  mx: { dist: 1.9, side: 0.35 },
  bocconi: { dist: 3.4, side: 0.9 },
}
// Drag (mouse) or swipe sideways (touch) to look around the scene. Outside explore mode it eases back on
// release; in explore mode it stays where you leave it, goes all the way round, and the wheel zooms.
const SKIP = 'a,button,input,textarea,select,[role="dialog"],.cm-modal,.case-modal,.chip,.explore-bar'
function useOrbitInput() {
  useEffect(() => {
    const start = (x: number, y: number, t: EventTarget | null) => {
      if (useStore.getState().active) return false
      if (t instanceof Element && t.closest(SKIP)) return false
      orbit.down = true
      orbit.x = x
      orbit.y = y
      return true
    }
    const move = (x: number, y: number, touch: boolean) => {
      if (!orbit.down) return
      const dx = x - orbit.x
      const dy = y - orbit.y
      orbit.x = x
      orbit.y = y
      if (useStore.getState().explore) {
        orbit.ty -= dx * 0.008
        orbit.tp = THREE.MathUtils.clamp(orbit.tp + dy * 0.004, -0.5, 0.6)
        return
      }
      if (touch && Math.abs(dy) > Math.abs(dx) * 1.5) return // a vertical swipe is just scrolling
      orbit.ty = THREE.MathUtils.clamp(orbit.ty - dx * 0.006, -1.2, 1.2)
      if (!touch) orbit.tp = THREE.MathUtils.clamp(orbit.tp + dy * 0.003, -0.35, 0.35)
    }
    const up = () => { orbit.down = false }
    const wheel = (e: WheelEvent) => {
      if (!useStore.getState().explore) return
      e.preventDefault()
      orbit.tz = THREE.MathUtils.clamp(orbit.tz * Math.exp(e.deltaY * 0.001), 0.45, 1.7)
    }
    const pd = (e: PointerEvent) => { if (e.pointerType === 'mouse' && e.button === 0) start(e.clientX, e.clientY, e.target) }
    const pm = (e: PointerEvent) => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY, false) }
    const ts = (e: TouchEvent) => { const t = e.touches[0]; if (t) start(t.clientX, t.clientY, e.target) }
    const tm = (e: TouchEvent) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY, true) }
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm)
    window.addEventListener('pointerup', up)
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchend', up)
    window.addEventListener('touchcancel', up)
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', up)
      window.removeEventListener('touchcancel', up)
    }
  }, [])
}

const UP = new THREE.Vector3(0, 1, 0)
const DESK_CENTER = new THREE.Vector3(DESK_X, DESK_TOP_Y + 0.12 * HEIGHT, 0.04 * HEIGHT)
function CameraRig() {
  useOrbitInput()
  const target = useMemo(() => new THREE.Vector3(0, FACE_Y, 0), [])
  const wantTarget = useMemo(() => new THREE.Vector3(), [])
  const wantPos = useMemo(() => new THREE.Vector3(), [])
  const zoom = useRef(0)
  const focusAmt = useRef(0)
  const focusPt = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, delta) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const p = Math.min(1, Math.max(0, window.scrollY / max))
    const cam = state.camera
    // Portrait screens (phones) need the camera further back so the figure fits the narrow width
    const aspect = state.size.width / state.size.height
    const back = Math.max(0, 1.05 - aspect) * 4.4

    // Hero: the closer the cursor is to the face, the closer the camera dollies in (top of the page only).
    const atTop = window.scrollY < window.innerHeight * 0.4 && !useStore.getState().active
    const d = Math.hypot(state.pointer.x * 1.1, (state.pointer.y - 0.05) * 1.4)
    const want = atTop ? THREE.MathUtils.smoothstep(0.9 - d, 0, 0.4) : 0
    zoom.current = THREE.MathUtils.lerp(zoom.current, want, 0.06)
    const z = zoom.current

    const drift = Math.min(1, p * 2.2)
    const end = THREE.MathUtils.smoothstep(p, 0.82, 1) // pull back to the full figure at the very end
    wantPos.set(
      THREE.MathUtils.lerp(0, -1.0, drift) * (1 - end) + state.pointer.x * 0.5 * z,
      THREE.MathUtils.lerp(FACE_Y + 0.1, 3.0, drift) * (1 - end) + 2.2 * end + state.pointer.y * 0.3 * z,
      THREE.MathUtils.lerp(5.4, 6.7, drift) * (1 - end) + 11 * end - 0.7 * z + back
    )
    wantTarget.set(state.pointer.x * 0.25 * z, THREE.MathUtils.lerp(FACE_Y, 3.0, drift) * (1 - end) + 2.1 * end + state.pointer.y * 0.2 * z, 0)

    // Hero on wide screens: pull back and look right of Vishal so the platform and desk fit beside the About card
    const pull = aspect >= 1.05 ? (1 - drift) * (1 - end) : 0
    wantPos.x += 1.5 * pull
    wantTarget.x += 1.5 * pull
    wantTarget.y -= 1.5 * pull
    wantPos.y -= 1.6 * pull
    wantPos.z += 5.2 * pull

    // Phones: the About card (hero) and the footer (end) cover the lower half, so lift the figure into the open top half
    if (aspect < 1.05) {
      // Hero: measure where the About card starts and keep his folded hands (about 46% down at lift 0.95) above it,
      // with a clear gap, whatever the phone size or font. A taller card pushes him up; a shorter one lets him sit lower.
      let heroLift = 0.95
      const card = document.querySelector('.hero .about')
      if (card) {
        const f = card.getBoundingClientRect().top / window.innerHeight
        heroLift = THREE.MathUtils.clamp(0.95 + (0.46 - (f - 0.1)) * 0.708 * Math.max(wantPos.z, 6), 0.3, 2.2)
      }
      const lift = heroLift * (1 - drift) * (1 - end) + 1.0 * end
      wantTarget.y -= lift
      wantPos.y -= lift
    }

    const ex = useStore.getState().explore
    if (ex) {
      // Explore mode: free views instead of the scroll camera
      const dk = DESK_CENTER
      if (ex === 'tour') {
        const stop = TOUR[useStore.getState().tourIdx % TOUR.length]
        const it = stickerRefs.get(stop.id)
        if (stop.me === 'face') {
          wantTarget.set(0, FACE_Y - 0.05, 0)
          wantPos.set(0.5, FACE_Y + 0.1, 3.7 + back * 1.4)
        } else if (stop.me === 'body') {
          wantTarget.set(0, 2.7, 0)
          wantPos.set(1.6, 3.0, 6.0 + back * 1.5)
        } else if (it) {
          it.getWorldPosition(focusPt)
          const fo = FOCUS[stop.id] ?? { dist: 2.4, side: 0.5 }
          // frame the item in the upper part of the screen so the tour card under it never covers it
          const lift = fo.dist * (aspect < 1.05 ? 0.2 : 0.15)
          wantTarget.set(focusPt.x, focusPt.y - lift, focusPt.z)
          wantPos.set(focusPt.x + fo.side, focusPt.y + 0.12, focusPt.z + fo.dist + back * 0.5)
        }
      } else if (ex === 'desk') {
        wantTarget.set(dk.x, dk.y - 0.1, dk.z)
        wantPos.set(dk.x + 0.4, dk.y + 0.2, dk.z + 4.3 + back * 1.3)
      } else if (ex === 'wide') {
        wantTarget.set(PLATFORM.x, 2.2, 0)
        wantPos.set(PLATFORM.x, 3.0, 11.5 + back * 2)
      } else {
        wantTarget.set(0, 2.7, 0)
        wantPos.set(0, 3.0, 6.6 + back * 1.5)
      }
      wantPos.sub(wantTarget).multiplyScalar(orbit.zoom).add(wantTarget)
    }

    const focusId = useStore.getState().focus
    const item = focusId ? stickerRefs.get(focusId) : undefined
    const wantF = !ex && item && aspect >= 1.05 && !atTop && !useStore.getState().active && end < 0.5 ? 1 : 0
    focusAmt.current = THREE.MathUtils.lerp(focusAmt.current, wantF, 0.07)
    if (item) item.getWorldPosition(focusPt)
    const f = focusAmt.current
    if (f > 0.001 && focusId) {
      const fo = FOCUS[focusId] ?? { dist: 2.8, side: 0.7 }
      tmp.set(focusPt.x + fo.side, focusPt.y + 0.05, focusPt.z + fo.dist + back * 0.6)
      wantPos.lerp(tmp, f)
      tmp.set(focusPt.x + fo.side, focusPt.y, focusPt.z)
      wantTarget.lerp(tmp, f)
    }

    // ease the drag offset back to centre once let go, and apply it around the look-at point
    if (!orbit.down && !ex) {
      orbit.ty = THREE.MathUtils.lerp(orbit.ty, 0, 0.03)
      orbit.tp = THREE.MathUtils.lerp(orbit.tp, 0, 0.03)
    }
    orbit.zoom = THREE.MathUtils.lerp(orbit.zoom, ex ? orbit.tz : 1, 0.12)
    orbit.yaw = THREE.MathUtils.lerp(orbit.yaw, orbit.ty, 0.15)
    orbit.pitch = THREE.MathUtils.lerp(orbit.pitch, orbit.tp, 0.15)
    if (Math.abs(orbit.yaw) > 1e-4 || Math.abs(orbit.pitch) > 1e-4) {
      tmp.copy(wantPos).sub(wantTarget)
      tmp.applyAxisAngle(UP, orbit.yaw)
      tmp.y += Math.sin(orbit.pitch) * tmp.length()
      wantPos.copy(wantTarget).add(tmp)
    }

    // Tour moves glide with time-based damping (same feel at any frame rate); everything else keeps the snappier follow
    const k = ex === 'tour' ? 1 - Math.exp(-Math.min(delta, 0.1) * 2.4) : 0.08
    cam.position.lerp(wantPos, k)
    target.lerp(wantTarget, k)
    cam.lookAt(target)
  })
  return null
}

export default function Scene() {
  return (
    <>
      <GradientBackground />
      <Lights />
      <Env />
      <Avatar />
      <Briefcase />
      <Platform />
      <Studio />
      <CameraRig />
    </>
  )
}
