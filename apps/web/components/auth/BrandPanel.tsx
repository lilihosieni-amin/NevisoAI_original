import { SparkIcon } from '../icons';

/** Desktop-only brand/illustration panel from design template §02 (AuthDesktop). */
export function BrandPanel() {
  return (
    <div
      className="hidden lg:flex"
      style={{
        background: 'var(--slate)',
        color: 'var(--paper)',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 40,
          width: 200,
          height: 270,
          transform: 'rotate(-8deg)',
          background: 'var(--card)',
          borderRadius: '4px 16px 16px 4px',
          boxShadow: 'var(--sh-3)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, background: '#6B8B6E' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: 160,
          width: 220,
          height: 300,
          transform: 'rotate(4deg)',
          background: 'var(--card)',
          borderRadius: '4px 16px 16px 4px',
          boxShadow: 'var(--sh-3)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 14, background: 'var(--saffron)' }} />
        <div
          style={{
            padding: '20px 20px 20px 26px',
            color: 'var(--ink)',
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0, transparent 22px, rgba(120,95,50,0.12) 22px, rgba(120,95,50,0.12) 23px)',
            height: '100%',
          }}
        >
          <div className="chip chip-saffron" style={{ marginBottom: 10 }}>
            ریاضی
          </div>
          <div style={{ font: 'var(--t-h4)', fontSize: 15 }}>سری فوریه</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 200, right: 300, color: 'var(--saffron)' }}>
        <SparkIcon size={32} />
      </div>

      <blockquote style={{ position: 'relative', font: 'var(--t-h3)', lineHeight: 1.5, margin: 0, maxWidth: 380 }}>
        «از وقتی نِویسو دارم، دیگه شب امتحان دنبال جزوهٔ بقیه نمی‌گردم.»
        <div style={{ font: 'var(--t-small)', color: 'var(--saffron)', marginTop: 12, fontWeight: 600 }}>
          — مریم، دانشجوی پزشکی · ۱۴۰۳
        </div>
      </blockquote>
    </div>
  );
}
