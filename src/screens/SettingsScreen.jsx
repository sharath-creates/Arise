import { useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import SystemMessage from '@/components/SystemMessage'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatWakeTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h < 12 ? 'AM' : 'PM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function formatTriggerTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h < 12 ? 'AM' : 'PM'
  const displayH = h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function hhmmToMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function minutesToHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─── Slider sub-component (mirrors OnboardingScreen) ──────────────────────────

function Slider({ label, min, max, step, value, onChange, displayFn }) {
  return (
    <div style={{ width: '100%', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 700 }}>
          {displayFn ? displayFn(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#00d4ff', cursor: 'pointer', height: '4px' }}
      />
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext()
  const { settingsUsed } = state.programState
  const profile = state.userProfile || {}

  // Initialize slider values from userProfile
  const [wakeMinutes, setWakeMinutes] = useState(
    () => hhmmToMinutes(profile.targetWakeTime) ?? 330
  )
  const [dailyWater, setDailyWater] = useState(() => profile.dailyWaterTarget ?? 2)
  const [cardioDuration, setCardioDuration] = useState(() => profile.cardioDuration ?? 30)
  const [trainingDuration, setTrainingDuration] = useState(() => profile.trainingDuration ?? 45)
  const [readingPages, setReadingPages] = useState(() => profile.dailyReadingPages ?? 20)
  const [screenTimeCap, setScreenTimeCap] = useState(() => profile.dailyScreenTimeCap ?? 3)
  const [triggerMinutes, setTriggerMinutes] = useState(
    () => hhmmToMinutes(profile.triggerTime) ?? 1200
  )

  const [showConfirm, setShowConfirm] = useState(false)

  function handleSave() {
    const updates = {
      targetWakeTime: minutesToHHMM(wakeMinutes),
      dailyWaterTarget: dailyWater,
      cardioDuration: (profile.weeklyCardioSessions ?? 0) > 0 ? cardioDuration : profile.cardioDuration,
      trainingDuration: (profile.weeklyTrainingSessions ?? 0) > 0 ? trainingDuration : profile.trainingDuration,
      dailyReadingPages: readingPages,
      dailyScreenTimeCap: screenTimeCap,
      triggerTime: minutesToHHMM(triggerMinutes),
    }
    dispatch({ type: ACTIONS.SAVE_SETTINGS, updates })
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })
  }

  function handleAbandon() {
    dispatch({ type: ACTIONS.ABANDON_PROGRAM })
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'THRESHOLD' })
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
        padding: '24px 20px 48px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Back link */}
        <button
          onClick={() => dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: 13,
            padding: '0 0 24px 0',
            display: 'block',
          }}
        >
          ← Back
        </button>

        {!settingsUsed ? (
          /* ── First visit: show sliders ── */
          <>
            <h1 style={{ margin: '0 0 28px', fontSize: 24, fontWeight: 700, color: '#f0f0f0' }}>
              Adjust Your Targets
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Wake time */}
              <div style={sectionStyle}>
                <div style={sectionLabel}>Wake Time</div>
                <Slider
                  label="Wake time"
                  min={240}
                  max={600}
                  step={15}
                  value={wakeMinutes}
                  onChange={setWakeMinutes}
                  displayFn={formatWakeTime}
                />
              </div>

              {/* Daily water */}
              <div style={sectionStyle}>
                <div style={sectionLabel}>Daily Water</div>
                <Slider
                  label="Daily water"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={dailyWater}
                  onChange={setDailyWater}
                  displayFn={v => `${v}L`}
                />
              </div>

              {/* Cardio duration (only if sessions > 0) */}
              {(profile.weeklyCardioSessions ?? 0) > 0 && (
                <div style={sectionStyle}>
                  <div style={sectionLabel}>Cardio Duration</div>
                  <Slider
                    label="Cardio duration"
                    min={15}
                    max={90}
                    step={15}
                    value={cardioDuration}
                    onChange={setCardioDuration}
                    displayFn={v => `${v} min`}
                  />
                </div>
              )}

              {/* Training duration (only if sessions > 0) */}
              {(profile.weeklyTrainingSessions ?? 0) > 0 && (
                <div style={sectionStyle}>
                  <div style={sectionLabel}>Training Duration</div>
                  <Slider
                    label="Training duration"
                    min={15}
                    max={90}
                    step={15}
                    value={trainingDuration}
                    onChange={setTrainingDuration}
                    displayFn={v => `${v} min`}
                  />
                </div>
              )}

              {/* Daily reading pages */}
              <div style={sectionStyle}>
                <div style={sectionLabel}>Daily Reading Pages</div>
                <Slider
                  label="Daily reading pages"
                  min={0}
                  max={100}
                  step={5}
                  value={readingPages}
                  onChange={setReadingPages}
                  displayFn={v => v === 0 ? 'None' : `${v} pages`}
                />
              </div>

              {/* Daily screen time cap */}
              <div style={sectionStyle}>
                <div style={sectionLabel}>Daily Screen Time Cap</div>
                <Slider
                  label="Daily screen time cap"
                  min={0}
                  max={12}
                  step={0.5}
                  value={screenTimeCap}
                  onChange={setScreenTimeCap}
                  displayFn={v => v === 0 ? 'No limit' : `${v}h`}
                />
              </div>

              {/* Trigger time */}
              <div style={sectionStyle}>
                <div style={sectionLabel}>Check-in Time</div>
                <Slider
                  label="Trigger time"
                  min={1080}
                  max={1380}
                  step={30}
                  value={triggerMinutes}
                  onChange={setTriggerMinutes}
                  displayFn={formatTriggerTime}
                />
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                marginTop: 32,
                width: '100%',
                padding: '14px 0',
                backgroundColor: '#00d4ff',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              Save Changes
            </button>
          </>
        ) : (
          /* ── After first save: give up only ── */
          <>
            <h1 style={{ margin: '0 0 28px', fontSize: 24, fontWeight: 700, color: '#f0f0f0' }}>
              Settings
            </h1>

            <SystemMessage
              message="There's no going back from here."
              tone="pressure"
            />

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  marginTop: 32,
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  color: '#ff4444',
                  border: '1px solid #ff4444',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Give Up on Program
              </button>
            ) : (
              <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SystemMessage
                  message="You've come this far. Are you sure?"
                  tone="disappointment"
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '13px 0',
                      backgroundColor: '#1a1a1a',
                      color: '#f0f0f0',
                      border: '1px solid #333',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    No, keep going
                  </button>
                  <button
                    onClick={handleAbandon}
                    style={{
                      flex: 1,
                      padding: '13px 0',
                      backgroundColor: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Yes, I'm done
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const sectionStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: 8,
  padding: '14px 16px',
}

const sectionLabel = {
  color: '#888',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 12,
}
