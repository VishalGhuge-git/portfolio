import { useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHead } from './WorkCards'
import { RECOGNITION, type Recognition } from '../data/recognition'
import { LINKEDIN_URL } from './ContactModal'
import { useStore } from '../store'
import { track } from '../analytics'

const EASE = [0.22, 1, 0.36, 1] as const
const CV_URL = `${import.meta.env.BASE_URL}Vishal_Ghuge_CV.pdf`

// "About me": who I am and why the side builds exist. Draft copy, sourced from the CV and case studies.
export function About() {
  return (
    <section className="work about-me" id="about" lang="en" aria-labelledby="about-title">
      <SectionHead num="03" label="About" id="about-title" title="About me" sub="From operations to product to AI." />
      <motion.div
        className="about-me-body"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="about-me-lead">I care about the moment a product becomes part of someone’s day.</p>
        <p>
          My first job was running content operations at Amazon MX Player, with real backlogs, deadlines and people
          waiting. It taught me a product only matters if it works every day. Since then I’ve turned CXO asks into a
          300+ screen design tool and an AI MVP at Foyr, and now lead iqigai, an AI staffing platform we built from
          scratch at Fractal.
        </p>
        <div className="about-me-actions">
          <a className="about-me-btn is-primary" href={CV_URL} download="Vishal_Ghuge_CV.pdf" onClick={() => track('cv_download', 'about')}>
            Download CV
          </a>
          <a className="about-me-btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('linkedin', 'about')}>
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
      </motion.div>
    </section>
  )
}

function Quote({ r }: { r: Recognition }) {
  return (
    <figure className={`kind-card${r.kind === 'letter' ? ' is-letter' : ''}`}>
      {r.kind === 'letter' && <span className="kind-badge">Letter of appreciation</span>}
      <blockquote>“{r.quote}”</blockquote>
      <figcaption>
        <b>{r.name}</b>
        <span>{r.role}</span>
        <em>{r.context}</em>
      </figcaption>
    </figure>
  )
}

// "Recommendations": the CEO letter and work recommendations first; classmates behind "Show more".
export function KindWords() {
  const [more, setMore] = useState(false)
  const featured = RECOGNITION.filter((r) => r.featured)
  const rest = RECOGNITION.filter((r) => !r.featured)
  return (
    <section className="work kind" id="kind-words" lang="en" aria-labelledby="kind-title">
      <SectionHead num="04" id="kind-title" title="Recommendations" sub="From people I’ve worked and studied with." />
      <div className="kind-list">
        {featured.map((r) => (
          <Quote key={r.name} r={r} />
        ))}
        {more && rest.map((r) => <Quote key={r.name} r={r} />)}
      </div>
      {rest.length > 0 && (
        <button
          type="button"
          className="kind-more"
          aria-expanded={more}
          onClick={() => {
            track('kind_more', more ? 'less' : 'more')
            setMore((v) => !v)
          }}
        >
          {more ? 'Show less' : `Show ${rest.length} more`}
        </button>
      )}
    </section>
  )
}
