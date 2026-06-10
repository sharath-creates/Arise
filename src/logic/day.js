/**
 * Day lifecycle: date math, outcome evaluation, catch-up rollover, rollback.
 * Pure functions only — the reducer applies the results.
 */

import { MANDATORY_IDS } from '@/data/quests'
import { getPoints, TARGET_POINTS } from '@/data/sideQuests'

export const PROGRAM_LENGTH = 66
export const MILESTONE_DAYS = [1, 7, 14, 21, 35, 48, 66]
export const SNAPSHOT_EVERY = 7
export const ROLLBACK_AFTER_FAILURES = 3

export const OUTCOME = {
  CLEARED: 'CLEARED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
}

/** Local date string YYYY-MM-DD (not UTC — days roll at local midnight). */
export function toDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse a YYYY-MM-DD key into a local-midnight Date. */
export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Day number (1-based) implied by a date, given the program start key. */
export function dayNumberFor(dateKey, startKey) {
  const ms = fromDateKey(dateKey) - fromDateKey(startKey)
  return Math.floor(ms / 86400000) + 1
}

export function countMandatoryDone(dayLog = {}) {
  const done = dayLog.mandatoryDone || {}
  return MANDATORY_IDS.filter(id => done[id]).length
}

export function allMandatoryDone(dayLog = {}) {
  return countMandatoryDone(dayLog) === MANDATORY_IDS.length
}

export function evaluateOutcome(dayLog = {}) {
  if (dayLog.surrendered) return OUTCOME.FAILED
  const n = countMandatoryDone(dayLog)
  if (n === MANDATORY_IDS.length) return OUTCOME.CLEARED
  if (n > 0) return OUTCOME.PARTIAL
  return OUTCOME.FAILED
}

/**
 * Process all elapsed days between programState.currentDay and the day implied
 * by `todayKey`. Returns null when nothing rolls over.
 *
 * Result: {
 *   newCurrentDay, programComplete,
 *   streakDays, consecutiveFailures,
 *   newLockedMilestones: number[] (additions only),
 *   newSnapshots: { [day]: { totalXP, stats, streakDays } },
 *   rollback: null | { fromSnapshotDay, totalXP, stats },
 *   report: { entries: [...], rollbackApplied, milestonesLocked: number[] },
 *   ceremonies: [{ type: 'MILESTONE', day }]
 * }
 */
export function processRollover({ programState, dailyLog, snapshots, todayKey }) {
  const { programStartDate, currentDay } = programState
  if (!programStartDate) return null

  const impliedDay = dayNumberFor(todayKey, programStartDate)
  if (impliedDay <= currentDay) return null // same day, or clock moved backwards

  let streak = programState.streakDays
  let failures = programState.consecutiveFailureDays
  const newLockedMilestones = []
  const newSnapshots = {}
  const entries = []
  const ceremonies = []

  const lastElapsed = Math.min(impliedDay - 1, PROGRAM_LENGTH)

  for (let day = currentDay; day <= lastElapsed; day++) {
    const log = dailyLog[day] || {}
    const outcome = evaluateOutcome(log)
    const points = getPoints(log.sideLog || {})

    if (outcome === OUTCOME.CLEARED) {
      streak += 1
      failures = 0
      if (
        MILESTONE_DAYS.includes(day) &&
        !programState.lockedMilestones.includes(day) &&
        !newLockedMilestones.includes(day)
      ) {
        newLockedMilestones.push(day)
        ceremonies.push({ type: 'MILESTONE', day })
      }
    } else if (outcome === OUTCOME.PARTIAL) {
      streak = 0
      failures = 0
    } else {
      streak = 0
      failures += 1
    }

    entries.push({
      day,
      outcome,
      mandatoryDone: countMandatoryDone(log),
      mandatoryTotal: MANDATORY_IDS.length,
      points,
      pointsTargetHit: points >= TARGET_POINTS,
      xpEarned: log.xpEarned || 0,
      surrendered: !!log.surrendered,
      streakAfter: streak,
    })

    if (day % SNAPSHOT_EVERY === 0) {
      newSnapshots[day] = {
        totalXP: programState.totalXP,
        stats: programState.stats,
        streakDays: streak,
      }
    }
  }

  // Rollback: at most once per catch-up, only when threshold reached.
  let rollback = null
  if (failures >= ROLLBACK_AFTER_FAILURES) {
    const allSnaps = { ...snapshots, ...newSnapshots }
    const snapDays = Object.keys(allSnaps).map(Number).sort((a, b) => b - a)
    if (snapDays.length > 0) {
      const fromDay = snapDays[0]
      const snap = allSnaps[fromDay]
      // Only roll back if it actually reduces XP (never below zero).
      if (snap.totalXP < programState.totalXP) {
        rollback = {
          fromSnapshotDay: fromDay,
          totalXP: Math.max(0, snap.totalXP),
          stats: { ...snap.stats },
        }
        failures = 0
      }
    }
  }

  const newCurrentDay = Math.min(impliedDay, PROGRAM_LENGTH + 1)
  const programComplete = impliedDay > PROGRAM_LENGTH

  return {
    newCurrentDay: programComplete ? PROGRAM_LENGTH : newCurrentDay,
    programComplete,
    streakDays: streak,
    consecutiveFailures: failures,
    newLockedMilestones,
    newSnapshots,
    rollback,
    ceremonies,
    report: {
      entries,
      rollbackApplied: !!rollback,
      rollbackFromDay: rollback ? rollback.fromSnapshotDay : null,
      milestonesLocked: newLockedMilestones,
      programComplete,
    },
  }
}
