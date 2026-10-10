import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SOCIAL_ICONS } from './SocialIcons'
import { track } from '../analytics'

export const LINKEDIN_URL = 'https://www.linkedin.com/in/vishal-ghuge'
export const EMAIL = 'vishalghuge26@gmail.com'
const PHONE = '+910000000000'
const PHONE_SHOWN = '+91 86559 85228'
const MAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Hello Vishal')}`

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="cm-copy"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1600)
        }).catch(() => {})
      }}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const Linkedin = SOCIAL_ICONS.linkedin
  const Mail = SOCIAL_ICONS.mail
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cm-card"
            role="dialog"
            aria-modal="true"
            aria-label="Get in touch"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cm-close" aria-label="Close" onClick={onClose}>×</button>
            <h2 className="cm-title">Let’s talk</h2>
            <p className="cm-sub">Pick whichever is easiest.</p>
            <div className="cm-list">
              <a className="cm-row" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('linkedin_click')}>
                <span className="cm-ico"><Linkedin /></span>
                <span className="cm-txt"><b>LinkedIn</b><em>Open my profile</em></span>
                <span className="cm-go">→</span>
              </a>
              <div className="cm-rowwrap">
                <a className="cm-row" href={MAIL_HREF} onClick={() => track('email_click')}>
                  <span className="cm-ico"><Mail /></span>
                  <span className="cm-txt"><b>Email</b><em>{EMAIL}</em></span>
                  <span className="cm-go">→</span>
                </a>
                <CopyBtn text={EMAIL} label="email address" />
              </div>
              <div className="cm-rowwrap">
                <a className="cm-row" href={`tel:${PHONE}`} onClick={() => track('call_click')}>
                  <span className="cm-ico"><PhoneIcon /></span>
                  <span className="cm-txt"><b>Call</b><em>{PHONE_SHOWN}</em></span>
                  <span className="cm-go">→</span>
                </a>
                <CopyBtn text={PHONE_SHOWN} label="phone number" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
