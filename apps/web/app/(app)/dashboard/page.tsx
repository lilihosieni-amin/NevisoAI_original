/**
 * Minimal dashboard landing for Step 2 (auth). The full folder dashboard is
 * built in Step 3 — this just gives a successful login somewhere to land and
 * confirms the credit badge in the header.
 */
export default function DashboardPage() {
  return (
    <main style={{ padding: '36px 32px' }}>
      <h1 style={{ font: 'var(--t-h1)', fontSize: 28, margin: '0 0 8px' }}>سلام دانشجو 👋</h1>
      <p style={{ font: 'var(--t-body)', color: 'var(--ink-3)', margin: 0 }}>
        به نِویسو خوش آمدی. پوشه‌ها و جزوه‌هایت در گام‌های بعدی اینجا ظاهر می‌شوند.
      </p>
    </main>
  );
}
