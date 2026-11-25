import { Fragment, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'

// Résumé timeline, English only. Source: Vishal_Ghuge_CV_updated.pdf
// To add or edit an entry, change RESUME.entries below. Each entry is one stop on the timeline.
// `groups` are sub-projects inside a role (title, sub-line, bullet items).

interface ResumeGroup {
  focus?: string // sticker id the camera zooms to while this block is on screen
  heading: string
  case?: string // case-study slug
  sub?: string
  items?: string[]
}
interface ResumeEntry {
  kind: 'work' | 'education' | 'certification'
  focus?: string
  period: string
  place: string
  role?: string
  case?: string // case-study slug
  points?: string[]
  groups?: ResumeGroup[]
}

const RESUME: { title: string; entries: ResumeEntry[] } = {
  title: 'Experience',
  entries: [
    {
      kind: 'work',
      period: 'Apr 2026 – Present',
      place: 'Fractal Analytics',
      focus: 'iqigai',
      role: 'Product Manager',
      groups: [
        {
          heading: 'iqigai', case: 'iqigai',
          focus: 'iqigai',
          sub: 'AI recruitment and staffing platform · Nov 2025 – Present (started as Fractal’s client PM from Foyr; hired in-house Apr 2026)',
          items: [
            'Platform build (0 to 1): B2B and B2C platform with 5,276+ daily active users; PM selection rate on AI recommendations up from 10% to 50%, and 50% less time spent on staffing',
            '6 AI agents across lateral hiring, fresher hiring, JD creation and candidate matching, and bench assessment',
            'Leading a 9-member cross-functional team: 2 frontend, 2 backend, 2 AI engineers, 1 QA, 2 UI/UX designers',
          ],
        },
      ],
    },
    {
      kind: 'work',
      period: 'Apr 2024 – Mar 2026',
      place: 'Foyr',
      focus: 'foyr',
      role: 'Associate Product Manager',
      groups: [
        {
          heading: 'Total Environment, Bangalore', case: 'total-environment',
          focus: 'te',
          sub: 'B2C portal + B2B 3D SaaS · Sep 2024 – Nov 2025',
          items: [
            'B2C portal: owned product strategy for a 3D property visualisation platform for home buyers',
            'B2B 3D design tool (0 to 1): delivered a customised Foyr Neo for internal design teams, 300+ screens and 32+ user flows',
            'Sole on-site PM for a 20-member cross-functional team; hired 2 UI/UX designers',
          ],
        },
        {
          heading: 'Foyr Ideate', case: 'foyr-ideate',
          focus: 'foyr',
          sub: 'AI interior design platform · MVP · Apr 2024 – Aug 2024',
          items: [
            'Owned 0-to-1 product strategy: auto-furnish an empty room from a photo, swap furniture and styles, restyle any space',
            'Onboarded and directed a UI/UX agency in Figma; ran user research to validate AI interaction patterns',
          ],
        },
      ],
    },
    {
      kind: 'work',
      period: 'Apr 2020 – Oct 2021',
      place: 'Amazon MX Player', case: 'mx-player',
      focus: 'mx',
      role: 'Business Analyst, Product Operations',
      points: [
        'Content operations: built and trained a team of 6 managing 300,000+ content units across several partner publishers',
        'API efficiency: led an API team overhaul, lifting daily content output by 50% within a month; standardised workflows across 7 teams',
        'Publisher onboarding: took 56 shows from a partner publisher from zero to live in 1 week',
      ],
    },
    {
      kind: 'education',
      period: '2022 – 2024',
      place: 'SDA Bocconi School of Management, Italy',
      focus: 'bocconi',
      role: 'International Master in Business',
      points: [
        'Ranked first on a Google Italy strategy project',
        'Top ten on a Cartier India market entry project',
      ],
    },
    {
      kind: 'education',
      period: '2019 – 2021',
      place: 'St. Xavier’s College, Mumbai · Kraftshala, Delhi',
      focus: 'xaviers',
      role: 'BA Economics (Majors) · Professional Brand Management in the Digital Age',
      points: ['London School of Economics (2019): Business, International Relations and Political Economy'],
    },
    {
      kind: 'certification',
      period: 'Nov 2026',
      place: 'Certified AI-Empowered SAFe 6 Product Owner/Product Manager',
      role: 'Scaled Agile · valid until Nov 2027',
      case: 'pmpo-portal',
      points: ['Passed with 100% across all objectives', 'Built POPM Prep, my own practice platform, while preparing'],
    },
    {
      kind: 'certification',
      period: 'Sep 2026',
      place: 'Certificate in AI Assisted Coding',
      role: 'Fractal AI Fluency Program · valid until Sep 2027',
      points: ['Built ExpenseFlow, an expense submission and approval API, as the course project'],
    },
  ],
}

const EASE = [0.22, 1, 0.36, 1]
function CaseLink({ slug }: { slug: string }) {
  const setActive = useStore((s) => s.setActive)
  return (
    <button type="button" className="tl-case" onClick={() => setActive(slug)}>
      Read case study →
    </button>
  )
}

function Group({ group }: { group: ResumeGroup }) {
  return (
    <div className="tl-group" data-focus={group.focus}>
      <div className="tl-group-head">
        <span>{group.heading}</span>
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.case && <CaseLink slug={group.case} />}
    </div>
  )
}

// One role or school as a collapsed row: place, role and dates; tap to see the details.
function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const hasBody = !!(entry.points || entry.groups || entry.case)
  const bodyId = `tl-body-${index}`
  return (
    <motion.div
      className={`tl-entry${open ? ' is-open' : ''}`}
      data-point={`entry-${index}`}
      data-focus={entry.focus}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <button
        type="button"
        className="tl-row"
        aria-expanded={hasBody ? open : undefined}
        aria-controls={hasBody ? bodyId : undefined}
        disabled={!hasBody}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tl-row-main">
          <span className="tl-place">{entry.place}</span>
          {entry.role && <span className="tl-role">{entry.role}</span>}
          <span className="tl-period-m">{entry.period}</span>
        </span>
        <span className="tl-row-side">
          <span className="tl-period">{entry.period}</span>
          {hasBody && <span className="tl-plus" aria-hidden="true" />}
        </span>
      </button>
      {hasBody && (
        <div className="tl-collapse" id={bodyId} hidden={!open}>
          <div className="tl-body">
            {entry.points && (
              <ul className="tl-points">
                {entry.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
            {entry.case && <CaseLink slug={entry.case} />}
            {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function Resume() {
  // While scrolling, the block nearest the middle of the screen tells the 3D scene which sticker to zoom to.
  useEffect(() => {
    const setFocus = useStore.getState().setFocus
    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.innerHeight / 2
      let best: string | null = null
      let bestD = Infinity
      document.querySelectorAll<HTMLElement>('.resume [data-focus]').forEach((el) => {
        const r = el.getBoundingClientRect()
        const d = mid >= r.top && mid <= r.bottom ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid))
        // prefer the smaller block when two contain the middle (a group inside an entry)
        const score = d + (d === 0 ? r.height * 0.001 : 0)
        if (score < bestD) {
          bestD = score
          best = el.dataset.focus || null
        }
      })
      setFocus(bestD < window.innerHeight * 0.35 ? best : null)
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
      setFocus(null)
    }
  }, [])

  return (
    <section className="resume" id="experience" lang="en">
      <p className="sec-mark resume-mark" aria-hidden="true">
        <span>05</span>
        Experience
      </p>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {RESUME.title}
      </motion.h2>
      <p className="sec-sub resume-sub">Where I’ve worked, studied and certified. Tap a row for details.</p>
      <div className="timeline">
        {RESUME.entries.map((e, i) => (
          <Fragment key={i}>
            {(i === 0 || RESUME.entries[i - 1].kind !== e.kind) && (
              <div className={`tl-section is-${e.kind}`} id={e.kind === 'work' ? undefined : e.kind}>
                <h3>{e.kind === 'work' ? 'Work' : e.kind === 'education' ? 'Education' : 'Certifications'}</h3>
              </div>
            )}
            <Entry entry={e} index={i} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
