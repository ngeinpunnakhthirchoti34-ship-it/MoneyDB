import React from 'react';
import { Database, ShieldCheck, CheckCircle2, Cloud, AlertCircle, Info, Mail } from 'lucide-react';
import { User } from 'firebase/auth';
import { PROJECT_DISPLAY_NAME, CURRENT_PROJECT_ID } from '../lib/firebase';

interface FirebaseStatusBannerProps {
  user: User | null;
  transactionCount: number;
}

export const FirebaseStatusBanner: React.FC<FirebaseStatusBannerProps> = ({
  user,
  transactionCount,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-emerald-800/40 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Firebase Project: {PROJECT_DISPLAY_NAME}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-stone-300">
              <Cloud className="w-3 h-3 text-cyan-400" />
              Firestore (default)
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 pt-1">
            ระบบจัดเก็บบันทึกรายรับรายจ่ายอัตโนมัติ
          </h3>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            {user ? (
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                เข้าสู่ระบบด้วย Gmail: <strong className="text-white">{user.email}</strong> • ซิงก์ข้อมูลลง Firebase ({PROJECT_DISPLAY_NAME}) แล้ว {transactionCount} รายการ
              </span>
            ) : (
              <span>
                กำลังทำงานในโหมดจัดเก็บข้อมูลเฉพาะบุคคล เข้าสู่ระบบด้วย Gmail เพื่อซิงก์ข้อมูลไปยังคลาวด์โปรเจกต์ <strong>{PROJECT_DISPLAY_NAME}</strong> แบบเรียลไทม์
              </span>
            )}
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl px-3.5 py-2 text-right">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
              สถานะความปลอดภัย
            </p>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Trust Rules
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
