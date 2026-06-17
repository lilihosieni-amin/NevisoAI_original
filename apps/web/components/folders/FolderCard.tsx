'use client';

import { useState } from 'react';
import { toPersianDigits } from '@neviso/phone';
import { DEFAULT_FOLDER_COLOR } from '../../lib/folder-colors';
import { NotebookIcon, PencilIcon, TrashIcon } from '../icons';

export interface Folder {
  id: string;
  name: string;
  coverUrl?: string | null;
  color?: string | null;
  noteCount: number;
}

/** Folder card — design template §03 `FolderCardCover` + hover edit/delete. */
export function FolderCard({
  folder,
  onEdit,
  onDelete,
}: {
  folder: Folder;
  onEdit: (f: Folder) => void;
  onDelete: (f: Folder) => void;
}) {
  const [hover, setHover] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const color = folder.color ?? DEFAULT_FOLDER_COLOR;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--paper-edge)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--sh-1)',
      }}
    >
      {/* Spine stripe (right) */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, background: color, zIndex: 1 }} />

      {/* Cover — color gradient placeholder shows instantly; the photo (if any)
          fades in over it once decoded, and the browser disk-caches it. */}
      <div
        style={{
          height: 'clamp(84px, 24vw, 110px)',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(140deg, ${color}22, ${color}44 60%, ${color}66)`,
        }}
      >
        {!folder.coverUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.5,
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0, transparent 18px, rgba(120,95,50,0.10) 18px, rgba(120,95,50,0.10) 19px)',
            }}
          />
        )}
        {folder.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={folder.coverUrl}
            alt=""
            decoding="async"
            loading="eager"
            onLoad={() => setCoverLoaded(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: coverLoaded ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: color,
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'var(--sh-1)',
          }}
        >
          <NotebookIcon size={18} stroke="white" />
        </div>

        {/* Hover actions */}
        {hover && (
          <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6, zIndex: 2 }}>
            <ActionButton label="ویرایش پوشه" onClick={() => onEdit(folder)}>
              <PencilIcon size={15} />
            </ActionButton>
            <ActionButton label="حذف پوشه" danger onClick={() => onDelete(folder)}>
              <TrashIcon size={15} />
            </ActionButton>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ font: 'var(--t-h4)', fontSize: 15, marginBottom: 4 }}>{folder.name}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            font: 'var(--t-xs)',
            color: 'var(--ink-3)',
          }}
        >
          <span>{toPersianDigits(folder.noteCount)} جزوه</span>
          <span className="hidden sm:inline">← باز کن</span>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.92)',
        color: danger ? 'var(--ruby)' : 'var(--ink-2)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: 'var(--sh-1)',
      }}
    >
      {children}
    </button>
  );
}
