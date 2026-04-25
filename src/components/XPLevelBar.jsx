/**
 * XPLevelBar — shows current level, XP fraction within that level, and an
 * animated progress bar.
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
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: '#00d4ff',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.05em',
          }}
        >
          LVL {currentLevel}
        </span>
        <span style={{ color: '#888', fontSize: 12 }}>
          {xpInLevel} / {XP_PER_LEVEL} XP
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 6,
          backgroundColor: '#222',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillPercent}%`,
            backgroundColor: '#00d4ff',
            borderRadius: 3,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}
