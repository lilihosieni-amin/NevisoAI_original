/**
 * Step 1 placeholder dashboard shell (RTL). Real dashboard arrives in Step 3+.
 * Confirms the foundation renders: RTL layout, Vazirmatn, design tokens.
 */
export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="paper-texture"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--s-4)',
        padding: 'var(--s-6)',
        textAlign: 'center',
      }}
    >
      <span className="chip chip-saffron">نویسو</span>
      <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--ink)' }}>
        پلتفرم هوشمند جزوه‌نویسی
      </h1>
      <p style={{ color: 'var(--ink-3)', maxWidth: '32rem' }}>
        بنیان پروژه آماده است. صفحه‌های کاربری در گام‌های بعدی ساخته می‌شوند.
      </p>
    </main>
  );
}
