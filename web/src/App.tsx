import { REDUCE } from './scene/motion'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import Resume from './ui/Resume'
import TickerBackdrop from './scene/TickerBackdrop'
import WorkCards, { BuiltWithAI } from './ui/WorkCards'
import { About, KindWords } from './ui/AboutKind'
import { CaseStudyHost } from './ui/Works'
import ScrollTopButton from './ui/ScrollTopButton'
import ExploreBar from './ui/ExploreBar'
import { resetView } from './scene/orbit'
import ContactModal, { LINKEDIN_URL, MAIL_HREF, PHONE, PhoneIcon } from './ui/ContactModal'
import { SOCIAL_ICONS } from './ui/SocialIcons'
import LoadingScreen from './ui/LoadingScreen'
import SoundToggle from './ui/SoundToggle'
import ThemeToggle from './ui/ThemeToggle'
import { useTheme } from './theme'
import { track } from './analytics'
import { useStore } from './store'

const CV_URL = `${import.meta.env.BASE_URL}Vishal_Ghuge_CV.pdf`

// WebGL check: without it we skip the 3D scene and show the page on a plain gradient
const HAS_WEBGL = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function TopBar() {
  // Hide while a case study is open so it never crowds the case study's own buttons
  const open = useStore((s) => s.active !== null)
  const [talk, setTalk] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const open = () => setTalk(true)
    window.addEventListener('open-talk', open)
    return () => window.removeEventListener('open-talk', open)
  }, [])
  // Which section is on screen, so its link in the bar lights up
  const [current, setCurrent] = useState<string | null>(null)
  useEffect(() => {
    const ids = ['work', 'built', 'about', 'kind-words', 'experience']
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const onScroll = () => {
      const mid = window.innerHeight * 0.35
      let found: string | null = null
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) found = el.id
      }
      setCurrent(found === 'kind-words' ? 'about' : found)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // Phone section menu: close on Escape or a tap outside
  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.topbar-menu-wrap')) setMenu(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [menu])
  const menuGo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMenu(false)
    track('menu_jump', id)
    jumpTo(id)
  }
  const { scrollY } = useScroll()
  const veil = useTransform(scrollY, [60, 220], [0, 1]) // dark strip behind the buttons once text scrolls under them
  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    track('nav_jump', id)
    jumpTo(id)
  }
  return (
    <>
    <motion.div className={`topbar-veil${open ? ' is-hidden' : ''}`} style={{ opacity: veil }} aria-hidden="true" />
    <nav className={`topbar${open ? ' is-hidden' : ''}`} aria-label="Site" aria-hidden={open}>
      <a
        className="tb-brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault()
          track('brand_home')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <b>Vishal Ghuge</b>
        <span>AI Product Manager</span>
      </a>
      <div className="tb-links">
        <a className={`topbar-jump${current === 'work' ? ' is-current' : ''}`} href="#work" aria-current={current === 'work' ? 'location' : undefined} onClick={jump('work')}>
          Work
        </a>
        <a className={`topbar-jump${current === 'built' ? ' is-current' : ''}`} href="#built" aria-current={current === 'built' ? 'location' : undefined} onClick={jump('built')}>
          Built with AI
        </a>
        <a className={`topbar-jump${current === 'about' ? ' is-current' : ''}`} href="#about" aria-current={current === 'about' ? 'location' : undefined} onClick={jump('about')}>
          About
        </a>
        <a className={`topbar-jump${current === 'experience' ? ' is-current' : ''}`} href="#experience" aria-current={current === 'experience' ? 'location' : undefined} onClick={jump('experience')}>
          Experience
        </a>
      </div>
      <div className="tb-right">
        <span className="tb-divider" aria-hidden="true" />
        <span className="tb-toggles">
          <ThemeToggle />
        </span>
        <a className="topbar-cv" href={CV_URL} download="Vishal_Ghuge_CV.pdf" onClick={() => track('cv_download')}>
          CV
        </a>
        <div className="topbar-menu-wrap">
          <button
            type="button"
            className="topbar-menu"
            aria-expanded={menu}
            aria-controls="site-menu"
            onClick={() => setMenu((v) => !v)}
          >
            <svg className="tm-ico" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              {menu ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M3.5 7h13M3.5 13h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
            {menu ? 'Close' : 'Menu'}
          </button>
          {menu && (
            <div className="site-menu" id="site-menu">
              <a href="#work" onClick={menuGo('work')}>Work</a>
              <a href="#built" onClick={menuGo('built')}>Built with AI</a>
              <a href="#about" onClick={menuGo('about')}>About me</a>
              <a href="#kind-words" onClick={menuGo('kind-words')}>Recommendations</a>
              <a href="#experience" onClick={menuGo('experience')}>Experience</a>
              <a href={CV_URL} download="Vishal_Ghuge_CV.pdf" onClick={() => { setMenu(false); track('cv_download', 'menu') }}>
                Download CV
              </a>
              <div className="site-menu-toggles">
                <span>Sound &amp; theme</span>
                <SoundToggle />
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
        <button type="button" className="topbar-cta" onClick={() => { track('talk_open'); setTalk(true) }}>
          Let’s talk
        </button>
      </div>
    </nav>
    <ContactModal open={talk} onClose={() => setTalk(false)} />
    </>
  )
}

// Page-level back to top; the open case study has its own, so this one steps aside.
function PageTopButton() {
  const open = useStore((s) => s.active !== null)
  return <ScrollTopButton hidden={open} />
}

// The desk hint shows once per visitor (about 8 seconds), then never again
function StickerHint({ opacity }: { opacity: MotionValue<number> }) {
  const touched = useStore((s) => s.touched)
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem('hintSeen') === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    if (seen) return
    const t = window.setTimeout(() => {
      setSeen(true)
      try {
        localStorage.setItem('hintSeen', '1')
      } catch {
        /* private mode */
      }
    }, 8000)
    return () => window.clearTimeout(t)
  }, [seen])
  if (touched || seen) return null
  return (
    <motion.div className="sticker-hint" style={{ opacity }} aria-hidden="true">
      {typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.05
        ? 'Tap 3D Tour to see the projects'
        : 'Tap the objects on the desk: each one is a project'}
    </motion.div>
  )
}

const ROLES = ['product manager', 'problem solver', 'creative thinker', 'firefighter', 'product owner']
// Every role stacked in one grid cell (invisible): the cell is as wide as the widest actual word, in pixels
function RoleSizer() {
  return (
    <span className="about-role-sizer" aria-hidden="true">
      {ROLES.map((r) => (
        <span key={r}>{r}</span>
      ))}
    </span>
  )
}
const COPY = {
  title: 'Vishal Ghuge, AI Product Manager',
  eyebrow: 'AI Product Manager · Mumbai',
  headline: 'I take AI products from idea to everyday use.',
  // "I’m Vishal, a {role} at Fractal Analytics ..."; the role rotates (RoleRotator)
  lead: ['I’m Vishal, ', ' at Fractal Analytics.'],
  rest: 'At Fractal Analytics I built iqigai, an AI staffing platform, from scratch to 5,276+ daily users. Before that: an AI MVP at Foyr in five months, and operations at Amazon MX Player.',
}

// The word after "I’m Vishal, a" rolls through a few roles every 2 seconds. It starts on the real title,
// pauses on hover, stops once the hero is off screen, and stays static for visitors who prefer reduced motion.
function RoleRotator() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (reduce || paused) return
    const t = setInterval(() => {
      if (document.hidden || window.scrollY > window.innerHeight) return
      setI((v) => (v + 1) % ROLES.length)
    }, 2000)
    return () => clearInterval(t)
  }, [reduce, paused])
  return (
    <span
      className="about-role"
      aria-label={ROLES[i]}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* The slot is always as wide as the longest role, so the rest of the sentence never moves */}
      <RoleSizer />
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          className="about-role-word"
          initial={{ y: '105%', opacity: 1 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-105%', opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Proof points shown under the intro. Project figures open their case study; the career total jumps to Work.
const PROOF = [
  { n: '5,276+', label: 'daily active users', sub: 'iqigai · AI staffing', slug: 'iqigai', logo: 'iqigai.png' },
  { n: '5 mo', label: 'idea to AI MVP', sub: 'Foyr Ideate', slug: 'foyr-ideate', logo: 'foyr.png' },
  { n: '986+', label: 'screens shipped', sub: 'across all products', slug: '', logo: '' },
]

function Proof() {
  const setActive = useStore((s) => s.setActive)
  return (
    <ul className="hx-stats">
      {PROOF.map((p) => (
        <li key={p.n}>
          <button
            className="hx-stat"
            onClick={() => {
              track('proof_click', p.slug || p.n)
              if (p.slug) setActive(p.slug)
              else jumpTo('work')
            }}
            aria-label={p.slug ? `${p.n} ${p.label}, ${p.sub}. Open case study` : `${p.n} ${p.label} ${p.sub}. See my work`}
          >
            <b>{p.n}</b>
            <span>{p.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

const WORKED_WITH = ['Fractal Analytics', 'Foyr', 'Amazon MX Player', 'Total Environment']

function Hero({ cueOpacity: _cue }: { cueOpacity: MotionValue<number> }) {
  // Fade/blur the hero text only once the page is actually scrolled (sharp at rest)
  const { scrollY } = useScroll()
  const p = useTransform(scrollY, [60, 460], [0, 1])
  const blur = useTransform(p, [0, 0.5], ['blur(0px)', 'blur(12px)'])
  const opacity = useTransform(p, [0, 0.5], [1, 0])
  const y = useTransform(p, [0, 1], [0, -40])
  return (
    <section className="hero">
      <motion.div className="hx" lang="en" style={{ filter: blur, opacity, y }}>
        <h1 className="sr-only">{COPY.title}</h1>
        <p className="hx-eyebrow">{COPY.eyebrow}</p>
        <p className="hx-headline">I take AI products from idea to everyday use.</p>
        <Proof />
        <p className="hx-worked">
          <span className="hx-worked-label">Worked with</span>
          <span className="hx-worked-names">
            {WORKED_WITH.map((n, i) => (
              <span key={n}>
                {i > 0 && <i aria-hidden="true"> · </i>}
                {n}
              </span>
            ))}
          </span>
        </p>
        <div className="hx-actions">
          <button
            className="hx-primary"
            onClick={() => {
              track('see_work', 'hero')
              jumpTo('work')
            }}
          >
            See my work <span aria-hidden="true">↓</span>
          </button>
          <button
            className="hx-link"
            onClick={() => {
              track('explore_3d', 'open')
              resetView()
              useStore.getState().setTourIdx(0)
              useStore.getState().setTourPlaying(!REDUCE)
              useStore.getState().setExplore('tour')
            }}
          >
            3D Tour <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.div>
    </section>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16" />
    </svg>
  )
}

// Slim glass bar at the end of the page: who, and four ways to reach me. The 3D scene stays in view above it.
function Contact() {
  const Linkedin = SOCIAL_ICONS.linkedin
  const Mail = SOCIAL_ICONS.mail
  return (
    <>
    <section className="closing" lang="en" aria-labelledby="closing-title">
      <h2 className="closing-title" id="closing-title">Building something with AI? Let’s talk.</h2>
      <p className="closing-sub">I’m happy to walk you through any of these products, the decisions behind them and what I’d do next.</p>
      <div className="closing-actions">
        <a className="about-me-btn is-primary" href={MAIL_HREF} onClick={() => track('email_click', 'closing')}>
          Email me
        </a>
        <a className="about-me-btn" href={CV_URL} download="Vishal_Ghuge_CV.pdf" onClick={() => track('cv_download', 'closing')}>
          Download CV
        </a>
      </div>
      <p className="closing-links">
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('linkedin_click', 'closing')}>LinkedIn</a>
        <a href={`tel:${PHONE}`} onClick={() => track('call_click', 'closing')}>Call</a>
        <span>© {new Date().getFullYear()} Vishal Ghuge</span>
      </p>
    </section>
    <footer className="contact" id="contact" lang="en">
      <div className="foot-bar">
        <div className="foot-id">
          <b>Vishal Ghuge</b>
          <span>AI Product Manager · Mumbai</span>
        </div>
        <nav className="foot-links" aria-label="Contact">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('linkedin_click', 'footer')}>
            <Linkedin /> LinkedIn
          </a>
          <a href={MAIL_HREF} onClick={() => track('email_click', 'footer')}>
            <Mail /> Email
          </a>
          <a href={`tel:${PHONE}`} onClick={() => track('call_click', 'footer')}>
            <PhoneIcon /> Call
          </a>
        </nav>
      </div>
      <div className="foot-meta">
        <span>© {new Date().getFullYear()} Vishal Ghuge</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to top</button>
      </div>
    </footer>
    </>
  )
}

export default function App() {
  const theme = useTheme()
  const { scrollY } = useScroll()
  // Darken the 3D scene after leaving the hero so the résumé text stays readable
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  const blurIn = useTransform(scrollY, [80, 520], [0, 1])
  // Desktop: a soft fade of the page colour behind the text column, so text never sits on the avatar
  const veilOpacity = useTransform(scrollY, [240, 640], [0, 1])
  // ease the blur off at the very end so Vishal and the platform are clear behind the footer
  const { scrollYProgress } = useScroll()
  const blurEnd = useTransform(scrollYProgress, [0.86, 0.98], [1, 0.1])
  const blurOpacity = useTransform([blurIn, blurEnd], ([a, b]: number[]) => a * b)
  // Scroll cue fades out as soon as scrolling starts
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // Frosted right rail fades in once the résumé starts (hero stays unfrosted)
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // Hero frame and corner marks fade after the first scroll
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* Loading mask: covers the screen until assets are ready, then fades out */}
      <LoadingScreen />

      {/* Fixed 3D background */}
      <div className="scene-bg">
        <TickerBackdrop />
        {/* The page content sits on top of the canvas and takes the pointer events, so the 3D scene
            listens on #root instead (events bubble up to it). That keeps eye-follow and the
            clickable stickers working. */}
        {HAS_WEBGL && (
        <Canvas
          eventSource={document.getElementById('root') as HTMLElement}
          eventPrefix="client"
          dpr={[1, 1.5]}
          camera={{ position: [0, 3.5, 5.4], fov: 39, near: 0.1, far: 500 }}
          gl={{ alpha: true, antialias: true, depth: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={({ gl }) => {
            // iPhones can drop the WebGL context under memory pressure, which leaves an empty scene.
            // Ask the browser to give it back; if it does not within 2.5 s, reload once (never in a loop).
            const el = gl.domElement
            let t = 0
            el.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              track('webgl_lost', 'scene')
              t = window.setTimeout(() => {
                try {
                  if (sessionStorage.getItem('glReloaded')) return
                  sessionStorage.setItem('glReloaded', '1')
                } catch {
                  return
                }
                window.location.reload()
              }, 2500)
            })
            el.addEventListener('webglcontextrestored', () => window.clearTimeout(t))
          }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        )}
      </div>

      {/* Scroll blur: softens the 3D behind the text once you leave the hero (stronger on phones) */}
      <motion.div className="scroll-blur" style={{ opacity: blurOpacity }} aria-hidden="true" />

      {/* Scroll darkening scrim */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <motion.div className="col-veil" style={{ opacity: veilOpacity }} aria-hidden="true" />

      {/* Fixed frosted right rail */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />


      <TopBar />
      <CaseStudyHost />
      <PageTopButton />
      <ExploreBar />
      <StickerHint opacity={heroChromeOpacity} />

      {/* Full-screen film grain (multiply blend) */}

      {/* Scrollable content */}
      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <WorkCards />
        <BuiltWithAI />
        <About />
        <KindWords />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
