export const STORAGE_KEYS = {
  userProfile: 'arise_userProfile',
  programState: 'arise_programState',
  dailyLog: 'arise_dailyLog',
  dailySnapshots: 'arise_dailySnapshots',
  guiltState: 'arise_guiltState',
}

export function readKey(key) {
  try {
    const serialized = localStorage.getItem(key)
    return serialized ? JSON.parse(serialized) : null
  } catch {
    return null
  }
}

export function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore write errors
  }
}

export function loadState() {
  return {
    userProfile: readKey(STORAGE_KEYS.userProfile),
    programState: readKey(STORAGE_KEYS.programState) ?? {
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
    dailyLog: readKey(STORAGE_KEYS.dailyLog) ?? {},
    dailySnapshots: readKey(STORAGE_KEYS.dailySnapshots) ?? {},
    guiltState: readKey(STORAGE_KEYS.guiltState) ?? {
      date: null,
      snoozeCount: 0,
      shownMessageIndices: [],
    },
  }
}
