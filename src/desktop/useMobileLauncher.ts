import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

/**
 * True when the shell uses the iPhone-style home grid instead of menu bar + dock.
 */
export function useMobileLauncher(): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return matches
}
