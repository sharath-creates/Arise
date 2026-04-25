import './index.css'
import { AppContextProvider, useAppContext } from './store/AppContext'
import ThresholdScreen from './screens/ThresholdScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import PlanConfirmationScreen from './screens/PlanConfirmationScreen'
import CommitmentScreen from './screens/CommitmentScreen'

function AppContent() {
  const { state } = useAppContext()
  const currentScreen = state.programState.currentScreen

  if (currentScreen === 'THRESHOLD') return <ThresholdScreen />
  if (currentScreen === 'ONBOARDING') return <OnboardingScreen />
  if (currentScreen === 'PLAN_CONFIRMATION') return <PlanConfirmationScreen />
  if (currentScreen === 'COMMITMENT') return <CommitmentScreen />

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
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
