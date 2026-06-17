'use client';

/** Dashed "new folder" tile (design template §03 `NewFolderCard`). */
export function NewFolderCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        borderRadius: 'var(--r-md)',
        border: '2px dashed var(--paper-edge)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--ink-3)',
        minHeight: 184,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--paper-2)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 22,
        }}
      >
        ＋
      </span>
      <span style={{ font: 'var(--t-body-md)' }}>پوشهٔ جدید</span>
    </button>
  );
}
