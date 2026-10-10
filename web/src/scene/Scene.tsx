import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Avatar from './Avatar'
import Stickers, { stickerRefs } from './Stickers'
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

// Scroll-driven camera: starts framing the face, drifts closer and sideways as you scroll.
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(0, 0.2, 0), [])
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
    // Portrait screens (phones) need the camera further back so the head fits the narrow width
    const aspect = state.size.width / state.size.height
    const back = Math.max(0, 1.05 - aspect) * 5.5

    // Hero zoom: the closer the cursor is to the face, the closer the camera dollies in
    // (and pans toward the cursor) so the stickers can be read. Only at the top of the page.
    const atTop = window.scrollY < window.innerHeight * 0.4 && !useStore.getState().active
    const d = Math.hypot(state.pointer.x * 1.1, (state.pointer.y - 0.05) * 1.4)
    const want = atTop ? THREE.MathUtils.smoothstep(0.9 - d, 0, 0.4) : 0
    zoom.current = THREE.MathUtils.lerp(zoom.current, want, 0.06)
    const z = zoom.current

    wantPos.set(
      THREE.MathUtils.lerp(0, -2.2, Math.min(1, p * 2.2)) + state.pointer.x * 0.9 * z,
      THREE.MathUtils.lerp(0.6, 0.3, p) + state.pointer.y * 0.5 * z,
      THREE.MathUtils.lerp(7.5, 4.2, Math.min(1, p * 2.2)) - 4.3 * z + back
    )
    wantTarget.set(state.pointer.x * 0.45 * z, 0.2 + state.pointer.y * 0.3 * z, 0)

    // Résumé focus: while a résumé block is on screen, fly in to its sticker. The sticker is held
    // left of centre because the résumé text and frosted rail sit on the right.
    const focusId = useStore.getState().focus
    const sticker = focusId ? stickerRefs.get(focusId) : undefined
    const wantF = sticker && !atTop && !useStore.getState().active ? 1 : 0
    focusAmt.current = THREE.MathUtils.lerp(focusAmt.current, wantF, 0.07)
    if (sticker) sticker.getWorldPosition(focusPt)
    const f = focusAmt.current
    if (f > 0.001) {
      tmp.set(focusPt.x + 0.55, focusPt.y + 0.05, focusPt.z + 2.6 + back * 0.6)
      wantPos.lerp(tmp, f)
      tmp.set(focusPt.x + 0.55, focusPt.y, focusPt.z)
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
      <Avatar>
        <Stickers />
      </Avatar>
      <CameraRig />
    </>
  )
}
