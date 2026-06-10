import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { reducer } from './reducer'
import { loadState, writeKey, STORAGE_KEYS } from './localStorage'

export const AppContext = createContext(null)

export function AppContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState())

  useEffect(() => {
    writeKey(STORAGE_KEYS.userProfile, state.userProfile)
    writeKey(STORAGE_KEYS.programState, state.programState)
    writeKey(STORAGE_KEYS.dailyLog, state.dailyLog)
    writeKey(STORAGE_KEYS.dailySnapshots, state.dailySnapshots)
    writeKey(STORAGE_KEYS.guiltState, state.guiltState)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}

export default AppContext
