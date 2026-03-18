import { Suspense, lazy, useEffect, useState } from 'react'
import { AVATAR_IMAGE } from '@/data'

const ComputerCanvas = lazy(() =>
  import('@/features/hero/ComputerCanvas').then((m) => ({ default: m.ComputerCanvas }))
)

type HomeViewProps = {
  avatarError: boolean
  onAvatarError: () => void
}

const HERO_VIDEO_SRC = '/hero-bg.mp4'

export function HomeView({ avatarError, onAvatarError }: HomeViewProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <div
        className="home-video-wrap fixed inset-0 z-0 overflow-hidden opacity-[0.32] mix-blend-screen"
        aria-hidden="true"
      >
        <video
          className="w-full h-full object-cover object-center"
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
      <div className="relative z-[1] flex-1 flex w-full min-h-screen min-h-dvh px-[clamp(0.75rem,3vw,2.5rem)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* Top HUD: title left, date/time right */}
        <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-between px-[clamp(0.75rem,3vw,2.5rem)]">
          {/* Top-left: role title */}
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-text-muted shadow-[0_10px_32px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="text-text-pri">Full‑Stack &amp; Machine Learning Engineer</span>
          </div>
          {/* Top-right: date / time */}
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[0.68rem] font-medium text-text-sec shadow-[0_10px_32px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="tracking-[0.16em] uppercase text-[0.65rem] text-text-muted">Local</span>
            <span className="text-text-pri">{timeStr}</span>
            <span className="text-text-sec/80">•</span>
            <span>{dateStr}</span>
          </div>
        </div>
        {/*
          < lg: stack — text + pfp on top, 3D full-width below.
          lg+: row — left column fixed width, right column fills entire rest of viewport.
        */}
        <div className="flex w-full flex-1 flex-col gap-10 pt-10 pb-8 lg:flex-row lg:items-stretch lg:gap-0 lg:py-0 lg:pt-[var(--section-padding-y)] lg:pb-[var(--section-padding-y)]">
          <section
            className="order-1 flex w-full shrink-0 flex-col lg:order-1 lg:w-auto lg:max-w-[min(50vw,40rem)] lg:flex-none lg:justify-center lg:pr-16 xl:pr-20"
            aria-label="Intro and profile"
          >
            <div className="flex flex-col gap-6">
              {/* Top cluster: name, big title */}
              <div className="flex flex-col items-center gap-2.5 text-center lg:items-start lg:text-left max-w-xl">
                <p className="font-display text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.3em] text-text-muted/90">
                  Hi, I&apos;m <span className="text-text-pri">Jose Correa</span>
                </p>
                <h1 className="font-display text-balance text-[clamp(2.4rem,4.6vw,3.4rem)] font-semibold leading-tight text-text-pri max-w-xl">
                  Turning data and AI
                  <br className="hidden sm:inline" /> into products people actually use.
                </h1>
              </div>

              {/* Middle cluster: About me + stack + portrait */}
              <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
                <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left max-w-2xl">
                  <h2 className="font-display text-[0.78rem] sm:text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
                    About me
                  </h2>
                  <p className="max-w-2xl text-balance text-[0.9rem] text-text-sec/95 md:text-base">
                    I&apos;m a Computer Engineering graduate who enjoys building systems that combine software, data,
                    and real‑world applications. My work ranges from full‑stack applications to machine learning models
                    and real‑time systems, with a focus on performance, reliability, and practical impact. I&apos;ve
                    built projects like a machine learning engine that identifies pricing inefficiencies in sports
                    markets and a real‑time telemetry platform for a Formula SAE race car&apos;s power distribution
                    module, streaming live voltage, current, and temperature data. I&apos;m currently looking for roles
                    in New York. Click the chat icon to ask my AI assistant about my projects, experience, and how I build things.
                  </p>
                  <p className="text-[0.7rem] sm:text-xs font-medium uppercase tracking-[0.24em] text-text-muted/95">
                    Core tools: <span className="text-text-pri">Python</span> •{' '}
                    <span className="text-text-pri">TypeScript</span> • <span className="text-text-pri">React</span> •{' '}
                    <span className="text-text-pri">Node</span> • <span className="text-text-pri">ML / LLMs</span>
                  </p>
                </div>
                <div className="mt-2 flex w-full justify-start">
                  <div
                    className="relative grid aspect-[3/4] w-[min(170px,34vw)] place-items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-lg"
                    role="img"
                    aria-label="Portrait of Jose Correa"
                  >
                    {!avatarError ? (
                      <img
                        src={AVATAR_IMAGE}
                        alt="Portrait of Jose Correa"
                        className="absolute inset-0 h-full w-full rounded-[inherit] object-cover object-top"
                        onError={onAvatarError}
                      />
                    ) : (
                      <span className="font-display text-[clamp(2.5rem,8vw,3.5rem)] font-bold tracking-[0.28em] text-text-pri">
                        JC
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="order-2 flex min-h-[min(52vh,480px)] w-full min-w-0 flex-1 flex-col justify-center lg:order-2 lg:min-h-[min(78vh,880px)] lg:max-w-[1374px]"
            aria-label="3D computer with code"
          >
            <Suspense fallback={<div className="w-full h-full" aria-hidden />}>
              <ComputerCanvas />
            </Suspense>
          </section>
        </div>
      </div>
    </>
  )
}
