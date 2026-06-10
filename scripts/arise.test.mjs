/* ARISE v2 behavioral tests — run against the real reducer + logic. */
import assert from 'node:assert'
import { reducer, createInitialState } from '@/store/reducer'
import { ACTIONS } from '@/store/actions'
import { getLevelInfo, getRank, getRankForXP } from '@/logic/xp'
import { processRollover, evaluateOutcome, dayNumberFor, toDateKey } from '@/logic/day'
import { MANDATORY_QUESTS, ALL_CLEAR_BONUS_XP } from '@/data/quests'
import { SIDE_QUESTS, XP_PER_POINT, getPoints, MAX_POINTS, TARGET_POINTS } from '@/data/sideQuests'

let passed = 0
function t(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name) }
  catch (e) { console.log('  ✗ ' + name + ' — ' + e.message); process.exitCode = 1 }
}

function startProgram() {
  let s = reducer(createInitialState(), { type: ACTIONS.TAKE_OATH, profile: { name: 'Test', warnHour: 20 } })
  return s
}

function clearAllMandatory(s) {
  for (const q of MANDATORY_QUESTS) {
    s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: q.id, value: true, completed: true })
  }
  return s
}

console.log('— data integrity —')
t('side quests sum to MAX_POINTS (12)', () => {
  assert.equal(SIDE_QUESTS.reduce((a, q) => a + q.points, 0), MAX_POINTS)
})
t('target is 10', () => assert.equal(TARGET_POINTS, 10))
t('6 mandatory quests', () => assert.equal(MANDATORY_QUESTS.length, 6))

console.log('— xp & ranks —')
t('level curve monotonic and starts at L1', () => {
  assert.equal(getLevelInfo(0).level, 1)
  assert.equal(getLevelInfo(299).level, 1)
  assert.equal(getLevelInfo(300).level, 2)
  assert.equal(getLevelInfo(300 + 375).level, 3)
})
t('rank thresholds', () => {
  assert.equal(getRank(1).id, 'E')
  assert.equal(getRank(6).id, 'D')
  assert.equal(getRank(13).id, 'C')
  assert.equal(getRank(40).id, 'S')
  assert.equal(getRank(99).id, 'S')
})

console.log('— mandatory quests & idempotency —')
t('completing a quest awards XP once', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  const xp1 = s.program.totalXP
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  assert.equal(xp1, 50)
  assert.equal(s.program.totalXP, 50)
})
t('counter quest only completes at target', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'water', value: 1, completed: false })
  assert.equal(s.program.totalXP, 0)
  assert.ok(!s.dailyLog[1].mandatoryDone.water)
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'water', value: 2, completed: true })
  assert.equal(s.program.totalXP, 60)
})

console.log('— the 2x overdrive rule —')
t('side quest pays base XP before all-clear', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: true }) // 2 pts
  assert.equal(s.program.totalXP, 2 * XP_PER_POINT) // 60
})
t('all-clear pays bonus + retroactive top-up', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: true })   // +60 base
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'phoneAM', checked: true })  // +30 base
  const beforeClear = s.program.totalXP
  assert.equal(beforeClear, 90)
  const mandatoryXP = MANDATORY_QUESTS.reduce((a, q) => a + q.xp, 0) // 500
  s = clearAllMandatory(s)
  // 90 base side + 500 mandatory + 100 bonus + 90 retro = 780
  assert.equal(s.program.totalXP, 90 + mandatoryXP + ALL_CLEAR_BONUS_XP + 90)
  assert.ok(s.dailyLog[1].allClear)
})
t('side quests after all-clear pay 2x', () => {
  let s = startProgram()
  s = clearAllMandatory(s)
  const before = s.program.totalXP
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: true })
  assert.equal(s.program.totalXP - before, 2 * 2 * XP_PER_POINT) // 120
})
t('order does not matter: same total either way', () => {
  // side first, then mandatory
  let a = startProgram()
  a = reducer(a, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'cardio20', checked: true })
  a = clearAllMandatory(a)
  // mandatory first, then side
  let b = startProgram()
  b = clearAllMandatory(b)
  b = reducer(b, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'cardio20', checked: true })
  assert.equal(a.program.totalXP, b.program.totalXP)
})
t('uncheck/recheck cannot farm XP', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'write200', checked: true })
  const xp1 = s.program.totalXP
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'write200', checked: false })
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'write200', checked: true })
  assert.equal(s.program.totalXP, xp1)
  // but points reflect the latest checked state
  assert.equal(getPoints(s.dailyLog[1].sideLog), 1)
})
t('retro top-up not double-paid if side quest unchecked before clear', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: true })
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: false })
  s = clearAllMandatory(s)
  // retro pays sideBaseXP (60) even though unchecked — XP is never revoked, consistent.
  assert.equal(s.program.totalXP, 60 + 500 + 100 + 60)
})

console.log('— surrender —')
t('surrendered day locks all earning', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.SURRENDER_DAY })
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  s = reducer(s, { type: ACTIONS.TOGGLE_SIDE_QUEST, itemId: 'sleep8', checked: true })
  assert.equal(s.program.totalXP, 0)
  assert.equal(evaluateOutcome(s.dailyLog[1]), 'FAILED')
})

console.log('— day rollover —')
function keyOffset(startKey, offsetDays) {
  const [y, m, d] = startKey.split('-').map(Number)
  const date = new Date(y, m - 1, d + offsetDays)
  return toDateKey(date)
}
t('same-day open is a no-op', () => {
  let s = startProgram()
  const r = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: s.program.startDate })
  assert.equal(r, s)
})
t('clock moved backwards is a no-op', () => {
  let s = startProgram()
  const r = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, -2) })
  assert.equal(r, s)
})
t('next-day rollover: cleared day increments streak, shows report', () => {
  let s = startProgram()
  s = clearAllMandatory(s)
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 1) })
  assert.equal(s.screen, 'DAILY_REPORT')
  assert.equal(s.program.currentDay, 2)
  assert.equal(s.program.streakDays, 1)
  assert.equal(s.lastReport.entries.length, 1)
  assert.equal(s.lastReport.entries[0].outcome, 'CLEARED')
  // day 1 milestone sealed
  assert.deepEqual(s.program.lockedMilestones, [1])
  assert.equal(s.ceremonies.some(c => c.type === 'MILESTONE' && c.day === 1), true)
})
t('partial day resets streak but not failure counter', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 1) })
  assert.equal(s.program.streakDays, 0)
  assert.equal(s.program.consecutiveFailureDays, 0)
  assert.equal(s.lastReport.entries[0].outcome, 'PARTIAL')
})
t('multi-day absence: each missed day FAILED, single report', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 4) })
  assert.equal(s.program.currentDay, 5)
  assert.equal(s.lastReport.entries.length, 4)
  assert.ok(s.lastReport.entries.every(e => e.outcome === 'FAILED'))
  assert.equal(s.program.consecutiveFailureDays, 4 % 100) // 4, no snapshot to roll back to
  assert.equal(s.lastReport.rollbackApplied, false) // no snapshot yet
})
t('rollback fires after 3 failures when a snapshot exists', () => {
  let s = startProgram()
  // clear days 1..7 one at a time
  for (let d = 1; d <= 7; d++) {
    s = clearAllMandatory(s)
    s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, d) })
    s = reducer(s, { type: ACTIONS.ACKNOWLEDGE_REPORT })
  }
  assert.equal(s.program.currentDay, 8)
  assert.ok(s.snapshots[7], 'snapshot at day 7 exists')
  const snapXP = s.snapshots[7].totalXP
  // earn some XP on day 8 so rollback has something to remove
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  // skip 3 days doing nothing -> 3 FAILED days (day 8 counts PARTIAL: wake done)
  // make it pure: days 9,10,11 untouched. Day 8 is PARTIAL (resets), then 3 FAILED.
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 11) })
  assert.equal(s.program.consecutiveFailureDays, 0, 'failures reset after rollback')
  assert.equal(s.lastReport.rollbackApplied, true)
  assert.equal(s.program.totalXP, snapXP)
  assert.deepEqual(s.program.lockedMilestones.includes(7), true, 'milestones survive')
})
t('program completes after day 66', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 66) })
  assert.equal(s.lastReport.programComplete, true)
  assert.equal(s.program.status, 'complete')
  s = reducer(s, { type: ACTIONS.ACKNOWLEDGE_REPORT })
  assert.equal(s.screen, 'COMPLETE')
})
t('no earning after completion', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.OPEN_APP, todayKey: keyOffset(s.program.startDate, 66) })
  s = reducer(s, { type: ACTIONS.ACKNOWLEDGE_REPORT })
  const before = s.program.totalXP
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  assert.equal(s.program.totalXP, before)
})

console.log('— rank-up ceremony —')
t('crossing a rank threshold queues RANK_UP', () => {
  let s = startProgram()
  // D rank at level 6. Cumulative XP for L6: 300+375+450+525+600 = 2250.
  s.program.totalXP = 2249
  s = reducer(s, { type: ACTIONS.COMPLETE_MANDATORY, questId: 'wake', value: true, completed: true })
  assert.ok(s.ceremonies.some(c => c.type === 'RANK_UP' && c.rank === 'D'))
})

console.log('— misc —')
t('abandon resets everything', () => {
  let s = startProgram()
  s = clearAllMandatory(s)
  s = reducer(s, { type: ACTIONS.ABANDON_PROGRAM })
  assert.equal(s.program.totalXP, 0)
  assert.equal(s.screen, 'AWAKENING')
})
t('settings save flags settingsUsed', () => {
  let s = startProgram()
  s = reducer(s, { type: ACTIONS.SAVE_SETTINGS, updates: { readingPages: 10 } })
  assert.equal(s.program.settingsUsed, true)
  assert.equal(s.profile.readingPages, 10)
})
t('dayNumberFor math', () => {
  assert.equal(dayNumberFor('2026-06-10', '2026-06-10'), 1)
  assert.equal(dayNumberFor('2026-06-12', '2026-06-10'), 3)
  assert.equal(dayNumberFor('2026-07-15', '2026-06-10'), 36)
})

console.log(`\n${passed} passed${process.exitCode ? ', WITH FAILURES' : ', all green'}`)
