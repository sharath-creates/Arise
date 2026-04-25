import './index.css'

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h1
        style={{
          color: '#00d4ff',
          fontSize: '3rem',
          fontWeight: '700',
          letterSpacing: '0.2em',
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        ARISE
      </h1>
      <p
        style={{
          color: '#606060',
          fontSize: '0.875rem',
          letterSpacing: '0.15em',
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        66-DAY PROTOCOL
      </p>
    </div>
  )
}

export default App
