import { useState } from 'react'

export function useGuiltTrigger() {
  const [triggered, setTriggered] = useState(false)
  return { triggered, setTriggered }
}
