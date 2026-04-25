import { useState, useEffect, useRef } from 'react'
import { ACTIONS } from '@/store/actions'
import { useAppContext } from '@/store/AppContext'

const ICONS = {
  wake:       '☀️',
  water:      '💧',
  cardio:     '🏃',
  training:   '💪',
  reading:    '📖',
  screenTime: '📵',
}

const STATUS_COLORS = {
  Done:       '#22c55e',
  Pending:    '#555',
  'At-Risk':  '#f59e0b',
  'Easy Win': '#00d4ff',
}

// ─── Wake CTA ────────────────────────────────────────────────────────────────
function WakeCTA({ questData, dispatch }) {
  const { status } = questData
  if (status === 'Done') {
    return <CompletedBadge label="Completed ✓" />
  }
  return (
    <CTAButton
      onClick={() =>
        dispatch({
          type: ACTIONS.LOG_QUEST_COMPLETION,
          questType: 'wake',
          value: true,
          completed: true,
        })
      }
    >
      I Woke On Time
    </CTAButton>
  )
}

// ─── Water CTA ───────────────────────────────────────────────────────────────
function WaterCTA({ questData, dispatch, userProfile }) {
  const initial = typeof questData.completionData === 'number' ? questData.completionData : 0
  const [current, setCurrent] = useState(initial)
  const target = userProfile?.dailyWaterTarget || 2

  if (questData.status === 'Done') {
    const displayVal = typeof questData.completionData === 'number' ? questData.completionData : target
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CompletedBadge label={`${displayVal.toFixed(1)}L completed ✓`} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#aaa', fontSize: 13 }}>
        {current.toFixed(1)}L / {target}L
      </span>
      <CTAButton
        onClick={() => {
          const next = parseFloat((current + 0.5).toFixed(1))
          setCurrent(next)
          dispatch({
            type: ACTIONS.LOG_QUEST_COMPLETION,
            questType: 'water',
            value: next,
            completed: next >= target,
          })
        }}
      >
        + 0.5L
      </CTAButton>
    </div>
  )
}

// ─── Timer CTA (cardio / training) ───────────────────────────────────────────
function TimerCTA({ questData, dispatch, userProfile }) {
  const { questType, status } = questData
  const durationMinutes =
    questType === 'cardio'
      ? userProfile?.cardioDuration ?? 30
      : userProfile?.trainingDuration ?? 45

  const totalSeconds = durationMinutes * 60

  const [phase, setPhase] = useState('idle') // idle | running | done | partial
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const intervalRef = useRef(null)

  // Sync initial state from completionData
  useEffect(() => {
    const cd = questData.completionData
    if (cd?.sessions > 0 && cd?.partial) setPhase('partial')
    else if (status === 'Done') setPhase('done')
  }, [])

  // Countdown tick
  useEffect(() => {
    if (phase !== 'running') return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setPhase('done')
          dispatch({
            type: ACTIONS.LOG_QUEST_COMPLETION,
            questType,
            value: { sessions: 1, partial: false },
            completed: true,
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [phase])

  function startTimer() {
    setSecondsLeft(totalSeconds)
    setPhase('running')
  }

  function endEarly() {
    clearInterval(intervalRef.current)
    setPhase('partial')
    dispatch({
      type: ACTIONS.LOG_QUEST_COMPLETION,
      questType,
      value: { sessions: 1, partial: true },
      completed: false,
    })
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  if (phase === 'done') return <CompletedBadge label="Session complete ✓" />
  if (phase === 'partial') {
    return (
      <span style={{ color: '#f59e0b', fontSize: 13, fontStyle: 'italic' }}>
        Partial — no XP awarded
      </span>
    )
  }
  if (phase === 'running') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 20,
            color: '#00d4ff',
            minWidth: 60,
          }}
        >
          {mm}:{ss}
        </span>
        <button
          onClick={endEarly}
          style={{
            background: 'none',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            color: '#f59e0b',
            fontSize: 13,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          End Early
        </button>
      </div>
    )
  }

  // idle
  return (
    <CTAButton onClick={startTimer}>
      Start {durationMinutes} min session
    </CTAButton>
  )
}

// ─── Reading CTA ─────────────────────────────────────────────────────────────
function ReadingCTA({ questData, dispatch, userProfile }) {
  const target = userProfile?.dailyReadingPages || 20
  const initial = typeof questData.completionData === 'number' ? questData.completionData : 0
  const [accumulated, setAccumulated] = useState(initial)
  const [input, setInput] = useState('')

  if (questData.status === 'Done') {
    return <CompletedBadge label={`${accumulated} / ${target} pages ✓`} />
  }

  function logPages() {
    const pages = parseInt(input, 10)
    if (!pages || pages <= 0) return
    const newTotal = accumulated + pages
    setAccumulated(newTotal)
    setInput('')
    dispatch({
      type: ACTIONS.LOG_QUEST_COMPLETION,
      questType: 'reading',
      value: newTotal,
      completed: newTotal >= target,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ color: '#aaa', fontSize: 13 }}>
        {accumulated} / {target} pages
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          min="1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="pages"
          style={{
            width: 70,
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #333',
            backgroundColor: '#111',
            color: '#f0f0f0',
            fontSize: 14,
            outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') logPages() }}
        />
        <CTAButton onClick={logPages}>Log Pages</CTAButton>
      </div>
    </div>
  )
}

// ─── Screen Time CTA ─────────────────────────────────────────────────────────
function ScreenTimeCTA({ questData, dispatch, userProfile }) {
  const cap = userProfile?.dailyScreenTimeCap || 2
  const [input, setInput] = useState(
    questData.completionData !== null && questData.completionData !== undefined
      ? String(questData.completionData)
      : ''
  )
  const [logged, setLogged] = useState(questData.status === 'Done')

  if (logged || questData.status === 'Done') {
    const val = parseFloat(input) || questData.completionData
    const met = val <= cap
    return (
      <span style={{ color: met ? '#22c55e' : '#f59e0b', fontSize: 13 }}>
        {val}h logged — {met ? 'Under cap ✓' : 'Over cap'}
      </span>
    )
  }

  function logScreenTime() {
    const hours = parseFloat(input)
    if (isNaN(hours) || hours < 0) return
    setLogged(true)
    dispatch({
      type: ACTIONS.LOG_QUEST_COMPLETION,
      questType: 'screenTime',
      value: hours,
      completed: hours <= cap,
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="number"
        min="0"
        step="0.1"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="hours"
        style={{
          width: 80,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #333',
          backgroundColor: '#111',
          color: '#f0f0f0',
          fontSize: 14,
          outline: 'none',
        }}
        onKeyDown={e => { if (e.key === 'Enter') logScreenTime() }}
      />
      <CTAButton onClick={logScreenTime}>Log Screen Time</CTAButton>
    </div>
  )
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function CTAButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#00d4ff',
        color: '#0a0a0a',
        border: 'none',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function CompletedBadge({ label }) {
  return (
    <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
      {label}
    </span>
  )
}

// ─── QuestCard ────────────────────────────────────────────────────────────────
export default function QuestCard({ questType, questData, dispatch }) {
  const { state } = useAppContext()
  const userProfile = state.userProfile

  const { title, target, weeklyContext, status, xp, statGains } = questData
  const statusColor = STATUS_COLORS[status] || '#555'

  function renderCTA() {
    switch (questType) {
      case 'wake':
        return <WakeCTA questData={questData} dispatch={dispatch} />
      case 'water':
        return <WaterCTA questData={questData} dispatch={dispatch} userProfile={userProfile} />
      case 'cardio':
      case 'training':
        return <TimerCTA questData={questData} dispatch={dispatch} userProfile={userProfile} />
      case 'reading':
        return <ReadingCTA questData={questData} dispatch={dispatch} userProfile={userProfile} />
      case 'screenTime':
        return <ScreenTimeCTA questData={questData} dispatch={dispatch} userProfile={userProfile} />
      default:
        return null
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        border: '1px solid #2a2a2a',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Row 1: icon + title + status chip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{ICONS[questType]}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>{title}</span>
        </div>
        <span
          style={{
            backgroundColor: statusColor,
            color: status === 'Pending' ? '#ccc' : '#0a0a0a',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          {status}
        </span>
      </div>

      {/* Row 2: target + weekly context */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, color: '#888' }}>{target}</span>
        {weeklyContext ? (
          <span style={{ fontSize: 12, color: '#555' }}>· {weeklyContext}</span>
        ) : null}
      </div>

      {/* Row 3: XP + stat gains */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#c9a84c',
            backgroundColor: 'rgba(201,168,76,0.1)',
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          +{xp} XP
        </span>
        <span style={{ fontSize: 12, color: '#888' }}>{statGains}</span>
      </div>

      {/* CTA area */}
      <div>{renderCTA()}</div>
    </div>
  )
}
