import { motion } from 'framer-motion'
import { WORKS } from '../data/works'
import { useStore } from '../store'
import { track } from '../analytics'

// "AI work I built": a flat road signpost. Each arm is a button that opens a case study.
// The arms come from the `ai-builds` section of src/data/works.ts, so to add or rename one, edit that file.
// Arms alternate: pointing left, pointing right, pointing left, and so on.

const EASE = [0.22, 1, 0.36, 1] as const

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
            aria-label={`Open case study: ${it.name}`}
            onClick={() => {
              track('ai_signpost_click', it.slug)
              setActive(it.slug!)
            }}
          >
            <span className="sign-board">
              <span className="sign-name">{it.name}</span>
              {it.meta && <span className="sign-meta">{it.meta}</span>}
            </span>
          </button>
        ))}
      </div>
    </motion.section>
  )
}
