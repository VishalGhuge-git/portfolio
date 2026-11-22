import { useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHead } from './WorkCards'
import { RECOGNITION, type Recognition } from '../data/recognition'
import { LINKEDIN_URL } from './ContactModal'
import { useStore } from '../store'
import { track } from '../analytics'

const EASE = [0.22, 1, 0.36, 1] as const
const CV_URL = `${import.meta.env.BASE_URL}Vishal_Ghuge_CV.pdf`

// Inline link that opens a case study (used inside About copy)
function CaseLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  const setActive = useStore((s) => s.setActive)
  return (
    <a
      className="inline-case"
      href={`#${slug}`}
      onClick={(e) => {
        e.preventDefault()
        track('about_case', slug)
        setActive(slug)
      }}
    >
      {children}
    </a>
  )
}

// "About me": who I am and why the side builds exist. Draft copy, sourced from the CV and case studies.
export function About() {
  return (
    <section className="work about-me" id="about" lang="en" aria-labelledby="about-title">
      <SectionHead id="about-title" title="About me" sub="Who I am and why I build." />
      <motion.div
        className="about-me-body"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="about-me-lead">
          I’m Vishal, a product manager in Mumbai. I take vague asks and turn them into products people use every day.
        </p>
        <p>
          I started in content operations at Amazon MX Player, moved into B2B and B2C SaaS at Foyr, and now build
          AI-native products at Fractal. I’m not an engineer, but I build with AI tools, so I can test an idea before
          asking anyone to build it.
        </p>
        <p>
          Most of my side builds started with a problem I saw up close. My family kept asking me what happened in the
          market, so I built a <CaseLink slug="indian-market-brief">morning brief that cross-checks every number</CaseLink>.
          When I prepared for SAFe POPM, I built <CaseLink slug="pmpo-portal">my own practice platform</CaseLink> and
          passed with 100%. And in Fractal’s AI Fluency Program I built ExpenseFlow, an expense approval API, for a
          certificate in AI-assisted coding.
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

// "Kind words": the CEO letter and work recommendations first; classmates behind "Show more".
export function KindWords() {
  const [more, setMore] = useState(false)
  const featured = RECOGNITION.filter((r) => r.featured)
  const rest = RECOGNITION.filter((r) => !r.featured)
  return (
    <section className="work kind" id="kind-words" lang="en" aria-labelledby="kind-title">
      <SectionHead id="kind-title" title="Kind words" sub="From people I’ve worked and studied with." />
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
