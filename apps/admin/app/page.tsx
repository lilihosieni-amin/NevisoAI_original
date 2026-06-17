/**
 * Step 1 admin shell (RTL, desktop-first). Two-step admin login + backoffice
 * features arrive in Steps 12–16.
 */
export default function AdminHome() {
  return (
    <main
      dir="rtl"
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
      <span className="chip chip-indigo">بک‌آفیس</span>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>پنل مدیریت نویسو</h1>
      <p style={{ color: 'var(--ink-3)' }}>بنیان پنل مدیریت آماده است.</p>
    </main>
  );
}
