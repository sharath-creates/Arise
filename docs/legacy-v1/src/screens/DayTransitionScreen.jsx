import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import SystemMessage from '@/components/SystemMessage'

const MILESTONE_DAYS = [1, 7, 14, 21, 35, 48, 66]

export default function DayTransitionScreen() {
  const { state, dispatch } = useAppContext()
  const { currentDay, rollbackApplied, rollbackFromDay, lockedMilestones } = state.programState

  const prevDay = currentDay - 1
  const prevLog = state.dailyLog[prevDay] || {}
  const todayLog = state.dailyLog[currentDay] || {}
  const rolledOverTasks = todayLog.rolledOverTasks || []

  function handleContinue() {
    const isMilestone = MILESTONE_DAYS.includes(currentDay)
    const alreadyLocked = lockedMilestones.includes(currentDay)

    if (rollbackApplied) {
      dispatch({ type: ACTIONS.CLEAR_ROLLBACK })
    }

    if (isMilestone && !alreadyLocked) {
      dispatch({ type: ACTIONS.NAVIGATE, screen: 'MILESTONE' })
    } else {
      dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })
    }
  }

  function renderContent() {
    if ((prevLog.xpEarned || 0) > 0) {
      return (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✓</div>
            <h2 style={{ color: '#00d4ff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Day {prevDay} Complete
            </h2>
            <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>
              +{prevLog.xpEarned || 0} XP earned
            </p>
          </div>
          <SystemMessage
            message={`Day ${prevDay} done. Day ${currentDay} starts now. Keep going.`}
            tone="sarcasm"
          />
        </>
      )
    }

    // Nothing done — pressure message + rolled-over tasks
    return (
      <>
        <SystemMessage
          message={`You did nothing on Day ${prevDay}. The quests don't disappear. They pile up.`}
          tone="pressure"
        />
        {rolledOverTasks.length > 0 && (
          <div
            style={{
              marginTop: 20,
              backgroundColor: '#1a1a1a',
              borderRadius: 8,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                color: '#888',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              Tasks carried forward:
            </div>
            {rolledOverTasks.map((task) => (
              <div
                key={task}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 0',
                  color: '#f0f0f0',
                  fontSize: 14,
                }}
              >
                <span style={{ color: '#ff4444', fontSize: 12 }}>▶</span>
                {task}
              </div>
            ))}
          </div>
        )}
        <p
          style={{
            color: '#888',
            fontSize: 13,
            marginTop: 14,
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          Skipped tasks carry a penalty. Fail three days in a row and your progress rolls back.
        </p>
      </>
    )
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
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div
          style={{
            color: '#888',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          Day {currentDay} Begins
        </div>

        {rollbackApplied && (
          <>
            <SystemMessage message="I'm disappointed in you." tone="disappointment" />
            <p style={{ color: '#888', margin: '12px 0' }}>
              Your progress has been rolled back to Day {rollbackFromDay}.
            </p>
          </>
        )}

        {renderContent()}

        <button
          onClick={handleContinue}
          style={{
            marginTop: 32,
            width: '100%',
            padding: '14px 0',
            backgroundColor: '#00d4ff',
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
