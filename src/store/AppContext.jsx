import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { reducer, createInitialState } from './reducer'
import { loadState, saveState } from './storage'

const AppContext = createContext(null)

function init() {
  const saved = loadState()
  if (!saved) return createInitialState()
  // Re-attach transient fields that don't persist.
  return { ...createInitialState(), ...saved, toasts: [] }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // Persist on change (skip the very first render's redundant write).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
