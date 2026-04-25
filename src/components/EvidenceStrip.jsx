import { useAppContext } from '@/store/AppContext'
import { getWeeklyXP } from '@/logic/xp'

export default function EvidenceStrip() {
  const { state } = useAppContext()
  const { dailyLog, programState } = state
  const { currentDay, stats } = programState

  // ── XP this week ──────────────────────────────────────────────────────────
  const weeklyXP = getWeeklyXP(dailyLog, currentDay)

  // ── Top 2 stats by value ──────────────────────────────────────────────────
  const sortedStats = Object.entries(stats || {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

  const statLabel =
    sortedStats.length > 0
      ? sortedStats
          .map(([name, val]) => `+${val} ${capitalize(name)}`)
          .join('  ·  ')
      : 'No stat gains yet'

  // ── Habit consistency % ───────────────────────────────────────────────────
  const activeDays = Object.entries(dailyLog).filter(
    ([key, entry]) => Number(key) <= currentDay && (entry?.xpEarned || 0) > 0
  ).length

  const consistencyPct =
    currentDay > 0 ? Math.round((activeDays / currentDay) * 100) : 0

  const consistencyLabel =
    consistencyPct >= 80
      ? `${consistencyPct}% completion rate`
      : `${consistencyPct}% — don't let it slip`

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    { value: `${weeklyXP} XP this week`, sub: 'Weekly XP' },
    { value: statLabel, sub: 'Since Day 1' },
    { value: consistencyLabel, sub: 'Consistency' },
  ]

  return (
    <div
      style={{
        backgroundColor: '#111',
        borderTop: '1px solid #2a2a2a',
        marginTop: 8,
        padding: '14px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        borderRadius: 10,
      }}
    >
      {columns.map(col => (
        <div
          key={col.sub}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontWeight: 600,
            }}
          >
            {col.sub}
          </span>
          <span
            style={{
              fontSize: 12,
              color: '#aaa',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {col.value}
          </span>
        </div>
      ))}
    </div>
  )
}
