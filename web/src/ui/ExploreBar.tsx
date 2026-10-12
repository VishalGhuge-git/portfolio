import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { orbit, resetView, setSide } from '../scene/orbit'
import { TOUR } from '../scene/tour'

type View = 'tour' | 'person' | 'desk' | 'wide'
const STEP_MS = 4600

// Controls for moving round the 3D scene. Explore starts as a guided tour that visits every clickable
// item in a loop (so it is obvious what can be tapped); Prev/Next/Pause steer it, and Vishal / Desk /
// Wide / Back give free views. Explore hides the page text and locks scrolling; Reset (or Esc) puts the
// scroll story back exactly where it was.
export default function ExploreBar() {
  const explore = useStore((s) => s.explore)
  const setExplore = useStore((s) => s.setExplore)
  const active = useStore((s) => s.active)
  const idx = useStore((s) => s.tourIdx)
  const setIdx = useStore((s) => s.setTourIdx)
  const playing = useStore((s) => s.tourPlaying)
  const setPlaying = useStore((s) => s.setTourPlaying)
  const [back, setBack] = useState(false)
  const [nearEnd, setNearEnd] = useState(false)
  const [inHero, setInHero] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('exploring', !!explore)
    return () => document.body.classList.remove('exploring')
  }, [explore])

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setNearEnd(window.scrollY / max > 0.85)
      setInHero(window.scrollY < window.innerHeight * 0.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Tour: the current stop pulses (the scene reads `focus`), and the camera follows tourIdx
  useEffect(() => {
    if (explore === 'tour') useStore.getState().setFocus(TOUR[idx % TOUR.length].id)
    else useStore.getState().setFocus(null)
  }, [explore, idx])

  // Auto-advance, looping; stops while a case study is open or the user has paused
  useEffect(() => {
    if (explore !== 'tour' || !playing || active) return
    const t = window.setInterval(() => setIdx((useStore.getState().tourIdx + 1) % TOUR.length), STEP_MS)
    return () => window.clearInterval(t)
  }, [explore, playing, active, idx, setIdx])

  // When a case study is closed, the tour picks up again by default (only Reset / Free end it)
  useEffect(() => {
    if (!active && useStore.getState().explore === 'tour') setPlaying(true)
  }, [active, setPlaying])

  const exit = () => {
    resetView()
    setBack(false)
    setPlaying(true)
    setExplore(null)
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useStore.getState().explore) exit()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  // the tour card is exactly as wide as the bar under it
  const barRef = useRef<HTMLDivElement>(null)
  const [barW, setBarW] = useState(0)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBarW(Math.round(el.getBoundingClientRect().width)))
    ro.observe(el)
    setBarW(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [explore])
  if (active) return null
  if (!explore) {
    if (nearEnd || inHero) return null
    return (
      <div className="explore-bar idle">
        <button
          className="eb-btn eb-main"
          onClick={() => {
            resetView()
            setIdx(0)
            setPlaying(true)
            setExplore('tour')
          }}
        >
          Explore 3D
        </button>
      </div>
    )
  }

  const go = (v: View) => {
    orbit.tz = 1
    orbit.tp = 0
    orbit.ty = back ? Math.PI : 0
    if (v === 'tour') setPlaying(true)
    setExplore(v)
  }
  const step = (d: number) => {
    // Prev/Next just jump; the tour keeps playing from the new stop
    setIdx((idx + d + TOUR.length) % TOUR.length)
  }
  const btn = (v: View, label: string) => (
    <button className={`eb-btn${explore === v ? ' on' : ''}`} onClick={() => go(v)}>
      {label}
    </button>
  )
  const stop = TOUR[idx % TOUR.length]
  return (
    <>
      {explore === 'tour' && (
        <button
          className={`tour-caption${stop.me ? ' is-me' : ''}`}
          style={barW ? { width: barW, minWidth: 0 } : undefined}
          key={stop.id}
          aria-live="polite"
          disabled={!!stop.me}
          onClick={() => {
            if (stop.slug) useStore.getState().setActive(stop.slug)
            else if (stop.scrollTo) {
              exit()
              window.setTimeout(() => document.getElementById(stop.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 80)
            }
          }}
        >
          <span className="tc-top">
            <span className="tc-name">{stop.name}</span>
            {stop.year && <span className="tc-year">{stop.year}</span>}
          </span>
          <span className="tc-sub">{stop.sub}</span>
          {stop.blurb && <span className="tc-blurb">{stop.blurb}</span>}
          <span className="tc-bot">
            <span className="tc-tap">{stop.me ? 'Meet Vishal' : stop.slug ? 'Open case study →' : 'See education →'}</span>
            <span className="tc-stat">{playing ? 'Auto' : 'Paused'} · {(idx % TOUR.length) + 1}/{TOUR.length}</span>
          </span>
        </button>
      )}
      <div className="explore-bar" role="toolbar" aria-label="3D view" ref={barRef}>
        {explore === 'tour' ? (
          <>
            <button className="eb-btn eb-arrow" onClick={() => step(-1)} aria-label="Previous">‹</button>
            <span className={`eb-dots${playing ? '' : ' paused'}`} aria-hidden="true">
              {TOUR.map((t, i) => (
                <i key={i === idx % TOUR.length ? `${t.id}-${playing}` : t.id} className={i === idx % TOUR.length ? 'on' : ''} />
              ))}
            </span>
            <button className="eb-btn eb-arrow" onClick={() => step(1)} aria-label="Next">›</button>
            <button className="eb-btn eb-play" onClick={() => setPlaying(!playing)}>
              <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                {playing ? <path d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z" fill="currentColor" /> : <path d="M3 1.5l7 4.5-7 4.5z" fill="currentColor" />}
              </svg>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button className="eb-btn" onClick={() => go('person')}>Free</button>
          </>
        ) : (
          <>
            {btn('tour', 'Tour')}
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
          </>
        )}
        <button className="eb-btn eb-reset" onClick={exit}>
          Reset
        </button>
      </div>
    </>
  )
}
