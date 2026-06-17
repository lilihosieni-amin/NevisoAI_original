'use client';

import { useEffect, useState } from 'react';
import { toJalali, toPersianDigits } from '@neviso/jalali';
import { PlusIcon } from '../icons';

const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];
// JS getDay(): 0=Sun … 6=Sat → Persian weekday name.
const FA_WEEKDAYS = ['یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];

/** Dashboard hero greeting + Jalali date + "new note" CTA (template §03). */
export function DashGreeting({ onNewNote }: { onNewNote: () => void }) {
  // Compute "today" after mount to avoid an SSR/CSR hydration mismatch.
  const [today, setToday] = useState<string>('');
  useEffect(() => {
    const now = new Date();
    const { jm, jd } = toJalali(now);
    setToday(`${FA_WEEKDAYS[now.getDay()]} · ${toPersianDigits(jd)} ${FA_MONTHS[jm - 1]}`);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px) 20px',
      }}
    >
      <div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', marginBottom: 6, minHeight: 14 }}>
          {today}
        </div>
        <h1 style={{ font: 'var(--t-h1)', fontSize: 'clamp(24px, 6vw, 32px)', margin: 0 }}>
          سلام، آماده‌ای؟
        </h1>
      </div>
      <button type="button" onClick={onNewNote} className="btn btn-accent" style={{ padding: '12px 22px' }}>
        <PlusIcon size={16} /> جزوهٔ جدید
      </button>
    </div>
  );
}
