import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Coins, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  PlusCircle, 
  Printer, 
  Sliders, 
  Search, 
  Filter, 
  Sparkles, 
  Receipt, 
  Layers, 
  Check, 
  X,
  FileSpreadsheet,
  Download,
  Landmark,
  BadgeDollarSign
} from 'lucide-react';
import { PaymentGatewayConfig, GatewayTransaction, SettlementBatch, Ahli } from '../types';

interface PaymentGatewaySettlementProps {
  gatewayConfig: PaymentGatewayConfig;
  transactions: GatewayTransaction[];
  settlements: SettlementBatch[];
  ahliList?: Ahli[];
  onUpdateConfig: (cfg: Partial<PaymentGatewayConfig>) => void;
  onCreateBill: (payload: any) => Promise<any>;
  onTriggerCallback: (billCode: string, status: number | string) => Promise<any>;
  onCreateSettlement: (payload: any) => Promise<any>;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const PaymentGatewaySettlement: React.FC<PaymentGatewaySettlementProps> = ({
  gatewayConfig,
  transactions = [],
  settlements = [],
  ahliList = [],
  onUpdateConfig,
  onCreateBill,
  onTriggerCallback,
  onCreateSettlement,
  language = 'BM',
  userRole,
}) => {
  const isEN = language === 'EN';
  const [activeSubTab, setActiveSubTab] = useState<'TRANSACTIONS' | 'SETTLEMENTS' | 'SIMULATOR' | 'SETTINGS'>('TRANSACTIONS');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals & Forms
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<SettlementBatch | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Simulator State
  const [simProvider, setSimProvider] = useState<'SECUREPAY' | 'TOYYIBPAY'>('SECUREPAY');
  const [simKategori, setSimKategori] = useState<'TAMBAH_SYER' | 'POS_STORE' | 'SIMPANAN_KHAS' | 'BAYARAN_PEMBIAYAAN'>('TAMBAH_SYER');
  const [simSelectedAhli, setSimSelectedAhli] = useState<string>(ahliList[0]?.noAhli || 'KOP-2022-005');
  const [simNama, setSimNama] = useState<string>(ahliList[0]?.nama || 'Ahmad Faiz Bin Rosli');
  const [simNoKP, setSimNoKP] = useState<string>(ahliList[0]?.noKp || '880315-10-5541');
  const [simEmel, setSimEmel] = useState<string>('faiz.rosli@gmail.com');
  const [simTelefon, setSimTelefon] = useState<string>('013-4455667');
  const [simJumlah, setSimJumlah] = useState<number>(100);
  const [simGeneratedBill, setSimGeneratedBill] = useState<any>(null);

  // Config Settings Local State
  const [editConfig, setEditConfig] = useState<PaymentGatewayConfig>({ ...gatewayConfig });

  // Format RM Currency
  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Metrics Calculations
  const totalKutipanKasar = transactions.reduce((acc, t) => acc + (t.status !== 'GAGAL' ? t.jumlahKasar : 0), 0);
  const totalCajVerttere = transactions.reduce((acc, t) => acc + (t.status !== 'GAGAL' ? t.cajPlatformVerttere : 0), 0);
  
  // Pending Settlement (BERJAYA but not yet assigned to any batch settlement)
  const pendingTransactions = transactions.filter(t => t.status === 'BERJAYA' && !t.noBatchSettlement);
  const totalBakiPendingSettlement = pendingTransactions.reduce((acc, t) => acc + t.jumlahBersihKoperasi, 0);

  // Completed Settlements Total
  const totalDilepaskan = settlements
    .filter(s => s.status === 'SELESAI_PINDAH')
    .reduce((acc, s) => acc + s.jumlahBersihPindahan, 0);

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.billCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.namaPembayar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.noAhli && t.noAhli.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.perihal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = filterCategory === 'ALL' || t.kategoriTransaksi === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Handle Generate Simulator Bill
  const handleSimulateCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const selected = ahliList.find(a => a.noAhli === simSelectedAhli);
      const res = await onCreateBill({
        provider: simProvider,
        kategoriTransaksi: simKategori,
        perihal: `Bayaran ${simKategori.replace('_', ' ')} via ${simProvider === 'TOYYIBPAY' ? 'ToyyibPay FPX' : 'SecurePay'}`,
        namaPembayar: selected ? selected.nama : simNama,
        noKP: selected ? selected.noKp : simNoKP,
        noAhli: simSelectedAhli,
        emel: simEmel,
        noTelefon: simTelefon,
        jumlahKasar: Number(simJumlah),
      });

      setSimGeneratedBill(res);
      showToast(`Pesanan ${res.billCode} (${res.provider || simProvider}) berjaya dijana!`);
    } catch (err: any) {
      alert(`Ralat menjana bil: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Callback Simulator
  const handleSimulatePaymentCallback = async (billCode: string, status: number) => {
    setIsProcessing(true);
    try {
      await onTriggerCallback(billCode, status);
      showToast(status === 1 ? 'Pembayaran FPX BERJAYA disahkan!' : 'Status bil ditandakan GAGAL.');
      setSimGeneratedBill(null);
    } catch (err: any) {
      alert(`Ralat callback: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Create Payout Settlement Batch
  const handleCreatePayoutBatch = async () => {
    if (pendingTransactions.length === 0) {
      alert('Tiada transaksi menunggu pelepasan pada masa ini.');
      return;
    }

    setIsProcessing(true);
    try {
      await onCreateSettlement({
        namaKoperasi: 'Koperasi Warga Berdaya Malaysia Berhad',
        kodKoperasi: 'KOP-MY-001',
        noAkaunBankKoperasi: '8602-9918-2019 (CIMB Islamic)',
        namaBankKoperasi: 'CIMB Islamic Bank Berhad',
        dikeluarkanOleh: 'Verttere Solutions FinTech Escrow',
        catatan: `Pelepasan ${pendingTransactions.length} transaksi kutipan FPX Toyyibpay.`
      });
      setShowPayoutModal(false);
      showToast(`Kelompok Payout bernilai ${formatRM(totalBakiPendingSettlement)} berjaya dilepaskan ke akaun bank koperasi!`);
    } catch (err: any) {
      alert(`Ralat pelepasan payout: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Save Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editConfig);
    showToast('Konfigurasi Gateway ToyyibPay & Struktur Caj Verttere berjaya dikemaskini!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-indigo-900/80 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-700">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                Verttere FinTech Gateway & Escrow
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {gatewayConfig.activeProvider === 'BOTH' ? 'SecurePay + ToyyibPay' : gatewayConfig.activeProvider || 'SECUREPAY'} ({gatewayConfig.isSandbox ? 'Sandbox Mode' : 'Live Mode'})
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isEN ? 'Payment Gateway & Escrow Settlement (SecurePay & ToyyibPay)' : 'Gerbang Pembayaran & Pengurusan Escrow'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Kutipan automatik bayaran syer, yuran, dan POS melalui SecurePay (FPX, DuitNow QR, Kad) & ToyyibPay dengan penahanan dana transit dan pelepasan berkala (*payout*) ke akaun bank koperasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={pendingTransactions.length === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                pendingTransactions.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <BadgeDollarSign className="w-4 h-4" />
              {isEN ? 'Release Payout to Co-op' : 'Lepaskan Payout ke Koperasi'} ({pendingTransactions.length})
            </button>

            <button
              onClick={() => setActiveSubTab('SIMULATOR')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isEN ? 'Test Gateway Simulator' : 'Uji Simulasi Gateway'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Collection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isEN ? 'Total Inflow (Gross)' : 'Jumlah Kutipan Kasar'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{formatRM(totalKutipanKasar)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-blue-400 font-semibold">{transactions.length} transaksi</span> keseluruhan diterima
            </p>
          </div>
        </div>

        {/* Card 2: Pending Escrow Balance */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isEN ? 'Pending Escrow Release' : 'Baki Transit Menunggu Payout'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-700 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-300">{formatRM(totalBakiPendingSettlement)}</h3>
            <p className="text-[11px] text-amber-200/80 mt-1 flex items-center gap-1">
              <span className="font-bold">{pendingTransactions.length} transaksi</span> sedia dilepaskan ke bank koperasi
            </p>
          </div>
        </div>

        {/* Card 3: Platform Fee Earned */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {isEN ? 'Verttere Fee Revenue' : 'Hasil Caj Platform Verttere'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-700 flex items-center justify-center text-indigo-300">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-indigo-300">{formatRM(totalCajVerttere)}</h3>
            <p className="text-[11px] text-indigo-200/80 mt-1">
              Kadar: RM{gatewayConfig.fixedFeeRM.toFixed(2)} + {gatewayConfig.percentageFee}% per transaksi
            </p>
          </div>
        </div>

        {/* Card 4: Disbursed to Co-op */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {isEN ? 'Disbursed to Co-op' : 'Dana Telah Dipindahkan'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-400">{formatRM(totalDilepaskan)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Dipindahkan terus ke CIMB Koperasi
            </p>
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('TRANSACTIONS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'TRANSACTIONS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {isEN ? 'Online FPX Inflows' : 'Transaksi Pembayaran FPX'} ({transactions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('SETTLEMENTS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'SETTLEMENTS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {isEN ? 'Settlement Batches & Payouts' : 'Penyata Pelepasan Dana & Payout'} ({settlements.length})
        </button>

        <button
          onClick={() => setActiveSubTab('SIMULATOR')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'SIMULATOR'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isEN ? 'FPX Payment Simulator' : 'Simulasi Pembayaran FPX Toyyibpay'}
        </button>

        <button
          onClick={() => setActiveSubTab('SETTINGS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'SETTINGS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          {isEN ? 'ToyyibPay & Fee Settings' : 'Tetapan Gateway & Caj Verttere'}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: TRANSACTIONS LIST */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'TRANSACTIONS' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
            
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder={isEN ? 'Search bill code, member name, purpose...' : 'Cari no bil, nama pembayar, perihal...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{isEN ? 'All Categories' : 'Semua Kategori'}</option>
                <option value="TAMBAH_SYER">Modal Syer</option>
                <option value="YURAN_BULANAN">Yuran Bulanan</option>
                <option value="POS_STORE">POS Kedai Koperasi</option>
                <option value="SIMPANAN_KHAS">Simpanan Khas</option>
                <option value="BAYARAN_PEMBIAYAAN">Bayaran Pembiayaan</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{isEN ? 'All Status' : 'Semua Status'}</option>
                <option value="BERJAYA">Berjaya (Pending Payout)</option>
                <option value="DILEPASKAN_KE_KOPERASI">Dilepaskan ke Koperasi</option>
                <option value="MENUNGGU">Menunggu Bayaran</option>
                <option value="GAGAL">Gagal</option>
              </select>
            </div>

          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Bil & Tarikh</th>
                    <th className="py-3.5 px-4">Kategori & Perihal</th>
                    <th className="py-3.5 px-4">Pembayar / Ahli</th>
                    <th className="py-3.5 px-4 text-right">Jumlah Kasar (RM)</th>
                    <th className="py-3.5 px-4 text-right">Caj Verttere (RM)</th>
                    <th className="py-3.5 px-4 text-right">Bersih Koperasi (RM)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tiada transaksi ditemui sepadan dengan carian.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-400">{tx.billCode}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              (tx.gatewayProvider === 'TOYYIBPAY' || tx.billCode.startsWith('TYB'))
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {(tx.gatewayProvider === 'TOYYIBPAY' || tx.billCode.startsWith('TYB')) ? 'ToyyibPay' : 'SecurePay'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">{tx.tarikhMasa}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {tx.kategoriTransaksi.replace('_', ' ')}
                          </span>
                          <div className="text-[11px] text-slate-200 mt-1 truncate max-w-xs">{tx.perihal}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{tx.namaPembayar}</div>
                          <div className="text-[10px] text-slate-400">{tx.noAhli || tx.noKP}</div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {formatRM(tx.jumlahKasar)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-indigo-300">
                          - {formatRM(tx.cajPlatformVerttere)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatRM(tx.jumlahBersihKoperasi)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {tx.status === 'BERJAYA' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                              <Clock className="w-3 h-3" /> Pending Payout
                            </span>
                          )}
                          {tx.status === 'DILEPASKAN_KE_KOPERASI' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Dilepaskan ({tx.noBatchSettlement})
                            </span>
                          )}
                          {tx.status === 'MENUNGGU' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Menunggu FPX
                            </span>
                          )}
                          {tx.status === 'GAGAL' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                              <AlertCircle className="w-3 h-3" /> Gagal
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {tx.status === 'MENUNGGU' ? (
                            <button
                              onClick={() => handleSimulatePaymentCallback(tx.billCode, 1)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              Sahkan Bayar
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`Resit FPX Toyyibpay:\nBil: ${tx.billCode}\nPembayar: ${tx.namaPembayar}\nJumlah: RM${tx.jumlahKasar}\nRef Bank: ${tx.transaksiBankId || 'FPX-OK'}`)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium transition-all"
                            >
                              Lihat Resit
                            </button>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SETTLEMENT BATCHES & PAYOUTS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'SETTLEMENTS' && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Kelompok Pelepasan Dana (*Payout Batches*)</h3>
              <p className="text-xs text-slate-400">Rekod pemindahan dana bersih dari akaun kutipan Verttere ke akaun bank operasi rasmi koperasi.</p>
            </div>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={pendingTransactions.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              Jana Kelompok Payout Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlements.map(b => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 relative">
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {b.batchNo}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{b.namaKoperasi}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{b.noAkaunBankKoperasi}</p>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pindahan Selesai
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Kutipan Kasar</span>
                    <div className="text-xs font-bold text-white">{formatRM(b.jumlahKasar)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Caj Verttere</span>
                    <div className="text-xs font-bold text-indigo-300">- {formatRM(b.jumlahCajVerttere)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase">Bersih Dipindah</span>
                    <div className="text-xs font-bold text-emerald-400">{formatRM(b.jumlahBersihPindahan)}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Tempoh Kutipan:</span>
                    <span className="text-slate-200 font-mono">{b.tarikhMula} hingga {b.tarikhTamat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Transaksi:</span>
                    <span className="text-slate-200 font-bold">{b.jumlahTransaksi} transaksi FPX</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No Rujukan Pindahan EFT:</span>
                    <span className="text-indigo-300 font-mono">{b.noRujukanBank || 'MBB-EFT-AUTO'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedBatchForPrint(b)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-400" />
                    Cetak Penyata Settlement A4
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SECUREPAY PAYMENT SIMULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-800 uppercase tracking-wider">
                Simulasi Gateway Sandbox
              </span>
              <h3 className="text-lg font-black text-white mt-1">Uji Aliran Bayaran Ahli ke Gateway</h3>
              <p className="text-xs text-slate-400">Pilih penyedia (SecurePay atau ToyyibPay), anggota, dan jumlah bayaran untuk menguji pengiraan caj dan pesanan.</p>
            </div>

            <form onSubmit={handleSimulateCreateBill} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Penyedia Gerbang (Gateway Provider):</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSimProvider('SECUREPAY')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      simProvider === 'SECUREPAY'
                        ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🔵 SecurePay (FPX, QR & Kad)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimProvider('TOYYIBPAY')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      simProvider === 'TOYYIBPAY'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🟢 ToyyibPay (FPX Direct)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Kategori Pembayaran:</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    { id: 'TAMBAH_SYER', label: 'Tambah Syer Ahli' },
                    { id: 'POS_STORE', label: 'Belian POS Kedai' },
                    { id: 'SIMPANAN_KHAS', label: 'Deposit Simpanan' },
                    { id: 'BAYARAN_PEMBIAYAAN', label: 'Bayar Pinjaman' },
                  ].map(k => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setSimKategori(k.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        simKategori === k.id
                          ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Anggota Koperasi:</label>
                <select
                  value={simSelectedAhli}
                  onChange={e => {
                    setSimSelectedAhli(e.target.value);
                    const found = ahliList.find(a => a.noAhli === e.target.value);
                    if (found) {
                      setSimNama(found.nama);
                      setSimNoKP(found.noKp);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {ahliList.slice(0, 15).map(a => (
                    <option key={a.id} value={a.noAhli}>{a.noAhli} - {a.nama} ({formatRM(a.modalSyer)} Syer)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Jumlah Bayaran (RM):</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={simJumlah}
                    onChange={e => setSimJumlah(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">No Telefon Pembayar:</label>
                  <input
                    type="text"
                    value={simTelefon}
                    onChange={e => setSimTelefon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Instant Fee Preview */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Jumlah Bayaran Kasar:</span>
                  <span className="text-white font-bold">{formatRM(simJumlah)}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>Caj Platform Verttere (RM1.00 + 0.5%):</span>
                  <span>- {formatRM(1.00 + (simJumlah * 0.005))}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                  <span>Baki Bersih Diterima Koperasi:</span>
                  <span>{formatRM(simJumlah - (1.00 + (simJumlah * 0.005)))}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                {isProcessing ? 'Menjana Pesanan...' : 'Cipta Pesanan Pembayaran SecurePay'}
              </button>

            </form>
          </div>

          {/* Generated Bill Simulator Screen */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 uppercase tracking-wider">
                Paparan Gerbang Bayaran SecurePay
              </span>
              <h3 className="text-lg font-black text-white mt-1">Status Pesanan SecurePay</h3>
              <p className="text-xs text-slate-400">Hasil panggilan API pendaftaran pesanan dari SecurePay Malaysia server.</p>

              {simGeneratedBill ? (
                <div className="mt-5 space-y-4 bg-slate-950 p-5 rounded-2xl border border-indigo-900/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-indigo-400 font-bold">{simGeneratedBill.billCode}</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-800">
                      Menunggu Bayaran (FPX / Kad / QR)
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-xs text-slate-400">Jumlah Perlu Dibayar</div>
                    <div className="text-3xl font-black text-white font-mono mt-1">{formatRM(simGeneratedBill.transaction.jumlahKasar)}</div>
                    <div className="text-xs text-slate-500 mt-1">{simGeneratedBill.transaction.perihal}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSimulatePaymentCallback(simGeneratedBill.billCode, 1)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg"
                    >
                      <Check className="w-4 h-4" /> Simulasi Bayaran Berjaya (Success)
                    </button>
                    <button
                      onClick={() => handleSimulatePaymentCallback(simGeneratedBill.billCode, 0)}
                      className="px-3 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800 transition-all"
                    >
                      Simulasi Gagal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-12 text-center py-12 text-slate-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="text-xs">Sila isi borang di sebelah untuk menjana pautan bayaran SecurePay.</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sistem ini mematuhi spesifikasi SecurePay API v1 (FPX Online Banking, DuitNow QR & Kad).
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CONFIGURATION & SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'SETTINGS' && (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-800 uppercase tracking-wider">
              Tetapan Gerbang Pembayaran & Escrow Verttere
            </span>
            <h3 className="text-lg font-black text-white mt-1">Konfigurasi Gateway (SecurePay & ToyyibPay)</h3>
            <p className="text-xs text-slate-400">
              Konfigurasi kunci API rasmi bagi SecurePay dan ToyyibPay untuk menerima bayaran FPX, Kad & DuitNow QR serta formula pengiraan caj platform.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            
            {/* Active Provider Selector */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-200">Penyedia Gerbang Aktif (Payment Gateway Provider):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'BOTH', label: '🟣 Kedua-duanya (SecurePay + ToyyibPay)', desc: 'Beri pilihan kepada pembayar/anggota' },
                  { id: 'SECUREPAY', label: '🔵 SecurePay Malaysia Sahaja', desc: 'FPX, DuitNow QR & Kad' },
                  { id: 'TOYYIBPAY', label: '🟢 ToyyibPay FPX Sahaja', desc: 'Perbankan Internet FPX Direct' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditConfig({ ...editConfig, activeProvider: p.id as any, provider: p.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      (editConfig.activeProvider || editConfig.provider) === p.id
                        ? 'bg-indigo-950 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: SecurePay Configuration */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-indigo-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-black text-indigo-200 uppercase tracking-wider">
                  1. Kredensial SecurePay Malaysia (securepay.my)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">Diperoleh daripada Dashboard SecurePay Merchant Settings.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Merchant UID (UUID):</label>
                  <input
                    type="text"
                    placeholder="7f4a9b2c-8821-49fa-91b3-..."
                    value={editConfig.securePayMerchantUid || editConfig.merchantUid || ''}
                    onChange={e => setEditConfig({ ...editConfig, securePayMerchantUid: e.target.value, merchantUid: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Authorization Token:</label>
                  <input
                    type="password"
                    placeholder="sec_auth_..."
                    value={editConfig.securePayAuthToken || editConfig.authToken || ''}
                    onChange={e => setEditConfig({ ...editConfig, securePayAuthToken: e.target.value, authToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Checksum Token (SHA256):</label>
                  <input
                    type="password"
                    placeholder="chk_..."
                    value={editConfig.securePayChecksumToken || editConfig.checksumToken || ''}
                    onChange={e => setEditConfig({ ...editConfig, securePayChecksumToken: e.target.value, checksumToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: ToyyibPay Configuration */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-black text-emerald-200 uppercase tracking-wider">
                  2. Kredensial ToyyibPay FPX (toyyibpay.com)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">Diperoleh daripada Dashboard ToyyibPay &gt; Settings &gt; API &amp; Category.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">User Secret Key (ToyyibPay):</label>
                  <input
                    type="password"
                    placeholder="sec_toyyib_..."
                    value={editConfig.toyyibUserSecretKey || editConfig.userSecretKey || ''}
                    onChange={e => setEditConfig({ ...editConfig, toyyibUserSecretKey: e.target.value, userSecretKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Category Code (ToyyibPay):</label>
                  <input
                    type="text"
                    placeholder="cat_toyyib_..."
                    value={editConfig.toyyibCategoryCode || editConfig.categoryCode || ''}
                    onChange={e => setEditConfig({ ...editConfig, toyyibCategoryCode: e.target.value, categoryCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Fee Model & Escrow */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                3. Model Caj Platform Verttere Solutions
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Struktur Caj Platform:</label>
                  <select
                    value={editConfig.platformFeeType}
                    onChange={e => setEditConfig({ ...editConfig, platformFeeType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HYBRID">Hibrid (Tetap RM + Peratusan %)</option>
                    <option value="FIXED">Caj Tetap Sahaja (RM)</option>
                    <option value="PERCENTAGE">Peratusan Sahaja (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Caj Tetap Gateway (RM):</label>
                  <input
                    type="number"
                    step="0.10"
                    value={editConfig.fixedFeeRM}
                    onChange={e => setEditConfig({ ...editConfig, fixedFeeRM: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Caj Peratusan Platform (%):</label>
                  <input
                    type="number"
                    step="0.10"
                    value={editConfig.percentageFee}
                    onChange={e => setEditConfig({ ...editConfig, percentageFee: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Fee Absorption Strategy & Auto-Markup */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-teal-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <h4 className="text-xs font-black text-teal-300 uppercase tracking-wider">
                    4. Strategi Penyerapan Caj &amp; Auto-Markup Harga Jualan
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 bg-teal-950 border border-teal-700 text-teal-300 text-[10px] font-bold rounded-full">
                  Konfigurasi Pintar
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih sama ada koperasi menyerap caj platform (dengan pilihan auto-markup pada harga katalog POS) atau mengenakan caj tambahan terus kepada pembeli semasa checkout.
              </p>

              {/* Strategy Selector Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditConfig({ ...editConfig, feeChargeStrategy: 'ABSORB_MARKUP' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    (editConfig.feeChargeStrategy || 'ABSORB_MARKUP') === 'ABSORB_MARKUP'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      🟢 Pilihan 1: Serap Caj / Auto-Markup POS
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Disyorkan</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Pembeli bayar harga tepat tanpa sebarang caj pemprosesan tambahan. Koperasi boleh mengaktifkan <strong>Auto-Markup %</strong> pada harga katalog jualan POS untuk menampung kos gateway.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEditConfig({ ...editConfig, feeChargeStrategy: 'PASSTHROUGH_SURCHARGE' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    editConfig.feeChargeStrategy === 'PASSTHROUGH_SURCHARGE'
                      ? 'bg-blue-950/70 border-blue-500 text-blue-100 shadow-md shadow-blue-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      🔵 Pilihan 2: Caj Tambahan Telus (+Surcharge)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Caj gateway (RM1.00 + 0.5%) ditambah secara telus pada jumlah akhir di skrin checkout SecurePay/ToyyibPay. Koperasi menerima 100% jumlah harga asal bersih.
                  </p>
                </button>
              </div>

              {/* Auto-Markup Parameter Inputs (Active when ABSORB_MARKUP selected) */}
              {(editConfig.feeChargeStrategy || 'ABSORB_MARKUP') === 'ABSORB_MARKUP' && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-800/40 space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      ⚙️ Parameter Auto-Markup Harga Jualan POS:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Contoh: 1.5% markup pada RM10.00 = RM10.15
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Kadar Auto-Markup (%):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          max="20"
                          value={editConfig.autoMarkupPercentage ?? 1.5}
                          onChange={e => setEditConfig({ ...editConfig, autoMarkupPercentage: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs font-bold text-emerald-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Skop Aplikasi Auto-Markup:</label>
                      <select
                        value={editConfig.markupApplyTo || 'ONLINE_PAYMENT_ONLY'}
                        onChange={e => setEditConfig({ ...editConfig, markupApplyTo: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ONLINE_PAYMENT_ONLY">Hanya Semasa Bayaran Online (SecurePay / ToyyibPay)</option>
                        <option value="ALL_PRODUCTS">Semua Produk &amp; Kaedah Bayaran POS (Katalog Kedai)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Calculation Simulation Breakdown Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>📊 Simulasi Contoh Kiraan Transaksi Jualan (RM 100.00):</span>
                  <span className="text-[10px] text-teal-400 font-mono">
                    Mod Semasa: {editConfig.feeChargeStrategy === 'PASSTHROUGH_SURCHARGE' ? 'Caj Tambahan Pembeli' : `Auto-Markup (+${editConfig.autoMarkupPercentage || 1.5}%)`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Harga Asal Produk</div>
                    <div className="text-sm font-bold text-white mt-0.5">RM 100.00</div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Dibayar Pembeli</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {editConfig.feeChargeStrategy === 'PASSTHROUGH_SURCHARGE' 
                        ? 'RM 101.50' 
                        : `RM ${(100 * (1 + (editConfig.autoMarkupPercentage || 1.5)/100)).toFixed(2)}`}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Caj Platform Verttere</div>
                    <div className="text-sm font-bold text-indigo-400 mt-0.5">RM 1.50</div>
                  </div>

                  <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-800">
                    <div className="text-[10px] text-emerald-300 font-bold">Koperasi Terima Bersih</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      {editConfig.feeChargeStrategy === 'PASSTHROUGH_SURCHARGE' 
                        ? 'RM 100.00' 
                        : `RM ${(100 * (1 + (editConfig.autoMarkupPercentage || 1.5)/100) - 1.50).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Escrow Bank Account */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                5. Maklumat Akaun Bank Transit (Escrow Verttere)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nama Pemegang Akaun Platform:</label>
                  <input
                    type="text"
                    value={editConfig.namaPlatform}
                    onChange={e => setEditConfig({ ...editConfig, namaPlatform: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">No Akaun Bank Transit:</label>
                  <input
                    type="text"
                    value={editConfig.akaunBankPlatform}
                    onChange={e => setEditConfig({ ...editConfig, akaunBankPlatform: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="sandboxToggle"
                checked={editConfig.isSandbox}
                onChange={e => setEditConfig({ ...editConfig, isSandbox: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
              />
              <label htmlFor="sandboxToggle" className="text-xs text-slate-300 cursor-pointer">
                Aktifkan **Sandbox Mode** (Untuk ujian tanpa pemotongan caj bank sebenar)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Simpan Semua Tetapan Gateway
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RELEASE PAYOUT TO CO-OP */}
      {/* ------------------------------------------------------------- */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
                Pelepasan Dana Payout ke Koperasi
              </h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Sistem akan mengumpulkan <span className="font-bold text-white">{pendingTransactions.length} transaksi</span> SecurePay yang telah berjaya dan melepaskan dana bersih ke akaun bank operasi rasmi koperasi.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Jumlah Kasar Dikutip:</span>
                <span className="text-white font-bold">{formatRM(pendingTransactions.reduce((a, t) => a + t.jumlahKasar, 0))}</span>
              </div>
              <div className="flex justify-between text-indigo-300">
                <span>Fee Platform Verttere:</span>
                <span>- {formatRM(pendingTransactions.reduce((a, t) => a + t.cajPlatformVerttere, 0))}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-2 text-sm">
                <span>Bersih Dipindahkan:</span>
                <span>{formatRM(totalBakiPendingSettlement)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div><strong>Penerima:</strong> Koperasi Warga Berdaya Malaysia Berhad</div>
              <div><strong>Akaun Bank:</strong> 8602-9918-2019 (CIMB Islamic)</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePayoutBatch}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isProcessing ? 'Memproses...' : 'Sahkan & Pindah'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PRINTABLE SETTLEMENT STATEMENT A4 */}
      {/* ------------------------------------------------------------- */}
      {selectedBatchForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6 my-8 font-sans">
            
            {/* Header Statement */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">VERTTERE SOLUTIONS SDN BHD</h2>
                <p className="text-[10px] text-slate-600">No Pendaftaran: 202301048192 (FinTech Payment Platform)</p>
                <p className="text-[10px] text-slate-600">Presint Diplomatik, 62050 Putrajaya, Malaysia</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300">
                  {selectedBatchForPrint.batchNo}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Tarikh: {selectedBatchForPrint.tarikhPindahan?.slice(0, 10)}</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-base font-bold uppercase tracking-wide text-slate-900">
                Penyata Pelepasan Dana & Baucar Settlement (SecurePay Gateway)
              </h3>
              <p className="text-xs text-slate-600">Pindahan Wang Bersih Transit ke Akaun Bank Operasi Koperasi</p>
            </div>

            {/* Beneficiary Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Nama Penerima / Koperasi:</div>
                <div className="font-bold text-slate-900">{selectedBatchForPrint.namaKoperasi}</div>
                <div className="text-slate-600 mt-1">Kod: {selectedBatchForPrint.kodKoperasi}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Maklumat Akaun Bank Penerima:</div>
                <div className="font-bold text-slate-900">{selectedBatchForPrint.namaBankKoperasi}</div>
                <div className="font-mono text-slate-800">{selectedBatchForPrint.noAkaunBankKoperasi}</div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-2 text-left">Perincian Pindahan</th>
                  <th className="p-2 text-center">Bil Transaksi</th>
                  <th className="p-2 text-right">Jumlah (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2">Kutipan Kasar Melalui Gerbang SecurePay</td>
                  <td className="p-2 text-center">{selectedBatchForPrint.jumlahTransaksi}</td>
                  <td className="p-2 text-right font-bold">{formatRM(selectedBatchForPrint.jumlahKasar)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-rose-600">Tolak: Caj Pemprosesan Gateway & Platform Verttere</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-right text-rose-600">- {formatRM(selectedBatchForPrint.jumlahCajVerttere)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-2.5">JUMLAH BERSIH DILEPASKAN / DIPINDAHKAN (EFT)</td>
                  <td className="p-2.5 text-center">{selectedBatchForPrint.jumlahTransaksi}</td>
                  <td className="p-2.5 text-right text-emerald-700 text-sm">{formatRM(selectedBatchForPrint.jumlahBersihPindahan)}</td>
                </tr>
              </tbody>
            </table>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
              <div>
                <div className="border-b border-slate-400 h-10 w-40 mx-auto" />
                <div className="font-bold mt-1.5">Pengurus Escrow Platform</div>
                <div className="text-[10px] text-slate-500">Verttere Solutions Sdn Bhd</div>
              </div>
              <div>
                <div className="border-b border-slate-400 h-10 w-40 mx-auto" />
                <div className="font-bold mt-1.5">Bendahari / Pegawai Kewangan</div>
                <div className="text-[10px] text-slate-500">{selectedBatchForPrint.namaKoperasi}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedBatchForPrint(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak Penyata
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
