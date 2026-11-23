import { useEffect, useRef } from 'react'

// Minimal "Times Square" backdrop behind the 3D avatar: a plain backdrop with one stock-board ticker.
// A marquee just under the top bar, above the avatar's head, on desktop, tablet and phones.
// It fades out once the visitor scrolls past the hero, and stops scrolling for reduced motion.

const ITEMS: [string, string][] = [
  ['IQIGAI', '5,276+ DAILY USERS'],
  ['PM SELECTION', '10% → 50%'],
  ['STAFFING TIME', '−50%'],
  ['MX PLAYER', '56 SHOWS / WEEK'],
  ['FOYR IDEATE', 'MVP IN 5 MO'],
  ['TOTAL ENV', '300+ SCREENS'],
]

function Row() {
  return (
    <span className="tkb-row">
      <span className="tkb-item">
        <i>VISHAL GHUGE · PRODUCT MANAGER</i>
      </span>
      {ITEMS.map(([label, value]) => (
        <span key={label} className="tkb-item">
          <i>{label}</i> <em>▲ {value}</em>
        </span>
      ))}
    </span>
  )
}

export default function TickerBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      // fully visible on the hero, gone by the time the next section arrives
      const o = 1 - Math.min(1, Math.max(0, (window.scrollY - vh * 0.25) / (vh * 0.45)))
      el.style.opacity = String(o)
      el.style.visibility = o === 0 ? 'hidden' : 'visible'
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="tkb" aria-hidden="true">
      <div className="tkb-band" ref={ref}>
        <div className="tkb-track">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  )
}
