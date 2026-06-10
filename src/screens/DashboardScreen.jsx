import HunterHUD from '@/components/HunterHUD'
import QuestBoard from '@/components/QuestBoard'
import SideQuestPanel from '@/components/SideQuestPanel'
import StatsPanel from '@/components/StatsPanel'
import { useAppContext } from '@/store/AppContext'
import { getPoints, TARGET_POINTS } from '@/data/sideQuests'
import { countMandatoryDone } from '@/logic/day'
import { MANDATORY_IDS } from '@/data/quests'

function EvidenceStrip() {
  const { state } = useAppContext()
  const { program, dailyLog } = state
  const today = dailyLog[program.currentDay] || {}

  const daysElapsed = Math.max(1, program.currentDay - 1)
  const clearedDays = Object.entries(dailyLog).filter(
    ([d, log]) =>
      Number(d) < program.currentDay &&
      countMandatoryDone(log) === MANDATORY_IDS.length &&
      !log.surrendered
  ).length
  const consistency = Math.round((clearedDays / daysElapsed) * 100)

  const cols = [
    { label: 'XP TODAY', value: `${today.xpEarned || 0}` },
    { label: 'POINTS TODAY', value: `${getPoints(today.sideLog || {})} / ${TARGET_POINTS}` },
    {
      label: 'CLEAR RATE',
      value: program.currentDay === 1 ? '—' : `${consistency}%`,
    },
  ]

  return (
    <div
      className="sys-window"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '14px 18px' }}
    >
      {cols.map(c => (
        <div key={c.label}>
          <div className="label" style={{ fontSize: 9, marginBottom: 4 }}>{c.label}</div>
          <div className="mono" style={{ fontSize: 16, color: 'var(--text)' }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardScreen() {
  const { state } = useAppContext()
  const { program, dailyLog } = state
  const today = dailyLog[program.currentDay] || {}

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <HunterHUD />

      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '20px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {today.surrendered ? (
          <div
            className="sys-window red"
            style={{ padding: '12px 18px', textAlign: 'center' }}
          >
            <span className="label" style={{ color: 'var(--red)' }}>
              YOU SURRENDERED THIS DAY. THE PENALTY ARRIVES AT MIDNIGHT.
            </span>
          </div>
        ) : null}

        <QuestBoard />
        <SideQuestPanel />
        <StatsPanel />
        <EvidenceStrip />

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>
          The System is always watching. 〔 監視中 〕
        </div>
      </main>
    </div>
  )
}
