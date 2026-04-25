/**
 * XP calculation utilities — pure functions, no React imports.
 */

/**
 * Sums xpEarned across all day entries in the dailyLog object.
 * @param {Object} dailyLog - keyed by day number, each value has an xpEarned field
 * @returns {number}
 */
export function getTotalXP(dailyLog) {
  if (!dailyLog || typeof dailyLog !== 'object') return 0
  return Object.values(dailyLog).reduce((sum, entry) => {
    return sum + (typeof entry?.xpEarned === 'number' ? entry.xpEarned : 0)
  }, 0)
}

/**
 * Sums xpEarned for days in the range [currentDay-6, currentDay] (7-day window).
 * @param {Object} dailyLog
 * @param {number} currentDay
 * @returns {number}
 */
export function getWeeklyXP(dailyLog, currentDay) {
  if (!dailyLog || typeof dailyLog !== 'object') return 0
  const startDay = currentDay - 6
  return Object.entries(dailyLog).reduce((sum, [key, entry]) => {
    const day = Number(key)
    if (day >= startDay && day <= currentDay) {
      return sum + (typeof entry?.xpEarned === 'number' ? entry.xpEarned : 0)
    }
    return sum
  }, 0)
}

/**
 * Returns the player's level based on total XP.
 * Level = floor(totalXP / 400) + 1
 * getLevel(0)   === 1
 * getLevel(400) === 2
 * @param {number} totalXP
 * @returns {number}
 */
export function getLevel(totalXP) {
  if (typeof totalXP !== 'number' || totalXP < 0) return 1
  return Math.floor(totalXP / 400) + 1
}

/**
 * Returns XP needed to reach the next level.
 * @param {number} totalXP
 * @returns {number}
 */
export function getXPToNextLevel(totalXP) {
  if (typeof totalXP !== 'number' || totalXP < 0) return 400
  return 400 - (totalXP % 400)
}
