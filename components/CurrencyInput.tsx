'use client';
import { useRef, useLayoutEffect } from 'react';

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className,
  autoFocus,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  const formatted = value ? value.toLocaleString('id-ID') : '';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || pendingCursor.current === null) return;
    el.setSelectionRange(pendingCursor.current, pendingCursor.current);
    pendingCursor.current = null;
  }, [formatted]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const cursorBefore = el.selectionStart ?? el.value.length;
    const digitsBeforeCursor = el.value.slice(0, cursorBefore).replace(/[^\d]/g, '').length;

    const raw = el.value.replace(/[^\d]/g, '');
    const num = parseInt(raw || '0', 10);
    const newFormatted = num ? num.toLocaleString('id-ID') : '';

    let digitsSeen = 0;
    let newPos = newFormatted.length;
    if (digitsBeforeCursor === 0) {
      newPos = 0;
    } else {
      for (let i = 0; i < newFormatted.length; i++) {
        if (/\d/.test(newFormatted[i])) digitsSeen++;
        if (digitsSeen === digitsBeforeCursor) { newPos = i + 1; break; }
      }
    }
    pendingCursor.current = newPos;

    onChange(num);
  }

  return (
    <input
      ref={ref}
      inputMode="numeric"
      placeholder={placeholder}
      value={formatted}
      onChange={handleChange}
      autoFocus={autoFocus}
      className={className}
    />
  );
}
