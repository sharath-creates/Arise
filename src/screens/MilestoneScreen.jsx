import { useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import SystemMessage from '@/components/SystemMessage'

const MILESTONE_DATA = {
  1: {
    name: 'The First Step',
    message: "Day one. Most people never start. You did. That's not nothing — but it's also just the beginning.",
  },
  7: {
    name: 'One Week',
    message: 'Seven days. Most people quit by now. You didn\'t. That\'s the difference between talking about it and doing it.',
  },
  14: {
    name: 'Two Weeks',
    message: 'Two weeks of showing up. Your body is changing. Your mind is starting to believe. Don\'t stop now.',
  },
  21: {
    name: 'Three Weeks',
    message: 'Twenty-one days. Science says habits form here. You\'re not just building a streak — you\'re rewiring yourself.',
  },
  35: {
    name: 'Halfway',
    message: 'Halfway through 66 days. This is where most people coast. You don\'t get to coast. Finish what you started.',
  },
  48: {
    name: 'The Long Game',
    message: 'Forty-eight days. You\'ve outlasted every excuse, every bad morning, every reason to quit. Keep that streak.',
  },
  66: {
    name: 'Complete',
    message: 'Sixty-six days. You said you would, and you did. This isn\'t the end — this is who you are now.',
  },
}

export default function MilestoneScreen() {
  const { state, dispatch } = useAppContext()
  const { currentDay, streakDays } = state.programState

  const milestone = MILESTONE_DATA[currentDay] || {
    name: `Day ${currentDay}`,
    message: `Day ${currentDay} reached. The streak lives.`,
  }

  // Lock this milestone on mount
  useEffect(() => {
    dispatch({ type: ACTIONS.LOCK_MILESTONE, day: currentDay })
  }, [currentDay])

  function handleContinue() {
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })
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
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        {/* Badge */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#1a1a1a',
            border: '2px solid #c9a84c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}
        >
          🏆
        </div>

        {/* Day label */}
        <div
          style={{
            color: '#c9a84c',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 6,
          }}
        >
          Day {currentDay} Milestone
        </div>

        {/* Milestone name */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#f0f0f0',
            margin: '0 0 20px',
          }}
        >
          {milestone.name}
        </h1>

        {/* Streak locked badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#1a1a1a',
            border: '1px solid #c9a84c',
            borderRadius: 20,
            padding: '6px 14px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 14 }}>🔒</span>
          <span
            style={{
              color: '#c9a84c',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            Streak Locked — {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {/* System message */}
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <SystemMessage message={milestone.message} tone="sarcasm" />
        </div>

        {/* Continue CTA */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '14px 0',
            backgroundColor: '#c9a84c',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Begin Day {currentDay}
        </button>
      </div>
    </div>
  )
}
