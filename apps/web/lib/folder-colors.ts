/** Spine-color palette (design template §11) — must match the API's allowed set. */
export const FOLDER_COLORS: ReadonlyArray<{ name: string; hex: string }> = [
  { name: 'زعفرانی', hex: '#E8A53D' },
  { name: 'مریم‌گلی', hex: '#6B8B6E' },
  { name: 'نیلی', hex: '#455A8F' },
  { name: 'یاقوتی', hex: '#B0413E' },
  { name: 'بنفش', hex: '#7A5AE0' },
  { name: 'قهوه‌ای', hex: '#8B5A3C' },
  { name: 'فیروزه‌ای', hex: '#2E8A8A' },
  { name: 'دودی', hex: '#4B5563' },
];

export const DEFAULT_FOLDER_COLOR = FOLDER_COLORS[0].hex;
