'use client';

/** Generic confirm prompt (used for destructive folder actions). */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'حذف',
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 27, 31, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: '92vw',
          background: 'var(--card)',
          border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-3)',
          color: 'var(--ink)',
          padding: '24px 26px',
        }}
      >
        <h3 style={{ font: 'var(--t-h3)', fontSize: 18, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 20px' }}>{message}</p>
        {error && <div style={{ font: 'var(--t-small)', color: 'var(--ruby)', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn"
            style={{ background: 'var(--ruby)', color: 'white', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'در حال حذف…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
