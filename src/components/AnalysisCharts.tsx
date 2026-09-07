import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingDown, TrendingUp, Layers } from 'lucide-react';
import { CategoryBreakdown, DailyFlow } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryMeta } from '../data/categories';

interface AnalysisChartsProps {
  dailyFlow: DailyFlow[];
  expenseBreakdown: CategoryBreakdown[];
  incomeBreakdown: CategoryBreakdown[];
  totalExpense: number;
  totalIncome: number;
}

export const AnalysisCharts: React.FC<AnalysisChartsProps> = ({
  dailyFlow,
  expenseBreakdown,
  incomeBreakdown,
  totalExpense,
  totalIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'expense' | 'income'>('flow');

  const formatCurrency = (val: number) =>
    `฿${Number(val).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6 mb-6">
      {/* Chart Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            กราฟวิเคราะห์ข้อมูลประจำเดือน
          </h3>
          <p className="text-xs text-stone-500">
            วิเคราะห์พฤติกรรมทางการเงิน สัดส่วนรายจ่าย และกระแสเงินสด
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs font-medium">
          <button
            id="tab-chart-flow"
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flow'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>แนวโน้มรายวัน</span>
          </button>
          <button
            id="tab-chart-expense"
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'expense'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>สัดส่วนรายจ่าย</span>
          </button>
          <button
            id="tab-chart-income"
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'income'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>สัดส่วนรายรับ</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Flow (Bar Chart) */}
      {activeTab === 'flow' && (
        <div className="pt-5">
          {dailyFlow.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
              ยังไม่มีข้อมูลบันทึกในเดือนนี้
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(v) => `วันที่ ${v}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[150px]">
                            <p className="font-semibold border-b border-stone-800 pb-1">
                              วันที่ {label}
                            </p>
                            <p className="text-emerald-400 flex justify-between">
                              <span>รายรับ:</span>
                              <strong>฿{Number(payload[0]?.value || 0).toLocaleString()}</strong>
                            </p>
                            <p className="text-rose-400 flex justify-between">
                              <span>รายจ่าย:</span>
                              <strong>฿{Number(payload[1]?.value || 0).toLocaleString()}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                    formatter={(value) => (value === 'income' ? 'รายรับ' : 'รายจ่าย')}
                  />
                  <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Expense Category Breakdown */}
      {activeTab === 'expense' && (
        <div className="pt-5">
          {expenseBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
              ไม่มีข้อมูลรายจ่ายในเดือนนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-exp-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`฿${Number(val).toLocaleString()}`, 'จำนวนเงิน']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-stone-400">รายจ่ายรวม</span>
                  <span className="text-base sm:text-lg font-bold text-stone-900">
                    ฿{totalExpense.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Category Ranking Bars */}
              <div className="lg:col-span-6 space-y-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  อันดับค่าใช้จ่ายสูงสุด
                </p>
                {expenseBreakdown.slice(0, 6).map((item) => {
                  const meta = getCategoryMeta(item.category, 'expense');
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-stone-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">
                            ฿{item.amount.toLocaleString()}
                          </span>
                          <span className="text-stone-400 font-mono text-[11px] w-11 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Income Category Breakdown */}
      {activeTab === 'income' && (
        <div className="pt-5">
          {incomeBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
              ไม่มีข้อมูลรายรับในเดือนนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`cell-inc-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`฿${Number(val).toLocaleString()}`, 'จำนวนเงิน']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-stone-400">รายรับรวม</span>
                  <span className="text-base sm:text-lg font-bold text-stone-900">
                    ฿{totalIncome.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Category Ranking Bars */}
              <div className="lg:col-span-6 space-y-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  แหล่งรายรับ
                </p>
                {incomeBreakdown.slice(0, 6).map((item) => {
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-stone-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">
                            ฿{item.amount.toLocaleString()}
                          </span>
                          <span className="text-stone-400 font-mono text-[11px] w-11 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
