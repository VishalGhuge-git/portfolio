import { useEffect, useRef } from 'react'

// Minimal "Times Square" backdrop behind the 3D avatar: a plain backdrop with one stock-board ticker.
// A marquee just under the top bar, above the avatar's head, on desktop, tablet and phones.
// It fades out once the visitor scrolls past the hero, and stops scrolling for reduced motion.

// Who Vishal has worked and studied with: new information, so the numbers appear only once on the page
const NAMES = ['FRACTAL ANALYTICS', 'FOYR', 'AMAZON MX PLAYER', 'TOTAL ENVIRONMENT', 'SDA BOCCONI', 'ST. XAVIER’S COLLEGE']

function Row() {
  return (
    <span className="tkb-row">
      <span className="tkb-item">
        <i>WORKED WITH</i>
      </span>
      {NAMES.map((n) => (
        <span key={n} className="tkb-item">
          <em>●</em> <i>{n}</i>
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
