import { useAppContext } from '../store/AppContext'
import { ACTIONS } from '../store/actions'

export default function ThresholdScreen() {
  const { dispatch } = useAppContext()

  function handleBegin() {
    dispatch({ type: ACTIONS.NAVIGATE, screen: 'ONBOARDING' })
  }

  return (
    <>
      <style>{`
        @keyframes arise-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .arise-mark {
          animation: arise-pulse 4s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}
        className="flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Brand mark */}
        <h1
          className="arise-mark"
          style={{
            color: '#00d4ff',
            fontSize: 'clamp(4rem, 20vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '0.25em',
            lineHeight: 1,
            margin: 0,
            fontFamily: 'Inter, system-ui, sans-serif',
            textShadow: '0 0 40px rgba(0,212,255,0.35)',
          }}
        >
          ARISE
        </h1>

        {/* Charged copy */}
        <p
          style={{
            color: '#a0a0a0',
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            fontWeight: 400,
            letterSpacing: '0.02em',
            marginTop: '2rem',
            maxWidth: '28rem',
            lineHeight: 1.5,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          You are not starting over.
          <br />
          You are starting awake.
        </p>

        {/* CTA */}
        <button
          onClick={handleBegin}
          style={{
            marginTop: '3rem',
            padding: '0.9rem 2.5rem',
            border: '2px solid #00d4ff',
            background: 'transparent',
            color: '#00d4ff',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#00d4ff'
            e.currentTarget.style.color = '#0a0a0a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#00d4ff'
          }}
        >
          Begin Assessment
        </button>
      </div>
    </>
  )
}
