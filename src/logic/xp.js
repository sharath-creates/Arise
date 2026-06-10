/**
 * XP, levels, ranks.
 *
 * Level curve: XP required to advance FROM level L is 300 + (L-1)*75.
 * L1->L2: 300, L2->L3: 375, L3->L4: 450, ...
 */

export const RANKS = [
  { id: 'E', minLevel: 1,  color: '#8a8a92', glow: 'rgba(138,138,146,0.35)' },
  { id: 'D', minLevel: 6,  color: '#4ade80', glow: 'rgba(74,222,128,0.35)' },
  { id: 'C', minLevel: 13, color: '#00d4ff', glow: 'rgba(0,212,255,0.35)' },
  { id: 'B', minLevel: 21, color: '#b14aff', glow: 'rgba(177,74,255,0.35)' },
  { id: 'A', minLevel: 30, color: '#ff4a6e', glow: 'rgba(255,74,110,0.35)' },
  { id: 'S', minLevel: 40, color: '#ffd76a', glow: 'rgba(255,215,106,0.45)' },
]

export function xpToAdvanceFrom(level) {
  return 300 + (level - 1) * 75
}

/** { level, intoLevel, needed } for a total XP amount. */
export function getLevelInfo(totalXP) {
  let level = 1
  let rest = Math.max(0, totalXP)
  // Hard cap iterations; XP totals in this program can't exceed ~level 200.
  while (level < 500) {
    const need = xpToAdvanceFrom(level)
    if (rest < need) return { level, intoLevel: rest, needed: need }
    rest -= need
    level += 1
  }
  return { level, intoLevel: 0, needed: xpToAdvanceFrom(level) }
}

export function getLevel(totalXP) {
  return getLevelInfo(totalXP).level
}

export function getRank(level) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r
  }
  return rank
}

export function getRankForXP(totalXP) {
  return getRank(getLevel(totalXP))
}

/** Next rank threshold, or null at S. */
export function getNextRank(level) {
  for (const r of RANKS) {
    if (r.minLevel > level) return r
  }
  return null
}
