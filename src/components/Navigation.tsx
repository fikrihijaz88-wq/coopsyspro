import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  HandCoins, 
  FileSpreadsheet, 
  PieChart, 
  Sparkles, 
  Receipt, 
  ShieldCheck, 
  CalendarDays, 
  FileText, 
  FileCheck, 
  ShoppingCart, 
  Award, 
  Scale,
  Landmark,
  HeartHandshake,
  Building2,
  PiggyBank,
  ArrowRightLeft,
  QrCode,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  Layers,
  MessageSquare
} from 'lucide-react';
import { isTabAllowedForRole, UserRole } from '../utils/rbac';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  language?: 'BM' | 'EN';
  userRole?: UserRole | string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0,
  language = 'BM',
  userRole = 'BENDAHARI',
}) => {
  const isEN = language === 'EN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allTabs = [
    { id: 'dashboard', category: 'UTAMA', label: isEN ? 'Dashboard' : 'Laman Utama', icon: LayoutDashboard },
    { id: 'members', category: 'KEAHLIAN', label: isEN ? 'Member & Share Management' : 'Pengurusan Ahli & Syer', icon: Users, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'savings', category: 'KEAHLIAN', label: isEN ? 'Special Savings & Deposits' : 'Simpanan Khas & Deposit', icon: PiggyBank, highlight: true },
    { id: 'governance', category: 'KEAHLIAN', label: isEN ? 'ALK & JAD Leadership' : 'Keanggotaan ALK & JAD', icon: Award },
    { id: 'welfare', category: 'KEAHLIAN', label: isEN ? 'Welfare & Death Benefit' : 'Tabung Kebajikan & Khairat', icon: HeartHandshake, highlight: true },
    { id: 'meetings', category: 'KEAHLIAN', label: isEN ? 'Meetings & Minutes' : 'Pengurusan Mesyuarat & Minit', icon: CalendarDays },
    { id: 'pos', category: 'KEWANGAN', label: isEN ? 'POS & Co-op Store' : 'POS & Kedai Koperasi', icon: ShoppingCart },
    { id: 'accounting', category: 'KEWANGAN', label: isEN ? 'Accounting & Ledger' : 'Perakaunan & Lejar', icon: BookOpenCheck },
    { id: 'bank-recon', category: 'KEWANGAN', label: isEN ? 'Bank Reconciliation' : 'Penyesuaian Bank', icon: ArrowRightLeft },
    { id: 'fixed-assets', category: 'KEWANGAN', label: isEN ? 'Fixed Asset Register' : 'Daftar Aset & Susutnilai', icon: Building2 },
    { id: 'financing', category: 'KEWANGAN', label: isEN ? 'Member Financing' : 'Pembiayaan Ahli', icon: HandCoins },
    { id: 'skm-funds', category: 'KEWANGAN', label: isEN ? 'SKM Loans & Grants' : 'Dana Pinjaman & Geran SKM', icon: Landmark, highlight: true },
    { id: 'e-invoice', category: 'KEWANGAN', label: isEN ? 'e-Koperasi & e-Invoice' : 'e-Koperasi & e-Invois LHDN', icon: QrCode, highlight: true },
    { id: 'gateway', category: 'KEWANGAN', label: isEN ? 'Gateway & Escrow (SecurePay)' : 'Gateway & Escrow (SecurePay)', icon: CreditCard, highlight: true },
    { id: 'payroll', category: 'KEWANGAN', label: isEN ? 'Payroll Deductions' : 'Potongan Gaji', icon: Receipt },
    { id: 'financials', category: 'KEWANGAN', label: isEN ? 'SKM Financial Statements' : 'Penyata Kewangan SKM', icon: FileSpreadsheet },
    { id: 'documents', category: 'AUDIT', label: isEN ? 'Document Verification' : 'Pengesahan Dokumen', icon: FileCheck },
    { id: 'dividend', category: 'AUDIT', label: isEN ? 'Dividend & Statutory' : 'Agihan Dividen & Statutori', icon: PieChart },
    { id: 'compliance', category: 'AUDIT', label: isEN ? 'Compliance Checker' : 'Pemeriksa Pematuhan', icon: Scale },
    { id: 'automated-reports', category: 'AUDIT', label: isEN ? 'Automated AGM Reports' : 'Laporan Berautomatik AGM', icon: FileText, highlight: true },
    { id: 'logs', category: 'AUDIT', label: isEN ? 'Activity Logs & Audit' : 'Log Aktiviti & Audit', icon: ShieldCheck },
    { id: 'notifications', category: 'KOMUNIKASI', label: isEN ? 'WhatsApp & SMS Notifications' : 'Notifikasi WhatsApp & SMS', icon: MessageSquare, highlight: true },
    { id: 'system-admin', category: 'PENTADBIRAN', label: isEN ? 'System Admin & Users' : 'Pengguna & Tetapan Asas', icon: ShieldCheck, highlight: true },
    { id: 'ai-audit', category: 'AUDIT', label: isEN ? 'AI Audit Advisor' : 'Penasihat Audit AI', icon: Sparkles, highlight: true },
  ];

  // Filter tabs according to RBAC permissions
  const tabs = allTabs.filter(tab => isTabAllowedForRole(userRole, tab.id));
  const currentActiveTabObj = allTabs.find(t => t.id === activeTab) || allTabs[0];
  const CurrentIcon = (currentActiveTabObj && currentActiveTabObj.icon) ? currentActiveTabObj.icon : LayoutDashboard;

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-300 relative z-20 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* MOBILE VIEW NAVIGATION BAR (Visible on screens < 768px) */}
        <div className="md:hidden py-2.5">
          <div className="flex items-center justify-between gap-2">
            
            {/* Active Tab Indicator & Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CurrentIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left truncate">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {isEN ? 'Current Active Menu' : 'Menu Aktif Semasa'}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {currentActiveTabObj.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {tabs.length} Menu
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </div>
            </button>

          </div>

          {/* Quick Horizontal Scroll Pills for Most Common Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar text-xs">
            {tabs.slice(0, 6).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold text-[11px] transition-all
                    ${isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'bg-slate-800/80 text-slate-300 active:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-2.5 py-1.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-lg whitespace-nowrap text-[11px] font-bold flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isEN ? 'All (+)' : 'Semua (+)'}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW HORIZONTAL TABS (Visible on md and above) */}
        <div className="hidden md:flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-150 relative
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold' 
                    : tab.highlight
                    ? 'bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : tab.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* MOBILE FULL-SCREEN MENU DRAWER / MODAL */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />

          {/* Drawer Container */}
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  {isEN ? 'Cooperative System Navigation' : 'Pilihan Menu Sistem Koperasi'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEN ? 'Select a module to view on your phone' : 'Pilih modul atau fungsi yang ingin dipaparkan'}
                </p>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="overflow-y-auto space-y-2 pr-1 pb-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all text-xs font-semibold
                        ${isActive 
                          ? 'bg-emerald-600 text-white shadow-lg font-bold ring-2 ring-emerald-400/50' 
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800/80'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-emerald-400 border border-slate-800'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </div>

                      {tab.badge ? (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {tab.badge}
                        </span>
                      ) : isActive ? (
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {isEN ? 'ACTIVE' : 'AKTIF'}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Close Button at Bottom */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                {isEN ? 'Close Menu' : 'Tutup Menu'}
              </button>
            </div>

          </div>
        </div>
      )}

    </nav>
  );
};
