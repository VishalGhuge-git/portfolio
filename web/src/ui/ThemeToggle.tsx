import { toggleTheme, useTheme } from '../theme'
import { track } from '../analytics'

// Round glass button next to the sound toggle: sun switches to light mode, moon back to dark.
export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      className="sound-toggle theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        track('theme_toggle', next)
        toggleTheme()
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === 'light' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}
