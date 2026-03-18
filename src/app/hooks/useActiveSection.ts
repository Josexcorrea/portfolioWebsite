import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type UseActiveSectionOptions = {
  observerOptions?: IntersectionObserverInit
}

const DEFAULT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '-40% 0px -40% 0px',
  threshold: [0, 0.25, 0.5, 0.75, 1],
}

/**
 * Tracks which section is most visible and exposes helpers to set refs and scroll.
 * Keeps DOM ownership in the caller (you still render the <section> nodes).
 */
export function useActiveSection(sectionCount: number, options: UseActiveSectionOptions = {}) {
  const [activeIndex, setActiveIndex] = useState(0)

  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const ratiosRef = useRef<number[]>([])

  // Ensure arrays are sized consistently (but don't trigger renders).
  useMemo(() => {
    if (sectionRefs.current.length !== sectionCount) {
      sectionRefs.current = Array(sectionCount).fill(null)
    }
    if (ratiosRef.current.length !== sectionCount) {
      ratiosRef.current = Array(sectionCount).fill(0)
    }
  }, [sectionCount])

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el
    },
    []
  )

  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const refs = sectionRefs.current
    const elements = refs.filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    const ratios = ratiosRef
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = refs.indexOf(entry.target as HTMLElement)
          if (i !== -1) ratios.current[i] = entry.intersectionRatio
        }

        let bestIndex = 0
        let bestRatio = 0
        ratios.current.forEach((r, i) => {
          if (r > bestRatio) {
            bestRatio = r
            bestIndex = i
          }
        })
        if (bestRatio > 0) setActiveIndex(bestIndex)
      },
      options.observerOptions ?? DEFAULT_OBSERVER_OPTIONS
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [options.observerOptions])

  return { activeIndex, setSectionRef, scrollToSection }
}

