import { getRank } from '@/logic/xp'

/**
 * RankBadge — hexagonal rank emblem.
 * Props: level {number}, size {number} (px, default 52)
 */
export default function RankBadge({ level = 1, size = 52 }) {
  const rank = getRank(level)
  const half = size / 2

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        filter: `drop-shadow(0 0 8px ${rank.glow})`,
      }}
      title={`${rank.id}-Rank Hunter`}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`rank-grad-${rank.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={rank.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={rank.color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points="50,3 93,26 93,74 50,97 7,74 7,26"
          fill={`url(#rank-grad-${rank.id})`}
          stroke={rank.color}
          strokeWidth="3"
        />
        <polygon
          points="50,14 83,32 83,68 50,86 17,68 17,32"
          fill="none"
          stroke={rank.color}
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      <span
        className="display"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: half * 0.72,
          fontWeight: 900,
          color: rank.color,
          lineHeight: 1,
        }}
      >
        {rank.id}
      </span>
    </div>
  )
}
