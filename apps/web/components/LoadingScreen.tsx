import { NevisoLogo, SparkIcon, SparkSmall } from './icons';

/**
 * Branded loading splash (design template §12). Fixed full-screen overlay (covers
 * the header) on a slate background: floating sparks, the notebook logo in a paper
 * tile with a rotating ring, the wordmark, a shimmer progress bar and pulsing dots.
 * Responsive via clamp() — one component for mobile + desktop.
 */
export function LoadingScreen() {
  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--slate)',
        fontFamily: 'var(--font)',
        color: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes lp-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes lp-spark { 0%,100% { transform: scale(1) rotate(0deg); opacity:.4 } 50% { transform: scale(1.35) rotate(15deg); opacity:1 } }
        @keyframes lp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes lp-bar { 0% { width: 8%; } 50% { width: 72%; } 100% { width: 96%; } }
        @keyframes lp-pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes lp-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 'clamp(360px, 60vw, 560px)',
          height: 'clamp(360px, 60vw, 560px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,165,61,0.22), transparent 65%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Floating sparks */}
      <div style={{ position: 'absolute', top: '24%', right: '28%', color: 'var(--saffron)', animation: 'lp-spark 2.4s ease-in-out infinite' }}>
        <SparkIcon size={22} />
      </div>
      <div style={{ position: 'absolute', bottom: '28%', left: '28%', color: 'var(--saffron-deep)', animation: 'lp-spark 3s ease-in-out infinite .6s' }}>
        <SparkIcon size={16} />
      </div>
      <div style={{ position: 'absolute', top: '34%', left: '30%', color: 'var(--saffron)', animation: 'lp-spark 2.7s ease-in-out infinite 1.1s' }}>
        <SparkIcon size={14} />
      </div>

      {/* Logo + rotating ring */}
      <div style={{ position: 'relative', marginBottom: 'clamp(28px, 5vw, 40px)', animation: 'lp-float 4s ease-in-out infinite' }}>
        <div
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--saffron)',
            borderRightColor: 'rgba(232,165,61,0.3)',
            animation: 'lp-ring 1.4s linear infinite',
          }}
        />
        <div
          style={{
            width: 'clamp(92px, 16vw, 120px)',
            height: 'clamp(92px, 16vw, 120px)',
            borderRadius: 'clamp(22px, 4vw, 28px)',
            background: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 60px rgba(232,165,61,0.35)',
          }}
        >
          <NevisoLogo size={60} />
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ font: 'var(--t-h1)', fontSize: 'clamp(30px, 6vw, 40px)', fontWeight: 700, marginBottom: 8, position: 'relative' }}>
        نِویسو
      </div>

      {/* Status line */}
      <div
        style={{
          font: 'var(--t-body)',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          color: '#C7C5BF',
          marginBottom: 'clamp(28px, 5vw, 36px)',
          position: 'relative',
          minHeight: 24,
        }}
      >
        دفترچهٔ هوشمندت را آماده می‌کنیم...
      </div>

      {/* Progress bar with shimmer */}
      <div
        style={{
          width: 'clamp(220px, 40vw, 300px)',
          height: 6,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, var(--saffron-deep), var(--saffron), #FFD58A)',
            backgroundSize: '200% 100%',
            animation: 'lp-bar 2.2s ease-in-out infinite, lp-shimmer 2.5s linear infinite',
          }}
        />
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'clamp(22px, 4vw, 28px)', position: 'relative' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--saffron)',
              animation: `lp-pulse 1.4s ease-in-out infinite ${i * 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(24px, 4vw, 36px)',
          font: 'var(--t-small)',
          color: 'var(--ink-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <SparkSmall stroke="var(--saffron-deep)" />
        صدای کلاس، جزوهٔ تمیز
      </div>
    </div>
  );
}
