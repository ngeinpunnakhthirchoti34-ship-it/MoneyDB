import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Calendar, FileText, Tag, DollarSign } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, existingId?: string) => void;
  initialData?: Transaction | null;
  defaultDate?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      // Default to today or provided default
      const today = new Date().toISOString().split('T')[0];
      setDate(defaultDate || today);
      setNote('');
    }
    setError('');
  }, [initialData, defaultDate, isOpen]);

  // When type toggles, reset category to first of new type if not compatible
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const list = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setCategory(list[0].name);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category.trim()) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date.trim()) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    onSave(
      {
        type,
        amount: numAmount,
        category,
        date,
        note: note.trim() || undefined,
      },
      initialData?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-100">
          <h3 className="text-lg sm:text-xl font-bold text-stone-900">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <span className="font-semibold">ข้อผิดพลาด:</span> {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl">
            <button
              type="button"
              id="btn-select-expense"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              id="btn-select-income"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                ฿
              </span>
              <input
                id="input-tx-amount"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-900"
              />
            </div>
            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2.5 py-1 text-xs font-medium text-stone-400 hover:text-stone-600 rounded-lg transition-colors shrink-0 ml-auto cursor-pointer"
              >
                ล้างค่า
              </button>
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-stone-200/80 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 shrink-0"
                      style={{ backgroundColor: cat.bgLight, color: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              วันที่ทำรายการ *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-800"
              />
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <div className="relative">
              <textarea
                id="input-tx-note"
                rows={2}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ทานข้าวกับเพื่อน, เติมน้ำมัน, ค่าซ่อมแซม..."
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-save-transaction"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
