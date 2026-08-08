import { describe, it, expect } from 'vitest';
import { fmt } from './types';

describe('fmt', () => {
  it('format angka positif ke Rupiah', () => {
    expect(fmt(15000)).toBe('Rp15.000');
  });

  it('nilai negatif tetep diformat sebagai angka absolut (tanda minus urusan caller)', () => {
    expect(fmt(-15000)).toBe('Rp15.000');
  });

  it('nol tetep kebaca bener', () => {
    expect(fmt(0)).toBe('Rp0');
  });

  it('bulatin desimal (transaksi selalu integer rupiah)', () => {
    expect(fmt(1500.7)).toBe('Rp1.501');
  });
});
