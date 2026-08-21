import React, { useState } from 'react';
import { Building2, ShieldCheck, Search, Printer, Globe, LogOut, UserCheck, ChevronRight } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onPrintCurrentView: () => void;
  activeTab: string;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
  currentUser?: { name: string; role: string; email: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onPrintCurrentView,
  activeTab,
  language = 'BM',
  setLanguage,
  currentUser,
  onLogout,
}) => {
  const isEN = language === 'EN';
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Co-op Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/40 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug truncate">
                  KopeRa<span className="text-emerald-400 font-extrabold text-xs align-super">™ Pro</span>
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border border-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> SKM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                Koperasi Warga Berdaya Malaysia Berhad • <span className="text-emerald-400 font-medium">{isEN ? 'Audit-Ready Engine' : 'Enjin Bersedia Audit'}</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEN ? "Search member, IC, voucher..." : "Cari ahli, no IC, baucer..."}
                className="w-full bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            {setLanguage && (
              <button
                onClick={() => setLanguage(language === 'BM' ? 'EN' : 'BM')}
                className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                title={isEN ? "Switch Language" : "Tukar Bahasa"}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono text-[11px]">{language === 'BM' ? 'BM' : 'EN'}</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={onPrintCurrentView}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEN ? 'Print' : 'Cetak'}</span>
            </button>

            {/* User Info & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">
                    {currentUser.role}
                  </span>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 sm:px-3 sm:py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    title={isEN ? "Logout" : "Log Keluar"}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">{isEN ? 'Logout' : 'Keluar'}</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Collapsible Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pt-2.5 pb-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEN ? "Search member, IC, voucher..." : "Cari ahli, no IC, baucer..."}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                autoFocus
              />
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
