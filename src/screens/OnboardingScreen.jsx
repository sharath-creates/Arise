import { useState } from 'react'
import { useAppContext } from '../store/AppContext'
import { ACTIONS } from '../store/actions'

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

function minutesToHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─── sub-components ───────────────────────────────────────────────────────────

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

function ChoiceButton({ text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        background: selected ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: `2px solid ${selected ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`,
        color: selected ? '#00d4ff' : '#a0a0a0',
        fontSize: '0.95rem',
        fontWeight: selected ? 600 : 400,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'all 0.15s',
        lineHeight: 1.4,
      }}
    >
      {text}
    </button>
  )
}

// ─── question definitions ─────────────────────────────────────────────────────

const QUESTIONS = [
  { id: 'age', type: 'slider' },
  { id: 'lifeSituation', type: 'choice' },
  { id: 'reasonForReset', type: 'choice' },
  { id: 'stressPrideAssessment', type: 'choice' },
  { id: 'readiness', type: 'choice' },
  { id: 'ambitionLevel', type: 'choice' },
  { id: 'targetWakeTime', type: 'slider' },
  { id: 'habits', type: 'habits' },
  { id: 'triggerTime', type: 'slider' },
]

// ─── main component ───────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { dispatch } = useAppContext()
  const [questionIndex, setQuestionIndex] = useState(0)

  // Individual answer states
  const [age, setAge] = useState(25)
  const [lifeSituation, setLifeSituation] = useState(null)
  const [reasonForReset, setReasonForReset] = useState(null)
  const [stressPrideAssessment, setStressPrideAssessment] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [ambitionLevel, setAmbitionLevel] = useState(null)
  // Wake time: 4:00 AM = 240 min, 10:00 AM = 600 min, default 5:30 AM = 330 min
  const [wakeMinutes, setWakeMinutes] = useState(330)
  // Habits
  const [dailyWater, setDailyWater] = useState(2)
  const [cardioSessions, setCardioSessions] = useState(3)
  const [cardioDuration, setCardioDuration] = useState(30)
  const [trainingSessions, setTrainingSessions] = useState(3)
  const [trainingDuration, setTrainingDuration] = useState(45)
  const [readingPages, setReadingPages] = useState(20)
  const [screenTimeCap, setScreenTimeCap] = useState(3)
  // Trigger time: 6:00 PM = 1080 min, 11:00 PM = 1380 min, default 8:00 PM = 1200 min
  const [triggerMinutes, setTriggerMinutes] = useState(1200)

  const q = QUESTIONS[questionIndex]
  const isLast = questionIndex === QUESTIONS.length - 1

  // ── validity check ──────────────────────────────────────────────────────────
  function isValid() {
    if (q.id === 'lifeSituation') return lifeSituation !== null
    if (q.id === 'reasonForReset') return reasonForReset !== null
    if (q.id === 'stressPrideAssessment') return stressPrideAssessment !== null
    if (q.id === 'readiness') return readiness !== null
    if (q.id === 'ambitionLevel') return ambitionLevel !== null
    return true // sliders always valid (have defaults)
  }

  // ── advance / complete ──────────────────────────────────────────────────────
  function handleNext() {
    if (!isValid()) return

    if (isLast) {
      const userProfile = {
        age,
        lifeSituation,
        reasonForReset,
        stressPrideAssessment,
        readiness,
        ambitionLevel,
        targetWakeTime: minutesToHHMM(wakeMinutes),
        dailyWaterTarget: dailyWater,
        weeklyCardioSessions: cardioSessions,
        cardioDuration: cardioSessions > 0 ? cardioDuration : 0,
        weeklyTrainingSessions: trainingSessions,
        trainingDuration: trainingSessions > 0 ? trainingDuration : 0,
        dailyReadingPages: readingPages,
        dailyScreenTimeCap: screenTimeCap,
        triggerTime: minutesToHHMM(triggerMinutes),
      }
      dispatch({ type: ACTIONS.COMPLETE_ONBOARDING, userProfile })
    } else {
      setQuestionIndex(i => i + 1)
    }
  }

  // ── render question ─────────────────────────────────────────────────────────
  function renderQuestion() {
    switch (q.id) {
      case 'age':
        return (
          <>
            <h2 style={styles.questionLabel}>How old are you?</h2>
            <div style={{ width: '100%', maxWidth: '420px', marginTop: '2rem' }}>
              <Slider
                label="Age"
                min={13}
                max={60}
                step={1}
                value={age}
                onChange={setAge}
                displayFn={v => `${v} years`}
              />
            </div>
          </>
        )

      case 'lifeSituation':
        return (
          <>
            <h2 style={styles.questionLabel}>Where are you right now?</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              {[
                'Drifting. No real direction.',
                'Busy but getting nowhere.',
                'Coasting on past momentum.',
                'Rock bottom, tired of it.',
              ].map(opt => (
                <ChoiceButton
                  key={opt}
                  text={opt}
                  selected={lifeSituation === opt}
                  onClick={() => setLifeSituation(opt)}
                />
              ))}
            </div>
          </>
        )

      case 'reasonForReset':
        return (
          <>
            <h2 style={styles.questionLabel}>Why are you actually here?</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              {[
                "I've been saying 'I'll start Monday' for months.",
                'I watched someone else succeed and it stung.',
                "I hit a wall I can't ignore anymore.",
                'I need proof I can do hard things.',
              ].map(opt => (
                <ChoiceButton
                  key={opt}
                  text={opt}
                  selected={reasonForReset === opt}
                  onClick={() => setReasonForReset(opt)}
                />
              ))}
            </div>
          </>
        )

      case 'stressPrideAssessment':
        return (
          <>
            <h2 style={styles.questionLabel}>What describes you most honestly?</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              {[
                'High stress, low output.',
                'Comfortable but uninspired.',
                'Inconsistent — good weeks, bad months.',
                'Burned out but still pushing.',
              ].map(opt => (
                <ChoiceButton
                  key={opt}
                  text={opt}
                  selected={stressPrideAssessment === opt}
                  onClick={() => setStressPrideAssessment(opt)}
                />
              ))}
            </div>
          </>
        )

      case 'readiness':
        return (
          <>
            <h2 style={styles.questionLabel}>How ready are you, really?</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              {[
                'Not at all — but here anyway.',
                "Somewhat — I keep stopping.",
                "Ready but I've said that before.",
                "More ready than I've ever been.",
              ].map(opt => (
                <ChoiceButton
                  key={opt}
                  text={opt}
                  selected={readiness === opt}
                  onClick={() => setReadiness(opt)}
                />
              ))}
            </div>
          </>
        )

      case 'ambitionLevel':
        return (
          <>
            <h2 style={styles.questionLabel}>What are you actually after?</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              {[
                'I just want to feel in control.',
                'I want to become someone I respect.',
                'I want results people notice.',
                'I want to prove something to myself.',
              ].map(opt => (
                <ChoiceButton
                  key={opt}
                  text={opt}
                  selected={ambitionLevel === opt}
                  onClick={() => setAmbitionLevel(opt)}
                />
              ))}
            </div>
          </>
        )

      case 'targetWakeTime':
        return (
          <>
            <h2 style={styles.questionLabel}>When will you wake up?</h2>
            <div style={{ width: '100%', maxWidth: '420px', marginTop: '2rem' }}>
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
          </>
        )

      case 'habits':
        return (
          <>
            <h2 style={styles.questionLabel}>Set your daily targets.</h2>
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '2rem' }}>
              <Slider
                label="Daily water"
                min={0.5}
                max={4}
                step={0.5}
                value={dailyWater}
                onChange={setDailyWater}
                displayFn={v => `${v}L`}
              />
              <div style={{ marginTop: '0.75rem' }} />
              <Slider
                label="Cardio sessions / week"
                min={0}
                max={7}
                step={1}
                value={cardioSessions}
                onChange={setCardioSessions}
                displayFn={v => v === 0 ? 'None' : `${v}x / week`}
              />
              {cardioSessions > 0 && (
                <Slider
                  label="Cardio duration"
                  min={15}
                  max={90}
                  step={15}
                  value={cardioDuration}
                  onChange={setCardioDuration}
                  displayFn={v => `${v} min`}
                />
              )}
              <div style={{ marginTop: '0.75rem' }} />
              <Slider
                label="Training sessions / week"
                min={0}
                max={7}
                step={1}
                value={trainingSessions}
                onChange={setTrainingSessions}
                displayFn={v => v === 0 ? 'None' : `${v}x / week`}
              />
              {trainingSessions > 0 && (
                <Slider
                  label="Training duration"
                  min={15}
                  max={90}
                  step={15}
                  value={trainingDuration}
                  onChange={setTrainingDuration}
                  displayFn={v => `${v} min`}
                />
              )}
              <div style={{ marginTop: '0.75rem' }} />
              <Slider
                label="Daily reading pages"
                min={0}
                max={100}
                step={5}
                value={readingPages}
                onChange={setReadingPages}
                displayFn={v => v === 0 ? 'None' : `${v} pages`}
              />
              <div style={{ marginTop: '0.75rem' }} />
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
          </>
        )

      case 'triggerTime':
        return (
          <>
            <h2 style={styles.questionLabel}>When should Arise check in on you?</h2>
            <div style={{ width: '100%', maxWidth: '420px', marginTop: '2rem' }}>
              <Slider
                label="Check-in time"
                min={1080}
                max={1380}
                step={30}
                value={triggerMinutes}
                onChange={setTriggerMinutes}
                displayFn={formatTriggerTime}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  const canAdvance = isValid()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Question content */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {renderQuestion()}

        {/* Next / Complete button */}
        {canAdvance && (
          <button
            onClick={handleNext}
            style={{
              marginTop: '2.5rem',
              padding: '0.9rem 2.5rem',
              background: '#00d4ff',
              border: 'none',
              color: '#0a0a0a',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'opacity 0.15s',
              alignSelf: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {isLast ? 'Complete Assessment' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  questionLabel: {
    color: '#f0f0f0',
    fontSize: 'clamp(1.4rem, 5vw, 2rem)',
    fontWeight: 700,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.3,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
}
