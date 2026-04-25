import { useEffect } from 'react'
import { shouldTransition } from '@/logic/dayTransition'
import { ACTIONS } from '@/store/actions'

export function useMidnightCheck(programState, dispatch) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldTransition(programState.lastOpenDate)) {
        dispatch({ type: ACTIONS.ADVANCE_DAY })
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [programState.lastOpenDate])
}
