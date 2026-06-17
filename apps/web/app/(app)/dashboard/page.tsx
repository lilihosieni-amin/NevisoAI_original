'use client';

import { useState } from 'react';
import { useMutation, useQuery, type ApolloError } from '@apollo/client';
import { toPersianDigits } from '@neviso/phone';
import { DELETE_FOLDER, FOLDERS } from '../../../lib/graphql/folders';
import { toPersianMessage } from '../../../lib/error-map';
import { DashGreeting } from '../../../components/dashboard/DashGreeting';
import { FolderCard, type Folder } from '../../../components/folders/FolderCard';
import { NewFolderCard } from '../../../components/folders/NewFolderCard';
import { FolderModal } from '../../../components/folders/FolderModal';
import { ConfirmDialog } from '../../../components/folders/ConfirmDialog';

function persianError(e: unknown): string {
  const code = (e as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
  return toPersianMessage(code ?? 'NETWORK_ERROR');
}

/** Folder dashboard (design template §03 — folder grid). */
export default function DashboardPage() {
  const { data, loading, refetch } = useQuery<{ folders: Folder[] }>(FOLDERS, {
    fetchPolicy: 'cache-and-network',
  });
  const folders = data?.folders ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Folder | undefined>(undefined);
  const [deleting, setDeleting] = useState<Folder | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deleteFolder, { loading: deletingLoading }] = useMutation(DELETE_FOLDER);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };
  const openEdit = (f: Folder) => {
    setEditing(f);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await deleteFolder({ variables: { id: deleting.id } });
      setDeleting(null);
      await refetch();
    } catch (e) {
      setDeleteError(persianError(e));
    }
  };

  return (
    <>
      <DashGreeting onNewFolder={openCreate} />

      <div className="px-4 pb-10 sm:px-8">
        <SectionHead label="پوشه‌های من" sub={`${toPersianDigits(folders.length)} پوشه`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {folders.map((f) => (
            <FolderCard key={f.id} folder={f} onEdit={openEdit} onDelete={(x) => setDeleting(x)} />
          ))}
          <NewFolderCard onClick={openCreate} />
        </div>
        {!loading && folders.length === 0 && (
          <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 16 }}>
            هنوز پوشه‌ای نساخته‌ای. با «پوشهٔ جدید» اولین پوشه‌ات را بساز.
          </p>
        )}
      </div>

      {modalOpen && (
        <FolderModal folder={editing} onClose={() => setModalOpen(false)} onSaved={() => refetch()} />
      )}

      {deleting && (
        <ConfirmDialog
          title="حذف پوشه"
          message={`آیا از حذف پوشهٔ «${deleting.name}» مطمئنی؟ این کار قابل بازگشت نیست.`}
          loading={deletingLoading}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleting(null);
            setDeleteError(null);
          }}
        />
      )}
    </>
  );
}

function SectionHead({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h3 style={{ font: 'var(--t-h3)', fontSize: 20, margin: 0 }}>{label}</h3>
        {sub && <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>{sub}</span>}
      </div>
    </div>
  );
}
