import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { SCREENS } from '@/store/reducer'
import { getLevelInfo, getRank, getNextRank } from '@/logic/xp'
import { PROGRAM_LENGTH, MILESTONE_DAYS } from '@/logic/day'
import RankBadge from './RankBadge'

export default function HunterHUD() {
  const { state, dispatch } = useAppContext()
  const { profile, program } = state
  const { level, intoLevel, needed } = getLevelInfo(program.totalXP)
  const rank = getRank(level)
  const nextRank = getNextRank(level)

  const nextMilestone = MILESTONE_DAYS.find(
    m => m >= program.currentDay && !program.lockedMilestones.includes(m)
  )

  return (
    <header className="hud">
      <div className="hud-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RankBadge level={level} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <span
                className="display glitch"
                data-text={(profile?.name || 'HUNTER').toUpperCase()}
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {(profile?.name || 'HUNTER').toUpperCase()}
              </span>
              <span className="label" style={{ whiteSpace: 'nowrap' }}>
                DAY{' '}
                <span className="mono" style={{ color: 'var(--cyan)', fontSize: 13 }}>
                  {String(program.currentDay).padStart(2, '0')}
                </span>
                /{PROGRAM_LENGTH}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '4px 0 6px',
                fontSize: 12,
                color: 'var(--text-dim)',
              }}
            >
              <span className="label" style={{ color: rank.color }}>
                {rank.id}-RANK · LV.{level}
              </span>
              <span style={{ color: 'var(--text-mute)' }}>|</span>
              <span>
                🔥{' '}
                <span className="mono" style={{ color: 'var(--gold)' }}>
                  {program.streakDays}
                </span>{' '}
                streak
              </span>
              {nextMilestone ? (
                <>
                  <span style={{ color: 'var(--text-mute)' }}>|</span>
                  <span style={{ color: 'var(--text-mute)', fontSize: 11 }}>
                    seal at day {nextMilestone}
                  </span>
                </>
              ) : null}
            </div>

            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${(intoLevel / needed) * 100}%` }} />
              <div className="xp-notches" />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 3,
                fontSize: 10.5,
              }}
            >
              <span className="mono" style={{ color: 'var(--text-mute)' }}>
                {intoLevel} / {needed} XP
              </span>
              <span className="mono" style={{ color: 'var(--text-mute)' }}>
                {nextRank
                  ? `${nextRank.id}-RANK AT LV.${nextRank.minLevel}`
                  : 'MAX RANK'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: ACTIONS.NAVIGATE, screen: SCREENS.SETTINGS })}
            aria-label="System settings"
            className="btn-ghost"
            style={{ padding: '8px 11px', fontSize: 13 }}
          >
            ⚙
          </button>
        </div>
      </div>
    </header>
  )
}
