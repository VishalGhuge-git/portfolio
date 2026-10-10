import * as THREE from 'three'

// Shared description of the clay head, so the head mesh, face parts and stickers all sit on
// exactly the same surface. Angles: theta = turn left/right from the front (+ is the character's
// left on screen-right), phi = elevation above the eye line (+ is up).

const { smoothstep, clamp } = THREE.MathUtils

// Centre of the head in the bust's local space
export const HEAD_CENTER_Y = 0.2

// Unit direction from (theta, phi)
export function dirFromAngles(theta: number, phi: number, out = new THREE.Vector3()) {
  const c = Math.cos(phi)
  return out.set(Math.sin(theta) * c, Math.sin(phi), Math.cos(theta) * c)
}

// Head surface point for a unit direction: an ellipsoid with a narrower jaw, a soft chin and a
// little cheek fullness. Keep these numbers gentle; the clay look comes from soft, simple forms.
export function headPoint(dx: number, dy: number, dz: number, out = new THREE.Vector3()) {
  const t = clamp(-dy, 0, 1) // 0 at the eye line, 1 at the chin
  const cheek = 0.04 * Math.exp(-(((dy + 0.2) / 0.32) ** 2))
  const xs = 1 - 0.22 * Math.pow(t, 1.4) + cheek
  const zs = 1 - 0.05 * t
  const chin = smoothstep(t, 0.3, 0.95) * Math.max(dz, 0) // front-bottom only
  return out.set(dx * xs, dy * 1.12 - 0.1 * chin, dz * zs + 0.04 * chin)
}

const _d = new THREE.Vector3()
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _c = new THREE.Vector3()

// Surface position and outward normal at (theta, phi), measured numerically
export function surfaceFrame(theta: number, phi: number) {
  const e = 0.01
  const p = new THREE.Vector3()
  dirFromAngles(theta, phi, _d)
  headPoint(_d.x, _d.y, _d.z, p)
  dirFromAngles(theta + e, phi, _d)
  headPoint(_d.x, _d.y, _d.z, _a)
  dirFromAngles(theta, phi + e, _d)
  headPoint(_d.x, _d.y, _d.z, _b)
  _a.sub(p)
  _b.sub(p)
  const normal = _c.crossVectors(_a, _b).normalize().clone()
  return { position: p, normal }
}

// Quaternion that turns +Z to face along a normal
export function faceNormal(normal: THREE.Vector3, spin = 0) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  if (spin) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), spin))
  return q
}

// Hair: 0 = skin, 1 = hair, with a narrow soft edge. The hairline sits high on the forehead,
// drops over the ears, and runs low at the back, with small sideburns.
export function hairMask(theta: number, phi: number) {
  const a = Math.abs(theta)
  let hairline = 0.58 - 0.28 * smoothstep(a, 0.5, 1.7) - 0.8 * smoothstep(a, 1.9, 2.8)
  hairline -= 0.2 * Math.exp(-(((a - 1.1) / 0.14) ** 2)) // short sideburns
  return smoothstep(phi - hairline, -0.045, 0.045)
}

// How far hair stands off the scalp: an even layer plus a swept quiff above the forehead
export function hairThickness(theta: number, phi: number, mask: number) {
  const quiff = 0.22 * Math.exp(-(((theta - 0.12) / 0.55) ** 2 + ((phi - 0.75) / 0.3) ** 2))
  const crown = 0.05 * smoothstep(phi, 0.2, 1.2)
  return mask * (0.045 + crown + quiff)
}
