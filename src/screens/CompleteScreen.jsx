import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { getLevelInfo, getRank } from '@/logic/xp'
import { PROGRAM_LENGTH } from '@/logic/day'
import RankBadge from '@/components/RankBadge'
import SystemWindow from '@/components/SystemWindow'

export default function CompleteScreen() {
  const { state, dispatch } = useAppContext()
  const { profile, program, dailyLog } = state
  const { level } = getLevelInfo(program.totalXP)
  const rank = getRank(level)

  const clearedDays = Object.values(dailyLog).filter(
    log => log && !log.surrendered && Object.keys(log.mandatoryDone || {}).length === 6
  ).length

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
      <div style={{ width: 'min(540px, 100%)', textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 10 }}>FINAL TRANSMISSION</div>
        <h1
          className="display"
          style={{
            fontSize: 'clamp(34px, 8vw, 52px)',
            fontWeight: 900,
            letterSpacing: '0.1em',
            margin: '0 0 6px',
            color: 'var(--gold)',
            textShadow: '0 0 40px var(--gold-glow)',
          }}
        >
          PROGRAM COMPLETE
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 26px' }}>
          {PROGRAM_LENGTH} days have passed, {profile?.name || 'Hunter'}.
          The person who took the oath no longer exists.
        </p>

        <SystemWindow title="Final Record" jp="記録" variant="gold">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <RankBadge level={level} size={88} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 14,
              textAlign: 'center',
            }}
          >
            {[
              ['FINAL RANK', `${rank.id}`],
              ['LEVEL', `${level}`],
              ['TOTAL XP', `${program.totalXP}`],
              ['DAYS CLEARED', `${clearedDays}/${PROGRAM_LENGTH}`],
              ['MILESTONES', `${program.lockedMilestones.length}/7`],
              ['BEST STREAK SEALED', program.lockedMilestones.length > 0 ? `DAY ${Math.max(...program.lockedMilestones)}` : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="label" style={{ fontSize: 9, marginBottom: 4 }}>{label}</div>
                <div className="display mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 12, color: 'var(--text-mute)' }}>
            Attributes — {Object.entries(program.stats).map(([k, v]) => `${k} ${v}`).join(' · ')}
          </div>
        </SystemWindow>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn gold" onClick={() => dispatch({ type: ACTIONS.RESTART_PROGRAM })}>
            BEGIN A NEW CYCLE
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-mute)' }}>
          A new cycle starts at Day 1 with your parameters intact. Rank resets. Hunger shouldn't.
        </div>
      </div>
    </div>
  )
}
