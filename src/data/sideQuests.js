/**
 * Side Quests — the 12-point system.
 * Optional. Pay XP_PER_POINT per point; 2x while Overdrive is active
 * (all mandatory quests cleared). Daily target: TARGET_POINTS of MAX_POINTS.
 */

export const MAX_POINTS = 12
export const TARGET_POINTS = 10
export const XP_PER_POINT = 30

export const SIDE_CATEGORIES = [
  { id: 'mind', label: 'Mind', sub: '精神' },
  { id: 'discipline', label: 'Discipline', sub: '規律' },
  { id: 'body', label: 'Body', sub: '肉体' },
]

export const SIDE_QUESTS = [
  { id: 'readPages',  label: 'Read 10 pages of a book',            points: 2, category: 'mind',       stats: { INT: 2 } },
  { id: 'longForm',   label: 'Consume long-form content',          points: 1, category: 'mind',       stats: { INT: 1 } },
  { id: 'paper',      label: 'Read an academic paper',             points: 1, category: 'mind',       stats: { INT: 1, FOC: 1 } },
  { id: 'write200',   label: 'Write 200 words',                    points: 1, category: 'mind',       stats: { INT: 1 } },
  { id: 'explain',    label: 'Explain something you learnt today', points: 1, category: 'mind',       stats: { INT: 1, FOC: 1 } },
  { id: 'phoneAM',    label: 'No phone — first 30 min of the day', points: 1, category: 'discipline', stats: { DIS: 1 } },
  { id: 'phonePM',    label: 'No phone — last 30 min of the day',  points: 1, category: 'discipline', stats: { DIS: 1 } },
  { id: 'offline1h',  label: '1 hour of offline time',             points: 1, category: 'discipline', stats: { DIS: 1, FOC: 1 } },
  { id: 'sleep8',     label: 'Sleep 8+ hours',                     points: 2, category: 'body',       stats: { VIT: 2 } },
  { id: 'cardio20',   label: '20+ min of physical activity',       points: 1, category: 'body',       stats: { STR: 1 } },
]

export function getSideQuest(id) {
  return SIDE_QUESTS.find(q => q.id === id)
}

/** Points scored for a { itemId: bool } log. */
export function getPoints(sideLog = {}) {
  return SIDE_QUESTS.reduce((sum, q) => sum + (sideLog[q.id] ? q.points : 0), 0)
}
