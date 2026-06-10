import { useEffect, useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { BOOT_LINES, AWAKENING_HOOK } from '@/data/messages'

/**
 * AwakeningScreen — boot sequence, then the System's offer.
 */
export default function AwakeningScreen() {
  const { dispatch } = useAppContext()
  const [shown, setShown] = useState(0)
  const booted = shown >= BOOT_LINES.length

  useEffect(() => {
    if (booted) return undefined
    const id = setTimeout(() => setShown(s => s + 1), shown === 0 ? 400 : 650)
    return () => clearTimeout(id)
  }, [shown, booted])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* boot log */}
      <div className="mono" style={{ minHeight: 130, width: 'min(420px, 100%)', fontSize: 13 }}>
        {BOOT_LINES.slice(0, shown).map((line, i) => (
          <div
            key={line}
            className="fade-in"
            style={{
              color: i === BOOT_LINES.length - 1 ? 'var(--cyan)' : 'var(--text-mute)',
              padding: '3px 0',
            }}
          >
            <span style={{ color: 'var(--text-mute)' }}>{'>'}</span> {line}
          </div>
        ))}
        {!booted ? <span className="caret" /> : null}
      </div>

      {booted ? (
        <div className="fade-in-slow" style={{ textAlign: 'center', maxWidth: 520 }}>
          <h1
            className="display glitch"
            data-text="ARISE"
            style={{
              fontSize: 'clamp(64px, 16vw, 110px)',
              fontWeight: 900,
              margin: '12px 0 4px',
              letterSpacing: '0.18em',
              color: 'var(--text)',
              textShadow: '0 0 30px var(--cyan-glow), 0 0 90px var(--cyan-glow)',
            }}
          >
            ARISE
          </h1>
          <div className="label" style={{ marginBottom: 26 }}>
            目覚めよ — THE SYSTEM HAS FOUND YOU
          </div>

          <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.7, margin: '0 0 30px' }}>
            {AWAKENING_HOOK}
          </p>

          <button
            className="btn"
            style={{ fontSize: 14, padding: '14px 36px' }}
            onClick={() => dispatch({ type: ACTIONS.ENTER_SYSTEM })}
          >
            ACCEPT THE SUMMONS
          </button>
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-mute)' }}>
            Refusal is also a choice. The weak make it daily.
          </div>
        </div>
      ) : null}
    </div>
  )
}
