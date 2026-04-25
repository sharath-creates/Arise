import { ACTIONS } from './actions'

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

    case ACTIONS.ADVANCE_DAY:
      return state

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

    default:
      return state
  }
}
