import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  LogOut, 
  User as UserIcon, 
  Database, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CURRENT_PROJECT_ID } from '../lib/firebase';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAddModal: () => void;
  firebaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  onSignIn,
  onSignOut,
  onOpenAddModal,
  firebaseConnected,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src="/pvclogo.png"
                alt="ตราสัญลักษณ์วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-contain p-0.5 bg-white border border-stone-200/80 shadow-xs hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-stone-900">
                  MoneyDB
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/70">
                  วอศ. แพร่
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Database className="w-3 h-3 text-emerald-600" />
                  {CURRENT_PROJECT_ID}
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                วิทยาลัยอาชีวศึกษาแพร่ • ระบบจัดการรายรับรายจ่าย
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add Transaction Button */}
            <button
              id="btn-add-transaction-nav"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-xs transition-colors active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">บันทึกรายการ</span>
            </button>

            {/* User Auth Section */}
            {loadingAuth ? (
              <div className="h-10 w-28 bg-stone-100 animate-pulse rounded-xl" />
            ) : user ? (
              /* Signed in with Gmail/Google */
              <div className="relative">
                <button
                  id="btn-profile-toggle"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Account'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-emerald-500/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-stone-800 leading-tight truncate max-w-[120px]">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-2.5 h-2.5" /> Gmail Synced
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="pb-3 mb-2 border-b border-stone-100 px-2">
                      <p className="text-xs font-medium text-stone-400">เข้าสู่ระบบด้วย Gmail</p>
                      <p className="text-sm font-semibold text-stone-900 truncate mt-0.5">
                        {user.displayName || 'ผู้ใช้งาน'}
                      </p>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100">
                        <Database className="w-3 h-3 text-emerald-600" />
                        <span>บันทึกข้อมูลไปที่ Firebase: <strong>{CURRENT_PROJECT_ID}</strong></span>
                      </div>
                    </div>

                    <button
                      id="btn-sign-out"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Signed In: Google / Gmail Button */
              <button
                id="btn-google-sign-in"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-sm font-medium shadow-2xs transition-colors active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
