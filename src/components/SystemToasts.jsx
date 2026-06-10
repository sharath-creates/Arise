import { useEffect } from 'react'
import { useAppContext } from '@/store/AppContext'
import { ACTIONS } from '@/store/actions'

const TOAST_LIFETIME_MS = 4200

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, TOAST_LIFETIME_MS)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`toast ${toast.variant}`} onClick={onDismiss} role="status">
      {toast.text}
    </div>
  )
}

export default function SystemToasts() {
  const { state, dispatch } = useAppContext()
  const toasts = state.toasts || []
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.slice(-4).map(t => (
        <Toast
          key={t.id}
          toast={t}
          onDismiss={() => dispatch({ type: ACTIONS.DISMISS_TOAST, id: t.id })}
        />
      ))}
    </div>
  )
}
