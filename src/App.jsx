import { useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'
import { SCREENS } from '@/store/reducer'
import { allMandatoryDone, toDateKey } from '@/logic/day'

import AwakeningScreen from '@/screens/AwakeningScreen'
import OnboardingScreen from '@/screens/OnboardingScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import DailyReportScreen from '@/screens/DailyReportScreen'
import WarningScreen from '@/screens/WarningScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import CompleteScreen from '@/screens/CompleteScreen'

import SystemToasts from '@/components/SystemToasts'
import CeremonyOverlay from '@/components/CeremonyOverlay'

const SCREEN_MAP = {
  [SCREENS.AWAKENING]: AwakeningScreen,
  [SCREENS.ONBOARDING]: OnboardingScreen,
  [SCREENS.DASHBOARD]: DashboardScreen,
  [SCREENS.DAILY_REPORT]: DailyReportScreen,
  [SCREENS.WARNING]: WarningScreen,
  [SCREENS.SETTINGS]: SettingsScreen,
  [SCREENS.COMPLETE]: CompleteScreen,
}

export default function App() {
  const { state, dispatch } = useAppContext()

  // ── Day rollover: on mount and every 30s (catches midnight while open).
  useEffect(() => {
    dispatch({ type: ACTIONS.OPEN_APP, todayKey: toDateKey() })
    const id = setInterval(() => {
      dispatch({ type: ACTIONS.OPEN_APP, todayKey: toDateKey() })
    }, 30000)
    return () => clearInterval(id)
  }, [dispatch])

  // ── Evening warning trigger.
  useEffect(() => {
    function check() {
      if (state.screen !== SCREENS.DASHBOARD) return
      if (state.program.status !== 'active') return
      const today = state.dailyLog[state.program.currentDay] || {}
      if (today.surrendered || allMandatoryDone(today)) return

      const warnHour = state.profile?.warnHour ?? 20
      if (new Date().getHours() < warnHour) return

      const { snoozeUntil, dateKey } = state.warning || {}
      const sameDay = dateKey === toDateKey()
      if (sameDay && snoozeUntil && Date.now() < snoozeUntil) return

      dispatch({ type: ACTIONS.SHOW_WARNING })
    }
    const id = setInterval(check, 20000)
    check()
    return () => clearInterval(id)
  }, [state, dispatch])

  const Screen = SCREEN_MAP[state.screen] || AwakeningScreen

  return (
    <>
      <div className="void-bg" />
      <Screen />
      <SystemToasts />
      <CeremonyOverlay />
      <div className="scanlines" />
    </>
  )
}
