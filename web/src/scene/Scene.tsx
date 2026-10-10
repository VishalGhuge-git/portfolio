import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Avatar from './Avatar'
import Stickers from './Stickers'
import { useStore } from '../store'

// Hero scene: gradient backdrop, lights, the clay bust (Bust.tsx) wearing project stickers
// (Stickers.tsx), and a camera that moves with page scroll.
// Phase 2: swap <Bust /> for a real avatar (glb) if wanted; the stickers and camera carry over.

// Vertical gradient backdrop (sage -> sand), wraps the camera
function GradientBackground() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#6f906f') },
      uBottom: { value: new THREE.Color('#dbd3b5') },
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
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
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
  useFrame((state) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const p = Math.min(1, Math.max(0, window.scrollY / max))
    const cam = state.camera

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
      THREE.MathUtils.lerp(7.5, 4.2, Math.min(1, p * 2.2)) - 4.3 * z
    )
    cam.position.lerp(wantPos, 0.08)
    wantTarget.set(state.pointer.x * 0.45 * z, 0.2 + state.pointer.y * 0.3 * z, 0)
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
