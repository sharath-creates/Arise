/**
 * SystemMessage — renders a chat-bubble-style card with a tone-colored left border.
 *
 * Props:
 *   message  {string}                           the message body
 *   tone     {'sarcasm'|'disappointment'|'pressure'}
 */

const TONE_COLORS = {
  sarcasm: '#00d4ff',
  disappointment: '#888',
  pressure: '#ff4444',
}

export default function SystemMessage({ message = '', tone = 'pressure' }) {
  const accentColor = TONE_COLORS[tone] ?? TONE_COLORS.pressure

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '0 8px 8px 0',
        padding: '10px 14px',
        maxWidth: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          color: accentColor,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 5,
        }}
      >
        System:
      </div>
      <div
        style={{
          color: '#f0f0f0',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
    </div>
  )
}
