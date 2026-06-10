import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import {
  SIDE_QUESTS,
  SIDE_CATEGORIES,
  MAX_POINTS,
  TARGET_POINTS,
  XP_PER_POINT,
  getPoints,
} from '@/data/sideQuests'
import { allMandatoryDone } from '@/logic/day'
import SystemWindow from './SystemWindow'

function PointsRing({ points, overdrive }) {
  const size = 124
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = Math.min(points / MAX_POINTS, 1)
  const hit = points >= TARGET_POINTS
  const cx = size / 2

  // tick at the target fraction
  const angle = (TARGET_POINTS / MAX_POINTS) * 2 * Math.PI - Math.PI / 2
  const t1 = r - stroke / 2 - 3
  const t2 = r + stroke / 2 + 3

  const color = hit ? 'var(--gold)' : 'var(--violet)'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#141d31" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 6px ${hit ? 'var(--gold-glow)' : 'var(--violet-glow)'})`,
          }}
        />
        <line
          x1={cx + t1 * Math.cos(angle)} y1={cx + t1 * Math.sin(angle)}
          x2={cx + t2 * Math.cos(angle)} y2={cx + t2 * Math.sin(angle)}
          stroke={hit ? 'var(--gold)' : '#3a4a64'} strokeWidth="2"
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span
          className="display"
          style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: hit ? 'var(--gold)' : 'var(--text)' }}
        >
          {points}
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>
          / {MAX_POINTS} PTS
        </span>
        {overdrive ? (
          <span className="label" style={{ color: 'var(--gold)', fontSize: 8, marginTop: 2 }}>
            2X ACTIVE
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default function SideQuestPanel() {
  const { state, dispatch } = useAppContext()
  const { program } = state
  const today = state.dailyLog[program.currentDay] || {}
  const sideLog = today.sideLog || {}
  const surrendered = !!today.surrendered

  const points = getPoints(sideLog)
  const hit = points >= TARGET_POINTS
  const overdrive = !!today.allClear || allMandatoryDone(today)

  function toggle(item) {
    if (surrendered) return
    dispatch({
      type: ACTIONS.TOGGLE_SIDE_QUEST,
      itemId: item.id,
      checked: !sideLog[item.id],
    })
  }

  return (
    <SystemWindow
      title="Side Quests"
      jp="副次"
      variant={hit ? 'gold' : 'violet'}
      right={
        overdrive ? (
          <span className="tag overdrive">OVERDRIVE 2X</span>
        ) : (
          <span className="tag side">BONUS XP</span>
        )
      }
    >
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-mute)' }}>
        Optional directives. {XP_PER_POINT} XP per point
        {overdrive
          ? ' — doubled while Overdrive is active.'
          : ` — clear all mandatory quests to unlock 2X. Target: ${TARGET_POINTS}+ points.`}
      </p>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 4 }}>
          <PointsRing points={points} overdrive={overdrive} />
          <span className="label" style={{ fontSize: 9 }}>
            TARGET {TARGET_POINTS} PTS
          </span>
          {hit ? (
            <span className="tag xp" style={{ fontSize: 9 }}>TARGET SECURED</span>
          ) : null}
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          {SIDE_CATEGORIES.map(cat => (
            <div key={cat.id} style={{ marginBottom: 10 }}>
              <div className="label" style={{ padding: '0 12px', marginBottom: 5 }}>
                {cat.label} <span style={{ letterSpacing: '0.3em', marginLeft: 4 }}>{cat.sub}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {SIDE_QUESTS.filter(q => q.category === cat.id).map(item => {
                  const checked = !!sideLog[item.id]
                  const xp = item.points * XP_PER_POINT * (overdrive ? 2 : 1)
                  return (
                    <button
                      key={item.id}
                      className={`side-row${checked ? ' checked' : ''}`}
                      onClick={() => toggle(item)}
                      disabled={surrendered}
                      aria-pressed={checked}
                    >
                      <span className="side-check"><span>{checked ? '✦' : ''}</span></span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                        {checked ? 'LOGGED' : `+${xp} XP`}
                      </span>
                      <span
                        className="tag"
                        style={{
                          color: checked ? '#120a1c' : 'var(--violet)',
                          background: checked
                            ? 'linear-gradient(135deg, #d9a8ff, var(--violet))'
                            : 'rgba(177,74,255,0.08)',
                          border: checked ? 'none' : '1px solid rgba(177,74,255,0.35)',
                          minWidth: 34,
                          textAlign: 'center',
                        }}
                      >
                        +{item.points}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SystemWindow>
  )
}
