import { useEffect, useRef } from 'react'
import { useTheme, type Theme } from '../theme'

// Pixel-art Mumbai behind the 3D avatar: skyline with flickering windows, the sea link, a local train
// crossing and reflections on the sea. Drawn on a small canvas and scaled up with crisp pixels, so it is
// cheap on phones. It redraws about 10 times a second, pauses with the tab, and stays still for visitors
// who prefer reduced motion. Night palette in dark mode, dusk palette in light mode.

const PIXEL = 4 // one art pixel = 4 screen pixels
const FPS = 10

interface Palette {
  sky: [string, string, string]
  stars: boolean
  orb: string
  orbSize: number
  far: string
  near: string
  win: [string, string]
  litChance: number
  bridge: string
  sea: string
  glints: [string, string]
  train: string
  trainWin: string
}
const PALETTES: Record<Theme, Palette> = {
  dark: {
    sky: ['#0b0f2a', '#2a1d4a', '#5a2e5c'],
    stars: true,
    orb: '#fff3c4',
    orbSize: 8,
    far: '#1d1f44',
    near: '#141633',
    win: ['#ffcf7a', '#ffe9b8'],
    litChance: 0.45,
    bridge: '#8a7bd1',
    sea: '#0d1030',
    glints: ['rgba(255,207,122,0.35)', 'rgba(138,123,209,0.35)'],
    train: '#c9d2ff',
    trainWin: '#ffcf7a',
  },
  light: {
    sky: ['#86a3cf', '#c7bedd', '#f5d2bb'],
    stars: false,
    orb: '#fff4d6',
    orbSize: 12,
    far: '#9aa6c4',
    near: '#6d7898',
    win: ['#ffe2a0', '#fff0c8'],
    litChance: 0.12,
    bridge: '#56627f',
    sea: '#7d94bb',
    glints: ['rgba(255,255,255,0.45)', 'rgba(255,226,160,0.4)'],
    train: '#eef1f8',
    trainWin: '#56627f',
  },
}

interface Building {
  x: number
  w: number
  h: number
  lit: boolean[]
}

function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function makeSkyline(w: number, h: number, seed: number, minH: number, spread: number, litChance: number): Building[] {
  const rnd = rng(seed)
  const out: Building[] = []
  let x = -((rnd() * 6) | 0)
  while (x < w) {
    const bw = 6 + ((rnd() * 10) | 0)
    out.push({ x, w: bw, h: h * (minH + rnd() * spread), lit: Array.from({ length: 240 }, () => rnd() < litChance) })
    x += bw + 1
  }
  return out
}

function draw(c: CanvasRenderingContext2D, w: number, h: number, t: number, p: Palette, far: Building[], near: Building[]) {
  const sky = c.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, p.sky[0])
  sky.addColorStop(0.6, p.sky[1])
  sky.addColorStop(0.78, p.sky[2])
  c.fillStyle = sky
  c.fillRect(0, 0, w, h)

  if (p.stars) {
    c.fillStyle = '#e8e6ff'
    for (let i = 0; i < 48; i++) if ((i * 7 + ((t * 1.5) | 0)) % 13) c.fillRect((i * 53) % w, (i * 29) % (h * 0.45), 1, 1)
  }
  // moon (night) or low sun (dusk), right of the avatar
  const ox = Math.round(w * 0.8)
  const oy = Math.round(h * 0.13)
  const s = p.orbSize
  c.fillStyle = p.orb
  c.fillRect(ox, oy, s, s)
  c.fillRect(ox - 1, oy + 1, s + 2, s - 2)
  c.fillRect(ox + 1, oy - 1, s - 2, s + 2)

  const sea = Math.round(h * 0.78)
  const skyline = (list: Building[], body: string, windows: boolean) => {
    for (const b of list) {
      c.fillStyle = body
      c.fillRect(b.x, Math.round(sea - b.h), b.w, Math.round(b.h))
      if (!windows) continue
      let k = 0
      for (let yy = Math.round(sea - b.h) + 2; yy < sea - 2; yy += 3)
        for (let xx = b.x + 1; xx < b.x + b.w - 1; xx += 2) {
          k++
          const flick = ((t * 0.6 + k * 3.1) | 0) % 41 === 0
          if (b.lit[k % 240] !== flick) {
            c.fillStyle = k % 5 ? p.win[0] : p.win[1]
            c.fillRect(xx, yy, 1, 1)
          }
        }
    }
  }
  skyline(far, p.far, false)
  skyline(near, p.near, true)

  // sea link: deck and two cable-stayed towers
  c.fillStyle = p.bridge
  c.fillRect(0, sea - 6, w, 1)
  for (const px of [Math.round(w * 0.27), Math.round(w * 0.64)]) {
    c.fillRect(px, sea - 26, 2, 20)
    for (let d = 1; d < 14; d++) {
      c.fillRect(px - d * 2, Math.round(sea - 26 + d * 1.4), 1, 1)
      c.fillRect(px + 1 + d * 2, Math.round(sea - 26 + d * 1.4), 1, 1)
    }
  }
  // local train crossing the bridge
  const tx = Math.round(((t * 16) % (w + 40)) - 40)
  c.fillStyle = p.train
  c.fillRect(tx, sea - 9, 30, 3)
  c.fillStyle = p.trainWin
  for (let j = 0; j < 30; j += 4) c.fillRect(tx + j + 1, sea - 8, 2, 1)

  // sea with drifting reflections
  c.fillStyle = p.sea
  c.fillRect(0, sea, w, h - sea)
  for (let i = 0; i < 70; i++) {
    c.fillStyle = i % 3 ? p.glints[0] : p.glints[1]
    c.fillRect(Math.round((i * 37 + t * 5) % w), sea + 2 + ((i * 13) % Math.max(1, h - sea - 2)), 3, 1)
  }
}

export default function CityBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const pal = PALETTES[theme]
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let far: Building[] = []
    let near: Building[] = []
    const size = () => {
      cv.width = Math.ceil(window.innerWidth / PIXEL)
      cv.height = Math.ceil(window.innerHeight / PIXEL)
      far = makeSkyline(cv.width, cv.height, 11, 0.24, 0.22, 0)
      near = makeSkyline(cv.width, cv.height, 7, 0.14, 0.3, pal.litChance)
      draw(ctx, cv.width, cv.height, performance.now() / 1000, pal, far, near)
    }
    size()
    window.addEventListener('resize', size)
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / FPS) return
      last = now
      draw(ctx, cv.width, cv.height, now / 1000, pal, far, near)
    }
    if (!still) raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
    }
  }, [theme])
  return <canvas ref={ref} className="city-backdrop" aria-hidden="true" />
}
