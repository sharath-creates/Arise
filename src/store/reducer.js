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

    case ACTIONS.START_PROGRAM:
      return state

    case ACTIONS.ADVANCE_DAY:
      return state

    case ACTIONS.LOG_QUEST_COMPLETION:
      return state

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
