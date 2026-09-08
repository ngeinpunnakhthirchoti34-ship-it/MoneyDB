import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  School, 
  GraduationCap, 
  LogIn, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onSelectQuickUser: (user: AppUser) => void;
  authError: { title: string; detail: string; isIframeIssue: boolean } | null;
  isLoading: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onSelectQuickUser,
  authError,
  isLoading,
}) => {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | 'user'>('user');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isVercelOrCustom = currentHostname && (currentHostname.includes('vercel.app') || !currentHostname.includes('localhost'));

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  if (!isOpen) return null;

  // Preset quick accounts
  const quickAccounts: AppUser[] = [
    {
      uid: 'user_admin_ngeinpun',
      email: 'ngeinpunnakhthirchoti34@gmail.com',
      displayName: 'คุณเงินปัญญ์ - ผู้ดูแลระบบ',
      role: 'admin',
      provider: 'google',
    },
    {
      uid: 'user_teacher_pvc',
      email: 'teacher@pvc.ac.th',
      displayName: 'อาจารย์การเงิน วอศ.แพร่',
      role: 'teacher',
      provider: 'college',
    },
    {
      uid: 'user_student_pvc',
      email: 'student@pvc.ac.th',
      displayName: 'แผนกวิชาการบัญชี/คอมพิวเตอร์ วอศ.แพร่',
      role: 'student',
      provider: 'college',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const name = customName.trim() || customEmail.split('@')[0];
    const newUser: AppUser = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: customEmail.trim(),
      displayName: name,
      role: selectedRole,
      provider: 'custom',
    };

    onSelectQuickUser(newUser);
    onClose();
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <img
              src="/pvclogo.png"
              alt="ตราสัญลักษณ์วิทยาลัยอาชีวศึกษาแพร่"
              className="w-11 h-11 rounded-full object-contain p-0.5 bg-white border border-stone-200 shadow-2xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
                <span>เข้าสู่ระบบ MoneyDB</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-medium border border-blue-200/60">
                  วอศ. แพร่
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                วิทยาลัยอาชีวศึกษาแพร่ • เลือกวิธีเข้าสู่ระบบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Domain & Vercel Helper Card */}
          {currentHostname && (
            <div className="p-3.5 rounded-2xl bg-emerald-950 text-white border border-emerald-800/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>โดเมนเว็บไซต์ปัจจุบัน:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-100" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>คัดลอกโดเมน</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-900/90 rounded-xl p-2 px-3 text-xs font-mono text-emerald-200 break-all select-all flex items-center justify-between border border-emerald-900/80">
                <span>{currentHostname}</span>
              </div>

              <div className="text-[11px] text-stone-300 space-y-1 pt-1 border-t border-emerald-900/70">
                <p className="font-semibold text-emerald-300">💡 วิธีทำให้ Google Login บน Vercel ใช้งานได้ถาวร (ในแท็บ Firebase Console ที่เปิดอยู่):</p>
                <ol className="list-decimal list-inside text-stone-300 space-y-0.5 leading-relaxed">
                  <li>ไปที่แท็บ Firebase Console แล้วคลิกเมนู <strong>Authentication</strong> ด้านซ้าย</li>
                  <li>คลิกแท็บ <strong>Settings</strong> ด้านบน แล้วเลือก <strong>Authorized domains</strong></li>
                  <li>กด <strong>Add domain</strong> วาง <span className="font-mono text-emerald-300">{currentHostname}</span> แล้วกดบันทึก</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => onSelectQuickUser(quickAccounts[0])}
                className="w-full mt-1.5 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบบนเว็บนี้ทันที (คุณเงินปัญญ์ - ผู้ดูแลระบบ)</span>
              </button>
            </div>
          )}

          {/* Error / Iframe Notice (if triggered) */}
          {authError && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-950 text-sm">
                    {authError.title}
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    {authError.detail}
                  </p>
                  {authError.isIframeIssue && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิดแอปในหน้าต่างใหม่ (แท็บใหม่)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Method 1: Google Account Sign-In */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                วิธีที่ 1: บัญชี Google / Gmail (Firebase Auth)
              </label>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200/50">
                รองรับบัญชี Google จริง
              </span>
            </div>
            
            <button
              id="btn-modal-google-signin"
              disabled={isLoading}
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200/90 hover:border-emerald-500/60 text-stone-800 font-semibold text-sm shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span>กำลังเชื่อมต่อบัญชี Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.01-3.12z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.61l4.01 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google / Gmail</span>
                </>
              )}
            </button>

            {/* Iframe tip with Open in new tab button */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[11px] text-stone-600 gap-2">
              <span className="leading-tight">
                หากเบราว์เซอร์บล็อกหน้าต่าง Pop-up หรือติดข้อจำกัดของเฟรม Iframe ในหน้าจอพรีวิว
              </span>
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 rounded-lg border border-stone-200 font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-emerald-600" />
                <span>เปิดแอปในหน้าต่างใหม่ (แท็บใหม่)</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-stone-400 font-medium">
                หรือ
              </span>
            </div>
          </div>

          {/* Method 2: Preset One-Click Profiles */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              วิธีที่ 2: เข้าสู่ระบบด่วน 1-คลิก (Quick Access)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickAccounts.map((account) => (
                <button
                  key={account.uid}
                  type="button"
                  onClick={() => {
                    onSelectQuickUser(account);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      account.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : account.role === 'teacher'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {account.role === 'admin' ? (
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                      ) : account.role === 'teacher' ? (
                        <School className="w-5 h-5 text-blue-600" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors">
                        {account.displayName}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {account.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-white group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-xl border border-stone-200 group-hover:border-emerald-600 transition-all shadow-2xs">
                    <span>เลือก</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Method 3: Custom Name / Email Form */}
          <div className="pt-2 border-t border-stone-100">
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  วิธีที่ 3: บัญชีเฉพาะบุคคล (Custom Profile)
                </label>
              </div>
              <p className="text-[11px] text-stone-500">
                สามารถกรอกชื่อและอีเมลของคุณเอง เพื่อกดเข้าใช้งานระบบได้ทันที
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล ของคุณ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="อีเมล (เช่น user@gmail.com)"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">บทบาท:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="text-xs px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-700"
                  >
                    <option value="user">บุคคลทั่วไป</option>
                    <option value="teacher">ครู / บุคลากร</option>
                    <option value="student">นักเรียน / นักศึกษา</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!customEmail.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบทันที</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ระบบเก็บข้อมูลปลอดภัย แยกตามผู้ใช้งาน</span>
          </div>
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
          >
            <span>เปิดหน้าต่างใหม่</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
