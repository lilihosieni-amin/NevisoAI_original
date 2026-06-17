'use client';

import { FolderCard, type Folder } from './FolderCard';
import { NewFolderCard } from './NewFolderCard';

/** Presentational responsive folder grid + trailing "new folder" card. */
export function FolderCardsGrid({
  folders,
  onEdit,
  onDelete,
  onCreate,
  className = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4',
}: {
  folders: Folder[];
  onEdit: (f: Folder) => void;
  onDelete: (f: Folder) => void;
  onCreate: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {folders.map((f) => (
        <FolderCard key={f.id} folder={f} onEdit={onEdit} onDelete={onDelete} />
      ))}
      <NewFolderCard onClick={onCreate} />
    </div>
  );
}
