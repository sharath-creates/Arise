import { useEffect } from 'react'
import { shouldTransition } from '@/logic/dayTransition'
import { ACTIONS } from '@/store/actions'

export function useMidnightCheck(programState, dispatch) {
  useEffect(() => {
    // Only run if program is active and started
    if (!programState.programStartDate) return
    const interval = setInterval(() => {
      if (shouldTransition(programState.lastOpenDate)) {
        dispatch({ type: ACTIONS.ADVANCE_DAY })
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [programState.lastOpenDate, programState.programStartDate])
}
