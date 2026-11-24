import { useState } from 'react'
import { motion } from 'framer-motion'
import { WORKS, type WorkListItem } from '../data/works'
import { useStore } from '../store'
import { track } from '../analytics'

const EASE = [0.22, 1, 0.36, 1] as const
const BASE = import.meta.env.BASE_URL

// Shared section heading: big title + one plain line saying what the section is.
export function SectionHead({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <motion.header
      className="sec-head"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h2 className="sec-title" id={id}>
        {title}
      </h2>
      <p className="sec-sub">{sub}</p>
    </motion.header>
  )
}

function Reveal({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 3) * 0.06 }}
    >
      {children}
    </motion.li>
  )
}

// One work card. The whole card opens the case study (a stretched button); a live-product link,
// when there is one, sits above it so both stay clickable without nesting interactive elements.
function WorkCard({ it }: { it: WorkListItem }) {
  const setActive = useStore((s) => s.setActive)
  const key = it.slug || it.name
  return (
    <div className="work-card">
      <button
        type="button"
        className="work-card-hit"
        aria-label={`Open case study: ${it.name}`}
        onClick={() => {
          track('work_card_click', key)
          setActive(key)
        }}
      />
      {it.cover ? (
        <span className="work-card-media">
          <img src={`${BASE}works/covers/${it.cover}`} alt="" loading="lazy" decoding="async" width={800} height={450} />
        </span>
      ) : it.stat ? (
        <span className="work-card-media is-stat">
          {it.logo && <img className="work-card-logo" src={`${BASE}stickers/${it.logo}`} alt="" loading="lazy" />}
          <b>{it.stat.n}</b>
          <span className="work-card-stat-label">{it.stat.label}</span>
        </span>
      ) : null}
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
      <span className="work-card-foot">
        <span className="work-card-go" aria-hidden="true">
          Read case study <span className="work-card-arrow">→</span>
        </span>
        {it.link && (
          <a
            className="work-card-live"
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('work_live_click', key)}
          >
            Try it live <span aria-hidden="true">↗</span>
          </a>
        )}
      </span>
    </div>
  )
}

// "Work": the products Vishal led. The card is the pitch; the case study popup is the proof.
export default function WorkCards() {
  const sec = WORKS.en.sections.find((s) => s.id === 'led')
  if (!sec?.items) return null
  return (
    <section className="work" id="work" lang="en" aria-labelledby="work-title">
      <SectionHead id="work-title" title="Selected work" sub="Products I’ve led, and what changed because of them." />
      <ul className="work-list">
        {sec.items.map((it, i) => (
          <Reveal key={it.slug || it.name} i={i}>
            <WorkCard it={it} />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

// "Built with AI": side builds whose demo plays right in the card.
// Clean cover with one play button; the real player (with controls) appears only once played
function BuildVideo({ it }: { it: { slug?: string; name: string; video?: string; poster?: string; length?: string } }) {
  const [playing, setPlaying] = useState(false)
  return (
    <span className="build-media">
      {playing ? (
        <video
          className="build-video"
          src={`${BASE}${it.video}`}
          poster={`${BASE}${it.poster}`}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <button
          type="button"
          className="build-cover"
          onClick={() => {
            track('build_play', it.slug || it.name)
            setPlaying(true)
          }}
          aria-label={`Play ${it.name} demo${it.length ? `, ${it.length}, with sound` : ''}`}
        >
          <img src={`${BASE}${it.poster}`} alt="" loading="lazy" decoding="async" />
          <span className="build-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
          </span>
          {it.length && <span className="build-len">{it.length}</span>}
        </button>
      )}
    </span>
  )
}

export function BuiltWithAI() {
  const setActive = useStore((s) => s.setActive)
  const sec = WORKS.en.sections.find((s) => s.id === 'ai-builds')
  const items = (sec?.items || []).filter((it) => it.video)
  if (!sec || !items.length) return null
  return (
    <section className="work builds" id="built" lang="en" aria-labelledby="built-title">
      <SectionHead id="built-title" title={sec.title} sub={sec.tagline} />
      <ul className="build-list">
        {items.map((it, i) => (
          <Reveal key={it.slug} i={i}>
            <div className={`build-card${it.landscape ? ' is-landscape' : ''}`}>
              <BuildVideo it={it} />
              <span className="build-name">{it.name}</span>
              {it.tagline && <span className="build-line">{it.tagline}</span>}
              <button
                type="button"
                className="build-story"
                onClick={() => {
                  track('build_story', it.slug || it.name)
                  setActive(it.slug!)
                }}
              >
                Read the story →
              </button>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
