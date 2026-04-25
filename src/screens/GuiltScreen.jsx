import { useState, useMemo, useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { guiltMessages } from '@/data/guiltMessages'

const TONES = ['sarcasm', 'disappointment', 'pressure']

const TONE_COLORS = {
  sarcasm: '#00d4ff',
  disappointment: '#888',
  pressure: '#ff4444',
}

function pickMessage(guiltState) {
  // Pick a random tone
  const tone = TONES[Math.floor(Math.random() * TONES.length)]
  const pool = guiltMessages[tone]
  const shown = (guiltState?.shownMessageIndices || [])
    .filter((k) => k.startsWith(tone + '_'))
    .map((k) => parseInt(k.split('_')[1], 10))

  // If all messages in this tone have been shown, reset and allow any
  const available =
    shown.length >= pool.length
      ? pool.map((_, i) => i)
      : pool.map((_, i) => i).filter((i) => !shown.includes(i))

  const idx = available[Math.floor(Math.random() * available.length)]
  return { tone, idx, message: pool[idx] }
}

export default function GuiltScreen() {
  const { state, dispatch } = useAppContext()
  const { guiltState } = state
  const snoozeCount = guiltState?.snoozeCount ?? 0

  // Pick a stable message on mount
  const { tone, idx, message } = useMemo(() => pickMessage(guiltState), [])
  const messageKey = `${tone}_${idx}`

  // Record this message as seen on mount
  useEffect(() => {
    dispatch({ type: ACTIONS.RECORD_GUILT_MESSAGE, shownKey: messageKey })
  }, [messageKey])

  // Flash overlay state
  const [showDisappointment, setShowDisappointment] = useState(false)

  const accent = TONE_COLORS[tone] ?? '#00d4ff'

  const handleSnooze = () => {
    dispatch({ type: ACTIONS.SNOOZE_GUILT, shownKey: messageKey })
  }

  const handleDoIt = () => {
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })
  }

  const handleGiveUp = () => {
    setShowDisappointment(true)
    setTimeout(() => {
      dispatch({ type: ACTIONS.GIVE_UP_TODAY })
    }, 1800)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '48px 24px 40px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Disappointment flash overlay */}
      {showDisappointment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10,10,10,0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <p
            style={{
              color: '#888',
              fontSize: 22,
              fontStyle: 'italic',
              textAlign: 'center',
              letterSpacing: '0.02em',
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            I'm disappointed in you.
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'left' }}>
        <div
          style={{
            color: '#555',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: 6,
          }}
        >
          System
        </div>
        <div
          style={{
            width: 28,
            height: 2,
            backgroundColor: accent,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Message block — center stage */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        <div style={{ width: '100%' }}>
          {/* Tone label */}
          <div
            style={{
              color: accent,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 18,
              opacity: 0.8,
            }}
          >
            {tone}
          </div>

          {/* Message card */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderLeft: `4px solid ${accent}`,
              borderRadius: '0 12px 12px 0',
              padding: '28px 28px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            <p
              style={{
                color: '#f0f0f0',
                fontSize: 20,
                lineHeight: 1.65,
                margin: 0,
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              {message}
            </p>
          </div>

          {/* Encounter count */}
          {snoozeCount > 0 && (
            <div
              style={{
                color: '#333',
                fontSize: 11,
                marginTop: 14,
                textAlign: 'right',
                letterSpacing: '0.06em',
              }}
            >
              encounter {snoozeCount + 1}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Primary: "I'll Do It" — always present */}
        <button
          onClick={handleDoIt}
          style={{
            backgroundColor: accent,
            color: '#0a0a0a',
            border: 'none',
            borderRadius: 8,
            padding: '15px 0',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          I'll Do It
        </button>

        {/* Secondary button: snooze (first 3 encounters) or give up (4th+) */}
        {snoozeCount < 3 ? (
          <button
            onClick={handleSnooze}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #242424',
              borderRadius: 8,
              padding: '13px 0',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
              letterSpacing: '0.02em',
            }}
          >
            Remind me in 30 min &nbsp;·&nbsp; {3 - snoozeCount} snooze{3 - snoozeCount !== 1 ? 's' : ''} left
          </button>
        ) : (
          <button
            onClick={handleGiveUp}
            style={{
              backgroundColor: 'transparent',
              color: '#ff4444',
              border: '1px solid rgba(255,68,68,0.2)',
              borderRadius: 8,
              padding: '13px 0',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
              letterSpacing: '0.02em',
            }}
          >
            Give Up on Today
          </button>
        )}
      </div>
    </div>
  )
}
