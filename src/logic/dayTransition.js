/**
 * Day-transition utilities — pure functions, no React imports.
 */

/**
 * Determines whether the app should transition to a new day.
 * Compares storedDate (YYYY-MM-DD) to today's date formatted as YYYY-MM-DD.
 * Returns true if they differ OR if storedDate is null/undefined.
 * @param {string|null|undefined} storedDate
 * @returns {boolean}
 */
export function shouldTransition(storedDate) {
  if (storedDate == null) return true
  const today = new Date().toISOString().slice(0, 10)
  return storedDate !== today
}
