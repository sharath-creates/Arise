import { useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { SCREENS } from '@/store/reducer'
import { ABANDON_CONFIRM_WORD } from '@/data/messages'
import SystemWindow from '@/components/SystemWindow'

function Row({ label, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '10px 0',
        borderBottom: '1px solid rgba(0,212,255,0.07)',
      }}
    >
      <span className="label">{label}</span>
      {children}
    </div>
  )
}

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext()
  const p = state.profile || {}
  const [form, setForm] = useState({
    name: p.name || 'Hunter',
    wakeTime: p.wakeTime || '06:30',
    waterTarget: p.waterTarget ?? 2,
    cardioMinutes: p.cardioMinutes ?? 30,
    trainingMinutes: p.trainingMinutes ?? 45,
    readingPages: p.readingPages ?? 20,
    screenCap: p.screenCap ?? 2,
    warnHour: p.warnHour ?? 20,
  })
  const [abandonWord, setAbandonWord] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function save() {
    const num = (v, min, max, fb) => {
      const n = parseFloat(v)
      return Number.isNaN(n) ? fb : Math.min(max, Math.max(min, n))
    }
    dispatch({
      type: ACTIONS.SAVE_SETTINGS,
      updates: {
        name: String(form.name || 'Hunter').trim().slice(0, 24),
        wakeTime: form.wakeTime || '06:30',
        waterTarget: num(form.waterTarget, 0.5, 8, 2),
        cardioMinutes: Math.round(num(form.cardioMinutes, 10, 120, 30)),
        trainingMinutes: Math.round(num(form.trainingMinutes, 10, 180, 45)),
        readingPages: Math.round(num(form.readingPages, 5, 200, 20)),
        screenCap: num(form.screenCap, 0.5, 8, 2),
        warnHour: Math.round(num(form.warnHour, 12, 23, 20)),
      },
    })
  }

  const numInput = (key, opts = {}) => (
    <input
      className="input mono"
      type="number"
      style={{ width: 110 }}
      value={form[key]}
      onChange={set(key)}
      {...opts}
    />
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ width: 'min(540px, 100%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SystemWindow title="System Parameters" jp="調整">
          <Row label="DESIGNATION">
            <input className="input" style={{ width: 200 }} value={form.name} maxLength={24} onChange={set('name')} />
          </Row>
          <Row label="WAKE TIME">
            <input className="input mono" type="time" style={{ width: 150 }} value={form.wakeTime} onChange={set('wakeTime')} />
          </Row>
          <Row label="WATER (L/DAY)">{numInput('waterTarget', { min: 0.5, max: 8, step: 0.5 })}</Row>
          <Row label="CARDIO (MIN)">{numInput('cardioMinutes', { min: 10, max: 120 })}</Row>
          <Row label="TRAINING (MIN)">{numInput('trainingMinutes', { min: 10, max: 180 })}</Row>
          <Row label="READING (PAGES)">{numInput('readingPages', { min: 5, max: 200 })}</Row>
          <Row label="SCREEN CAP (H)">{numInput('screenCap', { min: 0.5, max: 8, step: 0.5 })}</Row>
          <Row label="WARNING HOUR">{numInput('warnHour', { min: 12, max: 23 })}</Row>

          {state.program.settingsUsed ? (
            <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: '10px 0 0' }}>
              ◇ Parameter changes are on record. The System notices softened targets.
            </p>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <button
              className="btn-ghost"
              onClick={() => dispatch({ type: ACTIONS.NAVIGATE, screen: SCREENS.DASHBOARD })}
            >
              CANCEL
            </button>
            <button className="btn" onClick={save}>APPLY</button>
          </div>
        </SystemWindow>

        <SystemWindow title="Sever the Contract" jp="破棄" variant="red">
          <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '0 0 12px', lineHeight: 1.6 }}>
            Abandoning the program erases your rank, level, XP, attributes, streak
            and history. There is no archive of quitters. Type{' '}
            <span className="display" style={{ color: 'var(--red)' }}>{ABANDON_CONFIRM_WORD}</span> to confirm.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input display"
              style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}
              value={abandonWord}
              onChange={e => setAbandonWord(e.target.value)}
              placeholder={ABANDON_CONFIRM_WORD}
            />
            <button
              className="btn danger"
              disabled={abandonWord.trim().toUpperCase() !== ABANDON_CONFIRM_WORD}
              onClick={() => dispatch({ type: ACTIONS.ABANDON_PROGRAM })}
            >
              SEVER
            </button>
          </div>
        </SystemWindow>
      </div>
    </div>
  )
}
