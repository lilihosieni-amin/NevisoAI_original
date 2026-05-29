export default function AdminHomePage() {
  return (
    <main
      dir="rtl"
      style={{
        fontFamily: 'var(--font)',
        background: 'var(--slate)',
        color: 'var(--paper)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
      }}
    >
      <h1 style={{ fontWeight: 700, fontSize: 36 }}>پنل مدیریت نویسو</h1>
      <p style={{ color: 'var(--paper-edge)', fontSize: 15 }}>بک‌آفیس — ورود مدیران.</p>
      <a href="/login" className="btn btn-accent">
        ورود به پنل
      </a>
      <a href="/health" style={{ color: 'var(--saffron)', fontWeight: 500 }}>
        بررسی سلامت سرویس
      </a>
    </main>
  );
}
