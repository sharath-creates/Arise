/**
 * The 12-Point Daily System.
 * Score at least TARGET_POINTS out of MAX_POINTS every day.
 */

export const MAX_POINTS = 12
export const TARGET_POINTS = 10
export const XP_PER_POINT = 30

export const POINT_CATEGORIES = [
  { id: 'mind', label: 'Mind' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'body', label: 'Body' },
]

export const POINT_ITEMS = [
  {
    id: 'readPages',
    label: 'Read 10 pages of a book',
    points: 2,
    icon: '📖',
    category: 'mind',
  },
  {
    id: 'longForm',
    label: 'Consume long-form content',
    points: 1,
    icon: '🎧',
    category: 'mind',
  },
  {
    id: 'academicPaper',
    label: 'Read an academic paper',
    points: 1,
    icon: '📄',
    category: 'mind',
  },
  {
    id: 'write200',
    label: 'Write 200 words',
    points: 1,
    icon: '✍️',
    category: 'mind',
  },
  {
    id: 'explainLearning',
    label: 'Explain something you learnt today',
    points: 1,
    icon: '🗣️',
    category: 'mind',
  },
  {
    id: 'phoneMorning',
    label: 'No phone — first 30 min of the day',
    points: 1,
    icon: '🌅',
    category: 'discipline',
  },
  {
    id: 'phoneNight',
    label: 'No phone — last 30 min of the day',
    points: 1,
    icon: '🌙',
    category: 'discipline',
  },
  {
    id: 'offlineHour',
    label: '1 hour of offline time',
    points: 1,
    icon: '📵',
    category: 'discipline',
  },
  {
    id: 'sleep8',
    label: 'Sleep 8+ hours',
    points: 2,
    icon: '😴',
    category: 'body',
  },
  {
    id: 'cardio20',
    label: '20+ min of cardio / physical activity',
    points: 1,
    icon: '🏃',
    category: 'body',
  },
]

/** Sum points for a given pointsLog map ({ itemId: bool }). */
export function getDailyPoints(pointsLog = {}) {
  return POINT_ITEMS.reduce(
    (sum, item) => sum + (pointsLog[item.id] ? item.points : 0),
    0
  )
}
