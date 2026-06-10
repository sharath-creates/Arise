/**
 * Stat projection utilities — pure functions, no React imports.
 *
 * Quest stat gains:
 *   wake       → discipline +2, focus +1
 *   water      → confidence +2
 *   cardio     → strength +3, discipline +2
 *   training   → strength +3, discipline +2
 *   reading    → wisdom +3, focus +2
 *   screenTime → wisdom +2, focus +2
 *
 * XP per quest:
 *   wake 50 | water 60 | cardio 120 | training 120 | reading 80 | screenTime 70
 */

const QUEST_XP = {
  wake: 50,
  water: 60,
  cardio: 120,
  training: 120,
  reading: 80,
  screenTime: 70,
}

const QUEST_STAT_GAINS = {
  wake:       { discipline: 2, focus: 1 },
  water:      { confidence: 2 },
  cardio:     { strength: 3, discipline: 2 },
  training:   { strength: 3, discipline: 2 },
  reading:    { wisdom: 3, focus: 2 },
  screenTime: { wisdom: 2, focus: 2 },
}

/**
 * Returns a Day-66 projection of XP and stats based on the user's profile.
 *
 * Daily habits (wake, water, reading, screenTime) are assumed to complete every day × 66.
 * Weekly habits (cardio, training) use frequency/7 × 66 completions.
 *
 * @param {Object} userProfile
 * @param {number} userProfile.weeklyCardioSessions
 * @param {number} userProfile.weeklyTrainingSessions
 * @param {number} userProfile.dailyReadingPages   - > 0 means reading is active
 * @param {number} userProfile.dailyScreenTimeCap  - > 0 means screenTime is active
 * @param {number} userProfile.dailyWaterTarget     - > 0 means water is active
 * @param {string} userProfile.targetWakeTime       - presence means wake is active
 * @returns {{ projectedXP: number, projectedStats: { wisdom: number, confidence: number, strength: number, discipline: number, focus: number } }}
 */
export function getStatProjection(userProfile) {
  const stats = { wisdom: 0, confidence: 0, strength: 0, discipline: 0, focus: 0 }
  let projectedXP = 0

  if (!userProfile) {
    return { projectedXP, projectedStats: stats }
  }

  // Helper: accumulate completions
  function addQuest(questKey, completions) {
    if (completions <= 0) return
    projectedXP += QUEST_XP[questKey] * completions
    const gains = QUEST_STAT_GAINS[questKey]
    for (const [stat, gain] of Object.entries(gains)) {
      stats[stat] = (stats[stat] || 0) + gain * completions
    }
  }

  // Daily quests (all 66 days if the setting is present/positive)
  const DAYS = 66

  // Wake time — active if targetWakeTime is set
  if (userProfile.targetWakeTime) {
    addQuest('wake', DAYS)
  }

  // Water — active if dailyWaterTarget > 0
  if (userProfile.dailyWaterTarget > 0) {
    addQuest('water', DAYS)
  }

  // Cardio — weekly frequency projected over 66 days
  const cardioSessions = Number(userProfile.weeklyCardioSessions) || 0
  if (cardioSessions > 0) {
    const cardioCompletions = (cardioSessions / 7) * DAYS
    addQuest('cardio', cardioCompletions)
  }

  // Training — weekly frequency projected over 66 days
  const trainingSessions = Number(userProfile.weeklyTrainingSessions) || 0
  if (trainingSessions > 0) {
    const trainingCompletions = (trainingSessions / 7) * DAYS
    addQuest('training', trainingCompletions)
  }

  // Reading — active if dailyReadingPages > 0
  if (userProfile.dailyReadingPages > 0) {
    addQuest('reading', DAYS)
  }

  // Screen time — active if dailyScreenTimeCap > 0
  if (userProfile.dailyScreenTimeCap > 0) {
    addQuest('screenTime', DAYS)
  }

  return {
    projectedXP: Math.round(projectedXP),
    projectedStats: {
      wisdom:     Math.round(stats.wisdom),
      confidence: Math.round(stats.confidence),
      strength:   Math.round(stats.strength),
      discipline: Math.round(stats.discipline),
      focus:      Math.round(stats.focus),
    },
  }
}
