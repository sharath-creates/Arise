import { useState, useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { getLevel, getXPToNextLevel } from '@/logic/xp'
import { getQuestCards } from '@/logic/questStatus'
import XPLevelBar from '@/components/XPLevelBar'
import StreakIndicator from '@/components/StreakIndicator'
import QuestCard from '@/components/QuestCard'
import EvidenceStrip from '@/components/EvidenceStrip'
import DailyPointsCard from '@/components/DailyPointsCard'

function SectionHeading({ children }) {
  return (
    <h2
      style={{
        margin: '4px 0 12px',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#5c5c63',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {children}
      <span style={{ flex: 1, height: 1, background: '#222226' }} />
    </h2>
  )
}

export default function DashboardScreen() {
  const { state, dispatch } = useAppContext()
  const {
    currentDay,
    totalXP,
    streakDays,
    lockedMilestones,
  } = state.programState

  const currentLevel = getLevel(totalXP)
  const xpToNextLevel = getXPToNextLevel(totalXP)

  // Force re-render every 60 seconds so status chips update based on time
  const [, setTick] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  const todayLog = state.dailyLog[currentDay] || {}
  const questCards = getQuestCards(state.userProfile, todayLog, new Date())

  function handleSettings() {
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'SETTINGS' })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.07), transparent), #0a0a0a',
        color: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'rgba(10,10,10,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1c1c20',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '16px 20px 14px',
          }}
        >
          {/* Top row: day title + gear */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: '#f0f0f0',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              Day{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #7ae6ff)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {currentDay}
              </span>{' '}
              <span style={{ color: '#6a6a72', fontWeight: 400, fontSize: 19 }}>
                of 66
              </span>
            </h1>

            <button
              onClick={handleSettings}
              aria-label="Open settings"
              style={{
                background: '#1a1a1e',
                border: '1px solid #2a2a2e',
                cursor: 'pointer',
                padding: '6px 9px',
                borderRadius: 10,
      