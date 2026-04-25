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

      const xpGain    = action.completed ? (XP_GAINS[questType] || 0) : 0
      const statGains = action.completed ? (STAT_GAINS[questType] || {}) : {}

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
          },
        },
      }
    }

    case ACTIONS.SHOW_GUILT:
      return state

    case ACTIONS.GIVE_UP_TODAY:
      return state

    case ACTIONS.ABANDON_PROGRAM:
      return state

    case ACTIONS.SAVE_SETTINGS:
      return state

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
