import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { orbit, resetView, setSide } from '../scene/orbit'

// Small control bar for moving round the 3D scene: Vishal / Desk / Wide views, Front-Back flip, Reset.
// Entering explore mode hides the page text and locks scrolling so the scene is free to move in;
// Reset (or Esc) puts the scroll story back exactly where it was.
export default function ExploreBar() {
  const explore = useStore((s) => s.explore)
  const setExplore = useStore((s) => s.setExplore)
  const active = useStore((s) => s.active)
  const [back, setBack] = useState(false)
  const [nearEnd, setNearEnd] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('exploring', !!explore)
    return () => document.body.classList.remove('exploring')
  }, [explore])

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setNearEnd(window.scrollY / max > 0.85)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const exit = () => {
    resetView()
    setBack(false)
    setExplore(null)
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useStore.getState().explore) exit()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  if (active) return null
  if (!explore) {
    if (nearEnd) return null
    return (
      <div className="explore-bar idle">
        <button className="eb-btn eb-main" onClick={() => { resetView(); setExplore('person') }}>
          Explore 3D
        </button>
      </div>
    )
  }
  const go = (v: 'person' | 'desk' | 'wide') => {
    orbit.tz = 1
    orbit.tp = 0
    setExplore(v)
  }
  const btn = (v: 'person' | 'desk' | 'wide', label: string) => (
    <button className={`eb-btn${explore === v ? ' on' : ''}`} onClick={() => go(v)}>
      {label}
    </button>
  )
  return (
    <div className="explore-bar" role="toolbar" aria-label="3D view">
      {btn('person', 'Vishal')}
      {btn('desk', 'Desk')}
      {btn('wide', 'Wide')}
      <button
        className="eb-btn"
        onClick={() => {
          setSide(!back)
          setBack(!back)
        }}
      >
        {back ? 'Front' : 'Back'}
      </button>
      <button className="eb-btn eb-reset" onClick={exit}>
        Reset
      </button>
    </div>
  )
}
