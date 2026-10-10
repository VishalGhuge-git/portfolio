import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import Resume from './ui/Resume'
import { CaseStudyHost } from './ui/Works'
import ScrollTopButton from './ui/ScrollTopButton'
import ContactModal, { LINKEDIN_URL, EMAIL } from './ui/ContactModal'
import LoadingScreen from './ui/LoadingScreen'
import { SOCIAL_ICONS } from './ui/SocialIcons'
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
      <a className="topbar-jump" href="#experience" onClick={jump('experience')}>
        Experience
      </a>
      <a className="topbar-jump" href="#education" onClick={jump('education')}>
        Education
      </a>
      <a href={CV_URL} download="Vishal_Ghuge_CV.pdf" onClick={() => track('cv_download')}>
        Download CV
      </a>
      <a className="topbar-li" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('linkedin_click')}>
        LinkedIn
      </a>
      <button type="button" className="topbar-cta" onClick={() => { track('talk_open'); setTalk(true) }}>
        Let’s talk
      </button>
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

function StickerHint({ opacity }: { opacity: MotionValue<number> }) {
  const touched = useStore((s) => s.touched)
  if (touched) return null
  return (
    <motion.div className="sticker-hint" style={{ opacity }} aria-hidden="true">
      Tap the pins and badges: each one is a project
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
  title: 'About Vishal',
  // "I’m Vishal, a {role} at Fractal Analytics ..."; the role rotates (RoleRotator)
  lead: ['I’m Vishal, a ', ' at Fractal Analytics who takes AI and SaaS products from zero to one.'],
  rest: ' I turn ambiguous asks into shipped roadmaps, with hands-on UX, research and LLM prompt-engineering behind them. I started in OTT operations at Amazon MX Player, so I care about the process around a product as much as the product.',
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
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-105%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Proof points shown under the intro. Every figure comes from the case study it opens.
const PROOF = [
  { n: 'xxxx', label: 'daily users', sub: 'iqigai, 0 to 1 at Fractal', slug: 'iqigai' },
  { n: '300+', label: 'screens, 32+ flows', sub: 'Total Environment', slug: 'total-environment' },
  { n: '56', label: 'shows live in a week', sub: 'Amazon MX Player', slug: 'mx-player' },
  { n: '5 mo', label: 'AI MVP to handoff', sub: 'Foyr Ideate', slug: 'foyr-ideate' },
]

function Proof() {
  const setActive = useStore((s) => s.setActive)
  return (
    <div className="proof" role="list">
      {PROOF.map((p) => (
        <button
          key={p.slug}
          role="listitem"
          className="proof-chip"
          onClick={() => {
            track('proof_click', p.slug)
            setActive(p.slug)
          }}
        >
          <b>{p.n}</b>
          <span>{p.label}</span>
          <em>{p.sub}</em>
        </button>
      ))}
    </div>
  )
}

function Hero({ cueOpacity }: { cueOpacity: MotionValue<number> }) {
  const aboutRef = useRef(null)
  // On phones and tablets the card starts compact so it doesn't hide the character; desktop ignores this.
  const [expanded, setExpanded] = useState(false)
  // Fade/blur the About block only once the page is actually scrolled (sharp at rest)
  const { scrollY } = useScroll()
  const scrollYProgress = useTransform(scrollY, [60, 460], [0, 1])
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // Parallax: title rises faster and tracks wider as you scroll; body rises slower
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div className={`about${expanded ? '' : ' is-min'}`} lang="en" ref={aboutRef} style={{ filter: blur, opacity }}>
        {/* Entrance animation lives on the inner node so its fill doesn't override the scroll opacity */}
        <div className="about-intro">
          <div className="about-head">
            <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
              {COPY.title}
            </motion.h1>
            <button
              className="about-toggle"
              aria-expanded={expanded}
              onClick={() => {
                track('about_toggle', expanded ? 'collapse' : 'expand')
                setExpanded((v) => !v)
              }}
            >
              {expanded ? 'Hide' : 'Read more'}
            </button>
          </div>
          <motion.p className="about-body" style={{ y: bodyY }}>
            {/* Both copies share one grid cell: the hidden one (longest role) holds the height so the
                card and the chips below never jump as the role changes */}
            <span className="about-stack">
              <span className="about-live">
                <span className="about-lead">
                  {COPY.lead[0]}
                  <RoleRotator />
                  {COPY.lead[1]}
                </span>
                <span className="about-rest">{COPY.rest}</span>
              </span>
              <span className="about-sizer" aria-hidden="true">
                <span className="about-lead">
                  {COPY.lead[0]}
                  <span className="about-role"><RoleSizer /></span>
                  {COPY.lead[1]}
                </span>
                <span className="about-rest">{COPY.rest}</span>
              </span>
            </span>
          </motion.p>
          <Proof />
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">SCROLL</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

function Contact() {
  const Linkedin = SOCIAL_ICONS.linkedin
  const Mail = SOCIAL_ICONS.mail
  return (
    <footer className="contact" id="contact" lang="en">
      <h2 className="contact-title">Let’s build something</h2>
      <div className="tl-logos">
        <a
          className="tl-logo"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
          onClick={() => track('linkedin_click')}
        >
          <Linkedin />
        </a>
        <a
          className="tl-logo"
          href={`mailto:${EMAIL}`}
          aria-label="Email"
          title="Email"
          onClick={() => track('email_click')}
        >
          <Mail />
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  const { scrollY } = useScroll()
  // Darken the 3D scene after leaving the hero so the résumé text stays readable
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  const blurOpacity = useTransform(scrollY, [80, 520], [0, 1])
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
        {/* The page content sits on top of the canvas and takes the pointer events, so the 3D scene
            listens on #root instead (events bubble up to it). That keeps eye-follow and the
            clickable stickers working. */}
        {HAS_WEBGL && (
        <Canvas
          eventSource={document.getElementById('root') as HTMLElement}
          eventPrefix="client"
          dpr={[1, 2]}
          camera={{ position: [0, 3.65, 4.4], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: true, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
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

      {/* Fixed frosted right rail */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* Hero decoration: hairline frame, corner marks, meta labels (fade on scroll) */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">Vishal Ghuge</span>
          <span>Product Manager</span>
        </div>
        <div className="hero-meta hm-bl">AI · SaaS · 0 to 1</div>
        <div className="hero-meta hm-right">Based in Mumbai</div>
      </motion.div>

      <TopBar />
      <CaseStudyHost />
      <PageTopButton />
      <StickerHint opacity={heroChromeOpacity} />

      {/* Full-screen film grain (multiply blend) */}

      {/* Scrollable content */}
      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
