// Privacy-friendly analytics (GoatCounter: no cookies, no personal data).
// 1. Create a free site at goatcounter.com, e.g. "vishalghuge" -> https://vishalghuge.goatcounter.com
// 2. Put that code below. While it is empty, nothing is loaded and track() does nothing.
const GOATCOUNTER_CODE = ''

declare global {
  interface Window {
    goatcounter?: { count: (o: { path: string; title?: string; event?: boolean }) => void }
  }
}

export function initAnalytics() {
  if (!GOATCOUNTER_CODE || typeof document === 'undefined') return
  const s = document.createElement('script')
  s.async = true
  s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  s.src = 'https://gc.zgo.at/count.js'
  document.head.appendChild(s)
}

// Events used: sticker_click, case_open, cv_download, linkedin_click, email_click
export function track(event: string, title?: string) {
  try {
    window.goatcounter?.count({ path: event, title, event: true })
  } catch {
    /* analytics must never break the page */
  }
}
