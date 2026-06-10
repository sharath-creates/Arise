/**
 * Quest status logic — pure functions, no React imports.
 *
 * XP per quest:
 *   wake 50 | water 60 | cardio 120 | training 120 | reading 80 | screenTime 70
 *
 * Stat gain labels per quest:
 *   wake       → +Discipline +Focus
 *   water      → +Confidence
 *   cardio     → +Strength +Discipline
 *   training   → +Strength +Discipline
 *   reading    → +Wisdom +Focus
 *   screenTime → +Wisdom +Focus
 */

const QUEST_XP = {
  wake: 50,
  water: 60,
  cardio: 120,
  training: 120,
  reading: 80,
  screenTime: 70,
}

const QUEST_STAT_LABELS = {
  wake:       '+Discipline +Focus',
  water:      '+Confidence',
  cardio:     '+Strength +Discipline',
  training:   '+Strength +Discipline',
  reading:    '+Wisdom +Focus',
  screenTime: '+Wisdom +Focus',
}

// Which quests are "high effort" (eligible for At-Risk)
const HIGH_EFFORT = new Set(['cardio', 'training', 'reading'])

// Which quests are "low effort" (eligible for Easy Win)
const LOW_EFFORT = new Set(['wake', 'water', 'screenTime'])

/**
 * Checks whether a quest is completed today.
 * @param {string} questType
 * @param {Object} todayLog
 * @param {Object} userProfile
 * @returns {boolean}
 */
function isCompleted(questType, todayLog, userProfile) {
  const completions = todayLog?.questCompletions
  if (!completions) return false

  switch (questType) {
    case 'wake':
      return completions.wakeTime === true

    case 'water':
      return (
        typeof completions.water === 'number' &&
        completions.water >= userProfile.dailyWaterTarget
      )

    case 'cardio':
      return (
        completions.cardio?.sessions > 0 &&
        !completions.cardio?.partial
      )

    case 'training':
      return (
        completions.training?.sessions > 0 &&
        !completions.training?.partial
      )

    case 'reading':
      return (
        typeof completions.reading === 'number' &&
        completions.reading >= userProfile.dailyReadingPages
      )

    case 'screenTime':
      return (
        completions.screenTime !== undefined &&
        completions.screenTime <= userProfile.dailyScreenTimeCap
      )

    default:
      return false
  }
}

/**
 * Determines the status of a quest.
 * Priority: Done → Easy Win → At-Risk → Pending
 * @param {string} questType
 * @param {Object} todayLog
 * @param {Object} userProfile
 * @param {Date} now
 * @returns {'Done'|'Pending'|'At-Risk'|'Easy Win'}
 */
function resolveStatus(questType, todayLog, userProfile, now) {
  if (isCompleted(questType, todayLog, userProfile)) return 'Done'

  const currentHour = now instanceof Date ? now.getHours() : new Date().getHours()

  // Easy Win: low-effort quest AND current hour is before triggerTime hour
  if (LOW_EFFORT.has(questType) && userProfile.triggerTime) {
    const triggerHour = parseInt(userProfile.triggerTime.split(':')[0], 10)
    if (!isNaN(triggerHour) && currentHour < triggerHour) {
      return 'Easy Win'
    }
  }

  // At-Risk: high-effort quest AND hour >= 21
  if (HIGH_EFFORT.has(questType) && currentHour >= 21) {
    return 'At-Risk'
  }

  return 'Pending'
}

/**
 * Formats the target string for each quest type.
 * @param {string} questType
 * @param {Object} userProfile
 * @returns {string}
 */
function formatTarget(questType, userProfile) {
  switch (questType) {
    case 'wake': {
      // targetWakeTime is "HH:MM" in 24h; convert to 12h AM/PM
      if (!userProfile.targetWakeTime) return '—'
      const [hStr, mStr] = userProfile.targetWakeTime.split(':')
      const h = parseInt(hStr, 10)
      const m = mStr || '00'
      const period = h < 12 ? 'AM' : 'PM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${String(h12).padStart(2, '0')}:${m} ${period}`
    }
    case 'water':
      return userProfile.dailyWaterTarget
        ? `${userProfile.dailyWaterTarget}L`
        : '—'
    case 'cardio':
      return userProfile.weeklyCardioSessions
        ? `${userProfile.cardioDuration ?? '—'} min × ${userProfile.weeklyCardioSessions}/week`
        : '—'
    case 'training':
      return userProfile.weeklyTrainingSessions
        ? `${userProfile.trainingDuration ?? '—'} min × ${userProfile.weeklyTrainingSessions}/week`
        : '—'
    case 'reading':
      return userProfile.dailyReadingPages
        ? `${userProfile.dailyReadingPages} pages/day`
        : '—'
    case 'screenTime':
      return userProfile.dailyScreenTimeCap
        ? `≤${userProfile.dailyScreenTimeCap}h/day`
        : '—'
    default:
      return '—'
  }
}

/**
 * Builds a weekly context string for cardio/training (e.g. "Session 2 of 3 this week").
 * @param {string} questType
 * @param {Object} userProfile
 * @param {Object} todayLog
 * @returns {string}
 */
function weeklyContext(questType, userProfile, todayLog) {
  const weeklyTarget =
    questType === 'cardio'
      ? userProfile.weeklyCardioSessions
      : userProfile.weeklyTrainingSessions

  if (!weeklyTarget) return ''

  // sessions done this week — use todayLog weekly data if available, else 0
  const completions = todayLog?.questCompletions
  const sessionsThisWeek =
    questType === 'cardio'
      ? (completions?.cardio?.sessions ?? 0)
      : (completions?.training?.sessions ?? 0)

  const current = Math.min(sessionsThisWeek + 1, weeklyTarget)
  return `Session ${current} of ${weeklyTarget} this week`
}

/**
 * Returns a completion data snapshot for the given quest from todayLog.
 * @param {string} questType
 * @param {Object} todayLog
 * @returns {*}
 */
function getCompletionData(questType, todayLog) {
  const completions = todayLog?.questCompletions
  if (!completions) return null
  switch (questType) {
    case 'wake':       return completions.wakeTime ?? null
    case 'water':      return completions.water ?? null
    case 'cardio':     return completions.cardio ?? null
    case 'training':   return completions.training ?? null
    case 'reading':    return completions.reading ?? null
    case 'screenTime': return completions.screenTime ?? null
    default:           return null
  }
}

// Human-readable quest titles
const QUEST_TITLES = {
  wake:       'Wake Time',
  water:      'Water Intake',
  cardio:     'Cardio',
  training:   'Training',
  reading:    'Reading',
  screenTime: 'Screen Time',
}

/**
 * Default cards returned when userProfile is null or critically incomplete.
 * Returns 4 Pending cards for the always-present quests.
 */
function defaultCards() {
  return ['wake', 'water', 'reading', 'screenTime'].map(questType => ({
    questType,
    title: QUEST_TITLES[questType],
    target: '—',
    weeklyContext: '',
    status: 'Pending',
    xp: QUEST_XP[questType],
    statGains: QUEST_STAT_LABELS[questType],
    completionData: null,
  }))
}

/**
 * Builds the full array of quest card objects for today's dashboard.
 *
 * Always generates cards for wake and water.
 * Generates cardio if weeklyCardioSessions > 0.
 * Generates training if weeklyTrainingSessions > 0.
 * Generates reading if dailyReadingPages > 0.
 * Generates screenTime if dailyScreenTimeCap > 0.
 *
 * If userProfile is null or missing fields, returns default 4 Pending cards.
 *
 * @param {Object|null} userProfile
 * @param {Object} todayLog
 * @param {Date} now
 * @returns {Array<{questType: string, title: string, target: string, weeklyContext: string, status: string, xp: number, statGains: string, completionData: *}>}
 */
export function getQuestCards(userProfile, todayLog, now) {
  // Guard: if profile is missing, return safe defaults
  if (!userProfile || typeof userProfile !== 'object') {
    return defaultCards()
  }

  const safeLog = todayLog && typeof todayLog === 'object' ? todayLog : {}
  const safeNow = now instanceof Date ? now : new Date()

  // Determine which quest types to include
  const questTypes = ['wake', 'water']

  if (Number(userProfile.weeklyCardioSessions) > 0) questTypes.push('cardio')
  if (Number(userProfile.weeklyTrainingSessions) > 0) questTypes.push('training')
  if (Number(userProfile.dailyReadingPages) > 0) questTypes.push('reading')
  if (Number(userProfile.dailyScreenTimeCap) > 0) questTypes.push('screenTime')

  return questTypes.map(questType => {
    const isWeekly = questType === 'cardio' || questType === 'training'
    return {
      questType,
      title:          QUEST_TITLES[questType],
      target:         formatTarget(questType, userProfile),
      weeklyContext:  isWeekly ? weeklyContext(questType, userProfile, safeLog) : '',
      status:         resolveStatus(questType, safeLog, userProfile, safeNow),
      xp:             QUEST_XP[questType],
      statGains:      QUEST_STAT_LABELS[questType],
      completionData: getCompletionData(questType, safeLog),
    }
  })
}
