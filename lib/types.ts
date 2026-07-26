export type Category = {
  id: string;
  name: string;
  icon: string;
  ramp: string;
  type: 'exp' | 'inc' | 'both';
};

export type Account = {
  id: string;
  name: string;
  icon: string;
  ramp: string;
  type: 'cash' | 'savings' | 'debt';
  goal: number;
  balance: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: 'exp' | 'inc';
  category_id: string;
  account_id: string;
  tx_date: string;
  note: string;
};

export const RAMP: Record<string, [string, string]> = {
  pink: ['bg-pink-50', 'text-pink-400'],
  coral: ['bg-coral-50', 'text-coral-400'],
  green: ['bg-green-50', 'text-green-400'],
  blue: ['bg-blue-50', 'text-blue-400'],
  amber: ['bg-amber-50', 'text-amber-400'],
  purple: ['bg-purple-50', 'text-purple-400'],
  teal: ['bg-teal-50', 'text-teal-400'],
};

// Hex-based colors — dark-theme glass style: translucent tinted background + bright saturated icon color.
export const RAMP_HEX: Record<string, { bg: string; fg: string }> = {
  pink:   { bg: 'rgba(255, 138, 196, 0.12)', fg: '#ff8ac4' },
  coral:  { bg: 'rgba(255, 138, 101, 0.12)', fg: '#ff8a65' },
  green:  { bg: 'rgba(81, 207, 102, 0.12)',  fg: '#51cf66' },
  blue:   { bg: 'rgba(106, 169, 255, 0.12)', fg: '#6aa9ff' },
  amber:  { bg: 'rgba(255, 169, 77, 0.12)',  fg: '#ffa94d' },
  purple: { bg: 'rgba(151, 117, 250, 0.12)', fg: '#9775fa' },
  teal:   { bg: 'rgba(56, 217, 169, 0.12)',  fg: '#38d9a9' },
};

export function fmt(n: number): string {
  return 'Rp' + Math.round(Math.abs(n)).toLocaleString('id-ID');
}

export const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
export const DAYNAMES = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];