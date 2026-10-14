import { toggleMusic, useMusicPlaying } from '../audio'
import { track } from '../analytics'

// Round glass button for the ambient music. Shows the current state; tap to mute or play.
export default function SoundToggle() {
  const on = useMusicPlaying()
  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' is-on' : ''}`}
      aria-label={on ? 'Mute music' : 'Play music'}
      aria-pressed={on}
      title={on ? 'Mute music' : 'Play music'}
      onClick={() => { track('music_toggle', on ? 'off' : 'on'); toggleMusic() }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
    </button>
  )
}
