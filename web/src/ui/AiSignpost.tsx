import { motion } from 'framer-motion'
import { WORKS } from '../data/works'
import { useStore } from '../store'
import { track } from '../analytics'

// "AI work I built": a flat, wooden road signpost. Each arm is a button that opens a case study.
// The arms come from the `ai-builds` section of src/data/works.ts, so to add or rename one, edit that file.
// Arms alternate left and right. Icons are picked by slug below (unknown slugs get a sparkle).

const EASE = [0.22, 1, 0.36, 1] as const

const ICONS: Record<string, JSX.Element> = {
  // checklist: MCQ practice
  'pmpo-portal': (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17" />
    </>
  ),
  // envelope: daily email
  'indian-market-brief': (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  // film frame with play button: animated video
  'garu-animated-video': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m10 9.2 5 2.8-5 2.8z" fill="currentColor" />
    </>
  ),
}
const SPARKLE = <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />

export default function AiSignpost() {
  const setActive = useStore((s) => s.setActive)
  const section = WORKS.en.sections.find((s) => s.id === 'ai-builds')
  const items = (section?.items ?? []).filter((it) => it.slug)
  if (!section || items.length === 0) return null

  return (
    <motion.section
      className="aiwork"
      id="ai-work"
      lang="en"
      aria-labelledby="aiwork-title"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h2 className="aiwork-title" id="aiwork-title">
        {section.title}
      </h2>
      <p className="aiwork-sub">Pick a direction</p>
      <div className="signpost" role="list">
        <span className="signpost-post" aria-hidden="true" />
        {items.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            role="listitem"
            className={`sign-arm ${i % 2 === 0 ? 'to-left' : 'to-right'} tone-${i % 3}`}
            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
            aria-label={`Open case study: ${it.name}`}
            onClick={() => {
              track('ai_signpost_click', it.slug)
              setActive(it.slug!)
            }}
          >
            <span className="sign-board">
              <span className="sign-face">
                <span className="sign-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[it.slug!] ?? SPARKLE}
                  </svg>
                </span>
                <span className="sign-text">
                  <span className="sign-name">{it.name}</span>
                  {it.meta && <span className="sign-meta">{it.meta}</span>}
                </span>
                <span className="sign-go" aria-hidden="true">Open</span>
              </span>
            </span>
          </button>
        ))}
        <span className="signpost-ground" aria-hidden="true" />
      </div>
    </motion.section>
  )
}
