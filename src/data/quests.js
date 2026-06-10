/**
 * Mandatory Daily Quests — issued by the System every day.
 * Targets come from the Hunter profile; definitions here are static.
 */

export const MANDATORY_QUESTS = [
  {
    id: 'wake',
    name: 'Morning Protocol',
    sub: '起床',
    desc: profile => `Rise at or before ${profile?.wakeTime || '06:30'}`,
    kind: 'confirm',
    ctaLabel: 'CONFIRM WAKE',
    xp: 50,
    stats: { DIS: 2, FOC: 1 },
    icon: 'sunrise',
  },
  {
    id: 'water',
    name: 'Hydration Directive',
    sub: '水分',
    desc: profile => `Drink ${profile?.waterTarget ?? 2}L of water`,
    kind: 'counter',
    unit: 'L',
    step: 0.5,
    target: profile => profile?.waterTarget ?? 2,
    xp: 60,
    stats: { VIT: 2 },
    icon: 'droplet',
  },
  {
    id: 'cardio',
    name: 'Endurance Trial',
    sub: '走行',
    desc: profile => `${profile?.cardioMinutes ?? 30} minutes of cardio`,
    kind: 'timer',
    minutes: profile => profile?.cardioMinutes ?? 30,
    xp: 120,
    stats: { STR: 3, VIT: 2 },
    icon: 'run',
  },
  {
    id: 'training',
    name: 'Strength Trial',
    sub: '鍛錬',
    desc: profile => `${profile?.trainingMinutes ?? 45} minutes of training`,
    kind: 'timer',
    minutes: profile => profile?.trainingMinutes ?? 45,
    xp: 120,
    stats: { STR: 3, DIS: 2 },
    icon: 'sword',
  },
  {
    id: 'reading',
    name: 'Knowledge Acquisition',
    sub: '読書',
    desc: profile => `Read ${profile?.readingPages ?? 20} pages`,
    kind: 'counter',
    unit: 'pages',
    step: 1,
    target: profile => profile?.readingPages ?? 20,
    xp: 80,
    stats: { INT: 3, FOC: 2 },
    icon: 'book',
  },
  {
    id: 'screen',
    name: 'Signal Discipline',
    sub: '遮断',
    desc: profile => `Keep screen time under ${profile?.screenCap ?? 2}h`,
    kind: 'report',
    unit: 'h',
    cap: profile => profile?.screenCap ?? 2,
    xp: 70,
    stats: { FOC: 2, DIS: 2 },
    icon: 'shield',
  },
]

export const MANDATORY_IDS = MANDATORY_QUESTS.map(q => q.id)

export const ALL_CLEAR_BONUS_XP = 100

export function getQuest(id) {
  return MANDATORY_QUESTS.find(q => q.id === id)
}
