'use client';
import { useState } from 'react';
import type { Account } from '@/lib/types';
import { RAMP_HEX } from '@/lib/types';
import { IconRampPicker, PICKABLE_ICONS } from './IconRampPicker';
import { createAccount, updateAccountOpeningBalance, deleteAccount } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';

type Mode = 'add' | 'edit';

type AccountDraft = {
  name: string;
  icon: string;
  ramp: string;
  type: 'cash' | 'savings' | 'debt';
  opening_balance: number;
  goal: number;
};

const TYPE_OPTIONS: { value: 'cash' | 'savings' | 'debt'; label: string; icon: string; desc: string }[] = [
  { value: 'cash',    label: 'Dompet / Cash',  icon: 'ti-wallet',        desc: 'Uang tunai & e-wallet' },
  { value: 'savings', label: 'Tabungan',        icon: 'ti-building-bank', desc: 'Rekening & investasi' },
  { value: 'debt',    label: 'Utang / Kredit',  icon: 'ti-credit-card',   desc: 'Kartu kredit & pinjaman' },
];

const DEFAULT_DRAFT: AccountDraft = {
  name: '',
  icon: PICKABLE_ICONS[0],
  ramp: 'pink',
  type: 'cash',
  opening_balance: 0,
  goal: 0,
};

export default function AccountSheet({
  mode,
  account,
  onClose,
  onSaved,
}: {
  mode: Mode;
  account?: Account;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<AccountDraft>(
    mode === 'edit' && account
      ? {
          name: account.name,
          icon: account.icon,
          ramp: account.ramp,
          type: account.type,
          opening_balance: account.opening_balance ?? 0,
          goal: account.goal,
        }
      : DEFAULT_DRAFT
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const colors = RAMP_HEX[draft.ramp];

  async function handleSave() {
    if (!draft.name.trim()) { setError('Nama akun tidak boleh kosong'); return; }
    setSaving(true);
    setError('');
    try {
      if (mode === 'add') {
        await createAccount({
          name: draft.name.trim(),
          icon: draft.icon,
          ramp: draft.ramp,
          type: draft.type,
          opening_balance: draft.opening_balance,
          goal: draft.goal,
        });
      } else if (mode === 'edit' && account) {
        const supabase = createClient();
        await supabase.from('accounts').update({
          name: draft.name.trim(),
          icon: draft.icon,
          ramp: draft.ramp,
          type: draft.type,
          goal: draft.goal,
        }).eq('id', account.id);
        await updateAccountOpeningBalance(account.id, draft.opening_balance);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!account) return;
    if (!confirm(`Hapus akun "${account.name}"? Semua transaksinya juga akan ikut terhapus.`)) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAccount(account.id);
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus akun');
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 z-[100] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-bg rounded-t-3xl max-h-[92vh] overflow-y-auto pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-4 sticky top-0 bg-bg">
          <i className="ti ti-x text-xl text-gray-400 cursor-pointer" onClick={onClose} />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {mode === 'add' ? 'Akun baru' : 'Edit akun'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-pink-600 font-semibold text-sm px-2 py-1 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

        <div className="px-[18px]">
          {/* Preview icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: colors.bg, color: colors.fg }}
            >
              <i className={`ti ${draft.icon}`} />
            </div>
          </div>

          {/* Nama akun */}
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 mb-1.5">Nama Akun</p>
            <input
              type="text"
              placeholder="Contoh: GoPay, BCA, dll"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              maxLength={40}
              className="w-full border border-pink-100 bg-white/[0.04] text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* Tipe akun */}
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 mb-1.5">Tipe Akun</p>
            <div className="flex flex-col gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const active = draft.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDraft({ ...draft, type: opt.value })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      active
                        ? 'border-pink-400 bg-white/[0.06]'
                        : 'border-pink-100 bg-white/[0.02]'
                    }`}
                  >
                    <i
                      className={`ti ${opt.icon} text-lg`}
                      style={{ color: active ? colors.fg : '#6B7280' }}
                    />
                    <div>
                      <p className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-400'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-500">{opt.desc}</p>
                    </div>
                    {active && (
                      <i className="ti ti-check ml-auto text-pink-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon & Warna */}
          <IconRampPicker
            icon={draft.icon}
            ramp={draft.ramp}
            onIcon={(v) => setDraft({ ...draft, icon: v })}
            onRamp={(v) => setDraft({ ...draft, ramp: v })}
          />

          {/* Saldo awal */}
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 mb-1.5">Saldo Awal</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
              <input
                inputMode="numeric"
                placeholder="0"
                value={draft.opening_balance ? draft.opening_balance.toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '');
                  setDraft({ ...draft, opening_balance: parseInt(raw || '0', 10) });
                }}
                className="w-full border border-pink-100 bg-white/[0.04] text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Target (hanya savings & debt) */}
          {draft.type !== 'cash' && (
            <div className="mb-4">
              <p className="text-[11px] text-gray-400 mb-1.5">
                {draft.type === 'savings' ? 'Target Tabungan' : 'Total Utang / Limit Kredit'}
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input
                  inputMode="numeric"
                  placeholder="0"
                  value={draft.goal ? draft.goal.toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setDraft({ ...draft, goal: parseInt(raw || '0', 10) });
                  }}
                  className="w-full border border-pink-100 bg-white/[0.04] text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-coral-800 bg-coral-50 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}

          {/* Hapus akun (edit mode only) */}
          {mode === 'edit' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full mt-2 bg-coral-50 text-coral-800 border border-coral-400 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
            >
              <i className="ti ti-trash mr-1.5" />
              {deleting ? 'Menghapus...' : 'Hapus Akun'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
