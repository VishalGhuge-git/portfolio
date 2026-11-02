// Light / dark theme. Dark is the default (the 3D scene was designed for it); a visitor's choice is
// remembered in this browser. index.html applies the saved theme before the page paints, so there is no flash.
import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'
const KEY = 'theme'
const subs = new Set<() => void>()

function read(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(t: Theme) {
  const root = document.documentElement
  root.classList.add('theme-anim')
  window.setTimeout(() => root.classList.remove('theme-anim'), 400)
  root.dataset.theme = t
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t === 'light' ? '#eef1f5' : '#0a0e16')
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  subs.forEach((f) => f())
}

export function toggleTheme() {
  setTheme(read() === 'light' ? 'dark' : 'light')
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    read,
    () => 'dark',
  )
}
