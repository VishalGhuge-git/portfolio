// Ambient background music: an original loop (public/audio/ambient.mp3).
// Off by default: nothing is downloaded or played until the visitor presses the sound button.
// Tunables are the constants below.
import { useSyncExternalStore } from 'react'

const SRC = `${import.meta.env.BASE_URL}audio/ambient.mp3`
const VOLUME = 0.4 // final element volume (the file itself is already quiet)
const FADE_MS = 1800

let el: HTMLAudioElement | null = null
let playing = false
let fadeTimer: number | undefined
const subs = new Set<() => void>()

function emit() { subs.forEach((f) => f()) }

function audio(): HTMLAudioElement {
  if (!el) {
    el = new Audio(SRC)
    el.loop = true
    el.preload = 'auto'
    el.volume = 0
  }
  return el
}

function fadeTo(target: number, done?: () => void) {
  const a = audio()
  window.clearInterval(fadeTimer)
  const from = a.volume
  const t0 = performance.now()
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / FADE_MS)
    a.volume = Math.max(0, Math.min(1, from + (target - from) * k))
    if (k >= 1) { window.clearInterval(fadeTimer); done?.() }
  }, 50)
}

async function start(): Promise<boolean> {
  try {
    await audio().play()
    playing = true
    fadeTo(VOLUME)
    emit()
    return true
  } catch {
    return false // blocked until a gesture
  }
}

function stop() {
  playing = false
  emit()
  fadeTo(0, () => audio().pause())
}

/** Kept so main.tsx needs no change: only pauses playback while the tab is hidden. */
export function initMusic() {
  if (typeof window === 'undefined') return
  document.addEventListener('visibilitychange', () => {
    if (!el) return
    if (document.hidden) { el.pause() } else if (playing) { el.play().catch(() => {}) }
  })
}

export function toggleMusic() {
  if (playing) stop()
  else start()
}

export function useMusicPlaying(): boolean {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f) },
    () => playing,
    () => false,
  )
}
