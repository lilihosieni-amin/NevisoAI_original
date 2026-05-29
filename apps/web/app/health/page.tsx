export const dynamic = 'force-static';

export default function HealthPage() {
  return (
    <main
      dir="rtl"
      data-testid="web-health"
      style={{
        fontFamily: 'var(--font)',
        background: 'var(--paper)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="chip" style={{ color: 'var(--sage)', fontWeight: 600 }}>
        سرویس وب فعال است ✅
      </span>
    </main>
  );
}
