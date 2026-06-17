import { z } from 'zod';

/**
 * Spine-color palette (design template §11). A folder's `color` must be one of
 * these hex values; the UI offers exactly this set.
 */
export const FOLDER_COLORS = [
  '#E8A53D', // زعفرانی
  '#6B8B6E', // مریم‌گلی
  '#455A8F', // نیلی
  '#B0413E', // یاقوتی
  '#7A5AE0', // بنفش
  '#8B5A3C', // قهوه‌ای
  '#2E8A8A', // فیروزه‌ای
  '#4B5563', // دودی
] as const;

export const FOLDER_NAME_MAX = 40;

const name = z.string().trim().min(1).max(FOLDER_NAME_MAX);
const color = z.enum(FOLDER_COLORS).nullish();
const coverUrl = z.string().trim().min(1).nullish();

export const createFolderSchema = z.object({ name, color, coverUrl });
export const updateFolderSchema = z.object({
  name: name.optional(),
  color,
  coverUrl,
});

export type CreateFolderParsed = z.infer<typeof createFolderSchema>;
export type UpdateFolderParsed = z.infer<typeof updateFolderSchema>;
