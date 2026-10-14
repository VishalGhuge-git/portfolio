import { Fragment, useEffect } from 'react'
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
  kind: 'work' | 'education'
  focus?: string
  period: string
  place: string
  role?: string
  case?: string // case-study slug
  points?: string[]
  groups?: ResumeGroup[]
}

const RESUME: { title: string; entries: ResumeEntry[] } = {
  title: 'Résumé',
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
          sub: 'AI recruitment and staffing platform · Nov 2025 – Present',
          items: [
            'Platform build (0 to 1): B2B and B2C platform used organisation-wide, xxxx+ daily active users',
            '6 AI agents: Interview Bot, Practice Bot, JD Bot, Debrief Bot, Case Study Bot and a Candidate Agent',
            'Leading a 7-member cross-functional team',
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
        'Publisher onboarding: took a partner's 56 shows from zero to live in 1 week',
      ],
    },
    {
      kind: 'education',
      period: '2022 – 2024',
      place: 'SDA Bocconi School of Management, Italy',
      focus: 'bocconi',
      role: 'International Master in Business',
    },
    {
      kind: 'education',
      period: '2019 – 2021',
      place: 'St. Xavier’s College, Mumbai · Kraftshala, Delhi',
      focus: 'xaviers',
      role: 'BA Economics (Majors) · Professional Brand Management in the Digital Age',
      points: ['London School of Economics (2019): Business, International Relations and Political Economy'],
    },
  ],
}

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

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
    <motion.div className="tl-group" variants={itemV} data-focus={group.focus}>
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
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={`entry-${index}`}
      data-focus={entry.focus}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className={`tl-dot tl-dot-${entry.kind}`} variants={itemV} aria-hidden="true" />
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          <span className={`tl-kind tl-kind-${entry.kind}`}>{entry.kind === 'work' ? 'Work' : 'Education'}</span>
          <span>{entry.period}</span>
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.case && <CaseLink slug={entry.case} />}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
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
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {RESUME.title}
      </motion.h2>
      <div className="tl-legend" aria-hidden="true">
        <span><i className="tl-dot-work" /> Work</span>
        <span><i className="tl-dot-education" /> Education</span>
      </div>
      <div className="timeline">
        {RESUME.entries.map((e, i) => (
          <Fragment key={i}>
            {(i === 0 || RESUME.entries[i - 1].kind !== e.kind) && (
              <div className={`tl-section is-${e.kind}`} id={e.kind === 'education' ? 'education' : undefined}>
                <h3>{e.kind === 'work' ? 'Experience' : 'Education'}</h3>
              </div>
            )}
            <Entry entry={e} index={i} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
