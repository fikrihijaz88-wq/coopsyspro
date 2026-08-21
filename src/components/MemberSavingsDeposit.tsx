import React, { useState, useMemo } from 'react';
import { 
  AkaunSimpananDeposit, 
  JenisAkaunSimpanan, 
  StatusDeposit, 
  TransaksiSimpanan, 
  Ahli 
} from '../types';
import { 
  PiggyBank, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Award, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCw, 
  Sparkles,
  Calculator,
  Download
} from 'lucide-react';

interface MemberSavingsDepositProps {
  savingsList: AkaunSimpananDeposit[];
  ahliList: Ahli[];
  onAddSavingsAccount: (account: AkaunSimpananDeposit) => void;
  onUpdateSavingsAccount: (id: string, updates: Partial<AkaunSimpananDeposit>) => void;
  onAddTransaction: (accountId: string, tx: TransaksiSimpanan) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const MemberSavingsDeposit: React.FC<MemberSavingsDepositProps> = ({
  savingsList,
  ahliList,
  onAddSavingsAccount,
  onUpdateSavingsAccount,
  onAddTransaction,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'SENARAI_AKAUN' | 'TRANSAKSI_SIMPANAN' | 'KIRAAN_HIBAH' | 'SIJIL_RASMI'>('SENARAI_AKAUN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedCertificate, setSelectedCertificate] = useState<AkaunSimpananDeposit | null>(
    savingsList.find(s => s.jenis.startsWith('DEPOSIT_TETAP')) || savingsList[0] || null
  );

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTxModal, setShowTxModal] = useState<boolean>(false);
  const [selectedAccountForTx, setSelectedAccountForTx] = useState<AkaunSimpananDeposit | null>(null);

  // New Account Form State
  const [selectedNoAhli, setSelectedNoAhli] = useState<string>(ahliList[0]?.noAhli || '');
  const [formJenis, setFormJenis] = useState<JenisAkaunSimpanan>('DEPOSIT_TETAP_12B');
  const [formJumlah, setFormJumlah] = useState<number>(10000);
  const [formKadarHibah, setFormKadarHibah] = useState<number>(5.5);
  const [formTarikhMula, setFormTarikhMula] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formAutoRollover, setFormAutoRollover] = useState<boolean>(true);

  // Transaction Form State
  const [txJenis, setTxJenis] = useState<'DEPOSIT' | 'PENGELUARAN'>('DEPOSIT');
  const [txJumlah, setTxJumlah] = useState<number>(1000);
  const [txRujukan, setTxRujukan] = useState<string>(`REF-${Date.now().toString().slice(-6)}`);
  const [txCatatan, setTxCatatan] = useState<string>('Simpanan sukarela tunai/bank');

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // Aggregates
  const totalSimpananKhas = useMemo(() => 
    savingsList.filter(s => s.jenis === 'SIMPANAN_KHAS' && s.status === 'AKTIF').reduce((sum, s) => sum + s.bakiSemasa, 0),
    [savingsList]
  );

  const totalDepositTetap = useMemo(() => 
    savingsList.filter(s => s.jenis.startsWith('DEPOSIT_TETAP') && s.status === 'AKTIF').reduce((sum, s) => sum + s.bakiSemasa, 0),
    [savingsList]
  );

  const totalAnggaranHibah = useMemo(() => 
    savingsList.filter(s => s.status === 'AKTIF').reduce((sum, s) => sum + (s.anggaranPulanganHibah || 0), 0),
    [savingsList]
  );

  const totalAkaunAktif = useMemo(() => 
    savingsList.filter(s => s.status === 'AKTIF').length,
    [savingsList]
  );

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return savingsList.filter(s => {
      const matchQuery = !searchQuery ||
        s.namaAhli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.noAhli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.noSijilAkaun.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedTypeFilter === 'ALL' || s.jenis === selectedTypeFilter;

      return matchQuery && matchType;
    });
  }, [savingsList, searchQuery, selectedTypeFilter]);

  // Form Submit: Add Account
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = ahliList.find(a => a.noAhli === selectedNoAhli);
    if (!member || formJumlah <= 0) return;

    const isFD = formJenis.startsWith('DEPOSIT_TETAP');
    const prefix = isFD ? 'FD' : 'SK';
    const noSijil = `${prefix}-${new Date().getFullYear()}/${String(savingsList.length + 1).padStart(3, '0')}`;

    let months = 0;
    if (formJenis === 'DEPOSIT_TETAP_6B') months = 6;
    else if (formJenis === 'DEPOSIT_TETAP_12B') months = 12;
    else if (formJenis === 'DEPOSIT_TETAP_24B') months = 24;

    const startDate = new Date(formTarikhMula);
    let matangDate: string | undefined = undefined;
    let pulanganHibah: number | undefined = undefined;

    if (months > 0) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
      matangDate = endDate.toISOString().split('T')[0];
      pulanganHibah = Math.round((Number(formJumlah) * (Number(formKadarHibah) / 100) * (months / 12)) * 100) / 100;
    }

    const newAccount: AkaunSimpananDeposit = {
      id: `SD-${Date.now()}`,
      noSijilAkaun: noSijil,
      noAhli: member.noAhli,
      namaAhli: member.nama,
      noKP: member.noKp,
      jenis: formJenis,
      prinsipalAsal: Number(formJumlah),
      bakiSemasa: Number(formJumlah),
      kadarHibahTahunanPeratus: Number(formKadarHibah),
      tarikhMula: formTarikhMula,
      tarikhMatang: matangDate,
      anggaranPulanganHibah: pulanganHibah,
      status: 'AKTIF',
      pembaharuanAutomatik: formAutoRollover,
      sejarahTransaksi: [
        {
          id: `TX-SD-${Date.now()}`,
          tarikh: formTarikhMula,
          jenisTransaksi: 'DEPOSIT',
          jumlah: Number(formJumlah),
          bakiSelepas: Number(formJumlah),
          noRujukan: `REF-INIT-${Date.now().toString().slice(-4)}`,
          catatan: isFD ? `Penempatan Deposit Tetap ${months} Bulan` : 'Pembukaan Akaun Simpanan Khas'
        }
      ]
    };

    onAddSavingsAccount(newAccount);
    setShowAddModal(false);
    setSelectedCertificate(newAccount);
  };

  // Form Submit: Transaction
  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForTx || txJumlah <= 0) return;

    const currentBalance = selectedAccountForTx.bakiSemasa;
    if (txJenis === 'PENGELUARAN' && txJumlah > currentBalance) {
      alert('Baki simpanan tidak mencukupi untuk pengeluaran ini.');
      return;
    }

    const newBalance = txJenis === 'DEPOSIT' ? currentBalance + Number(txJumlah) : currentBalance - Number(txJumlah);

    const newTx: TransaksiSimpanan = {
      id: `TX-SD-${Date.now()}`,
      tarikh: new Date().toISOString().split('T')[0],
      jenisTransaksi: txJenis,
      jumlah: Number(txJumlah),
      bakiSelepas: newBalance,
      noRujukan: txRujukan,
      catatan: txCatatan
    };

    onAddTransaction(selectedAccountForTx.id, newTx);
    setShowTxModal(false);
    setSelectedAccountForTx(null);
  };

  const getJenisLabel = (jenis: JenisAkaunSimpanan) => {
    switch (jenis) {
      case 'SIMPANAN_KHAS': return 'Simpanan Khas Sukarela';
      case 'DEPOSIT_TETAP_6B': return 'Deposit Tetap (6 Bulan)';
      case 'DEPOSIT_TETAP_12B': return 'Deposit Tetap (12 Bulan)';
      case 'DEPOSIT_TETAP_24B': return 'Deposit Tetap (24 Bulan)';
      default: return 'Simpanan Khas';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Skim Pelaburan & Simpanan Patuh Syariah
            </span>
            <span className="text-xs text-slate-400">Akta Koperasi 1993 • Seksyen 50</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-indigo-400" /> Simpanan Khas & Deposit Tetap Anggota
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengurusan akaun simpanan sukarela, sijil deposit tetap bertempoh, pengiraan pulangan hibah dan cetakan sijil rasmi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Buka Akaun / Sijil Baharu
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab('SIJIL_RASMI');
              setTimeout(() => window.print(), 200);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Sijil Deposit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Simpanan Khas */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Simpanan Khas Sukarela</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            {formatRM(totalSimpananKhas)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Akaun Liabiliti Lejar:</span>
            <span className="text-indigo-400 font-mono">Kod 2050</span>
          </div>
        </div>

        {/* Card 2: Deposit Tetap Bertempoh */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Deposit Tetap Bertempoh</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {formatRM(totalDepositTetap)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Akaun Liabiliti Lejar:</span>
            <span className="text-emerald-400 font-mono">Kod 2060</span>
          </div>
        </div>

        {/* Card 3: Anggaran Hibah Matang */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Akruan Pulangan Hibah</span>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {formatRM(totalAnggaranHibah)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Kadar Pulangan:</span>
            <span className="text-amber-400 font-semibold">3.5% - 6.0% p.a.</span>
          </div>
        </div>

        {/* Card 4: Bilangan Sijil */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Jumlah Sijil Berdaftar</span>
            <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-xl border border-cyan-800/60">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300">
            {totalAkaunAktif} Sijil Aktif
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Pematuhan Statutori:</span>
            <span className="text-cyan-400 font-semibold">100% Sah Disahkan</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('SENARAI_AKAUN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'SENARAI_AKAUN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Senarai Akaun & Sijil Deposit ({savingsList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('TRANSAKSI_SIMPANAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'TRANSAKSI_SIMPANAN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Transaksi Simpanan Khas (Deposit / Keluar)
        </button>

        <button
          onClick={() => setActiveSubTab('KIRAAN_HIBAH')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'KIRAAN_HIBAH' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" /> Enjin Simulasi & Kiraan Hibah Matang
        </button>

        <button
          onClick={() => setActiveSubTab('SIJIL_RASMI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'SIJIL_RASMI' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Sijil Deposit Tetap Rasmi (Printable Template)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SENARAI AKAUN & SIJIL DEPOSIT */}
      {/* ========================================================================= */}
      {activeSubTab === 'SENARAI_AKAUN' && (
        <div className="space-y-4">
          
          {/* Search & Filter */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari no sijil, nama anggota, no ahli..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Jenis Akaun</option>
                <option value="SIMPANAN_KHAS">Simpanan Khas Sukarela</option>
                <option value="DEPOSIT_TETAP_6B">Deposit Tetap (6 Bulan)</option>
                <option value="DEPOSIT_TETAP_12B">Deposit Tetap (12 Bulan)</option>
                <option value="DEPOSIT_TETAP_24B">Deposit Tetap (24 Bulan)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((acc) => {
              const isFD = acc.jenis.startsWith('DEPOSIT_TETAP');

              return (
                <div 
                  key={acc.id} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-lg space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          {acc.noSijilAkaun}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFD ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {getJenisLabel(acc.jenis)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {acc.namaAhli}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">{acc.noAhli} • KP: {acc.noKP}</span>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                      {isFD ? <Award className="w-4 h-4 text-emerald-400" /> : <PiggyBank className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </div>

                  {/* Account Numbers */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Baki Semasa:</span>
                      <div className="font-bold text-lg text-emerald-400">{formatRM(acc.bakiSemasa)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Kadar Hibah Tahunan:</span>
                      <div className="font-bold text-amber-300">{acc.kadarHibahTahunanPeratus}% p.a.</div>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px]">Tarikh Mula:</span>
                      <div className="font-mono text-slate-300">{acc.tarikhMula}</div>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px]">{isFD ? 'Tarikh Matang:' : 'Status:'}</span>
                      <div className="font-mono text-indigo-300 font-bold">{isFD ? acc.tarikhMatang : 'BERTERUSAN'}</div>
                    </div>
                  </div>

                  {isFD && acc.anggaranPulanganHibah && (
                    <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-amber-300 text-[11px]">Anggaran Hibah Matang:</span>
                      <strong className="text-amber-300 font-mono font-black">{formatRM(acc.anggaranPulanganHibah)}</strong>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedCertificate(acc);
                        setActiveSubTab('SIJIL_RASMI');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" /> Lihat Sijil
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAccountForTx(acc);
                        setShowTxModal(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <RotateCw className="w-3 h-3" /> Transaksi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TRANSAKSI SIMPANAN KHAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'TRANSAKSI_SIMPANAN' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" /> Rekod Transaksi Masuk / Keluar Simpanan Khas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Buku tunai simpanan sukarela anggota untuk simpanan kecemasan, pelaburan atau pengeluaran segera.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Tarikh</th>
                    <th className="px-4 py-3">No. Sijil & Anggota</th>
                    <th className="px-4 py-3">Jenis Transaksi</th>
                    <th className="px-4 py-3 text-right">Jumlah (RM)</th>
                    <th className="px-4 py-3 text-right">Baki Selepas (RM)</th>
                    <th className="px-4 py-3">No. Rujukan</th>
                    <th className="px-4 py-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {savingsList.flatMap(acc => 
                    (acc.sejarahTransaksi || []).map(tx => ({ ...tx, acc }))
                  ).sort((a, b) => b.tarikh.localeCompare(a.tarikh)).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850 font-sans">
                      <td className="px-4 py-3 text-slate-300 font-mono">{item.tarikh}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{item.acc.namaAhli}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">{item.acc.noSijilAkaun}</div>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.jenisTransaksi === 'DEPOSIT' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {item.jenisTransaksi === 'DEPOSIT' ? 'SIMPANAN MASUK' : 'PENGELUARAN'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        item.jenisTransaksi === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.jenisTransaksi === 'DEPOSIT' ? '+' : '-'}{formatRM(item.jumlah)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        {formatRM(item.bakiSelepas)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{item.noRujukan}</td>
                      <td className="px-4 py-3 text-slate-300">{item.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: ENJIN SIMULASI & KIRAAN HIBAH */}
      {/* ========================================================================= */}
      {activeSubTab === 'KIRAAN_HIBAH' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Simulator Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-amber-400" /> Kalkulator Pulangan Hibah
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jumlah Deposit Prinsipal (RM)</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={formJumlah}
                  onChange={(e) => setFormJumlah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tempoh Penempatan</label>
                <select
                  value={formJenis}
                  onChange={(e) => {
                    const j = e.target.value as JenisAkaunSimpanan;
                    setFormJenis(j);
                    if (j === 'DEPOSIT_TETAP_6B') setFormKadarHibah(4.5);
                    else if (j === 'DEPOSIT_TETAP_12B') setFormKadarHibah(5.5);
                    else if (j === 'DEPOSIT_TETAP_24B') setFormKadarHibah(6.0);
                    else setFormKadarHibah(3.5);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="DEPOSIT_TETAP_6B">Deposit Tetap 6 Bulan (4.5% p.a.)</option>
                  <option value="DEPOSIT_TETAP_12B">Deposit Tetap 12 Bulan (5.5% p.a.)</option>
                  <option value="DEPOSIT_TETAP_24B">Deposit Tetap 24 Bulan (6.0% p.a.)</option>
                  <option value="SIMPANAN_KHAS">Simpanan Khas Sukarela (3.5% p.a.)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kadar Pulangan Hibah (% Tahunan)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formKadarHibah}
                  onChange={(e) => setFormKadarHibah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-300 focus:outline-none"
                />
              </div>

              {/* Simulation Result */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mt-4">
                <div className="flex justify-between text-slate-400">
                  <span>Prinsipal:</span>
                  <strong className="text-white font-mono">{formatRM(formJumlah)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kadar Hibah:</span>
                  <strong className="text-amber-300 font-mono">{formKadarHibah}%</strong>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between">
                  <span className="font-bold text-white">Anggaran Pulangan:</span>
                  <strong className="text-emerald-400 font-mono font-black text-sm">
                    {formatRM(
                      formJenis === 'DEPOSIT_TETAP_6B' ? formJumlah * (formKadarHibah / 100) * 0.5 :
                      formJenis === 'DEPOSIT_TETAP_12B' ? formJumlah * (formKadarHibah / 100) * 1.0 :
                      formJenis === 'DEPOSIT_TETAP_24B' ? formJumlah * (formKadarHibah / 100) * 2.0 :
                      formJumlah * (formKadarHibah / 100)
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Expected Maturity */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Jadual Kematangan & Akruan Liabiliti Koperasi
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5">No. Sijil</th>
                    <th className="px-3 py-2.5">Anggota</th>
                    <th className="px-3 py-2.5 text-right">Prinsipal (RM)</th>
                    <th className="px-3 py-2.5 text-center">Tarikh Matang</th>
                    <th className="px-3 py-2.5 text-right">Hibah Matang (RM)</th>
                    <th className="px-3 py-2.5 text-right">Jumlah Pulangan (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {savingsList.filter(s => s.status === 'AKTIF').map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-850 font-sans">
                      <td className="px-3 py-2.5 font-mono text-indigo-300 font-bold">{acc.noSijilAkaun}</td>
                      <td className="px-3 py-2.5 font-bold text-white">{acc.namaAhli}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{formatRM(acc.bakiSemasa)}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-amber-300">{acc.tarikhMatang || 'N/A'}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-emerald-400">{formatRM(acc.anggaranPulanganHibah)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-white">
                        {formatRM(acc.bakiSemasa + (acc.anggaranPulanganHibah || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SIJIL DEPOSIT TETAP RASMI (PRINTABLE TEMPLATE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'SIJIL_RASMI' && selectedCertificate && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Certificate Selector Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Pilih Sijil Deposit:</span>
              <select
                value={selectedCertificate.id}
                onChange={(e) => {
                  const s = savingsList.find(item => item.id === e.target.value);
                  if (s) setSelectedCertificate(s);
                }}
                className="bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 rounded-xl focus:outline-none"
              >
                {savingsList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.noSijilAkaun} - {s.namaAhli} ({formatRM(s.bakiSemasa)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              <Printer className="w-4 h-4" /> Cetak Sijil A4
            </button>
          </div>

          {/* Sijil Template Frame */}
          <div className="border-4 border-double border-amber-600/80 p-8 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 print:bg-white print:border-black print:p-8 space-y-6 text-center">
            
            {/* Crest & Co-op Name */}
            <div className="space-y-1">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center text-amber-400 print:text-black">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-xs font-bold tracking-widest text-amber-400 uppercase print:text-gray-800">
                SURUHANJAYA KOPERASI MALAYSIA (SKM)
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-wider print:text-black">
                KOPERASI WARGA BERDAYA MALAYSIA BERHAD
              </h1>
              <p className="text-xs text-slate-400 font-mono print:text-gray-600">
                No. Pendaftaran SKM: SKM-W-4921/2018
              </p>
            </div>

            <div className="py-2">
              <span className="bg-amber-950 text-amber-300 border border-amber-800 font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest print:bg-gray-200 print:text-black">
                SIJIL DEPOSIT TETAP / PELABURAN KHAS ANGGOTA
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed print:text-black">
              Dengan ini diperakui bahawa penama di bawah adalah pemegang berdaftar bagi Sijil Deposit Tetap Bertempoh Koperasi Warga Berdaya Malaysia Berhad mengikut peruntukan Undang-Undang Kecil Koperasi:
            </p>

            {/* Certificate Details */}
            <div className="max-w-lg mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-2.5 print:bg-gray-100 print:border-black print:text-black">
              <div className="flex justify-between border-b border-slate-800/80 pb-2 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">Nombor Sijil:</span>
                <strong className="font-mono text-indigo-300 print:text-black font-bold">{selectedCertificate.noSijilAkaun}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">Nama Pemegang:</span>
                <strong className="text-white print:text-black font-bold">{selectedCertificate.namaAhli}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">No. Kad Pengenalan & No. Ahli:</span>
                <strong className="font-mono text-slate-300 print:text-black">{selectedCertificate.noKP} ({selectedCertificate.noAhli})</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">Jumlah Prinsipal Deposit:</span>
                <strong className="font-mono text-emerald-400 print:text-black font-black text-sm">{formatRM(selectedCertificate.bakiSemasa)}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">Kadar Hibah & Tempoh:</span>
                <strong className="text-amber-300 print:text-black font-bold">{selectedCertificate.kadarHibahTahunanPeratus}% p.a. • {getJenisLabel(selectedCertificate.jenis)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Tarikh Penempatan & Matang:</span>
                <strong className="font-mono text-slate-300 print:text-black">{selectedCertificate.tarikhMula} hingga {selectedCertificate.tarikhMatang || 'Berterusan'}</strong>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-8 max-w-lg mx-auto text-xs text-center">
              <div className="space-y-6">
                <div className="border-b border-slate-600 print:border-black w-40 mx-auto pb-1 font-bold text-white print:text-black">
                  Tan Kah Hock
                </div>
                <div className="text-slate-400 text-[11px] print:text-gray-600">Bendahari Koperasi</div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-slate-600 print:border-black w-40 mx-auto pb-1 font-bold text-white print:text-black">
                  Dato' Ahmad Razali
                </div>
                <div className="text-slate-400 text-[11px] print:text-gray-600">Pengerusi Lembaga (ALK)</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BUKA AKAUN / SIJIL BAHARU */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Buka Akaun Simpanan / Sijil Deposit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar simpanan khas sukarela atau penempatan deposit tetap anggota.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Anggota Koperasi *</label>
                <select
                  required
                  value={selectedNoAhli}
                  onChange={(e) => setSelectedNoAhli(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {ahliList.map(a => (
                    <option key={a.id} value={a.noAhli}>
                      {a.noAhli} - {a.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenis Simpanan / Deposit *</label>
                <select
                  value={formJenis}
                  onChange={(e) => {
                    const j = e.target.value as JenisAkaunSimpanan;
                    setFormJenis(j);
                    if (j === 'DEPOSIT_TETAP_6B') setFormKadarHibah(4.5);
                    else if (j === 'DEPOSIT_TETAP_12B') setFormKadarHibah(5.5);
                    else if (j === 'DEPOSIT_TETAP_24B') setFormKadarHibah(6.0);
                    else setFormKadarHibah(3.5);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="DEPOSIT_TETAP_12B">Deposit Tetap 12 Bulan (5.5% setahun)</option>
                  <option value="DEPOSIT_TETAP_6B">Deposit Tetap 6 Bulan (4.5% setahun)</option>
                  <option value="DEPOSIT_TETAP_24B">Deposit Tetap 24 Bulan (6.0% setahun)</option>
                  <option value="SIMPANAN_KHAS">Simpanan Khas Sukarela (3.5% setahun)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Deposit (RM) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kadar Hibah (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formKadarHibah}
                    onChange={(e) => setFormKadarHibah(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh Penempatan Mula</label>
                <input
                  type="date"
                  required
                  value={formTarikhMula}
                  onChange={(e) => setFormTarikhMula(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoRollover"
                  checked={formAutoRollover}
                  onChange={(e) => setFormAutoRollover(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="autoRollover" className="text-slate-300 text-xs">
                  Pembaharuan Automatik (Auto-Rollover pada tarikh matang)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Buka Sijil Deposit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TRANSAKSI SIMPANAN KHAS */}
      {/* ========================================================================= */}
      {showTxModal && selectedAccountForTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-indigo-400" /> Transaksi Simpanan Anggota
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Akaun: <strong className="text-indigo-300">{selectedAccountForTx.namaAhli}</strong> ({selectedAccountForTx.noSijilAkaun})
                </p>
              </div>
              <button 
                onClick={() => setShowTxModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3.5 text-xs">
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Baki Semasa:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{formatRM(selectedAccountForTx.bakiSemasa)}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenis Transaksi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxJenis('DEPOSIT')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      txJenis === 'DEPOSIT' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    + Simpan / Tambah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxJenis('PENGELUARAN')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      txJenis === 'PENGELUARAN' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    - Pengeluaran Wang
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jumlah Transaksi (RM) *</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  value={txJumlah}
                  onChange={(e) => setTxJumlah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">No. Rujukan / Resit</label>
                <input
                  type="text"
                  value={txRujukan}
                  onChange={(e) => setTxRujukan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan</label>
                <input
                  type="text"
                  value={txCatatan}
                  onChange={(e) => setTxCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Sahkan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
