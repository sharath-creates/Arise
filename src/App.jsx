import './index.css'
import { AppContextProvider, useAppContext } from './store/AppContext'
import ThresholdScreen from './screens/ThresholdScreen'
import OnboardingScreen from './screens/OnboardingScreen'

function AppContent() {
  const { state } = useAppContext()
  const currentScreen = state.programState.currentScreen

  if (currentScreen === 'THRESHOLD') return <ThresholdScreen />
  if (currentScreen === 'ONBOARDING') return <OnboardingScreen />

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
