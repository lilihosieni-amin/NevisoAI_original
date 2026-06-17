import Link from 'next/link';

export const metadata = {
  title: 'بارگذاری جزوه | نویسو',
};

/**
 * Placeholder for the note-upload flow (Step 4). The dashboard "جزوهٔ جدید"
 * button routes here; this is replaced by the real upload page in Step 4.
 */
export default function UploadPage() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--s-4)',
        padding: 'var(--s-6)',
        textAlign: 'center',
      }}
    >
      <span className="chip chip-saffron">به‌زودی</span>
      <h1 style={{ font: 'var(--t-h1)', fontSize: 'clamp(22px, 5vw, 28px)', margin: 0 }}>
        بارگذاری جزوه
      </h1>
      <p style={{ font: 'var(--t-body)', color: 'var(--ink-3)', maxWidth: '32rem', margin: 0 }}>
        ساخت جزوه از صدا و تصویر در گام بعد اضافه می‌شود. فعلاً می‌توانی پوشه‌هایت را بسازی و مرتب کنی.
      </p>
      <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--s-2)' }}>
        بازگشت به داشبورد
      </Link>
    </main>
  );
}
