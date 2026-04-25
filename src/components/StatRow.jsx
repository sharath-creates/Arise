import { useState, useEffect, useRef } from 'react'

/**
 * StatRow
 * Props:
 *   statName       - string, e.g. "Wisdom"
 *   currentValue   - number (starting value, shown on the left column)
 *   projectedValue - number (target value to count up to)
 *   animate        - boolean; when true, counts up from 0 → projectedValue over ~1.5s
 */
export default function StatRow({ statName, currentValue = 0, projectedValue = 0, animate = false }) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : projectedValue)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!animate || projectedValue <= 0) {
      setDisplayValue(projectedValue)
      return
    }

    const duration = 1500 // ms
    let startTime = null

    function step(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * projectedValue))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate, projectedValue])

  // Fill ratio: 0–1 relative to projectedValue (which is the max for this column)
  const fillRatio = projectedValue > 0 ? displayValue / projectedValue : 0

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {/* Label + number row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.3rem',
        }}
      >
        <span
          style={{
            color: '#6b7280',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {statName}
        </span>
        <span
          style={{
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            minWidth: '2.5rem',
            textAlign: 'right',
          }}
        >
          {displayValue}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '3px',
          backgroundColor: '#1f2937',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillRatio * 100}%`,
            backgroundColor: '#00d4ff',
            borderRadius: '2px',
            transition: animate ? 'none' : 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
