import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import { SOCIAL_ICONS } from './ui/SocialIcons'

const LINKEDIN_URL = 'https://www.linkedin.com/in/vishal-ghuge'
const EMAIL = 'vishalghuge26@gmail.com'

const COPY = {
  title: 'About Vishal',
  paragraphs: [
    'I’m Vishal, a product manager who takes AI and SaaS products from zero to one. I turn ambiguous asks from leadership into shipped roadmaps, backed by hands-on UX, research and LLM prompt-engineering.',
  ],
}

function Hero({ cueOpacity }: { cueOpacity: MotionValue<number> }) {
  const aboutRef = useRef(null)
  // Fade/blur the About block as it scrolls away
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // Parallax: title rises faster and tracks wider as you scroll; body rises slower
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div className="about" lang="en" ref={aboutRef} style={{ filter: blur, opacity }}>
        {/* Entrance animation lives on the inner node so its fill doesn't override the scroll opacity */}
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {COPY.title}
          </motion.h1>
          {COPY.paragraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
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
    <footer className="contact" lang="en">
      <h2 className="contact-title">Let’s build something</h2>
      <div className="tl-logos">
        <a
          className="tl-logo"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <Linkedin />
        </a>
        <a className="tl-logo" href={`mailto:${EMAIL}`} aria-label="Email" title="Email">
          <Mail />
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  const { scrollY } = useScroll()
  // Works-section veil: progress of the works block entering the viewport drives a 3D darken
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(worksProgress, [0, 1], ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'])
  // Darken the 3D scene after leaving the hero so the résumé text stays readable
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
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
        <Canvas
          eventSource={document.getElementById('root') as HTMLElement}
          eventPrefix="client"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.6, 7.5], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: true, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll darkening scrim */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* Fixed veil over the works section */}
      <motion.div className="stage-fog" style={{ background: fogBg }} aria-hidden="true" />

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
        <div className="hero-meta hm-tr">Portfolio — 2026</div>
        <div className="hero-meta hm-bl">AI · SaaS · 0 to 1</div>
        <div className="hero-meta hm-right">Based in Mumbai</div>
      </motion.div>

      {/* Full-screen film grain (multiply blend) */}
      <NoiseOverlay />

      {/* Scrollable content */}
      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <Resume />
        <Works lang="en" innerRef={worksRef} />
        <Contact />
      </main>
    </>
  )
}
