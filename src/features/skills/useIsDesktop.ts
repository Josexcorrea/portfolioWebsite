import { useEffect, useState } from 'react'
import { DESKTOP_BREAKPOINT_PX } from './skillsConstants'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`)
    const set = () => setIsDesktop(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return isDesktop
}

