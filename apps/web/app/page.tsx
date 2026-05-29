export default function HomePage() {
  return (
    <main
      dir="rtl"
      style={{
        fontFamily: 'var(--font)',
        background: 'var(--paper)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
      }}
    >
      <h1 style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 36 }}>نویسو</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 15 }}>
        دستیار هوشمند جزوه‌نویسی — به‌زودی در دسترس.
      </p>
      <a href="/health" style={{ color: 'var(--saffron-deep)', fontWeight: 500 }}>
        بررسی سلامت سرویس
      </a>
    </main>
  );
}
