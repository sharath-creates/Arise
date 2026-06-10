import { useAppContext } from '@/store/AppContext'
import SystemWindow from './SystemWindow'

const STAT_META = {
  STR: { label: 'Strength', jp: '力', color: '#ff7a5c' },
  VIT: { label: 'Vitality', jp: '生', color: '#4ade80' },
  INT: { label: 'Intellect', jp: '知', color: '#00d4ff' },
  DIS: { label: 'Discipline', jp: '律', color: '#ffd76a' },
  FOC: { label: 'Focus', jp: '集', color: '#b14aff' },
}

export default function StatsPanel() {
  const { state } = useAppContext()
  const stats = state.program.stats || {}
  const max = Math.max(20, ...Object.values(stats))

  return (
    <SystemWindow title="Attributes" jp="能力">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(STAT_META).map(([key, meta]) => {
          const val = stats[key] || 0
          const pct = Math.min(100, (val / max) * 100)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                className="display"
                style={{ width: 38, fontSize: 12, fontWeight: 700, color: meta.color }}
              >
                {key}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  background: '#0a1322',
                  border: '1px solid #1a2940',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, transparent, ${meta.color})`,
                    boxShadow: `0 0 8px ${meta.color}55`,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <span className="mono" style={{ width: 34, textAlign: 'right', fontSize: 13, color: 'var(--text-dim)' }}>
                {val}
              </span>
              <span style={{ width: 16, fontSize: 11, color: 'var(--text-mute)' }}>{meta.jp}</span>
            </div>
          )
        })}
      </div>
    </SystemWindow>
  )
}
