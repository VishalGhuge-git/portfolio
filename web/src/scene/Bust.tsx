import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  HEAD_CENTER_Y,
  faceNormal,
  hairMask,
  hairThickness,
  headPoint,
  surfaceFrame,
} from './headShape'

// Soft clay cartoon bust, built from code (no external assets).
// Everything tweakable lives in the constants below.

const C = {
  skin: '#e2a888',
  skinDeep: '#d58f78', // nose
  hair: '#2a211e',
  hairLight: '#54423a', // highlight on the quiff
  iris: '#5a3a22',
  mouth: '#7a3b32',
  blush: '#e58b7d',
  shirt: '#2f4160',
  collar: '#43577a',
  headTurn: 0.25, // how far the head turns toward the cursor (radians)
  headTilt: 0.15,
  eyeRadius: 0.16,
  eyeTheta: 0.34,
  eyePhi: 0.1,
  blinkEvery: [2.5, 5] as [number, number], // seconds between blinks
  blinkLength: 0.16, // seconds
  curious: 0.03, // how much higher the right brow sits than the left
}

// One mesh for skin and hair: the hair is the same surface pushed outward and coloured darker,
// so there is no seam between them.
function useHeadGeometry() {
  return useMemo(() => {
    let g: THREE.BufferGeometry = new THREE.SphereGeometry(1, 160, 120)
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    g = mergeVertices(g, 1e-4) // weld the seam so normals stay smooth

    const pos = g.getAttribute('position')
    const colors = new Float32Array(pos.count * 3)
    const skin = new THREE.Color(C.skin)
    const hair = new THREE.Color(C.hair)
    const hairLight = new THREE.Color(C.hairLight)
    const d = new THREE.Vector3()
    const p = new THREE.Vector3()
    const col = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
      const theta = Math.atan2(d.x, d.z)
      const phi = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1))
      headPoint(d.x, d.y, d.z, p)
      const m = hairMask(theta, phi)
      const h = hairThickness(theta, phi, m)
      p.addScaledVector(d, h)
      pos.setXYZ(i, p.x, p.y, p.z)
      col.copy(skin).lerp(hair, m)
      // lighten the thickest hair so the quiff reads as a shape, not a flat cap
      col.lerp(hairLight, THREE.MathUtils.clamp((h - 0.07) / 0.2, 0, 1) * m)
      colors.set([col.r, col.g, col.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

// A tube that follows points laid on the head surface, lifted slightly off it
function surfaceTube(
  pts: [number, number][],
  lift: number,
  radius: number,
  segments = 24
): THREE.TubeGeometry {
  const points = pts.map(([theta, phi]) => {
    const f = surfaceFrame(theta, phi)
    return f.position.addScaledVector(f.normal, lift)
  })
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 10, false)
}

// Eyebrow arch for one side. side = +1 right on screen, -1 left.
function browPoints(side: number, raise: number): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    const phi = 0.32 + 0.05 * Math.sin(Math.PI * t) + 0.03 * t + raise
    out.push([side * (0.14 + 0.44 * t), phi])
  }
  return out
}

function Eye({ side, blink }: { side: number; blink: { current: number } }) {
  const group = useRef<THREE.Group>(null)
  const look = useRef<THREE.Group>(null)

  const { position } = useMemo(() => {
    const f = surfaceFrame(side * C.eyeTheta, C.eyePhi)
    // sink the eye a little so only its front bulges out of the head
    return { position: f.position.addScaledVector(f.normal, -0.045) }
  }, [side])

  const target = useMemo(() => new THREE.Vector3(), [])
  const z = useMemo(() => new THREE.Vector3(0, 0, 1), [])

  useFrame((state) => {
    if (group.current) group.current.scale.y = blink.current
    if (look.current) {
      // pupils follow the cursor, limited to what an eye can really do
      target.set(state.pointer.x * 0.6, state.pointer.y * 0.5, 1).normalize()
      look.current.quaternion.setFromUnitVectors(z, target)
    }
  })

  const R = C.eyeRadius
  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[R, 32, 24]} />
        <meshStandardMaterial color="#fbf8f1" roughness={0.35} />
      </mesh>
      <group ref={look}>
        <mesh position={[0, 0, R * 0.93]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[R * 0.58, 24, 16]} />
          <meshStandardMaterial color={C.iris} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, R * 0.99]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[R * 0.3, 20, 14]} />
          <meshStandardMaterial color="#0b0b0b" roughness={0.3} />
        </mesh>
        <mesh position={[R * 0.16, R * 0.18, R * 1.02]}>
          <sphereGeometry args={[R * 0.1, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

export default function Bust({ children }: { children?: ReactNode }) {
  const head = useRef<THREE.Group>(null)
  const shoulders = useRef<THREE.Mesh>(null)
  const blink = useRef(1)
  const blinkState = useRef({ next: 2.2, start: -1 })

  const headGeo = useHeadGeometry()

  const parts = useMemo(() => {
    const noseF = surfaceFrame(0, -0.08)
    const mouth: [number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * 2 - 1 // -1..1
      mouth.push([t * 0.3, -0.38 + 0.1 * t * t]) // ends rise: a soft smile
    }
    const mouthEnds = [mouth[0], mouth[mouth.length - 1]].map(([th, ph]) => {
      const f = surfaceFrame(th, ph)
      return f.position.addScaledVector(f.normal, 0.012)
    })
    const blushes = [-1, 1].map((s) => {
      const f = surfaceFrame(s * 0.55, -0.15)
      return {
        pos: f.position.clone().addScaledVector(f.normal, 0.012),
        quat: faceNormal(f.normal),
      }
    })
    return {
      nose: {
        pos: noseF.position.clone().addScaledVector(noseF.normal, 0.075),
        quat: faceNormal(noseF.normal),
      },
      browL: surfaceTube(browPoints(-1, 0), 0.015, 0.03),
      browR: surfaceTube(browPoints(1, C.curious), 0.015, 0.03),
      mouth: surfaceTube(mouth, 0.012, 0.022, 28),
      mouthEnds,
      blushes,
    }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // head follows the cursor
    const { x, y } = state.pointer
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, x * C.headTurn, 0.06)
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -y * C.headTilt, 0.06)
    }

    // idle breathing
    if (shoulders.current) shoulders.current.scale.y = 0.9 * (1 + Math.sin(t * 1.6) * 0.012)

    // blink every few seconds
    const b = blinkState.current
    let k = 1
    if (b.start < 0 && t > b.next) b.start = t
    if (b.start >= 0) {
      const u = (t - b.start) / C.blinkLength
      if (u >= 1) {
        b.start = -1
        b.next = t + C.blinkEvery[0] + Math.random() * (C.blinkEvery[1] - C.blinkEvery[0])
      } else {
        k = 1 - 0.92 * Math.sin(Math.PI * u)
      }
    }
    blink.current = k
  })

  return (
    <group>
      {/* shoulders and shirt */}
      <mesh ref={shoulders} position={[0, -1.95, 0]} scale={[1.75, 0.9, 0.95]}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color={C.shirt} roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.07, 0.02]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
        <torusGeometry args={[0.46, 0.09, 16, 40]} />
        <meshStandardMaterial color={C.collar} roughness={0.9} />
      </mesh>
      {/* neck */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.33, 0.38, 0.7, 32]} />
        <meshStandardMaterial color={C.skin} roughness={0.85} />
      </mesh>

      <group ref={head} position={[0, HEAD_CENTER_Y, 0]}>
        {/* head + hair */}
        <mesh geometry={headGeo}>
          <meshStandardMaterial vertexColors roughness={0.85} />
        </mesh>

        {/* ears */}
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 0.97, -0.06, -0.06]}
            rotation={[0, 0, s * 0.15]}
            scale={[0.45, 1, 0.75]}
          >
            <sphereGeometry args={[0.2, 24, 18]} />
            <meshStandardMaterial color={C.skin} roughness={0.85} />
          </mesh>
        ))}

        {/* eyes */}
        <Eye side={-1} blink={blink} />
        <Eye side={1} blink={blink} />

        {/* brows: the right one sits a touch higher, a curious look */}
        <mesh geometry={parts.browL}>
          <meshStandardMaterial color={C.hair} roughness={0.9} />
        </mesh>
        <mesh geometry={parts.browR}>
          <meshStandardMaterial color={C.hair} roughness={0.9} />
        </mesh>

        {/* nose */}
        <mesh position={parts.nose.pos} quaternion={parts.nose.quat} scale={[0.85, 1.1, 0.9]}>
          <sphereGeometry args={[0.14, 24, 18]} />
          <meshStandardMaterial color={C.skinDeep} roughness={0.8} />
        </mesh>

        {/* smile */}
        <mesh geometry={parts.mouth}>
          <meshStandardMaterial color={C.mouth} roughness={0.7} />
        </mesh>
        {parts.mouthEnds.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshStandardMaterial color={C.mouth} roughness={0.7} />
          </mesh>
        ))}

        {/* cheeks */}
        {parts.blushes.map((b, i) => (
          <mesh key={i} position={b.pos} quaternion={b.quat}>
            <circleGeometry args={[0.12, 32]} />
            <meshBasicMaterial
              color={C.blush}
              transparent
              opacity={0.4}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* stickers ride on the head so they turn with it */}
        {children}
      </group>
    </group>
  )
}
