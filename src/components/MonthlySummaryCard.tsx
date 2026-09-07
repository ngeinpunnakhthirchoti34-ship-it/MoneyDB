import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Calendar,
  RotateCcw
} from 'lucide-react';
import { THAI_MONTHS } from '../data/categories';
import { MonthlyStats } from '../types';

interface MonthlySummaryCardProps {
  stats: MonthlyStats;
  selectedYear: number;
  selectedMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onChangeMonth: (year: number, month: number) => void;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  stats,
  selectedYear,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onChangeMonth,
}) => {
  const isCurrentMonth = () => {
    const now = new Date();
    return now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;
  };

  const thaiBuddhistYear = selectedYear + 543;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6 mb-6">
      {/* Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {THAI_MONTHS[selectedMonth - 1]} {thaiBuddhistYear}
              </h2>
              <span className="text-xs text-stone-400 font-mono">
                ({selectedYear}-{String(selectedMonth).padStart(2, '0')})
              </span>
            </div>
            <p className="text-xs text-stone-500">
              สรุปภาพรวมรายรับรายจ่ายประจำเดือน
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {!isCurrentMonth() && (
            <button
              id="btn-current-month"
              onClick={onCurrentMonth}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer mr-1"
              title="กลับไปเดือนปัจจุบัน"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เดือนนี้</span>
            </button>
          )}

          <button
            id="btn-prev-month"
            onClick={onPrevMonth}
            aria-label="เดือนก่อนหน้า"
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            id="btn-next-month"
            onClick={onNextMonth}
            aria-label="เดือนถัดไป"
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        {/* Total Income */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/80 transition-all">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              รายรับรวม
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-emerald-600">฿</span>
            <span className="text-2xl font-bold text-emerald-950 tracking-tight">
              {stats.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            {stats.incomeCount} รายการรับในเดือนนี้
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-100/80 transition-all">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              รายจ่ายรวม
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-rose-600">฿</span>
            <span className="text-2xl font-bold text-rose-950 tracking-tight">
              {stats.totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">
            {stats.expenseCount} รายการจ่ายในเดือนนี้
          </p>
        </div>

        {/* Net Balance */}
        <div className={`rounded-xl p-4 border transition-all ${
          stats.netBalance >= 0 
            ? 'bg-blue-50/60 border-blue-100/80' 
            : 'bg-amber-50/60 border-amber-100/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              stats.netBalance >= 0 ? 'text-blue-700' : 'text-amber-700'
            }`}>
              คงเหลือสุทธิ
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              stats.netBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xs font-semibold ${
              stats.netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {stats.netBalance < 0 ? '-฿' : '฿'}
            </span>
            <span className={`text-2xl font-bold tracking-tight ${
              stats.netBalance >= 0 ? 'text-blue-950' : 'text-amber-950'
            }`}>
              {Math.abs(stats.netBalance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${
            stats.netBalance >= 0 ? 'text-blue-700/80' : 'text-amber-700/80'
          }`}>
            {stats.netBalance >= 0 ? 'สถานะการเงินเป็นบวก' : 'รายจ่ายมากกว่ารายรับ'}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100/80 transition-all">
          <div className="flex items-center justify-between text-purple-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              อัตราการออม
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-950 tracking-tight">
              {stats.savingsRate.toFixed(1)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-purple-200/50 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(stats.savingsRate, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
