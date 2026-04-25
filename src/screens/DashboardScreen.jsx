import { useState, useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { getLevel, getXPToNextLevel } from '@/logic/xp'
import { getQuestCards } from '@/logic/questStatus'
import XPLevelBar from '@/components/XPLevelBar'
import StreakIndicator from '@/components/StreakIndicator'
import QuestCard from '@/components/QuestCard'
import EvidenceStrip from '@/components/EvidenceStrip'

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
        backgroundColor: '#0a0a0a',
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
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a',
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
            }}
          >
            Day {currentDay}{' '}
            <span style={{ color: '#888', fontWeight: 400, fontSize: 20 }}>
              of 66
            </span>
          </h1>

          <button
            onClick={handleSettings}
            aria-label="Open settings"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6,
              fontSize: 20,
              lineHeight: 1,
              color: '#aaa',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
          >
            ⚙️
          </button>
        </div>

        {/* Streak badge */}
        <div style={{ marginBottom: 12 }}>
          <StreakIndicator
            streakDays={streakDays}
            lockedMilestones={lockedMilestones}
            currentDay={currentDay}
          />
        </div>

        {/* XP bar */}
        <XPLevelBar
          currentXP={totalXP}
          currentLevel={currentLevel}
          xpToNextLevel={xpToNextLevel}
        />
      </header>

      {/* ── Body ── */}
      <main
        style={{
          flex: 1,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {questCards.map(card => (
          <QuestCard
            key={card.questType}
            questType={card.questType}
            questData={card}
            dispatch={dispatch}
          />
        ))}
        <EvidenceStrip />
      </main>
    </div>
  )
}
