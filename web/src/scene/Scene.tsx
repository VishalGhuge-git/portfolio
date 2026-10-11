import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Avatar from './Avatar'
import { Emblems, WorkObjects, Briefcase, stickerRefs } from './SuitItems'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useStore } from '../store'

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
  iqigai: { dist: 3.2, side: 0.9 },
  xaviers: { dist: 3.2, side: 0.9 },
  foyr: { dist: 3.3, side: 0.8 },
  te: { dist: 3.3, side: 0.8 },
  mx: { dist: 3.3, side: 0.8 },
  bocconi: { dist: 3.4, side: 0.9 },
}
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(0, FACE_Y, 0), [])
  const wantTarget = useMemo(() => new THREE.Vector3(), [])
  const wantPos = useMemo(() => new THREE.Vector3(), [])
  const zoom = useRef(0)
  const focusAmt = useRef(0)
  const focusPt = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state) => {
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

    const focusId = useStore.getState().focus
    const item = focusId ? stickerRefs.get(focusId) : undefined
    const wantF = item && !atTop && !useStore.getState().active && end < 0.5 ? 1 : 0
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

    cam.position.lerp(wantPos, 0.08)
    target.lerp(wantTarget, 0.08)
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
      <WorkObjects />
      <Emblems />
      <CameraRig />
    </>
  )
}
