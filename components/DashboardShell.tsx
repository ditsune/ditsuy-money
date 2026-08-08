'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getCategories, getAccounts, getTransactions } from '@/lib/queries';
import { monthRange } from '@/lib/date';
import { createClient } from '@/lib/supabase/client';
import type { Category, Account, Transaction } from '@/lib/types';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import TransactionSheet from './TransactionSheet';

type DashboardContextType = {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  monthDate: Date;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  openEdit: (tx: Transaction) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardShell');
  return ctx;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState<Date>(new Date());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Race/skew antar-instance client udah dibenerin (singleton di lib/supabase/client.ts),
  // tapi kalau error JWT/token TETEP kejadian (token beneran expired/invalid, bukan cuma
  // race), retry pake token yang sama persis bakal gagal lagi terus — makanya sebelumnya
  // user harus hard-refresh biar dapet token baru dari middleware. Sekarang loadData
  // otomatis coba refresh session dulu sebelum retry; kalau itu juga gagal, baru paksa
  // re-login bersih (bukan cuma nampilin error selamanya).
  const retryingAfterRefresh = useRef(false);

  function isAuthError(e: any): boolean {
    const msg = (e?.message || '').toLowerCase();
    return msg.includes('jwt') || msg.includes('token') || e?.status === 401 || e?.code === 'PGRST301';
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = monthRange(monthDate);
      const [cats, accs, txs] = await Promise.all([
        getCategories(),
        getAccounts(),
        getTransactions(start, end),
      ]);
      setCategories(cats);
      setAccounts(accs);
      setTransactions(txs);
      retryingAfterRefresh.current = false;
    } catch (e: any) {
      console.error('Error loading data:', e);

      if (isAuthError(e) && !retryingAfterRefresh.current) {
        retryingAfterRefresh.current = true;
        const supabase = createClient();
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && data.session) {
          loadData();
          return;
        }
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      setError(e?.message || 'Gagal memuat data. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [monthDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setSheetOpen(true);
  }

  function openAdd() {
    setEditingTx(null);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTx(null);
  }

  function saved() {
    closeSheet();
    loadData();
  }

  function prevMonth() {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <DashboardContext.Provider
      value={{
        categories,
        accounts,
        transactions,
        monthDate,
        loading,
        error,
        refresh: loadData,
        openEdit,
      }}
    >
      <TopBar monthDate={monthDate} onPrev={prevMonth} onNext={nextMonth} />

      {error && (
        <div className="mx-[18px] mb-3.5 bg-coral-50 border border-coral-400 text-coral-800 text-xs rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={loadData} className="font-semibold underline shrink-0">Coba lagi</button>
        </div>
      )}

      {children}

      <BottomNav onAdd={openAdd} />

      {sheetOpen && (
        <TransactionSheet
          categories={categories}
          accounts={accounts}
          initial={
            editingTx
              ? {
                  id: editingTx.id,
                  amount: editingTx.amount,
                  type: editingTx.type,
                  category_id: editingTx.category_id,
                  account_id: editingTx.account_id,
                  tx_date: editingTx.tx_date,
                  note: editingTx.note,
                }
              : {
                  amount: 0,
                  type: 'exp',
                  category_id: null,
                  account_id: accounts[0]?.id || '',
                  tx_date: new Date().toISOString().split('T')[0],
                  note: '',
                }
          }
          onClose={closeSheet}
          onSaved={saved}
        />
      )}
    </DashboardContext.Provider>
  );
}
