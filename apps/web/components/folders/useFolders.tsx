'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, type ApolloError } from '@apollo/client';
import { DELETE_FOLDER, FOLDERS } from '../../lib/graphql/folders';
import { toPersianMessage } from '../../lib/error-map';
import type { Folder } from './FolderCard';
import { FolderModal } from './FolderModal';
import { ConfirmDialog } from './ConfirmDialog';

function persianError(e: unknown): string {
  const code = (e as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
  return toPersianMessage(code ?? 'NETWORK_ERROR');
}

/**
 * Shared folder state for the dashboard preview and the all-folders page: the
 * `FOLDERS` query plus create/edit/delete modal handling. `modalsElement` is the
 * modal + confirm dialog JSX — render it once per page.
 */
export function useFolders() {
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
  const requestDelete = (f: Folder) => setDeleting(f);

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

  const modalsElement = (
    <>
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

  return { folders, loading, refetch, openCreate, openEdit, requestDelete, modalsElement };
}

/** Tracks the live folder-grid column count (matches grid-cols-2 / sm:3 / lg:4). */
export function useColumns(): number {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const compute = () =>
      setCols(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2);
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  return cols;
}
