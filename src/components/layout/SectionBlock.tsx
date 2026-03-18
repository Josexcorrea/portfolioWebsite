import { useRef, useState, useEffect } from 'react'
import type { View } from '@/types'
import { getSectionLabel } from '@/app/sections'

type SectionView = Exclude<View, 'home'>

const CONTENT_PX =
  'pl-[max(clamp(0.75rem,2.5vw,1.5rem),env(safe-area-inset-left,0px))] pr-[max(clamp(0.75rem,2.5vw,1.5rem),env(safe-area-inset-right,0px))]'
const CONTENT_COLUMN = 'mx-auto w-full max-w-[72rem]'

const BLOCK_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '-15% 0px -15% 0px',
  threshold: 0,
}
const TITLE_OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: '0px', threshold: 0 }

type SectionBlockProps = {
  view: SectionView
  children: React.ReactNode
}

export function SectionBlock({ view, children }: SectionBlockProps) {
  const title = getSectionLabel(view)
  const isFullBleed = view === 'skillTree' || view === 'contact'
  const isWork = view === 'work'
  const blockRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const blockInViewRef = useRef(false)
  const [titleInView, setTitleInView] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const blockEl = blockRef.current
    const titleEl = titleRef.current
    if (!blockEl || !titleEl) return

    const blockObserver = new IntersectionObserver(([entry]) => {
      const inView = !!entry?.isIntersecting
      blockInViewRef.current = inView
      setTitleInView((prev) => {
        if (inView && !prev) setAnimationKey((k) => k + 1)
        return inView
      })
    }, BLOCK_OBSERVER_OPTIONS)
    const titleObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting && !blockInViewRef.current) setTitleInView(false)
    }, TITLE_OBSERVER_OPTIONS)
    blockObserver.observe(blockEl)
    titleObserver.observe(titleEl)
    return () => {
      blockObserver.disconnect()
      titleObserver.disconnect()
    }
  }, [animationKey])

  return (
    <div
      ref={blockRef}
      className="relative flex-1 flex flex-col min-h-0 min-h-screen min-h-dvh h-screen h-dvh pb-0"
      data-section={view}
    >
      <main
        className={`
          relative z-[1] flex-1 min-h-0 w-full flex flex-col overflow-auto bg-transparent
          ${view === 'work' ? 'scrollbar-glass scrollbar-glass-work-main' : '[scrollbar-gutter:stable]'}
          ${isFullBleed ? 'px-0' : CONTENT_PX}
        `}
      >
        <div
          className={`min-h-full flex flex-col ${
            isWork ? 'justify-start items-stretch pt-4 pb-10' : 'justify-center items-center'
          }`}
        >
          <div
            className={`flex-shrink-0 w-full flex flex-col min-w-0 ${
              isFullBleed ? 'w-full' : isWork ? 'w-full' : CONTENT_COLUMN
            }`}
          >
            <h2
              key={animationKey}
              ref={titleRef}
              className={`
                font-display font-bold text-white antialiased mb-4 flex-shrink-0
                ${
                  isFullBleed
                    ? 'text-[clamp(1.25rem,4.5vw,1.6rem)] uppercase tracking-[0.2em] text-center'
                    : 'text-[clamp(1.15rem,4.5vw,1.4rem)] tracking-wide text-left'
                }
                ${isFullBleed ? 'relative z-[2]' : ''}
                ${isFullBleed ? CONTENT_PX : ''}
                ${titleInView ? 'section-title-animate' : 'opacity-0'}
                ${titleInView && isFullBleed ? 'section-title-center' : ''}
              `}
              id={`section-${view}`}
            >
              {title}
            </h2>
            <div
              className={`flex-1 min-h-0 flex flex-col min-w-0 ${
                isWork ? 'justify-start items-stretch' : 'justify-center items-center'
              } ${isFullBleed ? 'relative z-[1]' : ''}`}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
