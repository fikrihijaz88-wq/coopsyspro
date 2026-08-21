import React, { useState, useMemo } from 'react';
import { 
  DanaGeranSKM, 
  RekodPenggunaanDana, 
  RekodBayaranBalikPinjamanSKM, 
  KategoriPerbelanjaanDana,
  DokumenSokongan
} from '../types';
import { 
  Coins, 
  Landmark, 
  Gift, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  Receipt, 
  ShieldCheck, 
  Calendar, 
  Percent, 
  ChevronRight, 
  FileCheck,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface SKMFundsTrackingProps {
  danaList: DanaGeranSKM[];
  onAddExpense: (danaId: string, expense: RekodPenggunaanDana) => void;
  onAddRepayment: (danaId: string, repayment: RekodBayaranBalikPinjamanSKM) => void;
  onAddNewFund?: (fund: DanaGeranSKM) => void;
  dokumenList?: DokumenSokongan[];
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const SKMFundsTracking: React.FC<SKMFundsTrackingProps> = ({
  danaList,
  onAddExpense,
  onAddRepayment,
  onAddNewFund,
  dokumenList = [],
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'RINGKASAN' | 'PINJAMAN_TMP' | 'GERAN_KOPERASI' | 'LEJAR_PERBELANJAAN' | 'PENYATA_RASMI'>('RINGKASAN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDanaFilter, setSelectedDanaFilter] = useState<string>('ALL');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('ALL');

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState<boolean>(false);
  const [selectedDanaForAction, setSelectedDanaForAction] = useState<DanaGeranSKM | null>(null);

  // New Expense Form State
  const [expPerkara, setExpPerkara] = useState<string>('');
  const [expKategori, setExpKategori] = useState<KategoriPerbelanjaanDana>('MODAL_PUSINGAN_STOK');
  const [expJumlah, setExpJumlah] = useState<number>(5000);
  const [expPenerima, setExpPenerima] = useState<string>('');
  const [expNoBaucar, setExpNoBaucar] = useState<string>(`BP-SKM-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`);
  const [expTarikh, setExpTarikh] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expCatatan, setExpCatatan] = useState<string>('');

  // New Repayment Form State
  const [repTarikh, setRepTarikh] = useState<string>(new Date().toISOString().split('T')[0]);
  const [repNoResit, setRepNoResit] = useState<string>(`RST-SKM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [repPrinsipal, setRepPrinsipal] = useState<number>(2500);
  const [repCaj, setRepCaj] = useState<number>(312.50);

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // High-Level Aggregates
  const totalPinjamanSKM = useMemo(() => 
    danaList.filter(d => d.jenisDana === 'PINJAMAN_TMP_SKM').reduce((sum, d) => sum + d.jumlahDiluluskan, 0),
    [danaList]
  );

  const totalBakiPinjamanSKM = useMemo(() => 
    danaList.filter(d => d.jenisDana === 'PINJAMAN_TMP_SKM').reduce((sum, d) => sum + (d.bakiPinjamanSKMTertunggak || 0), 0),
    [danaList]
  );

  const totalBayaranBalikSKM = useMemo(() => 
    danaList.filter(d => d.jenisDana === 'PINJAMAN_TMP_SKM').reduce((sum, d) => sum + (d.jumlahTelahDibayarBalik || 0), 0),
    [danaList]
  );

  const totalGeranSKM = useMemo(() => 
    danaList.filter(d => d.jenisDana !== 'PINJAMAN_TMP_SKM').reduce((sum, d) => sum + d.jumlahDiluluskan, 0),
    [danaList]
  );

  const totalKeseluruhanDana = totalPinjamanSKM + totalGeranSKM;

  const totalPerbelanjaanSemuaDana = useMemo(() => {
    return danaList.reduce((sum, d) => {
      const spentInDana = (d.penggunaanDanaList || []).reduce((s, exp) => s + exp.jumlahRM, 0);
      return sum + spentInDana;
    }, 0);
  }, [danaList]);

  const totalBakiDanaBelumDiguna = totalKeseluruhanDana - totalPerbelanjaanSemuaDana;
  const overallUtilizationRate = totalKeseluruhanDana > 0 ? (totalPerbelanjaanSemuaDana / totalKeseluruhanDana) * 100 : 0;

  // Flattened Expenses for All Dana
  const allExpenses = useMemo(() => {
    const list: Array<RekodPenggunaanDana & { tajukDana: string; rujukanSKM: string; jenisDana: string }> = [];
    danaList.forEach(d => {
      (d.penggunaanDanaList || []).forEach(exp => {
        list.push({
          ...exp,
          tajukDana: d.tajukProjek,
          rujukanSKM: d.rujukanKelulusanSKM,
          jenisDana: d.jenisDana
        });
      });
    });
    return list.sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime());
  }, [danaList]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const matchQuery = !searchQuery || 
        exp.perkara.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.noBaucarResit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.penerimaBayaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.rujukanSKM.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDana = selectedDanaFilter === 'ALL' || exp.danaId === selectedDanaFilter;
      const matchKategori = selectedKategoriFilter === 'ALL' || exp.kategori === selectedKategoriFilter;

      return matchQuery && matchDana && matchKategori;
    });
  }, [allExpenses, searchQuery, selectedDanaFilter, selectedKategoriFilter]);

  // Handle Form Submissions
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDanaForAction || expJumlah <= 0 || !expPerkara) return;

    const newExpense: RekodPenggunaanDana = {
      id: `EXP-${Date.now()}`,
      danaId: selectedDanaForAction.id,
      tarikh: expTarikh,
      perkara: expPerkara,
      kategori: expKategori,
      jumlahRM: Number(expJumlah),
      penerimaBayaran: expPenerima || 'Pembekal Sah Koperasi',
      noBaucarResit: expNoBaucar,
      statusVerifikasi: 'DISAHKAN_JAD',
      catatanAudit: expCatatan || 'Direkodkan melalui modul Pengurusan Dana SKM'
    };

    onAddExpense(selectedDanaForAction.id, newExpense);
    setShowExpenseModal(false);
    resetExpenseForm();
  };

  const resetExpenseForm = () => {
    setExpPerkara('');
    setExpJumlah(5000);
    setExpPenerima('');
    setExpCatatan('');
    setExpNoBaucar(`BP-SKM-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`);
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDanaForAction || repPrinsipal <= 0) return;

    const jumlahBayaran = Number(repPrinsipal) + Number(repCaj);
    const bakiTerkini = Math.max(0, (selectedDanaForAction.bakiPinjamanSKMTertunggak || selectedDanaForAction.jumlahDiluluskan) - Number(repPrinsipal));

    const newRep: RekodBayaranBalikPinjamanSKM = {
      id: `REP-${Date.now()}`,
      danaId: selectedDanaForAction.id,
      tarikhBayaran: repTarikh,
      noResitSKM: repNoResit,
      prinsipalRM: Number(repPrinsipal),
      cajPerkhidmatanRM: Number(repCaj),
      jumlahBayaranRM: jumlahBayaran,
      bakiPrinsipalSelepasBayaran: bakiTerkini,
      status: 'BERJAYA'
    };

    onAddRepayment(selectedDanaForAction.id, newRep);
    setShowRepaymentModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pematuhan Statutori SKM & KUSKOP
            </span>
            <span className="text-xs text-slate-400">Akta Koperasi 1993 • GP1 & GP3 SKM</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-400" /> Penjejakan Penggunaan Duit Pinjaman SKM & Geran Pembangunan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pantau perbelanjaan modal pusingan TMP-SKM, rekod bayaran balik bulanan, lejar geran pembangunan dan dokumen verifikasi audit SKM.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (danaList.length > 0) {
                setSelectedDanaForAction(danaList[0]);
                setShowExpenseModal(true);
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Rekod Perbelanjaan Dana
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Penyata
          </button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pinjaman TMP-SKM */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Pinjaman Modal Pusingan (TMP-SKM)</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            {formatRM(totalPinjamanSKM)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Baki Hutang SKM:</span>
            <strong className="text-rose-400 font-bold">{formatRM(totalBakiPinjamanSKM)}</strong>
          </div>
        </div>

        {/* Card 2: Total Geran Pembangunan */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Geran Pembangunan (Non-Repayable)</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">
            {formatRM(totalGeranSKM)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Bantuan KUSKOP/SKM:</span>
            <span className="text-emerald-400 font-semibold">100% Geran Bantuan</span>
          </div>
        </div>

        {/* Card 3: Total Duit Dibelanjakan */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Jumlah Dana Dibelanjakan</span>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {formatRM(totalPerbelanjaanSemuaDana)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Kadar Penggunaan (Utilization):</span>
            <strong className="text-amber-300 font-bold">{overallUtilizationRate.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Card 4: Baki Tunai Dana Belum Diguna */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Baki Dana Belum Diguna</span>
            <div className="p-2 bg-teal-950/80 text-teal-400 rounded-xl border border-teal-800/60">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-300">
            {formatRM(totalBakiDanaBelumDiguna)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Simpanan Akaun Bank Koperasi:</span>
            <span className="text-teal-400 font-semibold">Terkawal Dalam Lejar</span>
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('RINGKASAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'RINGKASAN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Ringkasan Portfolio Dana SKM
        </button>

        <button
          onClick={() => setActiveSubTab('PINJAMAN_TMP')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PINJAMAN_TMP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" /> Tabung Modal Pusingan (TMP-SKM)
        </button>

        <button
          onClick={() => setActiveSubTab('GERAN_KOPERASI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'GERAN_KOPERASI' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" /> Geran Pembangunan & KUSKOP
        </button>

        <button
          onClick={() => setActiveSubTab('LEJAR_PERBELANJAAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'LEJAR_PERBELANJAAN' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" /> Lejar Penggunaan & Baucar Bayaran ({allExpenses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('PENYATA_RASMI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PENYATA_RASMI' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Penyata Statutori Rasmi SKM
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: RINGKASAN PORTFOLIO DANA */}
      {/* ========================================================================= */}
      {activeSubTab === 'RINGKASAN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Cards of Each Registered Fund */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Senarai Fasiliti Dana & Geran Berdaftar
              </h3>

              {danaList.map((dana) => {
                const totalSpent = (dana.penggunaanDanaList || []).reduce((s, e) => s + e.jumlahRM, 0);
                const percentSpent = dana.jumlahDiluluskan > 0 ? (totalSpent / dana.jumlahDiluluskan) * 100 : 0;
                const isLoan = dana.jenisDana === 'PINJAMAN_TMP_SKM';

                return (
                  <div 
                    key={dana.id} 
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isLoan 
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {isLoan ? 'Pinjaman TMP-SKM' : 'Geran Pembangunan'}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {dana.rujukanKelulusanSKM}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {dana.tajukProjek}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Peruntukan Diluluskan:</div>
                        <div className="text-lg font-black text-emerald-400">{formatRM(dana.jumlahDiluluskan)}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dana.objektifProjek}
                    </p>

                    {/* Progress Bars: Utilization & Physical Completion */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Kadar Penggunaan Dana ({formatRM(totalSpent)}):</span>
                          <span className="font-bold text-amber-300">{percentSpent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min(100, percentSpent)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Pencapaian Milestone Fizikal:</span>
                          <span className="font-bold text-emerald-300">{dana.peratusSiapFizikal}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${dana.peratusSiapFizikal}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Action Bar for this Dana */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pegawai Pemantau: <strong className="text-slate-200">{dana.pegawaiPemantauSKM || 'SKM Wilayah'}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDanaForAction(dana);
                            setShowExpenseModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Rekod Belanja
                        </button>

                        {isLoan && (
                          <button
                            onClick={() => {
                              setSelectedDanaForAction(dana);
                              setShowRepaymentModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-semibold rounded-lg border border-indigo-800 flex items-center gap-1 transition-all"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Rekod Bayar Balik
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Compliance & Audit Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Syarat & Piawaian Audit SKM
              </h3>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Penggunaan Mengikut Perjanjian:</strong>
                    <p className="text-slate-400 mt-0.5">Duit pinjaman TMP-SKM dan geran hanya boleh dibelanjakan untuk skop yang diluluskan dalam surat tawaran SKM.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Dokumen Sokongan Lengkap:</strong>
                    <p className="text-slate-400 mt-0.5">Setiap pengeluaran mestilah disokong dengan Baucar Bayaran (Payment Voucher), Invois Pembekal, Resit Rasmi, dan Sijil Perakuan Siap Kerja.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Pengesahan JAD Suku Tahun:</strong>
                    <p className="text-slate-400 mt-0.5">Jawatankuasa Audit Dalaman (JAD) diwajibkan menyemak lejar penggunaan dana geran sekurang-kurangnya sekali setiap suku tahun.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Jadual Ansuran TMP-SKM:</strong>
                    <p className="text-slate-400 mt-0.5">Bayaran balik prinsipal dan caj perkhidmatan mesti dibuat mengikut tarikh matang bagi mengelakkan penalti dan sekatan permohonan dana masa hadapan.</p>
                  </div>
                </div>
              </div>

              {/* Summary of Fund Types */}
              <div className="bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Ringkasan Imbangan Dana SKM
                </div>
                <div className="flex justify-between text-slate-300 pt-1">
                  <span>Pinjaman TMP-SKM Diluluskan:</span>
                  <span className="font-bold text-white">{formatRM(totalPinjamanSKM)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Geran Bantuan Diterima:</span>
                  <span className="font-bold text-emerald-400">{formatRM(totalGeranSKM)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Jumlah Duit Telah Dibelanjakan:</span>
                  <span className="font-bold text-amber-400">{formatRM(totalPerbelanjaanSemuaDana)}</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-indigo-800/80 pt-2">
                  <span>Baki Tunai Belum Diguna:</span>
                  <span className="font-black text-teal-300">{formatRM(totalBakiDanaBelumDiguna)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TABUNG MODAL PUSINGAN (TMP-SKM) PINJAMAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'PINJAMAN_TMP' && (
        <div className="space-y-6">
          {danaList.filter(d => d.jenisDana === 'PINJAMAN_TMP_SKM').map(dana => (
            <div key={dana.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      Fasiliti Pembiayaan Institusi SKM
                    </span>
                    <span className="text-xs text-slate-400 font-mono">No. Rujukan: {dana.rujukanKelulusanSKM}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{dana.tajukProjek}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tempoh: {dana.tempohBayaranBalikBulan} Bulan ({dana.tempohBayaranBalikBulan ? dana.tempohBayaranBalikBulan / 12 : 5} Tahun) • Kadar Caj Perkhidmatan: {dana.kadarCajPerkhidmatanTahunan}% setahun
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedDanaForAction(dana);
                      setShowRepaymentModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-900/40 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Rekod Bayaran Ansuran SKM
                  </button>
                </div>
              </div>

              {/* Financial Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Jumlah Pinjaman Asal</div>
                  <div className="text-xl font-bold text-white mt-1">{formatRM(dana.jumlahDiluluskan)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Dikeluarkan pada {dana.tarikhMulaProjek}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Baki Hutang Tertunggak SKM</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{formatRM(dana.bakiPinjamanSKMTertunggak)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Prinsipal belum selesai</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Jumlah Telah Dibayar Balik</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{formatRM(dana.jumlahTelahDibayarBalik)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Prinsipal + Caj Perkhidmatan</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Kadar Ansuran Bulanan</div>
                  <div className="text-xl font-bold text-indigo-300 mt-1">{formatRM(dana.ansuranBulanan)} / bln</div>
                  <div className="text-[11px] text-slate-500 mt-1">Jadual bayaran ke akaun SKM</div>
                </div>
              </div>

              {/* Repayment History Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" /> Rekod Sejarah Bayaran Balik Ansuran Ke SKM
                </h4>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Tarikh Bayaran</th>
                        <th className="px-4 py-3">No. Resit Rasmi SKM</th>
                        <th className="px-4 py-3 text-right">Prinsipal (RM)</th>
                        <th className="px-4 py-3 text-right">Caj Servis SKM (RM)</th>
                        <th className="px-4 py-3 text-right">Jumlah Dibayar (RM)</th>
                        <th className="px-4 py-3 text-right">Baki Prinsipal (RM)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {(dana.bayaranBalikList || []).map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-850 transition-colors">
                          <td className="px-4 py-3 text-slate-200">{rep.tarikhBayaran}</td>
                          <td className="px-4 py-3 font-bold text-indigo-300">{rep.noResitSKM}</td>
                          <td className="px-4 py-3 text-right text-slate-300">{formatRM(rep.prinsipalRM)}</td>
                          <td className="px-4 py-3 text-right text-amber-400">{formatRM(rep.cajPerkhidmatanRM)}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">{formatRM(rep.jumlahBayaranRM)}</td>
                          <td className="px-4 py-3 text-right font-bold text-rose-300">{formatRM(rep.bakiPrinsipalSelepasBayaran)}</td>
                          <td className="px-4 py-3 text-center font-sans">
                            <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SELESAI
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: GERAN PEMBANGUNAN KOPERASI (NON-REPAYABLE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'GERAN_KOPERASI' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {danaList.filter(d => d.jenisDana !== 'PINJAMAN_TMP_SKM').map(dana => {
              const totalSpent = (dana.penggunaanDanaList || []).reduce((s, e) => s + e.jumlahRM, 0);
              const baki = dana.jumlahDiluluskan - totalSpent;

              return (
                <div key={dana.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {dana.jenisDana.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{dana.tajukProjek}</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{dana.rujukanKelulusanSKM}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Jumlah Geran:</div>
                      <div className="text-lg font-black text-emerald-400">{formatRM(dana.jumlahDiluluskan)}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{dana.objektifProjek}</p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Perbelanjaan Dibuat:</span>
                      <strong className="text-white">{formatRM(totalSpent)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Baki Geran Belum Guna:</span>
                      <strong className="text-emerald-400">{formatRM(baki)}</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${(totalSpent / dana.jumlahDiluluskan) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* List of items in this grant */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Senarai Perolehan & Baucar Geran:
                    </h5>
                    <div className="space-y-1.5">
                      {(dana.penggunaanDanaList || []).map(exp => (
                        <div key={exp.id} className="flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                          <div>
                            <div className="font-semibold text-slate-200">{exp.perkara}</div>
                            <div className="text-[10px] text-slate-400">{exp.tarikh} • {exp.noBaucarResit}</div>
                          </div>
                          <div className="font-bold text-white shrink-0">{formatRM(exp.jumlahRM)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedDanaForAction(dana);
                        setShowExpenseModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Perbelanjaan Geran
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: LEJAR PERBELANJAAN & BAUCAR BAYARAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'LEJAR_PERBELANJAAN' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari baucar, pembekal, butiran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedDanaFilter}
                onChange={(e) => setSelectedDanaFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Dana & Geran</option>
                {danaList.map(d => (
                  <option key={d.id} value={d.id}>{d.tajukProjek.substring(0, 35)}...</option>
                ))}
              </select>

              <select
                value={selectedKategoriFilter}
                onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Kategori Belanja</option>
                <option value="MODAL_PUSINGAN_STOK">Modal Pusingan / Stok</option>
                <option value="PEMBELIAN_ASET_MESIN">Pembelian Aset / Mesin</option>
                <option value="PENGUBAHSUAIAN_PREMIS">Pengubahsuaian Premis</option>
                <option value="SISTEM_IT_SOFTWARE">Sistem IT & Perisian</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Tarikh & No. Baucar</th>
                    <th className="px-4 py-3.5">Perkara / Butiran Perbelanjaan</th>
                    <th className="px-4 py-3.5">Fasiliti Dana SKM</th>
                    <th className="px-4 py-3.5">Penerima / Pembekal</th>
                    <th className="px-4 py-3.5 text-right">Jumlah (RM)</th>
                    <th className="px-4 py-3.5 text-center">Status Audit JAD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{exp.noBaucarResit}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{exp.tarikh}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-200">{exp.perkara}</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {exp.catatanAudit}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-300 font-medium">{exp.tajukDana}</div>
                        <div className="text-[10px] font-mono text-slate-400">{exp.rujukanSKM}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        {exp.penerimaBayaran}
                      </td>

                      <td className="px-4 py-3.5 text-right font-black text-white text-sm">
                        {formatRM(exp.jumlahRM)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> DISAHKAN JAD
                        </span>
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
      {/* SUB-TAB 5: PENYATA STATUTORI RASMI SKM (PRINTABLE / PDF) */}
      {/* ========================================================================= */}
      {activeSubTab === 'PENYATA_RASMI' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Printable Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-6 print:border-black">
            <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-1">
              SURUHANJAYA KOPERASI MALAYSIA (SKM) • KEMENTERIAN PEMBANGUNAN USAHAWAN & KOPERASI (KUSKOP)
            </div>
            <h1 className="text-xl font-black text-white uppercase print:text-black">
              PENYATA PENGGUNAAN DANA PINJAMAN & GERAN PEMBANGUNAN KOPERASI
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
              Disediakan di bawah Garis Panduan Tatacara Pengurusan Kewangan & Audit Statutori SKM (GP1, GP3, GP23)
            </p>
          </div>

          {/* Co-op Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-100 print:text-black">
            <div>
              <div className="text-slate-400">Nama Koperasi:</div>
              <strong className="text-white print:text-black">Koperasi Warga Berdaya Malaysia Berhad</strong>
            </div>
            <div>
              <div className="text-slate-400">No. Pendaftaran SKM:</div>
              <strong className="text-white print:text-black font-mono">SKM-W-4921/2018</strong>
            </div>
            <div>
              <div className="text-slate-400">Tahun Kewangan:</div>
              <strong className="text-white print:text-black">2026</strong>
            </div>
            <div>
              <div className="text-slate-400">Tarikh Cetakan Penyata:</div>
              <strong className="text-white print:text-black">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          </div>

          {/* Section 1: Summary Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-1.5 print:text-black">
              1. Ringkasan Penerimaan & Penggunaan Dana SKM
            </h3>
            
            <table className="w-full text-left text-xs border border-slate-800 print:border-black">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="p-2.5">Jenis Dana / Skim</th>
                  <th className="p-2.5">No. Rujukan SKM</th>
                  <th className="p-2.5 text-right">Diluluskan (RM)</th>
                  <th className="p-2.5 text-right">Dibelanjakan (RM)</th>
                  <th className="p-2.5 text-right">Baki Belum Guna (RM)</th>
                  <th className="p-2.5 text-right">Baki Pinjaman SKM (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {danaList.map(d => {
                  const spent = (d.penggunaanDanaList || []).reduce((s, e) => s + e.jumlahRM, 0);
                  const baki = d.jumlahDiluluskan - spent;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-bold text-white print:text-black">{d.tajukProjek}</td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-gray-700">{d.rujukanKelulusanSKM}</td>
                      <td className="p-2.5 text-right font-bold">{formatRM(d.jumlahDiluluskan)}</td>
                      <td className="p-2.5 text-right font-bold text-amber-400 print:text-black">{formatRM(spent)}</td>
                      <td className="p-2.5 text-right font-bold text-teal-400 print:text-black">{formatRM(baki)}</td>
                      <td className="p-2.5 text-right font-bold text-rose-400 print:text-black">{formatRM(d.bakiPinjamanSKMTertunggak || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950 font-black text-white border-t-2 border-slate-800 print:bg-gray-200 print:text-black">
                <tr>
                  <td colSpan={2} className="p-2.5 text-right uppercase">Jumlah Keseluruhan:</td>
                  <td className="p-2.5 text-right text-emerald-400 print:text-black">{formatRM(totalKeseluruhanDana)}</td>
                  <td className="p-2.5 text-right text-amber-400 print:text-black">{formatRM(totalPerbelanjaanSemuaDana)}</td>
                  <td className="p-2.5 text-right text-teal-400 print:text-black">{formatRM(totalBakiDanaBelumDiguna)}</td>
                  <td className="p-2.5 text-right text-rose-400 print:text-black">{formatRM(totalBakiPinjamanSKM)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 2: Audit Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-10 text-xs text-center border-t border-slate-800 print:border-black print:pt-8">
            <div className="space-y-8">
              <div className="text-slate-400 print:text-black">Disediakan Oleh:</div>
              <div className="border-b border-slate-600 print:border-black w-3/4 mx-auto pb-1 font-bold text-white print:text-black">
                Tan Kah Hock
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">Bendahari Koperasi</div>
            </div>

            <div className="space-y-8">
              <div className="text-slate-400 print:text-black">Disahkan Oleh:</div>
              <div className="border-b border-slate-600 print:border-black w-3/4 mx-auto pb-1 font-bold text-white print:text-black">
                Dato' Ahmad Razali Bin Zainal
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">Pengerusi Lembaga (ALK)</div>
            </div>

            <div className="space-y-8">
              <div className="text-slate-400 print:text-black">Diverifikasi Oleh:</div>
              <div className="border-b border-slate-600 print:border-black w-3/4 mx-auto pb-1 font-bold text-white print:text-black">
                Dr. Roslan Bin Mohamad
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">Pengerusi Jawatankuasa Audit (JAD)</div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REKOD PERBELANJAAN DANA (EXPENSE FORM) */}
      {/* ========================================================================= */}
      {showExpenseModal && selectedDanaForAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" /> Rekod Perbelanjaan Dana SKM
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fasiliti: <strong className="text-emerald-300">{selectedDanaForAction.tajukProjek}</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Perkara / Butiran Perbelanjaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Stok Barangan Pengguna / Peralatan Kedai"
                  value={expPerkara}
                  onChange={(e) => setExpPerkara(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Perbelanjaan</label>
                  <select
                    value={expKategori}
                    onChange={(e) => setExpKategori(e.target.value as KategoriPerbelanjaanDana)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MODAL_PUSINGAN_STOK">Modal Pusingan / Stok</option>
                    <option value="PEMBELIAN_ASET_MESIN">Pembelian Aset / Mesin</option>
                    <option value="PENGUBAHSUAIAN_PREMIS">Pengubahsuaian Premis</option>
                    <option value="SISTEM_IT_SOFTWARE">Sistem IT & Perisian</option>
                    <option value="LATIHAN_PEMBANGUNAN">Latihan & Pembangunan</option>
                    <option value="OPERASI_KHAS">Operasi Khas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Perbelanjaan (RM) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={expJumlah}
                    onChange={(e) => setExpJumlah(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Penerima Bayaran / Pembekal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Syarikat Pembekal"
                    value={expPenerima}
                    onChange={(e) => setExpPenerima(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Baucar / Resit *</label>
                  <input
                    type="text"
                    required
                    value={expNoBaucar}
                    onChange={(e) => setExpNoBaucar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh Perbelanjaan</label>
                <input
                  type="date"
                  value={expTarikh}
                  onChange={(e) => setExpTarikh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Verifikasi Audit JAD</label>
                <input
                  type="text"
                  placeholder="Catatan rujukan kelulusan mesyuarat ALK..."
                  value={expCatatan}
                  onChange={(e) => setExpCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Rekod Perbelanjaan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REKOD BAYARAN BALIK PINJAMAN TMP-SKM */}
      {/* ========================================================================= */}
      {showRepaymentModal && selectedDanaForAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" /> Rekod Ansuran Bayaran Balik TMP-SKM
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Baki Tertunggak Semasa: <strong className="text-rose-400">{formatRM(selectedDanaForAction.bakiPinjamanSKMTertunggak)}</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowRepaymentModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRepaymentSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh Bayaran Ansuran</label>
                <input
                  type="date"
                  required
                  value={repTarikh}
                  onChange={(e) => setRepTarikh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">No. Resit Rasmi SKM *</label>
                <input
                  type="text"
                  required
                  value={repNoResit}
                  onChange={(e) => setRepNoResit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bayaran Prinsipal (RM) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={repPrinsipal}
                    onChange={(e) => setRepPrinsipal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Caj Perkhidmatan SKM (RM)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={repCaj}
                    onChange={(e) => setRepCaj(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Jumlah Bayaran Keseluruhan:</span>
                <span className="font-black text-indigo-300 text-sm">{formatRM(Number(repPrinsipal) + Number(repCaj))}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRepaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Sahkan Bayaran Ansuran
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
