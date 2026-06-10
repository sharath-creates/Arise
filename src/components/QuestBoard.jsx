import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { MANDATORY_QUESTS } from '@/data/quests'
import SystemWindow from './SystemWindow'

const ICONS = {
  sunrise: '◢◤',
  droplet: '◈',
  run: '➤➤',
  sword: '⚔',
  book: '▤',
  shield: '⬡',
}

function StatTags({ stats }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      {Object.entries(stats).map(([k, v]) => (
        <span key={k} className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>
          {k}+{v}
        </span>
      ))}
    </span>
  )
}

/* ── per-kind controls ──────────────────────────────────── */

function ConfirmControl({ quest, dispatch }) {
  return (
    <button
      className="btn"
      onClick={() =>
        dispatch({
          type: ACTIONS.COMPLETE_MANDATORY,
          questId: quest.id,
          value: true,
          completed: true,
        })
      }
    >
      {quest.ctaLabel || 'CONFIRM'}
    </button>
  )
}

function CounterControl({ quest, profile, progress, dispatch }) {
  const target = quest.target(profile)
  const current = typeof progress === 'number' ? progress : 0
  const [custom, setCustom] = useState('')

  function log(amount) {
    if (!amount || amount <= 0) return
    const next = Math.round((current + amount) * 10) / 10
    dispatch({
      type: ACTIONS.COMPLETE_MANDATORY,
      questId: quest.id,
      value: next,
      completed: next >= target,
    })
    setCustom('')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span className="mono" style={{ fontSize: 13, color: 'var(--text-dim)', minWidth: 84 }}>
        {current} / {target} {quest.unit}
      </span>
      <button className="btn-ghost" onClick={() => log(quest.step)}>
        +{quest.step} {quest.unit}
      </button>
      {quest.step === 1 ? (
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <input
            className="input mono"
            style={{ width: 76, padding: '7px 10px', fontSize: 13 }}
            type="number"
            min="1"
            placeholder={quest.unit}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') log(parseInt(custom, 10)) }}
          />
          <button className="btn-ghost" onClick={() => log(parseInt(custom, 10))}>
            LOG
          </button>
        </span>
      ) : null}
    </div>
  )
}

function TimerControl({ quest, profile, dispatch }) {
  const minutes = quest.minutes(profile)
  const total = minutes * 60
  const [phase, setPhase] = useState('idle') // idle | running
  const [left, setLeft] = useState(total)
  const ref = useRef(null)

  useEffect(() => {
    if (phase !== 'running') return undefined
    ref.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          clearInterval(ref.current)
          setPhase('idle')
          dispatch({
            type: ACTIONS.COMPLETE_MANDATORY,
            questId: quest.id,
            value: { minutes },
            completed: true,
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'running') {
    const mm = String(Math.floor(left / 60)).padStart(2, '0')
    const ss = String(left % 60).padStart(2, '0')
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          className="mono flicker"
          style={{ fontSize: 22, color: 'var(--cyan)', textShadow: '0 0 12px var(--cyan-glow)' }}
        >
          {mm}:{ss}
        </span>
        <button
          className="btn-ghost danger"
          onClick={() => {
            clearInterval(ref.current)
            setPhase('idle')
            setLeft(total)
          }}
        >
          ABORT — NO XP
        </button>
      </div>
    )
  }

  return (
    <button className="btn" onClick={() => { setLeft(total); setPhase('running') }}>
      BEGIN {minutes} MIN TRIAL
    </button>
  )
}

function ReportControl({ quest, profile, dispatch }) {
  const cap = quest.cap(profile)
  const [input, setInput] = useState('')

  function log() {
    const hours = parseFloat(input)
    if (Number.isNaN(hours) || hours < 0) return
    dispatch({
      type: ACTIONS.COMPLETE_MANDATORY,
      questId: quest.id,
      value: hours,
      completed: hours <= cap,
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        className="input mono"
        style={{ width: 84, padding: '7px 10px', fontSize: 13 }}
        type="number"
        min="0"
        step="0.1"
        placeholder="hours"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') log() }}
      />
      <button className="btn-ghost" onClick={log}>REPORT</button>
    </div>
  )
}

/* ── row ────────────────────────────────────────────────── */

function QuestRow({ quest, today, profile, dispatch, surrendered }) {
  const done = !!today.mandatoryDone?.[quest.id]
  const progress = today.mandatoryProgress?.[quest.id]
  const hour = new Date().getHours()
  const risk = !done && hour >= (profile?.warnHour ?? 20) - 2

  const stateClass = done ? 'done' : risk ? 'risk' : 'active'

  function renderControl() {
    if (done) {
      return (
        <span className="tag clear" style={{ fontSize: 10, padding: '4px 12px' }}>
          ✓ CLEAR
        </span>
      )
    }
    if (surrendered) {
      return (
        <span className="label" style={{ color: 'var(--red)' }}>
          DAY SURRENDERED — LOCKED
        </span>
      )
    }
    switch (quest.kind) {
      case 'confirm': return <ConfirmControl quest={quest} dispatch={dispatch} />
      case 'counter': return <CounterControl quest={quest} profile={profile} progress={progress} dispatch={dispatch} />
      case 'timer':   return <TimerControl quest={quest} profile={profile} dispatch={dispatch} />
      case 'report':  return <ReportControl quest={quest} profile={profile} dispatch={dispatch} />
      default: return null
    }
  }

  // Screen-limit special: failed report (over cap) still logs progress.
  const overCap =
    quest.kind === 'report' && !done && typeof progress === 'number'

  return (
    <li className={`quest-row ${stateClass}`} style={{ listStyle: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: done ? 'var(--green)' : 'var(--cyan)', fontSize: 13, width: 28 }}>
          {ICONS[quest.icon] || '◆'}
        </span>
        <span className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em' }}>
          {quest.name.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.2em' }}>
          {quest.sub}
        </span>
        <span style={{ flex: 1 }} />
        <span className="tag xp">+{quest.xp} XP</span>
        <span className="tag mandatory">MANDATORY</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {quest.desc(profile)} · <StatTags stats={quest.stats} />
          {overCap ? (
            <span style={{ color: 'var(--red)', marginLeft: 8, fontSize: 12 }}>
              {progress}h logged — over cap, re-report if corrected
            </span>
          ) : null}
        </span>
        {renderControl()}
      </div>
    </li>
  )
}

/* ── board ──────────────────────────────────────────────── */

export default function QuestBoard() {
  const { state, dispatch } = useAppContext()
  const { profile, program } = state
  const today = state.dailyLog[program.currentDay] || {}
  const doneCount = MANDATORY_QUESTS.filter(q => today.mandatoryDone?.[q.id]).length

  return (
    <SystemWindow
      title="Daily Quests"
      jp="任務"
      right={
        <span className="mono" style={{ fontSize: 12, color: doneCount === 6 ? 'var(--green)' : 'var(--text-dim)' }}>
          {doneCount}/6
        </span>
      }
    >
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-mute)' }}>
        Clear all six before midnight. Failure to comply will incur a penalty.
      </p>
      <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MANDATORY_QUESTS.map(q => (
          <QuestRow
            key={q.id}
            quest={q}
            today={today}
            profile={profile}
            dispatch={dispatch}
            surrendered={!!today.surrendered}
          />
        ))}
      </ul>
    </SystemWindow>
  )
}
