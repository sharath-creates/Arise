import { useAppContext } from '../store/AppContext'
import { ACTIONS } from '../store/actions'

const VOW_LINES = [
  'This is not a promise to be perfect.',
  'It is a commitment to keep going —',
  'even when you fail, even when you skip,',
  'even when you don\'t want to.',
  '66 days. Not to fix yourself.',
  'To prove you can.',
]

export default function CommitmentScreen() {
  const { dispatch } = useAppContext()

  function handleStartProgram() {
    dispatch({ type: ACTIONS.START_PROGRAM })
  }

  return (
    <>
      <style>{`
        @keyframes vowFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vow-line {
          animation: vowFadeIn 0.6s ease both;
        }
        .vow-line:nth-child(1) { animation-delay: 0.1s; }
        .vow-line:nth-child(2) { animation-delay: 0.25s; }
        .vow-line:nth-child(3) { animation-delay: 0.4s; }
        .vow-line:nth-child(4) { animation-delay: 0.55s; }
        .vow-line:nth-child(5) { animation-delay: 0.75s; }
        .vow-line:nth-child(6) { animation-delay: 0.9s; }
        .commitment-cta {
          animation: vowFadeIn 0.6s ease 1.1s both;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 6vw, 5rem) clamp(1.5rem, 5vw, 3rem)',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        {/* Vow block */}
        <div
          style={{
            maxWidth: '480px',
            marginBottom: '3.5rem',
          }}
        >
          {VOW_LINES.map((line, i) => (
            <p
              key={i}
              className="vow-line"
              style={{
                color: i === 4 || i === 5 ? '#ffffff' : '#9ca3af',
                fontSize: i === 4 || i === 5
                  ? 'clamp(1.1rem, 3vw, 1.35rem)'
                  : 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: i === 4 || i === 5 ? 700 : 400,
                lineHeight: 1.7,
                margin: '0 0 0.15rem',
                letterSpacing: i === 4 || i === 5 ? '0.04em' : 'normal',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* CTA */}
        <button
          className="commitment-cta"
          onClick={handleStartProgram}
          style={{
            padding: '1rem 3.5rem',
            border: '2px solid #00d4ff',
            background: 'transparent',
            color: '#00d4ff',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '6px',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#00d4ff'
            e.currentTarget.style.color = '#0a0a0a'
            e.currentTarget.style.boxShadow = '0 0 28px rgba(0,212,255,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#00d4ff'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Start My Program
        </button>
      </div>
    </>
  )
}
