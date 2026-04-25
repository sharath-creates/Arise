const STORAGE_KEY = 'arise_state'

export function loadState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    return serialized ? JSON.parse(serialized) : undefined
  } catch {
    return undefined
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore write errors
  }
}
