/** Decorative skeuomorphic notebooks for the auth brand panel (Ui_sample §02). */
export function NotebookArt() {
  return (
    <div className="nb-art" aria-hidden="true">
      <div className="nb nb-back">
        <span className="nb-spine" style={{ background: 'linear-gradient(#7da07f, #557a58)' }} />
      </div>
      <div className="nb nb-front">
        <span
          className="nb-spine"
          style={{ background: 'linear-gradient(var(--saffron), var(--saffron-deep))' }}
        />
        <span className="chip chip-saffron">ریاضی</span>
        <div style={{ marginTop: 10, fontWeight: 700, color: 'var(--ink)' }}>سری فوریه</div>
        <span className="nb-plus">+</span>
      </div>
    </div>
  );
}

/** Small line-art notebook glyph used beside the wordmark. */
export function NotebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="15" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3v18" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 8h5M11 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
