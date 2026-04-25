import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'

export default function SettingsScreen() {
  const { dispatch } = useAppContext()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Settings</h1>
      <p style={{ color: '#888', margin: 0, fontSize: 14 }}>Coming soon</p>
      <button
        onClick={() => dispatch({ type: ACTIONS.NAVIGATE, screen: 'DASHBOARD' })}
        style={{
          marginTop: 8,
          background: 'none',
          border: '1px solid #333',
          borderRadius: 8,
          color: '#aaa',
          cursor: 'pointer',
          fontSize: 13,
          padding: '8px 18px',
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}
