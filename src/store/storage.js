/**
 * Versioned localStorage persistence. v1 data (key 'arise-state') is ignored.
 */

const KEY = 'arise/v2'
const VERSION = 2

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== VERSION || !parsed.state) return null
    return parsed.state
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    // Toasts and transient UI bits don't persist.
    // eslint-disable-next-line no-unused-vars
    const { toasts, ...rest } = state
    window.localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state: rest }))
  } catch {
    // Storage full or unavailable — the app keeps working in memory.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
