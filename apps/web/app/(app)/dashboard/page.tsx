'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toPersianDigits } from '@neviso/phone';
import { DashGreeting } from '../../../components/dashboard/DashGreeting';
import { FolderCardsGrid } from '../../../components/folders/FolderCardsGrid';
import { useColumns, useFolders } from '../../../components/folders/useFolders';
import { FwdIcon } from '../../../components/icons';
import { LoadingScreen } from '../../../components/LoadingScreen';

/** Dashboard (design template §03): greeting + a 2-row preview of folders. */
export default function DashboardPage() {
  const router = useRouter();
  const { folders, loading, openCreate, openEdit, requestDelete, modalsElement } = useFolders();
  const cols = useColumns();

  // Fill exactly two rows: (cols*2 - 1) folders + the trailing new-folder card.
  const preview = folders.slice(0, cols * 2 - 1);

  if (loading && folders.length === 0) return <LoadingScreen />;

  return (
    <>
      <DashGreeting onNewNote={() => router.push('/upload')} />

      <div className="px-4 pb-10 sm:px-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h3 style={{ font: 'var(--t-h3)', fontSize: 20, margin: 0 }}>پوشه‌های من</h3>
            <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
              {toPersianDigits(folders.length)} پوشه
            </span>
          </div>
          <Link
            href="/folders"
            style={{
              font: 'var(--t-small)',
              color: 'var(--saffron-deep)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            مشاهدهٔ همه <FwdIcon size={14} />
          </Link>
        </div>

        <FolderCardsGrid
          folders={preview}
          onEdit={openEdit}
          onDelete={requestDelete}
          onCreate={openCreate}
        />

        {!loading && folders.length === 0 && (
          <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 16 }}>
            هنوز پوشه‌ای نساخته‌ای. با «پوشهٔ جدید» اولین پوشه‌ات را بساز.
          </p>
        )}
      </div>

      {modalsElement}
    </>
  );
}
