export const dynamic = 'force-static';

export default function HealthPage() {
  return (
    <main
      dir="rtl"
      data-testid="admin-health"
      style={{
        fontFamily: 'var(--font)',
        background: 'var(--slate)',
        color: 'var(--paper)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'var(--saffron)', fontWeight: 600 }}>پنل مدیریت فعال است ✅</span>
    </main>
  );
}
