import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { RANKS } from '@/logic/xp'

/**
 * CeremonyOverlay — full-screen celebration for rank-ups and milestone seals.
 * Renders the first queued ceremony; acknowledging shifts the queue.
 */
export default function CeremonyOverlay() {
  const { state, dispatch } = useAppContext()
  const ceremony = state.ceremonies?.[0]
  if (!ceremony) return null

  const ack = () => dispatch({ type: ACTIONS.ACK_CEREMONY })

  if (ceremony.type === 'RANK_UP') {
    const rank = RANKS.find(r => r.id === ceremony.rank) || RANKS[0]
    return (
      <div className="ceremony" onClick={ack}>
        <div className="ceremony-burst" style={{ background: `radial-gradient(circle, ${rank.glow} 0%, transparent 65%)` }} />
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div className="label" style={{ marginBottom: 14 }}>NOTIFICATION</div>
          <div className="label" style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 18 }}>
            HUNTER RANK REASSESSMENT COMPLETE
          </div>
          <div
            className="display"
            style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              color: rank.color,
              textShadow: `0 0 50px ${rank.glow}, 0 0 120px ${rank.glow}`,
            }}
          >
            {rank.id}
          </div>
          <div className="display" style={{ fontSize: 18, letterSpacing: '0.3em', marginTop: 16 }}>
            RANK ASCENSION
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 10 }}>
            The System has recognized your growth.
          </div>
          <button className="btn" style={{ marginTop: 28 }} onClick={ack}>
            ACCEPT
          </button>
        </div>
      </div>
    )
  }

  if (ceremony.type === 'MILESTONE') {
    return (
      <div className="ceremony" onClick={ack}>
        <div className="ceremony-burst" style={{ background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 65%)' }} />
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div className="label" style={{ marginBottom: 14 }}>NOTIFICATION</div>
          <div
            className="display"
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: 'var(--gold)',
              textShadow: '0 0 40px var(--gold-glow)',
              letterSpacing: '0.06em',
            }}
          >
            DAY {ceremony.day} SEALED
          </div>
          <div className="display" style={{ fontSize: 14, letterSpacing: '0.3em', marginTop: 14, color: 'var(--text-dim)' }}>
            MILESTONE LOCKED — IT CANNOT BE TAKEN FROM YOU
          </div>
          <button className="btn gold" style={{ marginTop: 28 }} onClick={ack}>
            SEAL IT
          </button>
        </div>
      </div>
    )
  }

  return null
}
