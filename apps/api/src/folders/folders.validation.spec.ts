import { createFolderSchema, updateFolderSchema, FOLDER_COLORS } from './folders.validation';

describe('folder input validation (Zod)', () => {
  it('accepts a valid name + palette color', () => {
    const r = createFolderSchema.safeParse({ name: 'ریاضی ۱', color: FOLDER_COLORS[0] });
    expect(r.success).toBe(true);
  });

  it('trims the name', () => {
    const r = createFolderSchema.safeParse({ name: '  فیزیک  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe('فیزیک');
  });

  it('rejects an empty name', () => {
    expect(createFolderSchema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('rejects a name longer than 40 chars', () => {
    expect(createFolderSchema.safeParse({ name: 'x'.repeat(41) }).success).toBe(false);
  });

  it('rejects a color outside the preset palette', () => {
    expect(createFolderSchema.safeParse({ name: 'x', color: '#123456' }).success).toBe(false);
  });

  it('treats coverUrl + color as optional/nullable', () => {
    expect(createFolderSchema.safeParse({ name: 'x' }).success).toBe(true);
    expect(createFolderSchema.safeParse({ name: 'x', coverUrl: null, color: null }).success).toBe(true);
  });

  it('update schema allows a partial (name omitted)', () => {
    expect(updateFolderSchema.safeParse({ color: FOLDER_COLORS[1] }).success).toBe(true);
    expect(updateFolderSchema.safeParse({ name: '' }).success).toBe(false);
  });
});
