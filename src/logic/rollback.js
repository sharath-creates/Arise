/**
 * Rollback logic — pure functions, no React imports.
 */

/**
 * Checks whether a program rollback should occur.
 *
 * shouldRollback is true if programState.consecutiveFailureDays >= 3.
 * targetSnapshot is the most recent snapshot from dailySnapshots (highest day number key).
 * If no snapshots exist, returns { shouldRollback: true, targetSnapshot: null }.
 *
 * @param {Object} programState - must have consecutiveFailureDays field
 * @param {Object} dailySnapshots - keyed by day number (numeric strings or numbers)
 * @returns {{ shouldRollback: boolean, targetSnapshot: object|null }}
 */
export function checkRollback(programState, dailySnapshots) {
  const consecutiveFailures =
    typeof programState?.consecutiveFailureDays === 'number'
      ? programState.consecutiveFailureDays
      : 0

  const shouldRollback = consecutiveFailures >= 3

  if (!shouldRollback) {
    return { shouldRollback: false, targetSnapshot: null }
  }

  // Find the snapshot with the highest day number key
  if (!dailySnapshots || typeof dailySnapshots !== 'object') {
    return { shouldRollback: true, targetSnapshot: null }
  }

  const keys = Object.keys(dailySnapshots)
  if (keys.length === 0) {
    return { shouldRollback: true, targetSnapshot: null }
  }

  const maxKey = keys.reduce((best, key) => {
    return Number(key) > Number(best) ? key : best
  }, keys[0])

  return {
    shouldRollback: true,
    targetSnapshot: dailySnapshots[maxKey],
  }
}
