import { ACTIONS } from './actions'
import { getQuest, ALL_CLEAR_BONUS_XP } from '@/data/quests'
import { getSideQuest, XP_PER_POINT } from '@/data/sideQuests'
import { getRankForXP } from '@/logic/xp'
import { processRollover, allMandatoryDone, toDateKey, PROGRAM_LENGTH } from '@/logic/day'

export const SCREENS = {
  AWAKENING: 'AWAKENING',
  ONBOARDING: 'ONBOARDING',
  DASHBOARD: 'DASHBOARD',
  DAILY_REPORT: 'DAILY_REPORT',
  WARNING: 'WARNING',
  SETTINGS: 'SETTINGS',
  COMPLETE: 'COMPLETE',
}

const EMPTY_STATS = { STR: 0, VIT: 0, INT: 0, DIS: 0, FOC: 0 }

export function createInitialState() {
  return {
    screen: SCREENS.AWAKENING,
    profile: null,
    program: {
      startDate: null,
      currentDay: 1,
      status: 'idle', // idle | active | complete
      totalXP: 0,
      stats: { ...EMPTY_STATS },
      streakDays: 0,
      consecutiveFailureDays: 0,
      lockedMilestones: [],
      settingsUsed: false,
    },
    dailyLog: {},
    snapshots: {},
    warning: { dateKey: null, snoozeUntil: null, shownIndices: [] },
    lastReport: null,
    ceremonies: [],
    toasts: [],
  }
}

/* ── helpers ────────────────────────────────────────────── */

let toastSeq = 0
function toast(text, variant = 'info') {
  toastSeq += 1
  return { id: `${Date.now()}-${toastSeq}`, text, variant }
}

function emptyDay() {
  return {
    mandatoryDone: {},     // { questId: true }
    mandatoryProgress: {}, // { questId: latest logged value }
    sideLog: {},           // { itemId: bool }
    xpAwardedFor: {},      // { key: true } — idempotency guards
    sideBaseXP: 0,         // base XP from side quests before Overdrive
    allClear: false,
    surrendered: false,
    xpEarned: 0,
  }
}

function addStats(stats, gains = {}) {
  const next = { ...stats }
  for (const [k, v] of Object.entries(gains)) next[k] = (next[k] || 0) + v
  return next
}

/** Detect a rank-up between two XP totals; returns a ceremony or null. */
function rankUpCeremony(beforeXP, afterXP) {
  const before = getRankForXP(beforeXP)
  const after = getRankForXP(afterXP)
  if (before.id !== after.id && after.minLevel > before.minLevel) {
    return { type: 'RANK_UP', rank: after.id }
  }
  return null
}

/* ── reducer ────────────────────────────────────────────── */

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.NAVIGATE:
      return { ...state, screen: action.screen }

    case ACTIONS.ENTER_SYSTEM:
      return { ...state, screen: SCREENS.ONBOARDING }

    case ACTIONS.COMPLETE_ONBOARDING:
      return { ...state, profile: { ...state.profile, ...action.profile } }

    case ACTIONS.TAKE_OATH: {
      const profile = action.profile ? { ...state.profile, ...action.profile } : state.profile
      return {
        ...createInitialState(),
        profile,
        screen: SCREENS.DASHBOARD,
        program: {
          ...createInitialState().program,
          startDate: toDateKey(),
          currentDay: 1,
          status: 'active',
        },
        toasts: [toast('PROGRAM INITIATED — DAY 1 OF 66', 'system')],
      }
    }

    case ACTIONS.RESTART_PROGRAM:
      return reducer(state, { type: ACTIONS.TAKE_OATH })

    case ACTIONS.OPEN_APP: {
      if (state.program.status !== 'active') return state
      const todayKey = action.todayKey || toDateKey()
      const result = processRollover({
        programState: {
          ...state.program,
          programStartDate: state.program.startDate,
          consecutiveFailureDays: state.program.consecutiveFailureDays,
        },
        dailyLog: state.dailyLog,
        snapshots: state.snapshots,
        todayKey,
      })
      if (!result) return state

      const program = {
        ...state.program,
        currentDay: result.newCurrentDay,
        status: result.programComplete ? 'complete' : 'active',
        streakDays: result.streakDays,
        consecutiveFailureDays: result.consecutiveFailures,
        lockedMilestones: [
          ...state.program.lockedMilestones,
          ...result.newLockedMilestones,
        ],
        totalXP: result.rollback ? result.rollback.totalXP : state.program.totalXP,
        stats: result.rollback ? result.rollback.stats : state.program.stats,
      }

      return {
        ...state,
        program,
        snapshots: { ...state.snapshots, ...result.newSnapshots },
        lastReport: result.report,
        ceremonies: [...state.ceremonies, ...result.ceremonies],
        warning: { dateKey: todayKey, snoozeUntil: null, shownIndices: [] },
        screen: SCREENS.DAILY_REPORT,
      }
    }

    case ACTIONS.ACKNOWLEDGE_REPORT: {
      const complete = state.lastReport?.programComplete
      return {
        ...state,
        lastReport: null,
        screen: complete ? SCREENS.COMPLETE : SCREENS.DASHBOARD,
      }
    }

    case ACTIONS.COMPLETE_MANDATORY: {
      if (state.program.status !== 'active') return state
      const { questId, value, completed } = action
      const quest = getQuest(questId)
      if (!quest) return state

      const day = state.program.currentDay
      const today = { ...emptyDay(), ...(state.dailyLog[day] || {}) }
      if (today.surrendered) return state

      today.mandatoryProgress = { ...today.mandatoryProgress, [questId]: value }

      const toasts = []
      let totalXP = state.program.totalXP
      let stats = state.program.stats
      const beforeXP = totalXP

      const guardKey = `m:${questId}`
      const xpAwardedFor = { ...today.xpAwardedFor }

      if (completed && !today.mandatoryDone[questId]) {
        today.mandatoryDone = { ...today.mandatoryDone, [questId]: true }
        if (!xpAwardedFor[guardKey]) {
          xpAwardedFor[guardKey] = true
          totalXP += quest.xp
          today.xpEarned += quest.xp
          stats = addStats(stats, quest.stats)
          toasts.push(toast(`QUEST CLEAR — ${quest.name.toUpperCase()} +${quest.xp} XP`, 'clear'))
        }
      }

      // All-clear: bonus + Overdrive + retroactive side-quest top-up.
      if (!today.allClear && allMandatoryDone(today)) {
        today.allClear = true
        if (!xpAwardedFor['allClearBonus']) {
          xpAwardedFor['allClearBonus'] = true
          totalXP += ALL_CLEAR_BONUS_XP
          today.xpEarned += ALL_CLEAR_BONUS_XP
        }
        let retro = 0
        if (!xpAwardedFor['overdriveRetro']) {
          xpAwardedFor['overdriveRetro'] = true
          retro = today.sideBaseXP
          totalXP += retro
          today.xpEarned += retro
        }
        toasts.push(toast(`ALL DIRECTIVES CLEAR +${ALL_CLEAR_BONUS_XP} XP`, 'system'))
        toasts.push(toast(
          retro > 0
            ? `OVERDRIVE ENGAGED — 2X SIDE QUEST XP (+${retro} RETROACTIVE)`
            : 'OVERDRIVE ENGAGED — SIDE QUESTS NOW PAY 2X',
          'overdrive'
        ))
      }

      today.xpAwardedFor = xpAwardedFor

      const ceremony = rankUpCeremony(beforeXP, totalXP)

      return {
        ...state,
        program: { ...state.program, totalXP, stats },
        dailyLog: { ...state.dailyLog, [day]: today },
        toasts: [...state.toasts, ...toasts],
        ceremonies: ceremony ? [...state.ceremonies, ceremony] : state.ceremonies,
      }
    }

    case ACTIONS.TOGGLE_SIDE_QUEST: {
      if (state.program.status !== 'active') return state
      const { itemId, checked } = action
      const item = getSideQuest(itemId)
      if (!item) return state

      const day = state.program.currentDay
      const today = { ...emptyDay(), ...(state.dailyLog[day] || {}) }
      if (today.surrendered) return state

      today.sideLog = { ...today.sideLog, [itemId]: checked }

      const toasts = []
      let totalXP = state.program.totalXP
      let stats = state.program.stats
      const beforeXP = totalXP

      const guardKey = `s:${itemId}`
      if (checked && !today.xpAwardedFor[guardKey]) {
        today.xpAwardedFor = { ...today.xpAwardedFor, [guardKey]: true }
        const base = item.points * XP_PER_POINT
        const overdrive = today.allClear
        const gain = overdrive ? base * 2 : base
        if (!overdrive) today.sideBaseXP += base
        totalXP += gain
        today.xpEarned += gain
        stats = addStats(stats, item.stats)
        toasts.push(toast(
          overdrive ? `SIDE QUEST +${gain} XP (2X)` : `SIDE QUEST +${gain} XP`,
          overdrive ? 'overdrive' : 'clear'
        ))
      }

      const ceremony = rankUpCeremony(beforeXP, totalXP)

      return {
        ...state,
        program: { ...state.program, totalXP, stats },
        dailyLog: { ...state.dailyLog, [day]: today },
        toasts: [...state.toasts, ...toasts],
        ceremonies: ceremony ? [...state.ceremonies, ceremony] : state.ceremonies,
      }
    }

    case ACTIONS.SHOW_WARNING:
      return { ...state, screen: SCREENS.WARNING }

    case ACTIONS.SNOOZE_WARNING: {
      const shown = state.warning.shownIndices || []
      return {
        ...state,
        screen: SCREENS.DASHBOARD,
        warning: {
          ...state.warning,
          dateKey: toDateKey(),
          snoozeUntil: Date.now() + 30 * 60 * 1000,
          shownIndices:
            action.messageIndex != null && !shown.includes(action.messageIndex)
              ? [...shown, action.messageIndex]
              : shown,
        },
      }
    }

    case ACTIONS.SURRENDER_DAY: {
      const day = state.program.currentDay
      const today = { ...emptyDay(), ...(state.dailyLog[day] || {}) }
      today.surrendered = true
      return {
        ...state,
        screen: SCREENS.DASHBOARD,
        dailyLog: { ...state.dailyLog, [day]: today },
        toasts: [...state.toasts, toast('DAY SURRENDERED — PENALTY AT MIDNIGHT', 'penalty')],
      }
    }

    case ACTIONS.SAVE_SETTINGS:
      return {
        ...state,
        profile: { ...state.profile, ...action.updates },
        program: { ...state.program, settingsUsed: true },
        screen: SCREENS.DASHBOARD,
        toasts: [...state.toasts, toast('PARAMETERS UPDATED', 'system')],
      }

    case ACTIONS.ABANDON_PROGRAM:
      return createInitialState()

    case ACTIONS.ACK_CEREMONY:
      return { ...state, ceremonies: state.ceremonies.slice(1) }

    case ACTIONS.DISMISS_TOAST:
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    default:
      return state
  }
}

export { PROGRAM_LENGTH }
