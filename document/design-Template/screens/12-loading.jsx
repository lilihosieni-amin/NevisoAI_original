// 12 — Loading / splash screen
// Branded loading: notebook logo, animated saffron shimmer + sparks,
// rotating reassurance messages. Desktop + mobile.

const LoadingScreen = ({ mobile }) => {
  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      background: 'var(--slate)',
      fontFamily: 'var(--font)', color: 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes lp-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes lp-spark { 0%,100% { transform: scale(1) rotate(0deg); opacity:.4 } 50% { transform: scale(1.35) rotate(15deg); opacity:1 } }
        @keyframes lp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes lp-bar { 0% { width: 8%; } 50% { width: 72%; } 100% { width: 96%; } }
        @keyframes lp-pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes lp-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: mobile ? 360 : 560, height: mobile ? 360 : 560,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,165,61,0.22), transparent 65%)',
        filter: 'blur(8px)',
      }}/>

      {/* Floating sparks */}
      <div style={{ position: 'absolute', top: mobile ? '22%' : '26%', right: mobile ? '20%' : '32%', color: 'var(--saffron)', animation: 'lp-spark 2.4s ease-in-out infinite' }}><SparkIcon size={mobile ? 18 : 26}/></div>
      <div style={{ position: 'absolute', bottom: '28%', left: mobile ? '22%' : '34%', color: 'var(--saffron-deep)', animation: 'lp-spark 3s ease-in-out infinite .6s' }}><SparkIcon size={mobile ? 14 : 20}/></div>
      <div style={{ position: 'absolute', top: '34%', left: mobile ? '26%' : '36%', color: 'var(--saffron)', animation: 'lp-spark 2.7s ease-in-out infinite 1.1s' }}><SparkIcon size={mobile ? 12 : 16}/></div>

      {/* Logo + rotating ring */}
      <div style={{ position: 'relative', marginBottom: mobile ? 28 : 40, animation: 'lp-float 4s ease-in-out infinite' }}>
        {/* rotating ring */}
        <div style={{
          position: 'absolute', inset: mobile ? -16 : -22,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'var(--saffron)',
          borderRightColor: 'rgba(232,165,61,0.3)',
          animation: 'lp-ring 1.4s linear infinite',
        }}/>
        {/* notebook tile */}
        <div style={{
          width: mobile ? 92 : 120, height: mobile ? 92 : 120,
          borderRadius: mobile ? 22 : 28,
          background: 'var(--paper)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 60px rgba(232,165,61,0.35)',
        }}>
          <NevisoLogo size={mobile ? 52 : 68}/>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ font: 'var(--t-h1)', fontSize: mobile ? 30 : 40, fontWeight: 700, marginBottom: 8, position: 'relative' }}>
        نِویسو
      </div>

      {/* Rotating status line */}
      <div style={{
        font: 'var(--t-body)', fontSize: mobile ? 14 : 16,
        color: '#C7C5BF', marginBottom: mobile ? 28 : 36,
        position: 'relative', minHeight: 24,
      }}>
        دفترچهٔ هوشمندت را آماده می‌کنیم...
      </div>

      {/* Progress bar with shimmer */}
      <div style={{
        width: mobile ? 220 : 300, height: 6,
        background: 'rgba(255,255,255,0.1)', borderRadius: 999,
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%', borderRadius: 999,
          background: 'linear-gradient(90deg, var(--saffron-deep), var(--saffron), #FFD58A)',
          backgroundSize: '200% 100%',
          animation: 'lp-bar 2.2s ease-in-out infinite, lp-shimmer 2.5s linear infinite',
        }}/>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: mobile ? 22 : 28, position: 'relative' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: 'var(--saffron)',
            animation: `lp-pulse 1.4s ease-in-out infinite ${i * 0.25}s`,
          }}/>
        ))}
      </div>

      {/* Footer hint */}
      <div style={{
        position: 'absolute', bottom: mobile ? 24 : 36,
        font: 'var(--t-small)', color: 'var(--ink-4)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <SparkSmall stroke="var(--saffron-deep)"/>
        صدای کلاس، جزوهٔ تمیز
      </div>
    </div>
  );
};

const LoadingDesktop = () => <LoadingScreen/>;
const LoadingMobile = () => <LoadingScreen mobile/>;

Object.assign(window, { LoadingScreen, LoadingDesktop, LoadingMobile });
