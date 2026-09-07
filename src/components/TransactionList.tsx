import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileSpreadsheet, 
  SlidersHorizontal,
  Calendar,
  X
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getCategoryMeta, ALL_CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (filterType !== 'all' && t.type !== filterType) return false;
      // Category filter
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const noteMatch = t.note?.toLowerCase().includes(term);
        const catMatch = t.category.toLowerCase().includes(term);
        const amountMatch = String(t.amount).includes(term);
        if (!noteMatch && !catMatch && !amountMatch) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'บันทึก'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyDB_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const thaiYear = y + 543;
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${d} ${monthNames[m - 1]} ${thaiYear}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6">
      {/* Header with Title and CSV export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            รายการรับ-จ่ายทั้งหมด
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {filteredTransactions.length} รายการ
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            แสดงประวัติการทำรายการและจัดการข้อมูลใน MoneyDB
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredTransactions.length > 0 && (
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
              title="ส่งออกเป็นไฟล์ CSV (Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ส่งออก CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-tx"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามบันทึก หมวดหมู่ หรือยอดเงิน..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-medium self-start md:self-auto">
            <button
              id="filter-type-all"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="filter-type-expense"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="filter-type-income"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="min-w-[160px]">
            <select
              id="select-category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-700 cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.type === 'income' ? '➕ ' : '➖ '} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-stone-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-700">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-stone-400 mt-1">
              ลองเปลี่ยนคำค้นหา หรือกดบันทึกรายการใหม่
            </p>
            <button
              id="btn-add-tx-empty-state"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <span>+ บันทึกรายการใหม่</span>
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const meta = getCategoryMeta(tx.category, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 px-2 rounded-xl transition-colors group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.bgLight, color: meta.color }}
                  >
                    <CategoryIcon iconName={meta.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {tx.category}
                      </p>
                      <span className="text-[11px] text-stone-400 font-mono hidden xs:inline">
                        {formatThaiDate(tx.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-stone-400 font-mono xs:hidden">
                        {formatThaiDate(tx.date)} •
                      </span>
                      {tx.note ? (
                        <p className="text-xs text-stone-500 truncate max-w-[200px] sm:max-w-md">
                          {tx.note}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic">ไม่มีบันทึก</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-stone-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-tx-${tx.id}`}
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขรายการ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === tx.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in">
                        <button
                          onClick={() => {
                            onDelete(tx.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                        >
                          ลบจริง
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-stone-500 hover:text-stone-700 cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-delete-tx-${tx.id}`}
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
