// Ambient background music: an original loop (public/audio/ambient.mp3).
// Browsers block sound until the visitor interacts, so it starts on the first tap, click or key press
// and fades in. The visitor's mute choice is remembered. Tunables are the constants below.
import { useSyncExternalStore } from 'react'

const SRC = `${import.meta.env.BASE_URL}audio/ambient.mp3`
const VOLUME = 0.4 // final element volume (the file itself is already quiet)
const FADE_MS = 1800
const KEY = 'portfolio-music'
const GESTURES = ['pointerup', 'touchend', 'click', 'keydown'] as const

let el: HTMLAudioElement | null = null
let playing = false
let wantOn = readPref() // false once the visitor has muted it
let fadeTimer: number | undefined
const subs = new Set<() => void>()

function readPref(): boolean {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}
function writePref(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode: fine */ }
}
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

let armed = false
function armFirstGesture() {
  if (armed) return
  armed = true
  const on = async (e: Event) => {
    // A tap on the sound button is handled by the button itself.
    if ((e.target as Element | null)?.closest?.('.sound-toggle')) return
    if (!wantOn) return
    if (await start()) GESTURES.forEach((g) => window.removeEventListener(g, on, true))
  }
  GESTURES.forEach((g) => window.addEventListener(g, on, true))
}

/** Call once at app start. */
export function initMusic() {
  if (typeof window === 'undefined' || armed) return
  if (wantOn) {
    audio() // begin buffering
    start().then((ok) => { if (!ok) armFirstGesture() })
  }
  armFirstGesture() // also covers "muted earlier, then turned on": the button calls start() itself
  document.addEventListener('visibilitychange', () => {
    if (!el || !wantOn) return
    if (document.hidden) { el.pause() } else if (playing) { el.play().catch(() => {}) }
  })
}

export function toggleMusic() {
  if (playing) { wantOn = false; writePref(false); stop() }
  else { wantOn = true; writePref(true); start() }
}

export function useMusicPlaying(): boolean {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f) },
    () => playing,
    () => false,
  )
}
