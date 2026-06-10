import { ACTIONS } from './actions'
import { checkRollback } from '@/logic/rollback'

export const initialState = {
  userProfile: null,
  programState: {
    currentScreen: 'THRESHOLD',
    currentDay: 1,
    totalXP: 0,
    stats: {
      wisdom: 0,
      confidence: 0,
      strength: 0,
      discipline: 0,
      focus: 0,
    },
    streakDays: 0,
    consecutiveFailureDays: 0,
    lockedMilestones: [],
    programStartDate: null,
    settingsUsed: false,
    programStatus: 'active',
    lastOpenDate: null,
  },
  dailyLog: {},
  dailySnapshots: {},
  guiltState: {
    date: null,
    snoozeCount: 0,
    shownMessageIndices: [],
  },
}

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.NAVIGATE:
      return {
        ...state,
        programState: {
          ...state.programState,
          currentScreen: action.screen,
        },
      }

    case ACTIONS.COMPLETE_ONBOARDING:
      return {
        ...state,
        userProfile: action.userProfile,
        programState: { ...state.programState, currentScreen: 'PLAN_CONFIRMATION' },
      }

    case ACTIONS.START_PROGRAM: {
      const today = new Date().toISOString().slice(0, 10)
      return {
        ...state,
        programState: {
          ...state.programState,
          currentScreen: 'DASHBOARD',
          currentDay: 1,
          programStartDate: today,
          lastOpenDate: today,
          totalXP: 0,
          stats: { wisdom: 0, confidence: 0, strength: 0, discipline: 0, focus: 0 },
          streakDays: 1,
          consecutiveFailureDays: 0,
          lockedMilestones: [],
          programStatus: 'active',
          settingsUsed: false,
        },
      }
    }

    case ACTIONS.ADVANCE_DAY: {
      const { currentDay, consecutiveFailureDays, totalXP, stats, streakDays } = state.programState
      const todayLog = state.dailyLog[currentDay] || {}
      const today = new Date().toISOString().slice(0, 10)

      // Determine if today was a failure:
      // "Failure" = wasGiveUp OR xpEarned === 0 (nothing completed)
      const wasFailure = todayLog.wasGiveUp || (todayLog.xpEarned || 0) === 0
      const newConsecutiveFailures = wasFailure ? consecutiveFailureDays + 1 : 0
      const newStreakDays = wasFailure ? 0 : streakDays + 1

      // Collect rolled-over tasks (non-completed quests from today)
      const completions = todayLog.questCompletions || {}
      const rolledOver = []
      if (!completions.wakeTime) rolledOver.push('wake')
      if (!completions.water) rolledOver.push('water')
      if (!completions.cardio || completions.cardio.sessions === 0) rolledOver.push('cardio')
      if (!completions.training || completions.training.sessions === 0) rolledOver.push('training')
      if (!completions.reading) rolledOver.push('reading')
      if (completions.screenTime === undefined) rolledOver.push('screenTime')

      // Save weekly snapshot if currentDay % 7 === 0
      const newSnapshots = { ...state.dailySnapshots }
      if (currentDay % 7 === 0) {
        newSnapshots[currentDay] = { totalXP, stats, streakDays, currentDay }
      }

      // Check rollback
      const rollbackResult = newConsecutiveFailures >= 3
        ? checkRollback(
            { ...state.programState, consecutiveFailureDays: newConsecutiveFailures },
            newSnapshots
          )
        : { shouldRollback: false, targetSnapshot: null }

      const newProgramState = {
        ...state.programState,
        currentDay: rollbackResult.shouldRollback && rollbackResult.targetSnapshot
          ? rollbackResult.targetSnapshot.currentDay
          : currentDay + 1,
        totalXP: rollbackResult.shouldRollback && rollbackResult.targetSnapshot
          ? rollbackResult.targetSnapshot.totalXP
          : totalXP,
        stats: rollbackResult.shouldRollback && rollbackResult.targetSnapshot
          ? rollbackResult.targetSnapshot.stats
          : stats,
        streakDays: newStreakDays,
        consecutiveFailureDays: rollbackResult.shouldRollback ? 0 : newConsecutiveFailures,
        lastOpenDate: today,
        currentScreen: 'DAY_TRANSITION',
        rollbackApplied: rollbackResult.shouldRollback,
        rollbackFromDay: rollbackResult.shouldRollback && rollbackResult.targetSnapshot
          ? rollbackResult.targetSnapshot.currentDay
          : null,
      }

      // Set up tomorrow's rolledOverTasks
      const tomorrowDay = newProgramState.currentDay
      const tomorrowLog = state.dailyLog[tomorrowDay] || {
        questCompletions: {},
        xpEarned: 0,
        wasGiveUp: false,
      }

      return {
        ...state,
        programState: newProgramState,
        dailySnapshots: newSnapshots,
        dailyLog: {
          ...state.dailyLog,
          [tomorrowDay]: { ...tomorrowLog, rolledOverTasks: rolledOver, date: today },
        },
        guiltState: {
          date: today,
          snoozeCount: 0,
          shownMessageIndices: [],
          snoozeUntil: null,
        },
      }
    }

    case ACTIONS.LOG_QUEST_COMPLETION: {
      const { questType, value } = action
      const { currentDay, totalXP, stats } = state.programState
      const today = state.dailyLog[currentDay] || {
        questCompletions: {},
        xpEarned: 0,
        rolledOverTasks: [],
        wasGiveUp: false,
      }

      const XP_GAINS = { wake: 50, water: 60, cardio: 120, training: 120, reading: 80, screenTime: 70 }
      const STAT_GAINS = {
        wake:       { discipline: 2, focus: 1 },
        water:      { confidence: 2 },
        cardio:     { strength: 3, discipline: 2 },
        training:   { strength: 3, discipline: 2 },
        reading:    { wisdom: 3, focus: 2 },
        screenTime: { wisdom: 2, focus: 2 },
      }

      // Idempotency guard: never award XP for a quest that already has XP recorded
      const xpAwardedFor = today.xpAwardedFor || {}
      const alreadyAwarded = xpAwardedFor[questType] === true
      const xpGain    = (action.completed && !alreadyAwarded) ? (XP_GAINS[questType] || 0) : 0
      const statGains = (action.completed && !alreadyAwarded) ? (STAT_GAINS[questType] || {}) : {}

      const updatedCompletions = { ...today.questCompletions }

      if (questType === 'wake')       updatedCompletions.wakeTime   = true
      else if (questType === 'water')      updatedCompletions.water      = value
      else if (questType === 'cardio')     updatedCompletions.cardio     = value
      else if (questType === 'training')   updatedCompletions.training   = value
      else if (questType === 'reading')    updatedCompletions.reading    = value
      else if (questType === 'screenTime') updatedCompletions.screenTime = value

      const newStats = { ...stats }
      Object.entries(statGains).forEach(([stat, gain]) => {
        newStats[stat] = (newStats[stat] || 0) + gain
      })

      return {
        ...state,
        programState: {
          ...state.programState,
          totalXP: totalXP + xpGain,
          stats: newStats,
        },
        dailyLog: {
          ...state.dailyLog,
          [currentDay]: {
            ...today,
            questCompletions: updatedCompletions,
            xpEarned: today.xpEarned + xpGain,
            xpAwardedFor: action.completed
              ? { ...xpAwardedFor, [questType]: true }
              : xpAwardedFor,
          },
        },
      }
    }

    case ACTIONS.TOGGLE_DAILY_POINT: {
      const { itemId, checked, points } = action
      const { currentDay, totalXP } = state.programState
      const today = state.dailyLog[currentDay] || {
        questCompletions: {},
        xpEarned: 0,
        rolledOverTasks: [],
        wasGiveUp: false,
      }

      const pointsLog = { ...(today.pointsLog || {}), [itemId]: checked }

      // Idempotency guard: each point item awards XP at most once per day
      const pointXPAwarded = today.pointXPAwarded || {}
      const alreadyAwarded = pointXPAwarded[itemId] === true
      const XP_PER_POINT = 30
      const xpGain = checked && !alreadyAwarded ? (points || 1) * XP_PER_POINT : 0

      return {
        ...state,
        programState: {
          ...state.programState,
          totalXP: totalXP + xpGain,
        },
        dailyLog: {
          ...state.dailyLog,
          [currentDay]: {
            ...today,
            pointsLog,
            xpEarned: (today.xpEarned || 0) + xpGain,
            pointXPAwarded: checked
              ? { ...pointXPAwarded, [itemId]: true }
              : pointXPAwarded,
          },
        },
      }
    }

    case ACTIONS.SHOW_GUILT: {
      const today = new Date().toISOString().slice(0, 10)
      const prevGuilt = state.guiltState || { date: null, snoozeCount: 0, shownMessageIndices: [] }
      // Reset daily tracking if it's a new day
      const resetGuilt = prevGuilt.date !== today
        ? { date: today, snoozeCount: 0, shownMessageIndices: [] }
        : prevGuilt
      return {
        ...state,
        programState: { ...state.programState, currentScreen: 'GUILT' },
        guiltState: resetGuilt,
      }
    }

    case ACTIONS.SNOOZE_GUILT: {
      const snoozeUntil = Date.now() + 30 * 60 * 1000
      const shownIndices = state.guiltState?.shownMessageIndices || []
      const updatedIndices = action.shownKey && !shownIndices.includes(action.shownKey)
        ? [...shownIndices, action.shownKey]
        : shownIndices
      return {
        ...state,
        programState: { ...state.programState, currentScreen: 'DASHBOARD' },
        guiltState: {
          ...state.guiltState,
          snoozeCount: (state.guiltState?.snoozeCount || 0) + 1,
          snoozeUntil,
          shownMessageIndices: updatedIndices,
        },
      }
    }

    case ACTIONS.RECORD_GUILT_MESSAGE: {
      const shownIndices = state.guiltState?.shownMessageIndices || []
      const updatedIndices = action.shownKey && !shownIndices.includes(action.shownKey)
        ? [...shownIndices, action.shownKey]
        : shownIndices
      return {
        ...state,
        guiltState: {
          ...state.guiltState,
          shownMessageIndices: updatedIndices,
        },
      }
    }

    case ACTIONS.GIVE_UP_TODAY: {
      const { currentDay } = state.programState
      const today = state.dailyLog[currentDay] || {
        questCompletions: {},
        xpEarned: 0,
        rolledOverTasks: [],
        wasGiveUp: false,
      }

      const completions = today.questCompletions || {}
      const rolledOver = []
      if (!completions.wakeTime) rolledOver.push('wake')
      if (!completions.water) rolledOver.push('water')
      if (!completions.cardio || completions.cardio.sessions === 0) rolledOver.push('cardio')
      if (!completions.training || completions.training.sessions === 0) rolledOver.push('training')
      if (!completions.reading) rolledOver.push('reading')
      if (completions.screenTime === undefined) rolledOver.push('screenTime')

      const tomorrowDay = currentDay + 1
      const tomorrowLog = state.dailyLog[tomorrowDay] || {
        questCompletions: {},
        xpEarned: 0,
        wasGiveUp: false,
      }

      return {
        ...state,
        programState: {
          ...state.programState,
          currentScreen: 'DASHBOARD',
          consecutiveFailureDays: state.programState.consecutiveFailureDays + 1,
        },
        guiltState: {
          ...state.guiltState,
          snoozeCount: (state.guiltState?.snoozeCount || 0) + 1,
        },
        dailyLog: {
          ...state.dailyLog,
          [currentDay]: { ...today, wasGiveUp: true },
          [tomorrowDay]: { ...tomorrowLog, rolledOverTasks: rolledOver },
        },
      }
    }

    case ACTIONS.ABANDON_PROGRAM:
      return {
        ...initialState,
        programState: { ...initialState.programState, currentScreen: 'THRESHOLD' },
      }

    case ACTIONS.SAVE_SETTINGS:
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.updates },
        programState: { ...state.programState, settingsUsed: true },
      }

    case ACTIONS.CLEAR_ROLLBACK:
      return {
        ...state,
        programState: { ...state.programState, rollbackApplied: false, rollbackFromDay: null },
      }

    case ACTIONS.LOCK_MILESTONE:
      return {
        ...state,
        programState: {
          ...state.programState,
          lockedMilestones: [...state.programState.lockedMilestones, action.day],
        },
      }

    default:
      return state
  }
}
