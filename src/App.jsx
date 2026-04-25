import './index.css'
import { AppContextProvider, useAppContext } from './store/AppContext'
import ThresholdScreen from './screens/ThresholdScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import PlanConfirmationScreen from './screens/PlanConfirmationScreen'
import CommitmentScreen from './screens/CommitmentScreen'
import DashboardScreen from './screens/DashboardScreen'
import SettingsScreen from './screens/SettingsScreen'

function AppContent() {
  const { state } = useAppContext()
  const currentScreen = state.programState.currentScreen

  if (currentScreen === 'THRESHOLD') return <ThresholdScreen />
  if (currentScreen === 'ONBOARDING') return <OnboardingScreen />
  if (currentScreen === 'PLAN_CONFIRMATION') return <PlanConfirmationScreen />
  if (currentScreen === 'COMMITMENT') return <CommitmentScreen />
  if (currentScreen === 'DASHBOARD') return <DashboardScreen />
  if (currentScreen === 'SETTINGS') return <SettingsScreen />

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Screen: {currentScreen}
    </div>
  )
}

function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  )
}

export default App
