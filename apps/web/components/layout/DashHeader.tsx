'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { toPersianDigits } from '@neviso/phone';
import { MY_CREDITS } from '../../lib/graphql/auth';
import { NevisoLogo, SparkIcon, BellIcon } from '../icons';

/** App header from design template §03 — credit badge reads live `myCredits`. */
export function DashHeader() {
  const { data } = useQuery<{ myCredits: number }>(MY_CREDITS);
  const credits = data?.myCredits ?? 0;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--paper-edge)',
        background: 'var(--paper)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)' }}>
          <NevisoLogo size={28} />
          <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          aria-label="موجودی اعتبار"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--saffron-soft)',
            color: 'var(--saffron-deep)',
            padding: '7px 14px',
            borderRadius: 999,
            font: 'var(--t-body-md)',
            fontSize: 13,
          }}
        >
          <SparkIcon size={14} /> {toPersianDigits(credits)} اعتبار
        </div>
        <button
          type="button"
          aria-label="اعلان‌ها"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--paper-2)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--ink)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <BellIcon size={16} />
        </button>
        <Link
          href="/profile"
          aria-label="حساب کاربری"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--ink)',
            color: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            font: 'var(--t-body-md)',
            textDecoration: 'none',
          }}
        >
          ک
        </Link>
      </div>
    </header>
  );
}
