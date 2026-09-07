import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, testConnection } from './lib/firebase';
import { 
  loadCachedTransactions, 
  saveCachedTransactions, 
  subscribeToTransactions, 
  saveTransaction, 
  removeTransaction 
} from './lib/transactionsService';
import { Transaction, MonthlyStats, CategoryBreakdown, DailyFlow } from './types';
import { THAI_MONTHS, getCategoryMeta } from './data/categories';
import { Navbar } from './components/Navbar';
import { MonthlySummaryCard } from './components/MonthlySummaryCard';
import { AnalysisCharts } from './components/AnalysisCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Current selected month & year for monthly summary and analysis
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadCachedTransactions(null);
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    // Initial connection test
    testConnection().then((connected) => {
      setFirebaseConnected(connected);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);

      if (currentUser) {
        showToast(`ยินดีต้อนรับ ${currentUser.displayName || currentUser.email}! เข้าสู่ระบบด้วย Gmail สำเร็จ`, 'success');
      }
    });

    return () => unsubscribeAuth();
  }, [showToast]);

  // Real-time Firestore sync or cached sync
  useEffect(() => {
    const userId = user ? user.uid : 'guest';

    // Subscribe to Firestore for signed in users
    if (user) {
      const unsub = subscribeToTransactions(
        userId,
        (liveTransactions) => {
          if (liveTransactions && liveTransactions.length > 0) {
            setTransactions(liveTransactions);
          } else {
            // If new user with 0 transactions in Firestore, initialize with local cached records
            const cached = loadCachedTransactions(userId);
            setTransactions(cached);
            // push cached items to Firestore
            cached.forEach((item) => {
              saveTransaction(userId, { ...item, userId });
            });
          }
        },
        (err) => {
          console.warn('Real-time sync alert:', err);
        }
      );

      return () => unsub();
    } else {
      // Guest mode
      const cached = loadCachedTransactions(null);
      setTransactions(cached);
    }
  }, [user]);

  // Save to local cache whenever transactions change
  useEffect(() => {
    const userId = user ? user.uid : 'guest';
    saveCachedTransactions(userId, transactions);
  }, [transactions, user]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const handleChangeMonth = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Filter transactions for the selected month
  const targetYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(targetYearMonth));
  }, [transactions, targetYearMonth]);

  // Calculate Monthly Statistics
  const monthlyStats: MonthlyStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        incomeCount++;
      } else {
        totalExpense += t.amount;
        expenseCount++;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    return {
      yearMonth: targetYearMonth,
      year: selectedYear,
      month: selectedMonth,
      monthNameThai: THAI_MONTHS[selectedMonth - 1],
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      incomeCount,
      expenseCount,
    };
  }, [monthTransactions, targetYearMonth, selectedYear, selectedMonth]);

  // Calculate Daily Flow for Charts
  const dailyFlow: DailyFlow[] = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dayMap = new Map<number, { income: number; expense: number }>();

    monthTransactions.forEach((t) => {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (!isNaN(dayNum)) {
        const current = dayMap.get(dayNum) || { income: 0, expense: 0 };
        if (t.type === 'income') {
          current.income += t.amount;
        } else {
          current.expense += t.amount;
        }
        dayMap.set(dayNum, current);
      }
    });

    // Generate list of active days or all days up to current/total
    const result: DailyFlow[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const entry = dayMap.get(d) || { income: 0, expense: 0 };
      // Include all days with activity or every 3rd day to avoid empty charts
      if (entry.income > 0 || entry.expense > 0 || d === 1 || d === 15 || d === daysInMonth) {
        result.push({
          day: d,
          dateStr: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          income: entry.income,
          expense: entry.expense,
          balance: entry.income - entry.expense,
        });
      }
    }
    return result;
  }, [monthTransactions, selectedYear, selectedMonth]);

  // Calculate Expense Category Breakdown
  const expenseBreakdown: CategoryBreakdown[] = useMemo(() => {
    const catMap = new Map<string, { amount: number; count: number }>();
    let totalExpense = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        const current = catMap.get(t.category) || { amount: 0, count: 0 };
        current.amount += t.amount;
        current.count += 1;
        catMap.set(t.category, current);
      }
    });

    const result: CategoryBreakdown[] = [];
    catMap.forEach((val, catName) => {
      const meta = getCategoryMeta(catName, 'expense');
      const percentage = totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0;
      result.push({
        category: catName,
        amount: val.amount,
        percentage,
        color: meta.color,
        count: val.count,
      });
    });

    // Sort descending by amount
    return result.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // Calculate Income Category Breakdown
  const incomeBreakdown: CategoryBreakdown[] = useMemo(() => {
    const catMap = new Map<string, { amount: number; count: number }>();
    let totalIncome = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        const current = catMap.get(t.category) || { amount: 0, count: 0 };
        current.amount += t.amount;
        current.count += 1;
        catMap.set(t.category, current);
      }
    });

    const result: CategoryBreakdown[] = [];
    catMap.forEach((val, catName) => {
      const meta = getCategoryMeta(catName, 'income');
      const percentage = totalIncome > 0 ? (val.amount / totalIncome) * 100 : 0;
      result.push({
        category: catName,
        amount: val.amount,
        percentage,
        color: meta.color,
        count: val.count,
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // Add or Edit Transaction
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
    existingId?: string
  ) => {
    const userId = user ? user.uid : 'guest';
    const nowIso = new Date().toISOString();

    if (existingId) {
      // Edit
      const updatedList = transactions.map((t) => {
        if (t.id === existingId) {
          return {
            ...t,
            ...data,
            updatedAt: nowIso,
          };
        }
        return t;
      });

      setTransactions(updatedList);
      const updatedItem = updatedList.find((t) => t.id === existingId);
      if (updatedItem) {
        await saveTransaction(userId, updatedItem);
      }
      showToast('แก้ไขข้อมูลรายการเรียบร้อยแล้ว');
    } else {
      // New
      const newTx: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setTransactions((prev) => [newTx, ...prev]);
      await saveTransaction(userId, newTx);
      showToast('บันทึกรายการสำเร็จ');

      // Auto-navigate to that transaction's month if different
      const [txYear, txMonth] = data.date.split('-').map(Number);
      if (txYear !== selectedYear || txMonth !== selectedMonth) {
        setSelectedYear(txYear);
        setSelectedMonth(txMonth);
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const userId = user ? user.uid : 'guest';
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await removeTransaction(userId, id);
    showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  };

  // Sign In with Google/Gmail
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Sign In Error:', err);
      showToast('การเข้าสู่ระบบถูกยกเลิกหรือมีข้อผิดพลาด', 'error');
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('ออกจากระบบแล้ว ข้อมูลจะถูกเก็บสำรองไว้ที่เครื่องนี้', 'info');
    } catch (err: unknown) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : null}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        firebaseConnected={firebaseConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Firebase & Gmail Status Banner */}
        <FirebaseStatusBanner
          user={user}
          transactionCount={transactions.length}
        />

        {/* 1. Monthly Summary & KPI Card */}
        <MonthlySummaryCard
          stats={monthlyStats}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onCurrentMonth={handleCurrentMonth}
          onChangeMonth={handleChangeMonth}
        />

        {/* 2. Analytical Graphs & Charts */}
        <AnalysisCharts
          dailyFlow={dailyFlow}
          expenseBreakdown={expenseBreakdown}
          incomeBreakdown={incomeBreakdown}
          totalExpense={monthlyStats.totalExpense}
          totalIncome={monthlyStats.totalIncome}
        />

        {/* 3. Transaction Records Table / List */}
        <TransactionList
          transactions={monthTransactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 text-center text-xs text-stone-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="/pvclogo.png"
            alt="วิทยาลัยอาชีวศึกษาแพร่"
            className="w-6 h-6 rounded-full object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="font-semibold text-stone-700">
            วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)
          </span>
        </div>
        <p>
          MoneyDB • ระบบบันทึกและจัดการรายรับรายจ่าย พร้อมสรุปผลรายเดือนและกราฟวิเคราะห์ข้อมูล
        </p>
        <p className="mt-1 text-stone-400">
          ขับเคลื่อนด้วย Firebase Firestore & Gmail Authentication
        </p>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        defaultDate={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`}
      />
    </div>
  );
}
