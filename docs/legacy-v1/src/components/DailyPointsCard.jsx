import { useMemo } from 'react'
import { ACTIONS } from '@/store/actions'
import { useAppContext } from '@/store/AppContext'
import {
  POINT_ITEMS,
  POINT_CATEGORIES,
  MAX_POINTS,
  TARGET_POINTS,
  XP_PER_POINT,
  getDailyPoints,
} from '@/data/pointSystem'

/* ── Progress ring ──────────────────────────────────────── */
function PointsRing({ points }) {
  const size = 116
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = Math.min(points / MAX_POINTS, 1)
  const targetFrac = TARGET_POINTS / MAX_POINTS
  const hit = points >= TARGET_POINTS

  // Target tick position (ring starts at 12 o'clock)
  const angle = targetFrac * 2 * Math.PI - Math.PI / 2
  const cx = size / 2
  const tickInner = r - stroke / 2 - 2
  const tickOuter = r + stroke / 2 + 2
  const tx1 = cx + tickInner * Math.cos(angle)
  const ty1 = cx + tickInner * Math.sin(angle)
  const tx2 = cx + tickOuter * Math.cos(angle)
  const ty2 = cx + tickOuter * Math.sin(angle)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hit ? '#e8c96a' : '#00d4ff'} />
            <stop offset="100%" stopColor={hit ? '#c9a84c' : '#0077a3'} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none" stroke="#26262b" strokeWidth={stroke}
        />

        {/* Progress */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            filter: hit
              ? 'drop-shadow(0 0 6px rgba(201,168,76,0.6))'
              : 'drop-shadow(0 0 5px rgba(0,212,255,0.45))',
          }}
        />

        {/* Target tick at 10 pts */}
        <line
          x1={tx1} y1={ty1} x2={tx2} y2={ty2}
          stroke={hit ? '#e8c96a' : '#666'}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1,
            color: hit ? '#e8c96a' : '#f0f0f0',
          }}
        >
          {points}
        </span>
        <span style={{ fontSize: 11, color: '#777', fontWeight: 600 }}>
          / {MAX_POINTS} pts
        </span>
      </div>
    </div>
  )
}

/* ── Single checklist row ───────────────────────────────── */
function PointRow({ item, checked, onToggle }) {
  return (
    <button
      className={`point-row${checked ? ' checked' : ''}`}
      onClick={onToggle}
      aria-pressed={checked}
    >
      <span className="point-check">{checked ? '✓' : ''}</span>
      <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
      <span
        style={{
          flex: 1,
          fontSize: 13.5,
          fontWeight: 500,
          color: checked ? '#9fdcef' : '#cfcfcf',
          textDecoration: checked ? 'none' : 'none',
        }}
      >
        {item.label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.4,
          color: checked ? '#0a0a0a' : '#888',
          background: checked
            ? 'linear-gradient(135deg, #e8c96a, #c9a84c)'
            : '#222226',
          borderRadius: 6,
          padding: '3px 8px',
          minWidth: 38,
          textAlign: 'center',
        }}
      >
        +{item.points}
      </span>
    </button>
  )
}

/* ── DailyPointsCard ────────────────────────────────────── */
export default function DailyPointsCard() {
  const { state, dispatch } = useAppContext()
  const { currentDay } = state.programState
  const todayLog = state.dailyLog[currentDay] || {}
  const pointsLog = todayLog.pointsLog || {}

  const points = useMemo(() => getDailyPoints(pointsLog), [pointsLog])
  const hit = points >= TARGET_POINTS
  const remaining = TARGET_POINTS - points

  function toggle(item) {
    dispatch({
      type: ACTIONS.TOGGLE_DAILY_POINT,
      itemId: item.id,
      checked: !pointsLog[item.id],
      points: item.points,
    })
  }

  return (
    <section
      className={`surface-card fade-up${hit ? ' target-hit' : ''}`}
      style={{
        padding: 20,
        marginBottom: 16,
        borderColor: hit ? 'rgba(201,168,76,0.4)' : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#f0f0f0',
            }}
          >
            Daily Point System
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#777' }}>
            Hit {TARGET_POINTS}+ points to win the day · {XP_PER_POINT} XP per point
          </p>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: '4px 12px',
            borderRadius: 20,
            color: hit ? '#0a0a0a' : '#9aa0a6',
            background: hit
              ? 'linear-gradient(135deg, #e8c96a, #c9a84c)'
              : '#222226',
            border: hit ? 'none' : '1px solid #2e2e33',
            whiteSpace: 'nowrap',
          }}
        >
          {hit ? 'TARGET HIT 🏆' : `${remaining} TO TARGET`}
        </span>
      </div>

      {/* Ring + checklist */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            paddingTop: 6,
          }}
        >
          <PointsRing points={points} />
          <span style={{ fontSize: 11, color: '#666' }}>
            target: {TARGET_POINTS} pts
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          {POINT_CATEGORIES.map(cat => {
            const items = POINT_ITEMS.filter(i => i.category === cat.id)
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#5c5c63',
                    padding: '0 12px',
                    marginBottom: 4,
                  }}
                >
                  {cat.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {items.map(item => (
                    <PointRow
                      key={item.id}
                      item={item}
                      checked={!!pointsLog[item.id]}
                      onToggle={() => toggle(item)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
