import { motion } from 'framer-motion'
import { WORKS } from '../data/works'
import { useStore } from '../store'
import { track } from '../analytics'

const EASE = [0.22, 1, 0.36, 1] as const

// "Work" section: one card per project. The card is the pitch (what it does + proof tags);
// the case study popup is the proof (role, Why / How / Outcome, full write-up).
// Mobile-first: one full-width column; on desktop it sits in the right-hand content column.
export default function WorkCards() {
  const setActive = useStore((s) => s.setActive)
  const sections = WORKS.en.sections.filter((s) => s.items && s.items.length)

  return (
    <section className="work" id="work" lang="en" aria-labelledby="work-title">
      <motion.h2
        className="work-title"
        id="work-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        Work
      </motion.h2>
      {sections.map((sec) => (
        <div key={sec.id} className="work-group">
          <h3 className="work-group-title">{sec.title}</h3>
          <ul className="work-list">
            {sec.items!.map((it, i) => (
              <motion.li
                key={it.slug || it.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 3) * 0.06 }}
              >
                <button
                  type="button"
                  className="work-card"
                  aria-label={`Open case study: ${it.name}`}
                  onClick={() => {
                    track('work_card_click', it.slug || it.name)
                    setActive(it.slug || it.name)
                  }}
                >
                  <span className="work-card-name">{it.name}</span>
                  {it.meta && <span className="work-card-line">{it.meta}</span>}
                  {it.tags && it.tags.length > 0 && (
                    <span className="work-card-tags">
                      {it.tags.map((t) => (
                        <span key={t} className="work-tag">
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="work-card-go" aria-hidden="true">
                    Read case study <span className="work-card-arrow">→</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
