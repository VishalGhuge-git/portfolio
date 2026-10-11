// Camera look-around offsets shared by the scene (reads) and the Explore bar (writes).
export const orbit = { yaw: 0, pitch: 0, ty: 0, tp: 0, zoom: 1, tz: 1, down: false, x: 0, y: 0 }

/** Swing round to the front (0) or back (π) of whatever is in view, by the shortest way. */
export function setSide(back: boolean) {
  const k = Math.round((orbit.ty - (back ? Math.PI : 0)) / (2 * Math.PI))
  orbit.ty = k * 2 * Math.PI + (back ? Math.PI : 0)
}
export const isBack = () => Math.abs(Math.sin(orbit.ty / 2)) > 0.7
export function resetView() {
  orbit.ty = 0
  orbit.tp = 0
  orbit.tz = 1
}
