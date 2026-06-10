/**
 * System flavor text. The System speaks in cold, clipped declarations.
 */

export const BOOT_LINES = [
  'INITIALIZING SYSTEM…',
  'SCANNING LIFEFORM…',
  'POTENTIAL DETECTED.',
  'SUBJECT QUALIFIES FOR THE PROGRAM.',
  'AWAITING CONSENT.',
]

export const AWAKENING_HOOK =
  'You have been chosen. 66 days. Six daily directives. ' +
  'Clear them all, every day, and you will not recognize the person you were.'

export const WARNING_LINES = [
  'Daylight is spent. Your directives are not.',
  'The System does not accept intention. Only completion.',
  'Unfinished quests detected. The penalty clock is running.',
  'You swore an oath. The System remembers, even when you forget.',
  'Weakness is a choice made one evening at a time.',
  'Your future self is watching this moment. Make it worth watching.',
]

export const SURRENDER_CONFIRM_WORD = 'SURRENDER'
export const ABANDON_CONFIRM_WORD = 'ABANDON'
export const OATH_WORD = 'ARISE'

export const REPORT_VERDICTS = {
  CLEARED: {
    title: 'DAY CLEARED',
    line: 'All mandatory directives completed. The System acknowledges you.',
  },
  PARTIAL: {
    title: 'INCOMPLETE',
    line: 'Some directives were left unfinished. Your streak has been severed.',
  },
  FAILED: {
    title: 'DAY FAILED',
    line: 'No directives were completed. Penalties have been applied.',
  },
}

export const PRAISE_ALL_CLEAR = 'ALL DIRECTIVES CLEAR — OVERDRIVE ENGAGED'

export function pickWarning(excludeIndices = []) {
  const pool = WARNING_LINES.map((_, i) => i).filter(i => !excludeIndices.includes(i))
  const idx = pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : Math.floor(Math.random() * WARNING_LINES.length)
  return { index: idx, text: WARNING_LINES[idx] }
}
