'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toPersianDigits } from '@neviso/phone';
import { FolderCardsGrid } from '../../../components/folders/FolderCardsGrid';
import { useFolders } from '../../../components/folders/useFolders';
import { ChevDown, FilterIcon, PlusIcon, SearchIcon } from '../../../components/icons';
import { LoadingScreen } from '../../../components/LoadingScreen';

type Sort = 'recent' | 'name';
const SORT_LABEL: Record<Sort, string> = { recent: 'آخرین بروزرسانی', name: 'نام' };

/** All-folders library (design template §13): search + sort + full grid. */
export default function AllFoldersPage() {
  const { folders, loading, openCreate, openEdit, requestDelete, modalsElement } = useFolders();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [sortOpen, setSortOpen] = useState(false);

  const totalNotes = folders.reduce((sum, f) => sum + f.noteCount, 0);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? folders.filter((f) => f.name.toLowerCase().includes(q)) : folders;
    // `recent` keeps the server order (updatedAt desc); `name` sorts A–Z (fa).
    return sort === 'name'
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'fa'))
      : filtered;
  }, [folders, query, sort]);

  if (loading && folders.length === 0) return <LoadingScreen />;

  return (
    <>
      {/* Breadcrumb + title */}
      <div className="px-4 pt-6 sm:px-8">
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginBottom: 12 }}>
          <Link href="/dashboard" style={{ color: 'var(--ink-3)' }}>
            داشبورد
          </Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--ink)' }}>همهٔ پوشه‌ها</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ font: 'var(--t-h1)', fontSize: 'clamp(24px, 6vw, 32px)', margin: 0 }}>همهٔ پوشه‌ها</h1>
            <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 4 }}>
              {toPersianDigits(folders.length)} پوشه · {toPersianDigits(totalNotes)} جزوه
            </div>
          </div>
          <button type="button" onClick={openCreate} className="btn btn-accent" style={{ padding: '12px 22px' }}>
            <PlusIcon size={16} /> پوشهٔ جدید
          </button>
        </div>
      </div>

      {/* Toolbar: search + filter + sort */}
      <div className="flex flex-wrap items-center gap-3 px-4 pb-2 pt-4 sm:px-8">
        <div
          className="min-w-[180px] flex-1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 14px',
            background: 'var(--card)',
            border: '1px solid var(--paper-edge)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <SearchIcon size={16} stroke="var(--ink-3)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی پوشه..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              font: 'var(--t-body)',
              color: 'var(--ink)',
            }}
          />
        </div>

        {/* Filter — visual for now (no folder term/tag metadata yet) */}
        <button type="button" className="btn btn-outline hidden sm:inline-flex" style={{ padding: '10px 16px' }} disabled>
          <FilterIcon size={15} /> فیلتر
        </button>

        {/* Sort dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              background: 'var(--card)',
              border: '1px solid var(--paper-edge)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--ink)',
              font: 'var(--t-small)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>ترتیب:</span> {SORT_LABEL[sort]}
            <ChevDown size={13} />
          </button>
          {sortOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setSortOpen(false)} />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  insetInlineStart: 0,
                  zIndex: 21,
                  minWidth: 170,
                  background: 'var(--card)',
                  border: '1px solid var(--paper-edge)',
                  borderRadius: 'var(--r-sm)',
                  boxShadow: 'var(--sh-2)',
                  overflow: 'hidden',
                }}
              >
                {(['recent', 'name'] as Sort[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'right',
                      padding: '10px 14px',
                      background: sort === s ? 'var(--paper-2)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      font: 'var(--t-small)',
                      color: 'var(--ink)',
                    }}
                  >
                    {SORT_LABEL[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-10 sm:px-8">
        <FolderCardsGrid
          folders={shown}
          onEdit={openEdit}
          onDelete={requestDelete}
          onCreate={openCreate}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        />
        {!loading && folders.length > 0 && shown.length === 0 && (
          <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 16 }}>
            پوشه‌ای با این نام پیدا نشد.
          </p>
        )}
      </div>

      {modalsElement}
    </>
  );
}
