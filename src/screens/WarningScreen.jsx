import { useMemo, useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { pickWarning, SURRENDER_CONFIRM_WORD } from '@/data/messages'
import { MANDATORY_QUESTS } from '@/data/quests'
import SystemWindow from '@/components/SystemWindow'

/**
 * WarningScreen — the System's evening threat when mandatory quests
 * remain incomplete. Snooze it or surrender the day.
 */
export default function WarningScreen() {
  const { state, dispatch } = useAppContext()
  const today = state.dailyLog[state.program.currentDay] || {}
  const [confirming, setConfirming] = useState(false)
  const [word, setWord] = useState('')

  const message = useMemo(
    () => pickWarning(state.warning.shownIndices || []),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const remaining = MANDATORY_QUESTS.filter(q => !today.mandatoryDone?.[q.id])

  function surrender() {
    if (word.trim().toUpperCase() !== SURRENDER_CONFIRM_WORD) return
    dispatch({ type: ACTIONS.SURRENDER_DAY })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ width: 'min(520px, 100%)' }}>
        <SystemWindow title="System Warning" jp="警告" variant="red" className="shake">
          <div style={{ textAlign: 'center', margin: '6px 0 20px' }}>
            <div
              className="display flicker"
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: 'var(--red)',
                letterSpacing: '0.12em',
                textShadow: '0 0 30px var(--red-glow)',
              }}
            >
              ⚠ PENALTY IMMINENT
            </div>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, margin: '14px 0 0' }}>
              {message.text}
            </p>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>
            UNRESOLVED DIRECTIVES — {remaining.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 20 }}>
            {remaining.map(q => (
              <div
                key={q.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  border: '1px solid rgba(255,59,92,0.25)',
                  background: 'rgba(255,59,92,0.05)',
                  fontSize: 13,
                }}
              >
                <span className="display" style={{ fontSize: 12, fontWeight: 700 }}>
                  {q.name.toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  forfeits +{q.xp} XP
                </span>
              </div>
            ))}
          </div>

          {!confirming ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() =>
                  dispatch({ type: ACTIONS.SNOOZE_WARNING, messageIndex: message.index })
                }
              >
                RETURN TO QUESTS
              </button>
              <button className="btn-ghost danger" onClick={() => setConfirming(true)}>
                SURRENDER THE DAY
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '0 0 10px' }}>
                Type <span className="display" style={{ color: 'var(--red)' }}>{SURRENDER_CONFIRM_WORD}</span> to
                mark this day FAILED. XP earning locks until midnight.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <input
                  className="input display"
                  style={{ width: 220, textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                  value={word}
                  autoFocus
                  onChange={e => setWord(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') surrender() }}
                />
                <button
                  className="btn danger"
                  disabled={word.trim().toUpperCase() !== SURRENDER_CONFIRM_WORD}
                  onClick={surrender}
                >
                  CONFIRM
                </button>
              </div>
              <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setConfirming(false)}>
                I CHANGED MY MIND
              </button>
            </div>
          )}
        </SystemWindow>
      </div>
    </div>
  )
}
