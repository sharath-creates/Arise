import { useAppContext } from '../store/AppContext'
import { ACTIONS } from '../store/actions'
import { getStatProjection } from '../logic/statProjection'
import { getLevel } from '../logic/xp'
import StatRow from '../components/StatRow'

const STAT_LABELS = [
  { key: 'wisdom',     label: 'Wisdom' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'strength',   label: 'Strength' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'focus',      label: 'Focus' },
]

const FALLBACK_PROJECTED_XP = 18000

export default function PlanConfirmationScreen() {
  const { state, dispatch } = useAppContext()

  // Derive projection — handle null userProfile gracefully
  const { projectedXP, projectedStats } = state.userProfile
    ? getStatProjection(state.userProfile)
    : {
        projectedXP: FALLBACK_PROJECTED_XP,
        projectedStats: { wisdom: 0, confidence: 0, strength: 0, discipline: 0, focus: 0 },
      }

  const projectedLevel = getLevel(projectedXP)

  function handleClaimPath() {
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'COMMITMENT' })
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .plan-panel {
          animation: fadeSlideUp 0.5s ease both;
        }
        .plan-panel-right {
          animation: fadeSlideUp 0.65s ease both;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Page heading */}
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          Your 66-Day Path
        </p>
        <h2
          style={{
            color: '#ffffff',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            marginBottom: '2.5rem',
            textAlign: 'center',
          }}
        >
          Here is what you're building.
        </h2>

        {/* Two-column comparison */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '860px',
            justifyContent: 'center',
          }}
        >
          {/* ── Left column: You, Today ── */}
          <div
            className="plan-panel"
            style={{
              flex: '1 1 320px',
              backgroundColor: '#111111',
              border: '1px solid #1f2937',
              borderRadius: '12px',
              padding: '2rem',
            }}
          >
            <p
              style={{
                color: '#6b7280',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              You, Today
            </p>

            {/* Level */}
            <div
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}
            >
              Level 1
            </div>
            <div
              style={{
                color: '#6b7280',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              0 XP
            </div>

            {/* Empty XP bar */}
            <div
              style={{
                height: '4px',
                backgroundColor: '#1f2937',
                borderRadius: '2px',
                marginBottom: '1rem',
              }}
            />

            <p
              style={{
                color: '#4b5563',
                fontSize: '0.85rem',
                marginBottom: '1.75rem',
                lineHeight: 1.6,
              }}
            >
              This is your starting point.
            </p>

            {/* Stat rows — all zeros, no animation */}
            {STAT_LABELS.map(({ key, label }) => (
              <StatRow
                key={key}
                statName={label}
                currentValue={0}
                projectedValue={0}
                animate={false}
              />
            ))}
          </div>

          {/* ── Right column: Day 66 Projection ── */}
          <div
            className="plan-panel-right"
            style={{
              flex: '1 1 320px',
              backgroundColor: '#0d1a1f',
              border: '1px solid #0e3a4a',
              borderRadius: '12px',
              padding: '2rem',
            }}
          >
            <p
              style={{
                color: '#00d4ff',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              Day 66 Projection
            </p>

            {/* Projected Level */}
            <div
              style={{
                color: '#00d4ff',
                fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '0.25rem',
                textShadow: '0 0 24px rgba(0,212,255,0.35)',
              }}
            >
              Level {projectedLevel}
            </div>
            <div
              style={{
                color: '#22d3ee',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              {projectedXP.toLocaleString()} XP
            </div>

            {/* Full XP bar */}
            <div
              style={{
                height: '4px',
                backgroundColor: '#0e3a4a',
                borderRadius: '2px',
                marginBottom: '1rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: '#00d4ff',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(0,212,255,0.5)',
                }}
              />
            </div>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                marginBottom: '1.75rem',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              If you show up, this is who you become.
            </p>

            {/* Animated stat rows */}
            {STAT_LABELS.map(({ key, label }) => (
              <StatRow
                key={key}
                statName={label}
                currentValue={0}
                projectedValue={projectedStats[key] ?? 0}
                animate={true}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleClaimPath}
          style={{
            marginTop: '2.5rem',
            padding: '1rem 3rem',
            border: '2px solid #00d4ff',
            background: '#00d4ff',
            color: '#0a0a0a',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '6px',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 20px rgba(0,212,255,0.25)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#00d4ff'
            e.currentTarget.style.boxShadow = '0 0 32px rgba(0,212,255,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#00d4ff'
            e.currentTarget.style.color = '#0a0a0a'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'
          }}
        >
          Claim This Path
        </button>
      </div>
    </>
  )
}
