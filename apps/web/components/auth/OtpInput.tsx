'use client';

import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { toAsciiDigits, toPersianDigits } from '@neviso/phone';

const LENGTH = 6; // 6-digit code (ARD §7.2)

/**
 * Six-box OTP entry matching design template §02 (boxes filled in saffron,
 * empty in white). Value is the bare ASCII digit string; digits render in
 * Persian. Auto-advances, supports backspace + paste, fires onComplete at 6.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, raw: string) => {
    const digit = toAsciiDigits(raw).replace(/\D/g, '').slice(-1);
    const chars = value.padEnd(LENGTH, ' ').split('');
    chars[index] = digit || ' ';
    const next = chars.join('').replace(/\s/g, '');
    onChange(next);
    if (digit && index < LENGTH - 1) refs.current[index + 1]?.focus();
    if (next.length === LENGTH) onComplete?.(next);
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    setDigit(index, e.target.value);
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = toAsciiDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === LENGTH) onComplete?.(pasted);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', direction: 'ltr' }}>
      {Array.from({ length: LENGTH }).map((_, i) => {
        const char = value[i];
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={char ? toPersianDigits(char) : ''}
            onChange={handleChange(i)}
            onKeyDown={handleKeyDown(i)}
            onPaste={handlePaste}
            aria-label={`رقم ${toPersianDigits(i + 1)}`}
            style={{
              width: 52,
              height: 64,
              textAlign: 'center',
              borderRadius: 'var(--r-md)',
              background: char ? 'var(--saffron-soft)' : 'var(--card)',
              border: char ? '1.5px solid var(--saffron)' : '1.5px solid var(--ink)',
              font: 'var(--t-h2)',
              fontSize: 28,
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
        );
      })}
    </div>
  );
}
