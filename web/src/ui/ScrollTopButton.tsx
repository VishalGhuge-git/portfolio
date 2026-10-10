import { useEffect, useRef, useState, type RefObject } from 'react'
import { track } from '../analytics'

// "Back to top" that shows up when you scroll UP after being well down a long page or panel, so it is
// right under your thumb or cursor exactly when you want it, and out of the way while you read down.
// Use it for any long scroll area: pass `containerRef` for an inner scroller, omit it for the page.
export default function ScrollTopButton({
  containerRef,
  minDepth,
  hidden = false,
  className = '',
}: {
  containerRef?: RefObject<HTMLElement | null>
  minDepth?: number // px scrolled before it may appear (default: 1.2 screens for the page, 400 for a panel)
  hidden?: boolean
  className?: string
}) {
  const [show, setShow] = useState(false)
  const hover = useRef(false)

  useEffect(() => {
    const el = containerRef?.current ?? null
    const target: HTMLElement | Window = el ?? window
    const pos = () => (el ? el.scrollTop : window.scrollY)
    const min = () => minDepth ?? (el ? 400 : window.innerHeight * 1.2)
    let last = pos()
    let timer = 0
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (!hover.current) setShow(false)
      }, 3500)
    }
    const onScroll = () => {
      const y = pos()
      const dy = y - last
      last = y
      if (y < min()) {
        setShow(false)
        return
      }
      if (dy < -6) {
        setShow(true)
        arm()
      } else if (dy > 6 && !hover.current) {
        setShow(false)
      }
    }
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [containerRef, minDepth])

  const visible = show && !hidden
  const goTop = () => {
    track('back_to_top')
    const el = containerRef?.current
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    setShow(false)
  }

  return (
    <button
      className={`to-top${visible ? ' is-on' : ''} ${className}`}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
      onClick={goTop}
    >
      <span aria-hidden="true">↑</span>
      <em>Back to top</em>
    </button>
  )
}
