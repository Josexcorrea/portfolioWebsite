export function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,var(--bg-start)_0%,var(--bg-mid)_48%,var(--bg-end)_100%)]" />
      <div
        className="absolute rounded-full blur-[100px] opacity-90"
        style={{
          width: 'min(92vw, 760px)',
          height: 'min(92vw, 760px)',
          top: '-18%',
          left: '-16%',
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.42) 0%, rgba(56, 189, 248, 0.08) 45%, transparent 68%)',
        }}
      />
      <div
        className="absolute rounded-full blur-[110px] opacity-85"
        style={{
          width: 'min(88vw, 700px)',
          height: 'min(88vw, 700px)',
          top: '8%',
          right: '-22%',
          background:
            'radial-gradient(circle, rgba(244, 114, 182, 0.38) 0%, rgba(244, 114, 182, 0.06) 42%, transparent 65%)',
        }}
      />
      <div
        className="absolute rounded-full blur-[90px] opacity-70"
        style={{
          width: 'min(55vw, 480px)',
          height: 'min(45vh, 380px)',
          bottom: '2%',
          left: '0%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.14) 0%, transparent 58%)',
        }}
      />
      <div
        className="absolute rounded-full blur-[120px] opacity-50"
        style={{
          width: 'min(70vw, 560px)',
          height: 'min(70vw, 560px)',
          bottom: '-10%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, transparent 62%)',
        }}
      />
      <div className="absolute inset-0 hex-dots mix-blend-overlay opacity-[0.28]" />
    </div>
  )
}

