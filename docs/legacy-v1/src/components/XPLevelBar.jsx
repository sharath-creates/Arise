/**
 * XPLevelBar — shows current level, XP fraction within that level, and an
 * animated progress bar with a shimmer sweep.
 *
 * Props:
 *   currentXP      {number}  total accumulated XP
 *   currentLevel   {number}  level derived from currentXP
 *   xpToNextLevel  {number}  XP remaining until next level (unused directly,
 *                             but kept in props for callers that want it)
 */
export default function XPLevelBar({ currentXP = 0, currentLevel = 1 }) {
  const XP_PER_LEVEL = 400
  const xpInLevel = currentXP % XP_PER_LEVEL
  const fillPercent = (xpInLevel / XP_PER_LEVEL) * 100

  return (
    <div style={{ width: '100%' }}>
      {/* Level label + fraction */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 7,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#00d4ff',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.1em',
            textShadow: '0 0 12px rgba(0,212,255,0.45)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00d4ff',
              boxShadow: '0 0 8px rgba(0,212,255,0.8)',
            }}
          />
          LVL {currentLevel}
        </span>
        <span
          style={{
            color: '#8a8a92',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ color: '#