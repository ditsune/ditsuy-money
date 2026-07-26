'use client';
import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt } from '@/lib/types';
import type { Account } from '@/lib/types';
import AccountSheet from '@/components/AccountSheet';

export default function AkunPage() {
  const { accounts, loading, refresh } = useDashboard();
  const [sheet, setSheet] = useState<{ open: boolean; mode: 'add' | 'edit'; account?: Account }>({
    open: false, mode: 'add',
  });

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  function openAdd() { setSheet({ open: true, mode: 'add' }); }
  function openEdit(a: Account) { setSheet({ open: true, mode: 'edit', account: a }); }
  function closeSheet() { setSheet((s) => ({ ...s, open: false })); }
  function onSaved() { closeSheet(); refresh(); }

  if (loading) return <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>;

  return (
    <>
      {/* Header kekayaan bersih + tombol tambah */}
      <div className="flex items-end justify-between pt-[22px] px-[18px] pb-2.5">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Kekayaan bersih</p>
          <p className="hand text-4xl">{netWorth < 0 ? '-' : ''}{fmt(netWorth)}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 bg-white/[0.06] border border-pink-100 text-pink-400 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 mb-0.5"
        >
          <i className="ti ti-plus text-xs" />
          Tambah Akun
        </button>
      </div>

      {/* List akun */}
      {accounts.map((a) => {
        const colors = RAMP_HEX[a.ramp];
        let pct = 0, minLbl = '', maxLbl = '';
        if (a.type === 'savings') {
          pct = a.goal ? Math.min(a.balance / a.goal, 1) : 0;
          minLbl = 'Rp0,00'; maxLbl = fmt(a.goal);
        }
        if (a.type === 'debt') {
          pct = a.goal ? Math.min(Math.abs(a.balance) / a.goal, 1) : 0;
          minLbl = (a.balance < 0 ? '-' : '') + fmt(a.goal); maxLbl = 'Rp0,00';
        }

        return (
          <div key={a.id} className="mx-[18px] mb-3.5 bg-white/[0.04] border border-pink-100 rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-[30px] h-[30px] rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <i className={`ti ${a.icon}`} />
              </div>
              <p className="text-[13px] font-semibold flex-1">{a.name}</p>
              <span className="text-[13px] font-semibold">{a.balance < 0 ? '-' : ''}{fmt(a.balance)}</span>
              {/* Tombol edit akun */}
              <button
                onClick={() => openEdit(a)}
                className="text-gray-400 hover:text-pink-400 transition-colors ml-1"
              >
                <i className="ti ti-dots text-base" />
              </button>
            </div>

            {a.type !== 'cash' && (
              <>
                <div className="h-2 rounded-md bg-pink-50 overflow-hidden mb-1.5">
                  <div className="h-full rounded-md" style={{ width: `${pct * 100}%`, background: colors.fg }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{minLbl}</span>
                  <span>{Math.round(pct * 100)}%</span>
                  <span>{maxLbl}</span>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {accounts.length === 0 && (
        <div className="text-center py-16 px-8">
          <i className="ti ti-wallet text-4xl text-gray-600 mb-3 block" />
          <p className="text-sm text-gray-400 mb-1">Belum ada akun</p>
          <p className="text-xs text-gray-500">Tap "Tambah" untuk bikin akun pertama</p>
        </div>
      )}

      {/* Account Sheet */}
      {sheet.open && (
        <AccountSheet
          mode={sheet.mode}
          account={sheet.account}
          onClose={closeSheet}
          onSaved={onSaved}
        />
      )}
    </>
  );
}