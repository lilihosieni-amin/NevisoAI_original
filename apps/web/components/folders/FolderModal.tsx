'use client';

import { useRef, useState } from 'react';
import { useMutation, type ApolloError } from '@apollo/client';
import { toPersianDigits } from '@neviso/phone';
import { toPersianMessage } from '../../lib/error-map';
import { FOLDER_COLORS, DEFAULT_FOLDER_COLOR } from '../../lib/folder-colors';
import { CREATE_FOLDER, UPDATE_FOLDER } from '../../lib/graphql/folders';
import { uploadFolderCover } from '../../lib/upload';
import { ImageIcon } from '../icons';
import type { Folder } from './FolderCard';

const MAX_NAME = 40;

function persianError(e: unknown): string {
  const code = (e as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
  return code ? toPersianMessage(code) : 'آپلود کاور ناموفق بود. می‌توانی بدون کاور ادامه بدهی.';
}

/** New/edit folder modal — design template §11. */
export function FolderModal({
  folder,
  onClose,
  onSaved,
}: {
  folder?: Folder; // present → edit mode
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(folder);
  const [name, setName] = useState(folder?.name ?? '');
  const [color, setColor] = useState(folder?.color ?? DEFAULT_FOLDER_COLOR);
  const [coverPreview, setCoverPreview] = useState<string | null>(folder?.coverUrl ?? null);
  const [coverKey, setCoverKey] = useState<string | null | undefined>(undefined); // undefined = untouched
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [createFolder] = useMutation(CREATE_FOLDER);
  const [updateFolder] = useMutation(UPDATE_FOLDER);

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const prevPreview = coverPreview;
    setError(null);
    setUploading(true);
    setProgress(0);
    setCoverPreview(URL.createObjectURL(file)); // instant local preview
    try {
      const key = await uploadFolderCover(file, setProgress);
      setCoverKey(key);
    } catch (err) {
      setError(persianError(err));
      setCoverPreview(prevPreview); // revert on failure
      setCoverKey(undefined);
    } finally {
      setUploading(false);
    }
  };

  const removeCover = () => {
    setCoverKey(null);
    setCoverPreview(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setSaving(true);
    try {
      if (editing && folder) {
        await updateFolder({
          variables: {
            id: folder.id,
            input: { name: trimmed, color, ...(coverKey !== undefined ? { coverUrl: coverKey } : {}) },
          },
        });
      } else {
        await createFolder({
          variables: { input: { name: trimmed, color, ...(coverKey ? { coverUrl: coverKey } : {}) } },
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(persianError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92vh] overflow-y-auto rounded-t-[24px] sm:w-[560px] sm:max-w-[94vw] sm:rounded-[20px]"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--paper-edge)',
          boxShadow: 'var(--sh-3)',
          color: 'var(--ink)',
        }}
      >
        {/* Drag handle (mobile bottom-sheet affordance) */}
        <div
          className="sm:hidden"
          style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--paper-edge)', margin: '10px auto 0' }}
        />

        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--paper-edge)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2 style={{ font: 'var(--t-h3)', fontSize: 20, margin: '0 0 4px' }}>
              {editing ? 'ویرایش پوشه' : 'پوشهٔ جدید'}
            </h2>
            <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
              یک دفترچهٔ جدید برای دسته‌بندی جزوه‌ها بساز.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--paper-2)',
              color: 'var(--ink-2)',
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[180px_1fr] sm:gap-6 sm:p-6">
          <div className="hidden sm:block">
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>
              پیش‌نمایش
            </div>
            <NotebookPreview color={color} title={name || 'بدون عنوان'} cover={coverPreview} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="نام پوشه" required>
              <input
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً ریاضی مهندسی"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--paper)',
                  border: '1.5px solid var(--ink)',
                  borderRadius: 'var(--r-sm)',
                  font: 'var(--t-body-md)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              />
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4, textAlign: 'left' }}>
                {toPersianDigits(name.length)}/{toPersianDigits(MAX_NAME)}
              </div>
            </Field>

            <Field label="رنگ شیرازه">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setColor(c.hex)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: c.hex,
                      border: color === c.hex ? '2px solid var(--ink)' : '2px solid transparent',
                      outline: color === c.hex ? '2px solid var(--paper)' : 'none',
                      outlineOffset: -4,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </Field>

            <Field label="کاور (اختیاری)">
              {coverPreview ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'var(--paper)',
                    border: '1px solid var(--paper-edge)',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: `center / cover no-repeat url(${coverPreview}), linear-gradient(135deg, ${color}55, ${color}88)`,
                    }}
                  />
                  <div style={{ flex: 1, font: 'var(--t-small)' }}>
                    <div style={{ font: 'var(--t-body-md)', fontSize: 13 }}>کاور پوشه</div>
                    {uploading ? (
                      <div style={{ marginTop: 6 }}>
                        <div
                          style={{
                            height: 6,
                            background: 'var(--paper-2)',
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${progress}%`,
                              background: 'var(--saffron)',
                              borderRadius: 999,
                              transition: 'width 0.15s ease',
                            }}
                          />
                        </div>
                        <div style={{ color: 'var(--ink-3)', fontSize: 11, marginTop: 4 }}>
                          در حال بارگذاری… {toPersianDigits(progress)}٪
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>انتخاب شد</div>
                    )}
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeCover}
                      style={{ font: 'var(--t-xs)', color: 'var(--ruby)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      حذف
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: 14,
                    background: 'transparent',
                    border: '1.5px dashed var(--paper-edge)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--ink-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    font: 'var(--t-small)',
                    cursor: 'pointer',
                  }}
                >
                  <ImageIcon size={16} /> {uploading ? 'در حال آپلود…' : 'آپلود تصویر کاور'}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/heic"
                onChange={handlePickFile}
                style={{ display: 'none' }}
              />
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4 }}>
                اگر کاور انتخاب نکنی، رنگ شیرازه به‌عنوان پس‌زمینهٔ پوشه استفاده می‌شود.
              </div>
            </Field>

            {error && <div style={{ font: 'var(--t-small)', color: 'var(--ruby)' }}>{error}</div>}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:px-6"
          style={{
            borderTop: '1px solid var(--paper-edge)',
            background: 'var(--card-soft)',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-ghost w-full justify-center sm:w-auto">
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving || uploading}
            className="btn btn-primary w-full justify-center sm:w-auto"
            style={{ opacity: !name.trim() || saving || uploading ? 0.5 : 1 }}
          >
            {saving ? 'در حال ذخیره…' : editing ? 'ذخیره' : 'ساخت پوشه'}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 27, 31, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: 'var(--ruby)', marginInlineStart: 4 }}>*</span>}
      </div>
      {children}
    </div>
  );
}

function NotebookPreview({ color, title, cover }: { color: string; title: string; cover: string | null }) {
  const hasCover = Boolean(cover);
  return (
    <div
      style={{
        width: 160,
        height: 220,
        position: 'relative',
        margin: '0 auto',
        background: hasCover
          ? `center / cover no-repeat url(${cover})`
          : 'var(--card-soft)',
        borderRadius: '6px 16px 16px 6px',
        boxShadow: 'var(--sh-spine)',
        border: '1px solid var(--paper-edge)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 14,
          background: color,
          boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.15)',
        }}
      />
      {!hasCover && (
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
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 24,
          left: 14,
          padding: '4px 0',
          font: 'var(--t-h4)',
          fontSize: 13,
          color: hasCover ? 'white' : 'var(--ink)',
          textShadow: hasCover ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {title}
      </div>
    </div>
  );
}
