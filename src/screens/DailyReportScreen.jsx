import { useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { REPORT_VERDICTS } from '@/data/messages'
import SystemWindow from '@/components/SystemWindow'

const OUTCOME_COLOR = {
  CLEARED: 'var(--green)',
  PARTIAL: 'var(--gold)',
  FAILED: 'var(--red)',
}

export default function DailyReportScreen() {
  const { state, dispatch } = useAppContext()
  const report = state.lastReport

  // Defensive: opened with nothing to show — return to dashboard.
  useEffect(() => {
    if (!report) dispatch({ type: ACTIONS.ACKNOWLEDGE_REPORT })
  }, [report, dispatch])

  if (!report) return null

  const { entries, rollbackApplied, rollbackFromDay, milestonesLocked, programComplete } = report
  const latest = entries[entries.length - 1]
  const verdict = latest ? REPORT_VERDICTS[latest.outcome] : null

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
      <div style={{ width: 'min(560px, 100%)' }}>
        <SystemWindow
          title="Daily Report"
          jp="報告"
          variant={latest?.outcome === 'CLEARED' ? '' : latest?.outcome === 'FAILED' ? 'red' : 'gold'}
        >
          {verdict ? (
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div
                className="display"
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: OUTCOME_COLOR[latest.outcome],
                  textShadow: `0 0 24px ${OUTCOME_COLOR[latest.outcome]}44`,
                }}
              >
                {verdict.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
                {verdict.line}
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(e => (
              <div key={e.day} className={`report-entry ${e.outcome}`}>
                <div>
                  <div className="display" style={{ fontSize: 13, fontWeight: 700 }}>
                    DAY {e.day}
                    <span style={{ color: OUTCOME_COLOR[e.outcome], marginLeft: 10, fontSize: 11, letterSpacing: '0.15em' }}>
                      {e.outcome}
                      {e.surrendered ? ' · SURRENDERED' : ''}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 3 }}>
                    quests {e.mandatoryDone}/{e.mandatoryTotal} · points {e.points}
                    {e.pointsTargetHit ? ' ✦' : ''} · +{e.xpEarned} XP
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  🔥 {e.streakAfter}
                </div>
              </div>
            ))}
          </div>

          {milestonesLocked.length > 0 ? (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                border: '1px solid rgba(255,215,106,0.3)',
                background: 'rgba(255,215,106,0.06)',
                fontSize: 12.5,
                color: 'var(--gold)',
              }}
            >
              ✦ Milestone{milestonesLocked.length > 1 ? 's' : ''} sealed:{' '}
              day {milestonesLocked.join(', day ')}. Sealed days survive every penalty.
            </div>
          ) : null}

          {rollbackApplied ? (
            <div
              className="shake"
              style={{
                marginTop: 14,
                padding: '10px 14px',
                border: '1px solid rgba(255,59,92,0.4)',
                background: 'rgba(255,59,92,0.07)',
                fontSize: 12.5,
                color: '#ffb3c0',
              }}
            >
              ⚠ PENALTY — three consecutive failed days. Your XP and attributes were
              rolled back to the day-{rollbackFromDay} archive. Sealed milestones were spared.
            </div>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
            <button className="btn" onClick={() => dispatch({ type: ACTIONS.ACKNOWLEDGE_REPORT })}>
              {programComplete ? 'VIEW FINAL RECORD' : `BEGIN DAY ${state.program.currentDay}`}
            </button>
          </div>
        </SystemWindow>
      </div>
    </div>
  )
}
