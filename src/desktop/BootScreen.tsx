import { useState, useEffect } from 'react'

interface BootScreenProps {
  onEnter: () => void
}

export function BootScreen({ onEnter }: BootScreenProps) {
  const [exiting, setExiting] = useState(false)

  function handleEnter() {
    if (exiting) return
    setExiting(true)
  }

  return (
    <div
      className={`boot-screen${exiting ? ' boot-screen--exiting' : ''}`}
      onClick={handleEnter}
      onAnimationEnd={(e) => {
        if (e.animationName === 'boot-fade-out') onEnter()
      }}
      role="button"
      tabIndex={0}
      aria-label="Click to enter"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEnter() }}
    >
      {/* Clock — upper center */}
      <div className="boot-clock-area">
        <BootClock />
      </div>

      {/* Profile — bottom center */}
      <div className="boot-profile-area">
        <div className="boot-avatar-wrap">
          <img
            src="/pfp.jpeg"
            alt="Jose Correa"
            className="boot-avatar"
            draggable={false}
          />
        </div>
        <p className="boot-name">Jose Correa</p>
        <p className="boot-hint">Full-Stack &amp; ML Engineer</p>
      </div>
    </div>
  )
}

function BootClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })

  return (
    <div className="boot-clock" aria-hidden>
      <div className="boot-clock-date">{dateStr}</div>
      <div className="boot-clock-time">{timeStr}</div>
    </div>
  )
}
