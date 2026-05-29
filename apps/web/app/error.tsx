'use client';

import { useEffect } from 'react';

/**
 * Root error boundary (ARD §16.2): full-page Persian fallback. Never renders
 * the raw error message to the user; logs it for diagnostics only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error);
  }, [error]);

  return (
    <div
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
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: 'var(--ink)', fontWeight: 700 }}>خطایی رخ داد</h2>
      <p style={{ color: 'var(--ink-3)' }}>متأسفیم؛ مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</p>
      <button
        type="button"
        onClick={reset}
        style={{
          background: 'var(--saffron)',
          color: 'var(--ink)',
          border: 'none',
          borderRadius: 14,
          padding: '10px 18px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        تلاش دوباره
      </button>
    </div>
  );
}
