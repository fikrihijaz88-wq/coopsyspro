import React, { useState } from 'react';
import { Ahli, CartaAkaun, Transaksi, PembiayaanAhli, Mesyuarat } from '../types';
import { MONTHLY_TREND_DATA } from '../data/initialData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Users, 
  Coins, 
  Wallet, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Receipt,
  PieChart,
  AlertCircle,
  FileText,
  BarChart3,
  LineChart as LineChartIcon,
  Bell,
  Calendar,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCheck,
  RefreshCw,
  HandCoins,
  X,
  Radio,
  HelpCircle
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'MEETING' | 'MEMBER_APPROVAL' | 'LOAN_APPROVAL' | 'COMPLIANCE';
  priority: 'URGENT' | 'HIGH' | 'INFO';
  title: string;
  description: string;
  timestamp: string;
  actionText: string;
  targetTab: string;
  badgeText: string;
  badgeColor: string;
}

interface DashboardOverviewProps {
  demoMode?: boolean;
  ahliList: Ahli[];
  cartaAkaun: CartaAkaun[];
  transaksiList: Transaksi[];
  pembiayaanList: PembiayaanAhli[];
  mesyuaratList?: Mesyuarat[];
  setActiveTab: (tab: string) => void;
  onOpenNewMemberModal: () => void;
  onOpenNewTxModal: () => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
  userRole?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  demoMode = false,
  ahliList = [],
  cartaAkaun = [],
  transaksiList = [],
  pembiayaanList = [],
  mesyuaratList = [],
  setActiveTab,
  onOpenNewMemberModal,
  onOpenNewTxModal,
  language = 'BM',
  setLanguage,
  userRole,
}) => {
  const isEN = language === 'EN';
  const [chartType, setChartType] = useState<'AREA' | 'BAR'>('AREA');

  // Real-time notification filter & acknowledgement state
  const [filterAlertCategory, setFilterAlertCategory] = useState<'ALL' | 'MEETINGS' | 'APPROVALS' | 'COMPLIANCE'>('ALL');
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);

  // Calculations
  const totalAhliAktif = ahliList.filter(a => a.status === 'AKTIF').length;
  const totalAhliPending = ahliList.filter(a => a.status === 'PENDING_AL').length;
  
  const totalModalSyer = ahliList.reduce((acc, curr) => acc + curr.modalSyer, 0);
  const totalYuranBulanan = ahliList.reduce((acc, curr) => acc + curr.yuranBulanan, 0);
  
  // Financial totals from Chart of Accounts
  const totalAset = cartaAkaun
    .filter(a => a.kategori === 'ASET')
    .reduce((acc, curr) => acc + curr.bakiSemasa, 0);

  const totalLiabiliti = cartaAkaun
    .filter(a => a.kategori === 'LIABILITI')
    .reduce((acc, curr) => acc + curr.bakiSemasa, 0);

  const totalHasil = cartaAkaun
    .filter(a => a.kategori === 'HASIL')
    .reduce((acc, curr) => acc + curr.bakiSemasa, 0);

  const totalBelanja = cartaAkaun
    .filter(a => a.kategori === 'BELANJA')
    .reduce((acc, curr) => acc + curr.bakiSemasa, 0);

  const untungBersihSemasa = totalHasil - totalBelanja;

  // Outstanding loan total
  const totalPembiayaanAktif = pembiayaanList
    .filter(p => p.status === 'DILULUSKAN')
    .reduce((acc, curr) => acc + curr.bakiPinjaman, 0);

  // SKM Statutory Appropriations Estimate (12% KWRS, 3% KWPK, 1% KWP)
  const kwrs12 = Math.max(0, untungBersihSemasa * 0.12);
  const kwpk3 = Math.max(0, untungBersihSemasa * 0.03);
  const kwp1 = Math.max(0, untungBersihSemasa * 0.01);
  const bakiBolehDiagih = Math.max(0, untungBersihSemasa - (kwrs12 + kwpk3 + kwp1));

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // Build Real-Time Alerts & Notifications
  const upcomingMeetings = mesyuaratList.filter(m => m.status === 'DIJADUALKAN' || m.status === 'DRAF');
  const pendingMembers = ahliList.filter(a => a.status === 'PENDING_AL');
  const pendingLoans = pembiayaanList.filter(p => p.status === 'PERMOHONAN' || (p.status as string) === 'DALAM_PROSES');

  const notifications: NotificationItem[] = [];

  // 1. Scheduled Meetings Alerts
  upcomingMeetings.forEach(m => {
    notifications.push({
      id: `NOTIF-MSY-${m.id}`,
      type: 'MEETING',
      priority: m.jenis === 'AGM' || m.jenis === 'EGM' ? 'URGENT' : 'HIGH',
      title: `${isEN ? 'Scheduled Meeting:' : 'Mesyuarat Dijadualkan:'} ${m.bilangan}`,
      description: `${m.tajuk} • ${m.tarikh} (${m.masa}) @ ${m.tempat}. ${isEN ? 'Required quorum:' : 'Korum minima:'} ${m.korumMinimaDiperlukan} ${isEN ? 'members.' : 'orang.'}`,
      timestamp: m.tarikh,
      actionText: isEN ? 'Open Meeting Room' : 'Buka Bilik Mesyuarat',
      targetTab: 'meetings',
      badgeText: m.jenis,
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    });
  });

  // 2. Pending Board Approvals for New Members
  if (pendingMembers.length > 0) {
    pendingMembers.forEach(a => {
      notifications.push({
        id: `NOTIF-AHLI-${a.id}`,
        type: 'MEMBER_APPROVAL',
        priority: 'URGENT',
        title: `${isEN ? 'Pending Member Registration:' : 'Permohonan Keahlian Baru:'} ${a.nama}`,
        description: `${isEN ? 'Draft Member ID:' : 'No. Ahli Draf:'} ${a.noAhli} • ${isEN ? 'Initial Share Capital:' : 'Modal Syer Awal:'} ${formatRM(a.modalSyer)} • ${isEN ? 'Employer:' : 'Majikan:'} ${a.majikan}`,
        timestamp: a.tarikhSertai || 'Terkini',
        actionText: isEN ? 'Review Member Approval' : 'Semak & Luluskan ALK',
        targetTab: 'members',
        badgeText: isEN ? 'Pending Board' : 'Menunggu ALK',
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      });
    });
  }

  // 3. Pending Financing Applications
  if (pendingLoans.length > 0) {
    pendingLoans.forEach(p => {
      notifications.push({
        id: `NOTIF-LOAN-${p.id}`,
        type: 'LOAN_APPROVAL',
        priority: 'HIGH',
        title: `${isEN ? 'Pending Loan Application:' : 'Permohonan Pembiayaan Baru:'} ${p.namaAhli}`,
        description: `${p.jenisPembiayaan.replace('_', ' ')} • ${isEN ? 'Amount Requested:' : 'Jumlah Mohon:'} ${formatRM(p.jumlahPinjaman)} (${p.tempohBulan} ${isEN ? 'months' : 'bulan'})`,
        timestamp: p.tarikhPermohonan || 'Terkini',
        actionText: isEN ? 'Process Financing' : 'Proses Pembiayaan',
        targetTab: 'financing',
        badgeText: isEN ? 'In Review' : 'Dalam Semakan',
        badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      });
    });
  }

  // 4. Statutory & Audit Compliance Alert
  if (untungBersihSemasa > 0) {
    notifications.push({
      id: 'NOTIF-COMPLIANCE-STATUTORY',
      type: 'COMPLIANCE',
      priority: 'INFO',
      title: isEN ? 'SKM Statutory Allocation Check (Sec 57 Act 1993)' : 'Peringatan Agihan Statutori SKM (Seksyen 57 Akta 1993)',
      description: `${isEN ? 'Estimated YTD Net Profit:' : 'Anggaran Untung Bersih YTD:'} ${formatRM(untungBersihSemasa)}. ${isEN ? 'Requires 12% KWRS, 3% KWPK & 1% KWP statutory allocation.' : 'Memerlukan peruntukan 12% KWRS, 3% KWPK & 1% KWP.'}`,
      timestamp: '2026-Q3',
      actionText: isEN ? 'View Financial Statements' : 'Penyata Kewangan SKM',
      targetTab: 'financials',
      badgeText: 'SKM Sec 57',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    });
  }

  // 5. SKM Loans & Grants Tracking Reminder
  notifications.push({
    id: 'NOTIF-SKM-FUNDS-MONITOR',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'SKM Loans & Development Grants Ledger' : 'Penjejakan Pinjaman TMP-SKM & Geran Bantuan Pembangunan',
    description: isEN 
      ? 'Institutional TMP-SKM soft loan (RM 150,000) & SKM/KUSKOP Grant Aid (RM 80,000) utilization and quarterly JAD audit verification.' 
      : 'Pemantauan pengeluaran Pinjaman Modal Pusingan TMP-SKM (RM 150,000) & Geran Bantuan (RM 80,000) serta verifikasi lejar suku tahun JAD.',
    timestamp: '2026',
    actionText: isEN ? 'Manage SKM Funds' : 'Urus Dana Pinjaman & Geran',
    targetTab: 'skm-funds',
    badgeText: 'TMP-SKM & Geran',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  });

  // 6. Welfare & Bereavement Fund
  notifications.push({
    id: 'NOTIF-WELFARE-FUND',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'Member Welfare & Death Benefit Fund (Sec 57(3))' : 'Tabung Kebajikan, Khairat Kematian & Manfaat Anggota',
    description: isEN
      ? '30 enrolled members (RM 10/month) • Welfare reserve fund balance: RM 34,250.00.'
      : '30 anggota mencarum (RM 10/bulan) • Baki Kumpulan Wang Kebajikan (KWK): RM 34,250.00 bersedia untuk tuntutan manfaat.',
    timestamp: '2026',
    actionText: isEN ? 'View Welfare Fund' : 'Semak Tabung Kebajikan',
    targetTab: 'welfare',
    badgeText: 'Seksyen 57(3)',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
  });

  // 7. Fixed Assets & Depreciation Engine
  notifications.push({
    id: 'NOTIF-FIXED-ASSETS',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'Fixed Asset Register & Annual Depreciation (GP1)' : 'Daftar Harta Tetap & Susutnilai Automatik SKM (GP1)',
    description: isEN
      ? '6 active registered assets (Premises, Vehicle, POS chillers, IT systems) • Net Book Value: RM 477,667.00.'
      : '6 harta tetap aktif (Premis, Van, Peti Sejuk POS, IT) • Nilai Buku Bersih (NBV): RM 477,667.00 sedia untuk audit.',
    timestamp: '2026',
    actionText: isEN ? 'Manage Fixed Assets' : 'Urus Harta Tetap',
    targetTab: 'fixed-assets',
    badgeText: 'Audit GP1',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  });

  // 8. Special Savings & Member Fixed Deposits
  notifications.push({
    id: 'NOTIF-SAVINGS-DEPOSITS',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'Member Special Savings & Term Deposits (Sec 50)' : 'Simpanan Khas Sukarela & Sijil Deposit Tetap Anggota',
    description: isEN
      ? 'Total Member Term Deposits: RM 110,000.00 • Voluntary Savings: RM 48,500.00 • Expected Hibah: RM 7,675.00.'
      : 'Baki Deposit Tetap Bertempoh: RM 110,000.00 • Simpanan Khas: RM 48,500.00 • Anggaran Hibah Matang: RM 7,675.00.',
    timestamp: '2026',
    actionText: isEN ? 'View Savings' : 'Urus Simpanan & Deposit',
    targetTab: 'savings',
    badgeText: 'Seksyen 50',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
  });

  // 9. Bank Reconciliation
  notifications.push({
    id: 'NOTIF-BANK-RECON',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'Monthly Bank Reconciliation Statement' : 'Penyata Penyesuaian Bank Bulanan (BIMB)',
    description: isEN
      ? 'Ledger Cash Book (RM 245,800.00) vs Bank Statement (RM 248,670.00) • Status: BALANCED (RM 0.00 discrepancy).'
      : 'Lejar Buku Tunai (RM 245,800.00) vs Penyata Bank (RM 248,670.00) • Status Penyesuaian: SEIMBANG (0.00).',
    timestamp: '2026',
    actionText: isEN ? 'Check Recon' : 'Semak Penyesuaian Bank',
    targetTab: 'bank-recon',
    badgeText: 'Buku Tunai 1010',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  });

  // 10. e-Koperasi & LHDN e-Invoice
  notifications.push({
    id: 'NOTIF-E-INVOICE-LHDN',
    type: 'COMPLIANCE',
    priority: 'INFO',
    title: isEN ? 'e-Koperasi SKM & LHDN e-Invoice Data Bridge' : 'Hab Eksport e-Koperasi SKM & e-Invois LHDN Malaysia',
    description: isEN
      ? 'SKM Annual Filing JSON ready • 2 LHDN validated e-Invoices (RM 12,850.00) with QR code & UBL 2.1 format.'
      : 'Pakej pemfailan e-Koperasi sedia dimuat turun • 2 e-Invois LHDN (RM 12,850.00) disahkan dengan kod QR digital.',
    timestamp: '2026',
    actionText: isEN ? 'View e-Invoices' : 'Buka Hab Integrasi',
    targetTab: 'e-invoice',
    badgeText: 'MyInvois LHDN',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  });

  // Active unacknowledged notifications
  const activeNotifications = notifications.filter(n => !acknowledgedAlertIds.includes(n.id));

  // Filtered by active tab
  const filteredNotifications = activeNotifications.filter(n => {
    if (filterAlertCategory === 'MEETINGS') return n.type === 'MEETING';
    if (filterAlertCategory === 'APPROVALS') return n.type === 'MEMBER_APPROVAL' || n.type === 'LOAN_APPROVAL';
    if (filterAlertCategory === 'COMPLIANCE') return n.type === 'COMPLIANCE';
    return true;
  });

  if (userRole === 'SUPER_ADMIN_VERTTERE') {
    return (
      <div className="space-y-6">
        {/* Super Admin Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 border border-purple-800/50 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-900 text-purple-300 border border-purple-600 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  👑 Super Admin Platform (Verttere Solutions)
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
                  🛡️ Privacy Shield Aktif
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Pusat Kawalan Platform &amp; Pelepasan Dana Escrow
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Panel khas pentadbiran platform Verttere Solutions bagi menguruskan pelepasan bayaran escrow, pengurusan akaun pengguna sistem, tetapan profil asas koperasi, dan log audit keselamatan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('gateway')}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" /> Buka Pelepasan Payout
              </button>
              <button
                onClick={() => setActiveTab('support-tickets')}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer transition-all"
              >
                <HelpCircle className="w-4 h-4" /> Tiket Aduan &amp; Ralat
              </button>
              <button
                onClick={() => setActiveTab('system-admin')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Users className="w-4 h-4 text-emerald-400" /> Urus Pengguna
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice Alert */}
        <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
            🔒
          </div>
          <div>
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">
              Polisi Perlindungan Privasi Koperasi &amp; Pematuhan PDPA
            </h4>
            <p className="text-[11px] text-slate-300">
              Data perakaunan dalaman koperasi (Buku Tunai, Lejar Am, Untung Rugi), permohonan pinjaman peribadi anggota, dan agihan dividen dilindungi dan diasingkan secara automatik daripada paparan vendor/Super Admin.
            </p>
          </div>
        </div>

        {/* Super Admin Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div 
            onClick={() => setActiveTab('gateway')}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 p-5 rounded-2xl transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Pelepasan Dana Escrow</span>
              <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/50 group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-white">Kuasa Payout EFT</div>
              <p className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                Luluskan permohonan bendahari <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('support-tickets')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 p-5 rounded-2xl transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Tiket Aduan &amp; Ralat</span>
              <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/50 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-white">Inbox Permohonan</div>
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                Semak &amp; buat pembetulan <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('system-admin')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 p-5 rounded-2xl transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Pengguna &amp; Peranan</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-white">Urus Pengguna</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                Tambah / Padam / Kunci User <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('system-admin')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 p-5 rounded-2xl transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Profil &amp; Bank Koperasi</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-white">Tetapan Profil</div>
              <p className="text-xs text-indigo-300 mt-1 flex items-center gap-1">
                CIMB 8602-9918-2019 <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('logs')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-5 rounded-2xl transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Log Audit &amp; Keselamatan</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/50 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-white">Audit Trail</div>
              <p className="text-xs text-cyan-300 mt-1 flex items-center gap-1">
                Semak Log Sistem <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {isEN ? 'Co-operative Societies Act 1993 Compliance (Section 57)' : 'Pematuhan Akta Koperasi 1993 (Seksyen 57)'}
              </span>
              <span className="bg-slate-700/60 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">
                {isEN ? 'Quarter 3 (2026)' : 'Suku Tahun 3 (2026)'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isEN ? 'Co-operative Management & Accounting Reports System' : 'Sistem Pengurusan & Laporan Perakaunan Koperasi'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isEN 
                ? 'Financial position overview, member share capital balances, and Statutory Fund allocations according to Malaysia Co-operative Societies Commission (SKM) guidelines.'
                : 'Ringkasan kedudukan kewangan, baki modal syer ahli, dan peruntukan Kumpulan Wang Statutori mengikut garis panduan Suruhanjaya Koperasi Malaysia (SKM).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewMemberModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> {isEN ? 'Register New Member' : 'Daftar Ahli Baru'}
            </button>
            <button
              onClick={onOpenNewTxModal}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl border border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" /> {isEN ? 'Record Transaction' : 'Rekod Transaksi'}
            </button>
            <button
              onClick={() => setActiveTab('support-tickets')}
              className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> {isEN ? 'System Support & Requests' : 'Tiket Bantuan & Ralat'}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Ahli */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isEN ? 'Total Co-op Members' : 'Jumlah Ahli Koperasi'}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{ahliList.length} {isEN ? 'Members' : 'Orang'}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{totalAhliAktif} {isEN ? 'Active' : 'Aktif'}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{totalAhliPending} {isEN ? 'Pending Board' : 'Menunggu ALK'}</span>
            </div>
          </div>
        </div>

        {/* Modal Syer Ahli */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isEN ? 'Issued Share Capital' : 'Modal Syer Terbitan Ahli'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{formatRM(totalModalSyer)}</div>
            <p className="text-xs text-slate-400 mt-1">
              {isEN ? 'Average' : 'Purata'} <span className="text-white font-medium">{formatRM(totalModalSyer / (totalAhliAktif || 1))}</span> {isEN ? '/ member' : '/ ahli'}
            </p>
          </div>
        </div>

        {/* Keuntungan Bersih Semasa */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isEN ? 'Current Net Profit (YTD)' : 'Untung Bersih Semasa (YTD)'}</span>
            <div className={`w-9 h-9 rounded-xl ${untungBersihSemasa >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'} flex items-center justify-center`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${untungBersihSemasa >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatRM(untungBersihSemasa)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <span className="text-slate-300">{isEN ? 'Revenue:' : 'Hasil:'} {formatRM(totalHasil)}</span>
            </div>
          </div>
        </div>

        {/* Pembiayaan Ahli Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isEN ? 'Member Financing Balance' : 'Baki Pembiayaan Ahli'}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/50">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{formatRM(totalPembiayaanAktif)}</div>
            <p className="text-xs text-slate-400 mt-1">
              {pembiayaanList.filter(p => p.status === 'DILULUSKAN').length} {isEN ? 'active financing accounts' : 'akaun pembiayaan Murabahah'}
            </p>
          </div>
        </div>

      </div>

      {/* REAL-TIME ALERTS & NOTIFICATIONS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Subtle Ambient Light Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                {isEN ? 'Real-Time System Alerts' : 'Makluman & Pemberitahuan Masa Nyata'}
              </span>
              
              <span className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700/50 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {isEN ? 'Live Sync Active' : 'Sistem Aktif (Live)'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {isEN ? 'Urgent Approvals & Scheduled Meetings Panel' : 'Panel Kelulusan Segera & Mesyuarat Dijadualkan'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEN
                ? 'Automated notifications for upcoming scheduled co-op meetings, board member approvals, and statutory compliance.'
                : 'Pemberitahuan automatik bagi mesyuarat koperasi dijadualkan, kelulusan permohonan ahli/pembiayaan, dan status audit SKM.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeNotifications.length > 0 && (
              <button
                onClick={() => setAcknowledgedAlertIds(notifications.map(n => n.id))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isEN ? 'Mark All Read' : 'Tanda Semua Dilihat'}
              </button>
            )}
            
            {acknowledgedAlertIds.length > 0 && (
              <button
                onClick={() => setAcknowledgedAlertIds([])}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                {isEN ? 'Reset Alerts' : 'Muat Semula'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterAlertCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filterAlertCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <span>{isEN ? 'All Alerts' : 'Semua Notis'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterAlertCategory === 'ALL' ? 'bg-slate-950 text-amber-300 font-extrabold' : 'bg-slate-700 text-slate-300'}`}>
              {activeNotifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilterAlertCategory('MEETINGS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filterAlertCategory === 'MEETINGS'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isEN ? 'Scheduled Meetings' : 'Mesyuarat Dijadualkan'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterAlertCategory === 'MEETINGS' ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-700 text-slate-300'}`}>
              {activeNotifications.filter(n => n.type === 'MEETING').length}
            </span>
          </button>

          <button
            onClick={() => setFilterAlertCategory('APPROVALS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filterAlertCategory === 'APPROVALS'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isEN ? 'Pending Approvals' : 'Tindakan Kelulusan'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterAlertCategory === 'APPROVALS' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-700 text-slate-300'}`}>
              {activeNotifications.filter(n => n.type === 'MEMBER_APPROVAL' || n.type === 'LOAN_APPROVAL').length}
            </span>
          </button>

          <button
            onClick={() => setFilterAlertCategory('COMPLIANCE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filterAlertCategory === 'COMPLIANCE'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isEN ? 'Statutory & Audit' : 'Statutori & Audit SKM'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterAlertCategory === 'COMPLIANCE' ? 'bg-blue-950 text-blue-200' : 'bg-slate-700 text-slate-300'}`}>
              {activeNotifications.filter(n => n.type === 'COMPLIANCE').length}
            </span>
          </button>
        </div>

        {/* Notifications List Container */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">
              {isEN ? 'No pending alerts or notifications in this category.' : 'Tiada makluman atau tindakan pending buat masa ini.'}
            </p>
            <p className="text-xs text-slate-500">
              {isEN ? 'All co-op board approvals and scheduled meetings are updated.' : 'Semua kelulusan ALK dan mesyuarat koperasi berada dalam keadaan teratur.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredNotifications.map((notif) => {
              return (
                <div
                  key={notif.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon based on notification type */}
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'MEETING' && (
                        <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center shadow-lg shadow-indigo-950/50">
                          <Calendar className="w-5 h-5" />
                        </div>
                      )}
                      {notif.type === 'MEMBER_APPROVAL' && (
                        <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center shadow-lg shadow-amber-950/50">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      )}
                      {notif.type === 'LOAN_APPROVAL' && (
                        <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center shadow-lg shadow-purple-950/50">
                          <HandCoins className="w-5 h-5" />
                        </div>
                      )}
                      {notif.type === 'COMPLIANCE' && (
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${notif.badgeColor}`}>
                          {notif.badgeText}
                        </span>

                        {notif.priority === 'URGENT' && (
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            {isEN ? 'URGENT ATTENTION' : 'TINDAKAN SEGERA'}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Button & Dismiss */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                    <button
                      onClick={() => setActiveTab(notif.targetTab)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/40 flex items-center gap-1.5 transition-all"
                    >
                      <span>{notif.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setAcknowledgedAlertIds(prev => [...prev, notif.id])}
                      title={isEN ? 'Dismiss Alert' : 'Sembunyikan Makluman'}
                      className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECHARTS COMPONENT: Monthly Trends of Share Capital & Loan Disbursement */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> {isEN ? 'Financial Growth Analysis' : 'Analisis Pertumbuhan Kewangan'}
              </span>
              <span className="text-xs text-slate-400">{isEN ? 'Year 2026 (Jan - Aug)' : 'Tahun 2026 (Jan - Ogos)'}</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {isEN ? 'Monthly Share Capital & Financing Disbursement Growth Trend' : 'Analisis Trend Bulanan Pertumbuhan Syer & Pengeluaran Pembiayaan'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEN 
                ? 'Cumulative tracking of issued share capital versus approved member financing disbursement.'
                : 'Pemantauan kumulatif modal syer terbitan ahli berbanding pengeluaran pembiayaan ahli berdaftar.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setChartType('AREA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                chartType === 'AREA'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" /> {isEN ? 'Area' : 'Kawasan (Area)'}
            </button>
            <button
              onClick={() => setChartType('BAR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                chartType === 'BAR'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> {isEN ? 'Column (Bar)' : 'Bar (Column)'}
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'AREA' ? (
              <AreaChart data={demoMode ? MONTHLY_TREND_DATA : []} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSyer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPembiayaan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `RM ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(val: any) => [formatRM(Number(val)), '']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
                  formatter={(value) => value === 'modalSyer' ? 'Modal Syer Terbitan (RM)' : 'Pembiayaan Ahli (RM)'}
                />
                <Area 
                  type="monotone" 
                  dataKey="modalSyer" 
                  name="modalSyer" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSyer)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="pembiayaan" 
                  name="pembiayaan" 
                  stroke="#a855f7" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorPembiayaan)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={demoMode ? MONTHLY_TREND_DATA : []} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `RM ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [formatRM(Number(val)), '']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
                  formatter={(value) => value === 'modalSyer' ? (isEN ? 'Issued Share Capital (RM)' : 'Modal Syer Terbitan (RM)') : (isEN ? 'Member Financing (RM)' : 'Pembiayaan Ahli (RM)')}
                />
                <Bar dataKey="modalSyer" name="modalSyer" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pembiayaan" name="pembiayaan" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Quick summary stats line below chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{isEN ? 'Share Capital Growth YTD: +30.9%' : 'Pertumbuhan Syer YTD: +30.9%'}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>{isEN ? 'Financing Growth: +88.2%' : 'Pertumbuhan Pembiayaan: +88.2%'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>{isEN ? 'Share to Loan Coverage Ratio: 1.71x' : 'Nisbah Tutupan Syer / Pinjaman: 1.71x'}</span>
          </div>
        </div>

      </div>

      {/* Financial Structure & SKM Statutory Appropriations Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Kedudukan Kewangan SKM */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> {isEN ? 'Co-operative Financial Position Balance' : 'Imbangan Kedudukan Kewangan Koperasi'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{isEN ? 'SKM Standard Format' : 'Format Piawai Suruhanjaya Koperasi Malaysia (SKM)'}</p>
            </div>

            <button
              onClick={() => setActiveTab('financials')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              {isEN ? 'Full Statement' : 'Penyata Penuh'} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400">{isEN ? 'Total Co-op Assets' : 'Jumlah Aset Koperasi'}</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">{formatRM(totalAset)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isEN ? 'Bank, Cash, Investments & Fixed Assets' : 'Bank, Tunai, Pelaburan & Aset Tetap'}</p>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400">{isEN ? 'Total Liabilities' : 'Jumlah Liabiliti'}</span>
              <p className="text-lg font-bold text-amber-400 mt-1">{formatRM(totalLiabiliti)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isEN ? 'Creditors & Retained Member Fees' : 'Pemiutang & Yuran Ahli Disimpan'}</p>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400">{isEN ? 'Share Capital & Equity' : 'Modal Syer & Ekuiti'}</span>
              <p className="text-lg font-bold text-blue-400 mt-1">{formatRM(totalModalSyer + untungBersihSemasa)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isEN ? 'Share Capital & Statutory Reserves' : 'Modal Syer & Rizab Statutori'}</p>
            </div>
          </div>

          {/* Statutory Appropriations Visual Box */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-400" />
                {isEN ? 'Estimated Co-op Statutory Allocation (Section 57 Act 1993)' : 'Anggaran Agihan Statutori Koperasi (Seksyen 57 Akta 1993)'}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {isEN ? 'Net Profit:' : 'Untung Bersih:'} {formatRM(untungBersihSemasa)}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">{isEN ? '12% Statutory Reserve Fund (KWRS)' : '12% Kumpulan Wang Rizab Statutori (KWRS)'}</span>
                </div>
                <span className="font-semibold text-white">{formatRM(kwrs12)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-slate-300">{isEN ? '3% Co-op Education Fund (KWPK)' : '3% Kumpulan Wang Pendidikan Koperasi (KWPK)'}</span>
                </div>
                <span className="font-semibold text-white">{formatRM(kwpk3)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-slate-300">{isEN ? '1% Co-op Development Fund (KWP)' : '1% Kumpulan Wang Pembangunan Koperasi (KWP)'}</span>
                </div>
                <span className="font-semibold text-white">{formatRM(kwp1)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-emerald-300 font-semibold">{isEN ? 'Distributable Profit for Member Dividends' : 'Keuntungan Boleh Diagih kepada Dividen Ahli'}</span>
                </div>
                <span className="font-bold text-amber-300 text-sm">{formatRM(bakiBolehDiagih)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Recent Transactions & Checklist */}
        <div className="space-y-6">
          
          {/* Recent Transactions Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isEN ? 'Recent Transactions' : 'Transaksi Terkini'}
              </h3>
              <button
                onClick={() => setActiveTab('accounting')}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                {isEN ? 'View All' : 'Lihat Semua'}
              </button>
            </div>

            <div className="space-y-3">
              {transaksiList.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs">
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white truncate max-w-[170px]">{tx.perihal}</span>
                    <span className="font-bold text-emerald-400">{formatRM(tx.jumlah)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{tx.noRujukan}</span>
                    <span>{tx.tarikh}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Compliance Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" /> {isEN ? 'SKM Annual Audit Checklist' : 'Semakan Audit Tahunan SKM'}
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-slate-300">
                <span>{isEN ? 'Trial Balance Balanced' : 'Imbangan Duga Seimbang'}</span>
                <span className="text-emerald-400 font-bold">✓ {isEN ? 'PASSED' : 'SELESAI'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-slate-300">
                <span>{isEN ? 'Members & Nominees Register Updated' : 'Daftar Ahli & Waris Kemaskini'}</span>
                <span className="text-emerald-400 font-bold">✓ {isEN ? 'PASSED' : 'SELESAI'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-slate-300">
                <span>{isEN ? 'Dividend Cap <= 10% Compliant' : 'Pematuhan Dividen Max 10%'}</span>
                <span className="text-emerald-400 font-bold">✓ {isEN ? 'COMPLIANT' : 'PATUH'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-slate-300">
                <span>{isEN ? 'Statutory Contributions (KWRS/KWPK/KWP)' : 'Caruman Statutori (KWRS/KWPK/KWP)'}</span>
                <span className="text-amber-400 font-bold">⚠️ {isEN ? 'ESTIMATED' : 'ANGGARAN'}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('ai-audit')}
              className="w-full mt-4 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isEN ? 'Generate AI Audit Report' : 'Jana Laporan Semakan AI'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
