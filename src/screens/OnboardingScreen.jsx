import { useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { OATH_WORD } from '@/data/messages'
import SystemWindow from '@/components/SystemWindow'

const DEFAULTS = {
  name: '',
  wakeTime: '06:30',
  waterTarget: 2,
  cardioMinutes: 30,
  trainingMinutes: 45,
  readingPages: 20,
  screenCap: 2,
  warnHour: 20,
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      {children}
      {hint ? (
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>{hint}</div>
      ) : null}
    </label>
  )
}

function NumberField({ label, value, onChange, min, max, step = 1, unit, hint }) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          className="input mono"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 110 }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{unit}</span>
      </div>
    </Field>
  )
}

export default function OnboardingScreen() {
  const { dispatch } = useAppContext()
  const [step, setStep] = useState(0) // 0 identity, 1 parameters, 2 oath
  const [form, setForm] = useState(DEFAULTS)
  const [oath, setOath] = useState('')
  const [shakeKey, setShakeKey] = useState(0)

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  function clamp(v, min, max, fallback) {
    const n = parseFloat(v)
    if (Number.isNaN(n)) return fallback
    return Math.min(max, Math.max(min, n))
  }

  function normalizedProfile() {
    return {
      name: (form.name || 'Hunter').trim().slice(0, 24),
      wakeTime: form.wakeTime || '06:30',
      waterTarget: clamp(form.waterTarget, 0.5, 8, 2),
      cardioMinutes: Math.round(clamp(form.cardioMinutes, 10, 120, 30)),
      trainingMinutes: Math.round(clamp(form.trainingMinutes, 10, 180, 45)),
      readingPages: Math.round(clamp(form.readingPages, 5, 200, 20)),
      screenCap: clamp(form.screenCap, 0.5, 8, 2),
      warnHour: Math.round(clamp(form.warnHour, 12, 23, 20)),
    }
  }

  function submitOath() {
    if (oath.trim().toUpperCase() !== OATH_WORD) {
      setShakeKey(k => k + 1)
      setOath('')
      return
    }
    dispatch({ type: ACTIONS.TAKE_OATH, profile: normalizedProfile() })
  }

  const steps = ['IDENTITY', 'PARAMETERS', 'THE OATH']

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
      <div style={{ width: 'min(540px, 100%)' }}>
        {/* step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
          {steps.map((s, i) => (
            <span
              key={s}
              className="label"
              style={{
                color: i === step ? 'var(--cyan)' : 'var(--text-mute)',
                borderBottom: i === step ? '1px solid var(--cyan)' : '1px solid transparent',
                paddingBottom: 3,
              }}
            >
              {String(i + 1).padStart(2, '0')} {s}
            </span>
          ))}
        </div>

        {step === 0 ? (
          <SystemWindow title="Registration" jp="登録">
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-dim)' }}>
              The System requires a designation for its records.
            </p>
            <Field label="HUNTER DESIGNATION">
              <input
                className="input"
                placeholder="Enter your name"
                value={form.name}
                maxLength={24}
                autoFocus
                onChange={e => set('name')(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) setStep(1) }}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" disabled={!form.name.trim()} onClick={() => setStep(1)}>
                PROCEED
              </button>
            </div>
          </SystemWindow>
        ) : null}

        {step === 1 ? (
          <SystemWindow title="Quest Parameters" jp="設定">
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-dim)' }}>
              Calibrate your six daily directives. Choose numbers that hurt a little.
            </p>

            <Field label="WAKE TIME">
              <input
                className="input mono"
                type="time"
                value={form.wakeTime}
                onChange={e => set('wakeTime')(e.target.value)}
                style={{ width: 150 }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 20px' }}>
              <NumberField label="WATER" value={form.waterTarget} onChange={set('waterTarget')} min={0.5} max={8} step={0.5} unit="litres / day" />
              <NumberField label="CARDIO" value={form.cardioMinutes} onChange={set('cardioMinutes')} min={10} max={120} unit="minutes / day" />
              <NumberField label="TRAINING" value={form.trainingMinutes} onChange={set('trainingMinutes')} min={10} max={180} unit="minutes / day" />
              <NumberField label="READING" value={form.readingPages} onChange={set('readingPages')} min={5} max={200} unit="pages / day" />
              <NumberField label="SCREEN CAP" value={form.screenCap} onChange={set('screenCap')} min={0.5} max={8} step={0.5} unit="hours / day" />
              <NumberField
                label="WARNING HOUR" value={form.warnHour} onChange={set('warnHour')}
                min={12} max={23} unit="o'clock"
                hint="When the System starts threatening you."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setStep(0)}>BACK</button>
              <button className="btn" onClick={() => setStep(2)}>PROCEED</button>
            </div>
          </SystemWindow>
        ) : null}

        {step === 2 ? (
          <SystemWindow title="The Oath" jp="誓約" variant="gold" key={shakeKey} className={shakeKey > 0 ? 'shake' : ''}>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7 }}>
              66 days. Six directives, every day. No negotiation, no rest days,
              no excuses the System will accept.
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
              Type <span className="display" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>{OATH_WORD}</span> to bind the contract.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input display"
                style={{ letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: 18, textAlign: 'center' }}
                placeholder={OATH_WORD}
                value={oath}
                autoFocus
                onChange={e => setOath(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitOath() }}
              />
              <button className="btn gold" onClick={submitOath}>BIND</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setStep(1)}>BACK</button>
            </div>
          </SystemWindow>
        ) : null}
      </div>
    </div>
  )
}
