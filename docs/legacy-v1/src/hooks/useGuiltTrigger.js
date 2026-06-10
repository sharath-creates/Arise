import { useEffect } from 'react'
import { ACTIONS } from '@/store/actions'

export function useGuiltTrigger(state, dispatch) {
  useEffect(() => {
    const check = () => {
      const { programState, userProfile, dailyLog, guiltState } = state

      if (!userProfile?.triggerTime) return
      if (programState.currentScreen !== 'DASHBOARD') return

      const now = new Date()
      const [triggerHour, triggerMin] = userProfile.triggerTime.split(':').map(Number)
      const triggerMinutes = triggerHour * 60 + triggerMin
      const nowMinutes = now.getHours() * 60 + now.getMinutes()

      if (nowMinutes < triggerMinutes) return

      // Check if snooze is still active (within 30 min window)
      if (guiltState?.snoozeUntil && Date.now() < guiltState.snoozeUntil) return

      // Check completion %
      const todayLog = dailyLog[programState.currentDay] || {}
      const questCompletions = todayLog.questCompletions || {}
      const totalQuests = 4
      const doneCount = [
        questCompletions.wakeTime,
        questCompletions.water,
        questCompletions.reading,
        questCompletions.screenTime !== undefined,
      ].filter(Boolean).length

      if (doneCount / totalQuests < 0.5) {
        dispatch({ type: ACTIONS.SHOW_GUILT })
      }
    }

    check()
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [state.programState.currentDay, state.programState.currentScreen, state.guiltState?.snoozeUntil])
}
