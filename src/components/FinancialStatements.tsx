import React, { useState } from 'react';
import { CartaAkaun, RingkasanStatutoriSKM, RekodKewanganTahunan } from '../types';
import { pdfExport } from '../utils/pdfExport';
import { excelExport } from '../utils/excelExport';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Building2, 
  ShieldCheck, 
  Scale, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  History,
  Plus,
  Calendar,
  Award,
  FileCheck,
  TrendingDown,
  Layers,
  Edit2,
  FileDown
} from 'lucide-react';

interface FinancialStatementsProps {
  cartaAkaun: CartaAkaun[];
  rekodTahunanList?: RekodKewanganTahunan[];
  onAddRekodTahunan?: (rekod: RekodKewanganTahunan) => void;
  onOpenAIAudit: () => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({
  cartaAkaun,
  rekodTahunanList = [],
  onAddRekodTahunan,
  onOpenAIAudit,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [activeReportTab, setActiveReportTab] = useState<'untungRugi' | 'kunciKiraKira' | 'imbanganDuga' | 'aliranTunai' | 'tahunLepas'>('untungRugi');
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);

  // ==================== YEAR SELECTOR ====================
  // 'SEMASA' = live cartaAkaun data for current year (2026)
  // numeric year = historical data from rekodTahunanList
  const [selectedYear, setSelectedYear] = useState<number | 'SEMASA'>('SEMASA');

  // Build sorted list of available historical years
  const availableYears = rekodTahunanList
    .map(r => r.tahun)
    .sort((a, b) => a - b);

  // Get the historical record for selected year (if not SEMASA)
  const selectedRekod = selectedYear !== 'SEMASA'
    ? rekodTahunanList.find(r => r.tahun === selectedYear)
    : null;

  // Form for historical year entry
  const [inputTahun, setInputTahun] = useState<number>(2025);
  const [inputHasil, setInputHasil] = useState<number>(388900);
  const [inputBelanja, setInputBelanja] = useState<number>(254100);
  const [inputUntungBersih, setInputUntungBersih] = useState<number>(134800);
  const [inputDividenRM, setInputDividenRM] = useState<number>(20100);
  const [inputPeratusDividen, setInputPeratusDividen] = useState<number>(7.5);
  const [inputTotalAset, setInputTotalAset] = useState<number>(742000);
  const [inputTotalLiabiliti, setInputTotalLiabiliti] = useState<number>(275000);
  const [inputTotalEkuiti, setInputTotalEkuiti] = useState<number>(467000);
  const [inputModalSyer, setInputModalSyer] = useState<number>(268000);
  const [inputBilAhli, setInputBilAhli] = useState<number>(138);
  const [inputStatusAudit, setInputStatusAudit] = useState<'DISAHKAN_SKM' | 'DALAM_PROSES' | 'DRAF'>('DISAHKAN_SKM');
  const [inputJuruaudit, setInputJuruaudit] = useState<string>('Tetuan Bertauliah SKM & Associates');
  const [inputCatatan, setCatatan] = useState<string>('Laporan Penyata Kewangan Teraudit SKM.');

  // ==================== LIVE CALCULATIONS (for SEMASA / current year) ====================
  const debitAccounts = cartaAkaun.filter(c => c.jenisBaki === 'DEBIT');
  const creditAccounts = cartaAkaun.filter(c => c.jenisBaki === 'KREDIT');

  const totalDebit = debitAccounts.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const totalKredit = creditAccounts.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const isBalanced = Math.abs(totalDebit - totalKredit) < 0.01;

  const hasilList = cartaAkaun.filter(c => c.kategori === 'HASIL');
  const belanjaList = cartaAkaun.filter(c => c.kategori === 'BELANJA');

  const liveTotalHasil = hasilList.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const liveTotalBelanja = belanjaList.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const liveUntungBersih = liveTotalHasil - liveTotalBelanja;

  const liveKwrs12 = Math.max(0, liveUntungBersih * 0.12);
  const liveKwpk3 = Math.max(0, liveUntungBersih * 0.03);
  const liveKwp1 = Math.max(0, liveUntungBersih * 0.01);
  const liveJumlahStatutori = liveKwrs12 + liveKwpk3 + liveKwp1;
  const liveUntungBolehDiagih = Math.max(0, liveUntungBersih - liveJumlahStatutori);

  const liveTotalSyerAhli = cartaAkaun.find(c => c.kod === '3010')?.bakiSemasa || 268000;
  const livePeratusDividen = 7.5;
  const liveCadanganDividenRM = liveTotalSyerAhli * (livePeratusDividen / 100);
  const liveHonorariumALK = Math.min(10000, liveUntungBolehDiagih * 0.05);
  const liveBakiKeHadapan = Math.max(0, liveUntungBolehDiagih - (liveCadanganDividenRM + liveHonorariumALK));

  const asetList = cartaAkaun.filter(c => c.kategori === 'ASET');
  const liabilitiList = cartaAkaun.filter(c => c.kategori === 'LIABILITI');
  const ekuitiList = cartaAkaun.filter(c => c.kategori === 'EKUITI');

  const liveTotalAset = asetList.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const liveTotalLiabiliti = liabilitiList.reduce((acc, curr) => acc + curr.bakiSemasa, 0);
  const liveTotalEkuiti = ekuitiList.reduce((acc, curr) => acc + curr.bakiSemasa, 0) + liveUntungBersih;

  // ==================== ACTIVE VIEW DATA (switches between live & historical) ====================
  const isSemasa = selectedYear === 'SEMASA';
  const viewYear = isSemasa ? new Date().getFullYear() : (selectedYear as number);

  const totalHasil = isSemasa ? liveTotalHasil : (selectedRekod?.jumlahHasil ?? 0);
  const totalBelanja = isSemasa ? liveTotalBelanja : (selectedRekod?.jumlahBelanja ?? 0);
  const untungBersihSebelumStatutori = isSemasa ? liveUntungBersih : (selectedRekod?.untungBersih ?? 0);

  const kwrs12 = isSemasa ? liveKwrs12 : (selectedRekod?.kwrs12 ?? 0);
  const kwpk3 = isSemasa ? liveKwpk3 : (selectedRekod?.kwpk3 ?? 0);
  const kwp1 = isSemasa ? liveKwp1 : (selectedRekod?.kwp1 ?? 0);
  const jumlahStatutori = kwrs12 + kwpk3 + kwp1;
  const untungBolehDiagih = isSemasa ? liveUntungBolehDiagih : Math.max(0, untungBersihSebelumStatutori - jumlahStatutori);

  const peratusDividenCadangan = isSemasa ? livePeratusDividen : (selectedRekod?.peratusDividen ?? 7.5);
  const totalSyerAhli = isSemasa ? liveTotalSyerAhli : (selectedRekod?.modalSyerTerkumpul ?? 268000);
  const cadanganDividenRM = isSemasa ? liveCadanganDividenRM : (selectedRekod?.dividenAgihanRM ?? 0);
  const honorariumALK = isSemasa ? liveHonorariumALK : Math.min(10000, untungBolehDiagih * 0.05);
  const bakiKeHadapan = Math.max(0, untungBolehDiagih - (cadanganDividenRM + honorariumALK));

  const totalAset = isSemasa ? liveTotalAset : (selectedRekod?.totalAset ?? 0);
  const totalLiabiliti = isSemasa ? liveTotalLiabiliti : (selectedRekod?.totalLiabiliti ?? 0);
  const totalEkuiti = isSemasa ? liveTotalEkuiti : (selectedRekod?.totalEkuiti ?? 0);

  const viewStatusAudit = isSemasa ? 'DALAM_PROSES' : (selectedRekod?.statusAuditSKM ?? 'DRAF');
  const viewJuruaudit = isSemasa ? 'Jawatankuasa Audit Dalaman (JAD)' : (selectedRekod?.juruauditBertauliah ?? '-');
  const viewBilAhli = isSemasa ? '-' : String(selectedRekod?.bilanganAhli ?? '-');

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  const handleCalculateUntung = (h: number, b: number) => {
    setInputHasil(h);
    setInputBelanja(b);
    setInputUntungBersih(h - b);
  };

  const handleSubmitNewYearRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRekodTahunan) return;

    const ub = inputUntungBersih;
    const newRecord: RekodKewanganTahunan = {
      tahun: inputTahun,
      jumlahHasil: inputHasil,
      jumlahBelanja: inputBelanja,
      untungBersih: ub,
      kwrs12: Math.max(0, ub * 0.12),
      kwpk3: Math.max(0, ub * 0.03),
      kwp1: Math.max(0, ub * 0.01),
      dividenAgihanRM: inputDividenRM,
      peratusDividen: inputPeratusDividen,
      totalAset: inputTotalAset,
      totalLiabiliti: inputTotalLiabiliti,
      totalEkuiti: inputTotalEkuiti,
      modalSyerTerkumpul: inputModalSyer,
      bilanganAhli: inputBilAhli,
      statusAuditSKM: inputStatusAudit,
      juruauditBertauliah: inputJuruaudit,
      catatanSKM: inputCatatan
    };

    onAddRekodTahunan(newRecord);
    setShowAddYearModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {isEN ? 'SKM Audit Report Standards' : 'Piawaian Laporan Audit SKM'}
            </span>
            <span className="text-xs text-slate-400">
              {isEN ? `Viewing: Year ${viewYear}` : `Paparan: Tahun ${viewYear}`}
              {!isSemasa && selectedRekod && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  viewStatusAudit === 'DISAHKAN_SKM' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {viewStatusAudit === 'DISAHKAN_SKM' ? '✓ TERAUDIT SKM' : '⏳ DALAM PROSES'}
                </span>
              )}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> {isEN ? 'Financial Statements & Co-op Audit Report' : 'Penyata Kewangan & Laporan Audit Koperasi'}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              setInputTahun(2025);
              setShowAddYearModal(true);
            }}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>{isEN ? 'Add Historical Record' : 'Tambah Rekod Tahun Lepas'}</span>
          </button>

          <button
            onClick={onOpenAIAudit}
            className="px-3.5 py-2.5 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/80 text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-300" /> {isEN ? 'Run AI Audit Review' : 'Semak Audit AI'}
          </button>

          <button
            onClick={() => {
              pdfExport.exportFinancialStatements(
                'Koperasi Warga Berdaya Malaysia Berhad',
                'SKM-W-4921/2018',
                viewYear,
                { hasil: totalHasil, belanja: totalBelanja, untungKasar: totalHasil, untungBersih: untungBersihSebelumStatutori },
                { kwrs: kwrs12, kwpk: kwpk3, kwp: kwp1, untungBolehDiagih, cadanganDividen: cadanganDividenRM, honorarium: honorariumALK },
                { aset: totalAset, liabiliti: totalLiabiliti, ekuiti: totalEkuiti, modalSyer: totalSyerAhli }
              );
            }}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
            title={`Muat turun Penyata Kewangan Rasmi SKM Tahun ${viewYear} (PDF)`}
          >
            <FileDown className="w-4 h-4" />
            <span>PDF {viewYear}</span>
          </button>

          <button
            onClick={() => {
              excelExport.exportGeneralLedger([], cartaAkaun, `Koperasi_Warga_Berdaya_${viewYear}`);
            }}
            className="px-3.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
            title="Eksport Carta Akaun & Imbangan Duga (Excel)"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> {isEN ? 'Print Report' : 'Cetak'}
          </button>
        </div>
      </div>

      {/* ==================== YEAR SELECTOR BAR ==================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-800/60 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            {isEN ? 'Select Financial Year' : 'Pilih Tahun Kewangan'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableYears.map(yr => {
            const rekod = rekodTahunanList.find(r => r.tahun === yr);
            const isActive = selectedYear === yr;
            const isAudited = rekod?.statusAuditSKM === 'DISAHKAN_SKM';
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`relative px-5 py-3 rounded-xl text-xs font-extrabold transition-all border-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-950 scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-600 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-black">{yr}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isAudited ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {isAudited ? '✓ TERAUDIT' : '⏳ PROSES'}
                  </span>
                  {rekod && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRM(rekod.untungBersih)}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}

          {/* SEMASA (Current Year - Live Data) button */}
          <button
            onClick={() => setSelectedYear('SEMASA')}
            className={`relative px-5 py-3 rounded-xl text-xs font-extrabold transition-all border-2 ${
              isSemasa
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-600 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-black flex items-center gap-1">
                {new Date().getFullYear()} <span className="text-emerald-300 text-[9px]">SEMASA</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300">
                ● DATA LANGSUNG
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatRM(liveUntungBersih)}
              </span>
            </div>
            {isSemasa && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Year info banner */}
        {!isSemasa && selectedRekod && (
          <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-white">Juruaudit:</span> {viewJuruaudit}
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white">Ahli:</span> {viewBilAhli} orang
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">Dividen:</span> {peratusDividenCadangan}% ({formatRM(cadanganDividenRM)})
            </div>
            {selectedRekod.catatanSKM && (
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="italic text-slate-400">{selectedRekod.catatanSKM}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('untungRugi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeReportTab === 'untungRugi' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? '1. Income Statement & Statutory Allocations' : '1. Penyata Untung Rugi & Agihan Statutori'}
        </button>
        <button
          onClick={() => setActiveReportTab('kunciKiraKira')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeReportTab === 'kunciKiraKira' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? '2. Balance Sheet' : '2. Kunci Kira-Kira (Lembaran Imbangan)'}
        </button>
        <button
          onClick={() => setActiveReportTab('imbanganDuga')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeReportTab === 'imbanganDuga' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? '3. Trial Balance' : '3. Imbangan Duga (Trial Balance)'}
        </button>
        <button
          onClick={() => setActiveReportTab('aliranTunai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeReportTab === 'aliranTunai' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? '4. Cash Flow Statement' : '4. Penyata Aliran Tunai'}
        </button>

        {/* Tab 5: Multi-Year Historical Audit Records */}
        <button
          onClick={() => setActiveReportTab('tahunLepas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${activeReportTab === 'tahunLepas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950' : 'bg-indigo-950/70 border border-indigo-800 text-indigo-300 hover:bg-indigo-900'}`}
        >
          <History className="w-4 h-4 text-indigo-300" />
          <span>{isEN ? '5. Historical Records (2023 - 2026)' : '5. Rekod Kewangan Tahun-Tahun Lepas'}</span>
          <span className="px-2 py-0.5 bg-indigo-900 text-indigo-200 text-[10px] rounded-full font-mono font-bold">
            {rekodTahunanList.length}
          </span>
        </button>
      </div>

      {/* REPORT 1: UNTUNG RUGI & AGIHAN STATUTORI */}
      {activeReportTab === 'untungRugi' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          
          <div className="border-b border-slate-800 pb-4 text-center">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              KOPERASI PERKHIDMATAN & USAHAWAN BERHAD
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              PENYATA PENDAPATAN & AGIHAN UNTUNG RUGI STATUTORI (AKTA KOPERASI 1993 SEKSYEN 57)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Bagi Tahun Kewangan Berakhir {viewYear}{!isSemasa && viewStatusAudit === 'DISAHKAN_SKM' ? ' (Teraudit SKM)' : isSemasa ? ' (Data Langsung Semasa)' : ' (Dalam Proses Audit)'}</p>
          </div>

          <div className="space-y-6 text-xs">
            
            {/* HASIL */}
            <div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-bold text-emerald-400 uppercase tracking-wider mb-2">
                1. HASIL / PENDAPATAN OPERASI
              </div>
              <div className="space-y-2 px-2">
                {hasilList.map((h) => (
                  <div key={h.kod} className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-300 font-medium">{h.kod} - {h.namaAkaun}</span>
                    <span className="font-semibold text-white">{formatRM(h.bakiSemasa)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t-2 border-slate-700 font-bold text-sm text-emerald-400 pt-2">
                  <span>JUMLAH HASIL KOPERASI</span>
                  <span>{formatRM(totalHasil)}</span>
                </div>
              </div>
            </div>

            {/* BELANJA */}
            <div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-bold text-rose-400 uppercase tracking-wider mb-2">
                2. BELANJA OPERASI & PENTADBIRAN
              </div>
              <div className="space-y-2 px-2">
                {belanjaList.map((b) => (
                  <div key={b.kod} className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-300 font-medium">{b.kod} - {b.namaAkaun}</span>
                    <span className="font-semibold text-white">{formatRM(b.bakiSemasa)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t-2 border-slate-700 font-bold text-sm text-rose-400 pt-2">
                  <span>JUMLAH BELANJA OPERASI</span>
                  <span>{formatRM(totalBelanja)}</span>
                </div>
              </div>
            </div>

            {/* UNTUNG BERSIH OPERASI */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-sm font-bold">
              <span className="text-white">KEUNTUNGAN BERSIH SEBELUM AGIHAN STATUTORI</span>
              <span className="text-emerald-400 text-lg">{formatRM(untungBersihSebelumStatutori)}</span>
            </div>

            {/* STATUTORY APPROPRIATIONS BOX */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-5 rounded-2xl border border-emerald-800/80 space-y-3">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                3. AGIHAN KEUNTUNGAN STATUTORI SKM (SEKSYEN 57 AKTA KOPERASI 1993)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                  <span>Tolok: Kumpulan Wang Rizab Statutori (KWRS 12%)</span>
                  <span className="font-semibold text-white">({formatRM(kwrs12)})</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                  <span>Tolok: Kumpulan Wang Pendidikan Koperasi (KWPK 3%)</span>
                  <span className="font-semibold text-white">({formatRM(kwpk3)})</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                  <span>Tolok: Kumpulan Wang Pembangunan Koperasi (KWP 1%)</span>
                  <span className="font-semibold text-white">({formatRM(kwp1)})</span>
                </div>

                <div className="flex justify-between text-emerald-300 font-bold py-2 border-t border-emerald-800">
                  <span>KEUNTUNGAN BERSIH BOLEH DIAGIH KEPADA AHLI</span>
                  <span>{formatRM(untungBolehDiagih)}</span>
                </div>

                <div className="flex justify-between text-slate-300 py-1">
                  <span>Cadangan Dividen Syer Ahli ({peratusDividenCadangan}% - Maksimum 10% Seksyen 57)</span>
                  <span className="font-bold text-amber-300">{formatRM(cadanganDividenRM)}</span>
                </div>

                <div className="flex justify-between text-slate-300 py-1">
                  <span>Honorarium Ahli Lembaga Koperasi (ALK)</span>
                  <span className="font-semibold text-white">{formatRM(honorariumALK)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 font-bold">
                  <span>Baki Keuntungan Dibawa Ke Hadapan</span>
                  <span className="text-white">{formatRM(bakiKeHadapan)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* REPORT 2: KUNCI KIRA-KIRA / BALANCE SHEET */}
      {activeReportTab === 'kunciKiraKira' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 text-center">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              KOPERASI PERKHIDMATAN & USAHAWAN BERHAD
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              KUNCI KIRA-KIRA / LEMBARAN IMBANGAN (STATEMENT OF FINANCIAL POSITION)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pada 31 Disember {viewYear}{!isSemasa && viewStatusAudit === 'DISAHKAN_SKM' ? ' (Teraudit SKM)' : ''}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Left: Aset */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 text-xs uppercase border-b border-slate-800 pb-2">
                ASET KOPERASI
              </h4>
              <div className="space-y-2">
                {asetList.map(a => (
                  <div key={a.kod} className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">{a.kod} - {a.namaAkaun}</span>
                    <span className="font-semibold text-white">{formatRM(a.bakiSemasa)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-400 border-t-2 border-slate-700 pt-2">
                <span>JUMLAH ASET</span>
                <span>{formatRM(totalAset)}</span>
              </div>
            </div>

            {/* Right: Liabiliti & Ekuiti */}
            <div className="space-y-4">
              
              {/* Liabiliti */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs uppercase border-b border-slate-800 pb-2">
                  LIABILITI KOPERASI
                </h4>
                <div className="space-y-2">
                  {liabilitiList.map(l => (
                    <div key={l.kod} className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">{l.kod} - {l.namaAkaun}</span>
                      <span className="font-semibold text-white">{formatRM(l.bakiSemasa)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-amber-400 border-t border-slate-800 pt-2">
                  <span>JUMLAH LIABILITI</span>
                  <span>{formatRM(totalLiabiliti)}</span>
                </div>
              </div>

              {/* Ekuiti */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 text-xs uppercase border-b border-slate-800 pb-2">
                  EKUITI AHLI & KUMPULAN WANG
                </h4>
                <div className="space-y-2">
                  {ekuitiList.map(e => (
                    <div key={e.kod} className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">{e.kod} - {e.namaAkaun}</span>
                      <span className="font-semibold text-white">{formatRM(e.bakiSemasa)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 border-b border-slate-800/60 text-emerald-400">
                    <span>Untung Bersih Semasa</span>
                    <span className="font-semibold">{formatRM(untungBersihSebelumStatutori)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-blue-400 border-t border-slate-800 pt-2">
                  <span>JUMLAH EKUITI AHLI</span>
                  <span>{formatRM(totalEkuiti)}</span>
                </div>
              </div>

              {/* Total Liabiliti & Ekuiti */}
              <div className="bg-slate-950 p-4 rounded-xl border-2 border-emerald-800 flex justify-between font-bold text-sm text-emerald-400">
                <span>JUMLAH LIABILITI & EKUITI</span>
                <span>{formatRM(totalLiabiliti + totalEkuiti)}</span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* REPORT 3: IMBANGAN DUGA */}
      {activeReportTab === 'imbanganDuga' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Imbangan Duga Koperasi (Trial Balance)</h3>
              <p className="text-xs text-slate-400">Semakan Keseimbangan Baki Debit (Dr) dan Baki Kredit (Cr)</p>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isBalanced ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>STATUS: {isBalanced ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG'}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="px-4 py-3">Kod & Nama Akaun Lejar</th>
                <th className="px-4 py-3">Kategori SKM</th>
                <th className="px-4 py-3 text-right">Baki Debit (RM)</th>
                <th className="px-4 py-3 text-right">Baki Kredit (RM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cartaAkaun.map(c => (
                <tr key={c.kod} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-semibold text-white">
                    <span className="font-mono text-emerald-400 mr-2">{c.kod}</span> {c.namaAkaun}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{c.kategori}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-blue-400">
                    {c.jenisBaki === 'DEBIT' ? formatRM(c.bakiSemasa) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-purple-400">
                    {c.jenisBaki === 'KREDIT' ? formatRM(c.bakiSemasa) : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-950 font-bold text-sm text-white">
                <td colSpan={2} className="px-4 py-3">JUMLAH KESELURAHAN IMBANGAN DUGA</td>
                <td className="px-4 py-3 text-right text-blue-400">{formatRM(totalDebit)}</td>
                <td className="px-4 py-3 text-right text-purple-400">{formatRM(totalKredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: ALIRAN TUNAI */}
      {activeReportTab === 'aliranTunai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <h3 className="text-base font-bold text-white">Penyata Aliran Tunai (Statement of Cash Flows)</h3>
          
          <div className="space-y-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-emerald-400 mb-2">1. Aliran Tunai Daripada Aktiviti Operasi</h4>
              <div className="flex justify-between py-1">
                <span className="text-slate-300">Terimaan Daripada Jualan Perniagaan & Pembiayaan</span>
                <span className="text-white font-semibold">{formatRM(totalHasil)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">Pembayaran Belanja Operasi & Pentadbiran</span>
                <span className="text-rose-400 font-semibold">({formatRM(totalBelanja)})</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-emerald-400">
                <span>Aliran Tunai Bersih Operasi</span>
                <span>{formatRM(untungBersihSebelumStatutori)}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-blue-400 mb-2">2. Aliran Tunai Daripada Aktiviti Pembiayaan & Syer</h4>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">Terimaan Modal Syer & Yuran Ahli Baru</span>
                <span className="text-white font-semibold">{formatRM(48000)}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-blue-400">
                <span>Aliran Tunai Bersih Pembiayaan</span>
                <span>{formatRM(48000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* REPORT 5: REKOD KEWANGAN TAHUN-TAHUN LEPAS (2023 - 2026) */}
      {/* ========================================================================================= */}
      {activeReportTab === 'tahunLepas' && (
        <div className="space-y-6">

          {/* Top Banner Overview */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 p-6 rounded-2xl border border-indigo-800/80 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wider flex items-center gap-1 w-fit">
                  <Award className="w-3.5 h-3.5 text-indigo-300" />
                  Pematuhan Laporan Penyata Kewangan Teraudit SKM (Akta Koperasi 1993)
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Penyata Kewangan Perbandingan Pelbagai Tahun (2023 - 2026)
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  Rekod kewangan terdahulu bagi tujuan Audit SKM, Pembentangan Mesyuarat Agung Tahunan (AGM), serta semakan semula prestasi pertumbuhan koperasi dari tahun ke tahun.
                </p>
              </div>

              <button
                onClick={() => {
                  setInputTahun(2025);
                  setShowAddYearModal(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Input Rekod Tahun Terdahulu</span>
              </button>
            </div>

            {/* Quick Multi-Year KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {rekodTahunanList.map(r => (
                <div key={r.tahun} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="font-extrabold text-white text-xs">Tahun {r.tahun}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                      r.statusAuditSKM === 'DISAHKAN_SKM' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {r.statusAuditSKM === 'DISAHKAN_SKM' ? 'TERAUDIT SKM' : 'DRAF / SEMASA'}
                    </span>
                  </div>

                  <div className="text-base font-black text-emerald-400">
                    {formatRM(r.untungBersih)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Hasil: {formatRM(r.jumlahHasil)}</span>
                    <span className="text-amber-300 font-bold">Div: {r.peratusDividen}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Comparison Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Jadual Perbandingan Penyata Kewangan Teraudit Koperasi (Year-on-Year)</span>
              </h4>

              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold border border-slate-700 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" /> Cetak Jadual Audit
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">Butiran Perakaunan & Audit</th>
                    {rekodTahunanList.map(r => (
                      <th key={r.tahun} className="px-4 py-3.5 text-right font-bold text-white bg-slate-900/60">
                        Tahun {r.tahun}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {/* Revenue */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-extrabold text-white">Jumlah Pendapatan / Hasil Operasi (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right font-bold text-emerald-400 font-mono">
                        {formatRM(r.jumlahHasil)}
                      </td>
                    ))}
                  </tr>

                  {/* Expense */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">Jumlah Belanja Operasi & Pentadbiran (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right text-rose-300 font-mono">
                        {formatRM(r.jumlahBelanja)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Profit */}
                  <tr className="bg-slate-950 font-bold">
                    <td className="px-4 py-3.5 text-white">Keuntungan Bersih Sebelum Statutori (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3.5 text-right text-emerald-300 text-sm font-mono">
                        {formatRM(r.untungBersih)}
                      </td>
                    ))}
                  </tr>

                  {/* Statutori KWRS 12% */}
                  <tr className="hover:bg-slate-800/30 text-[11px] text-slate-400">
                    <td className="px-4 py-2.5 pl-8">Tolok: Rizab Statutori SKM (KWRS 12%)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-2.5 text-right font-mono">
                        ({formatRM(r.kwrs12)})
                      </td>
                    ))}
                  </tr>

                  {/* Statutori KWPK 3% */}
                  <tr className="hover:bg-slate-800/30 text-[11px] text-slate-400">
                    <td className="px-4 py-2.5 pl-8">Tolok: Kumpulan Wang Pendidikan (KWPK 3%)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-2.5 text-right font-mono">
                        ({formatRM(r.kwpk3)})
                      </td>
                    ))}
                  </tr>

                  {/* Dividend Allocation */}
                  <tr className="hover:bg-slate-800/30 border-t border-slate-800">
                    <td className="px-4 py-3 font-bold text-amber-300">Agihan Dividen Syer Ahli (RM / %)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right font-bold text-amber-300 font-mono">
                        {formatRM(r.dividenAgihanRM)} ({r.peratusDividen}%)
                      </td>
                    ))}
                  </tr>

                  {/* Total Assets */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-blue-300">Jumlah Aset Teraudit (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right font-bold text-blue-300 font-mono">
                        {formatRM(r.totalAset)}
                      </td>
                    ))}
                  </tr>

                  {/* Total Liabilities */}
                  <tr className="hover:bg-slate-800/30 text-[11px]">
                    <td className="px-4 py-2.5 text-slate-400">Jumlah Liabiliti (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-2.5 text-right font-mono">
                        {formatRM(r.totalLiabiliti)}
                      </td>
                    ))}
                  </tr>

                  {/* Total Equity */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-emerald-400">Jumlah Ekuiti Ahli & Kumpulan Wang (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right font-bold text-emerald-400 font-mono">
                        {formatRM(r.totalEkuiti)}
                      </td>
                    ))}
                  </tr>

                  {/* Modal Syer */}
                  <tr className="hover:bg-slate-800/30 text-[11px]">
                    <td className="px-4 py-2.5 text-slate-300">Modal Syer Terbitan Terkumpul (RM)</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-2.5 text-right font-mono">
                        {formatRM(r.modalSyerTerkumpul)}
                      </td>
                    ))}
                  </tr>

                  {/* Bilangan Ahli */}
                  <tr className="hover:bg-slate-800/30 text-[11px]">
                    <td className="px-4 py-2.5 text-slate-300">Bilangan Keanggotaan Terdaftar</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-2.5 text-right font-mono font-bold text-white">
                        {r.bilanganAhli} Orang
                      </td>
                    ))}
                  </tr>

                  {/* Juruaudit & SKM */}
                  <tr className="bg-slate-950 text-[10px] text-slate-400">
                    <td className="px-4 py-3 font-bold text-slate-300 uppercase">Juruaudit Bertauliah & Status SKM</td>
                    {rekodTahunanList.map(r => (
                      <td key={r.tahun} className="px-4 py-3 text-right font-sans">
                        <div className="font-semibold text-slate-200">{r.juruauditBertauliah}</div>
                        <div className="text-emerald-400 font-mono mt-0.5">{r.catatanSKM}</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL: INPUT REKOD KEWANGAN TAHUNAN LEPAS */}
      {/* ========================================================================================= */}
      {showAddYearModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <span>Borang Rekod Kewangan Teraudit Tahun Terdahulu</span>
              </h3>
              <button
                onClick={() => setShowAddYearModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewYearRecord} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tahun Kewangan</label>
                  <input
                    type="number"
                    value={inputTahun}
                    onChange={(e) => setInputTahun(Number(e.target.value))}
                    required
                    min={2010}
                    max={2030}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Audit SKM</label>
                  <select
                    value={inputStatusAudit}
                    onChange={(e) => setInputStatusAudit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="DISAHKAN_SKM">DISAHKAN SKM (Teraudit)</option>
                    <option value="DALAM_PROSES">DALAM PROSES AUDIT</option>
                    <option value="DRAF">DRAF PENUTUPAN AKAUN</option>
                  </select>
                </div>
              </div>

              {/* Hasil & Belanja */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Hasil Operasi (RM)</label>
                  <input
                    type="number"
                    value={inputHasil}
                    onChange={(e) => handleCalculateUntung(Number(e.target.value), inputBelanja)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Belanja Operasi (RM)</label>
                  <input
                    type="number"
                    value={inputBelanja}
                    onChange={(e) => handleCalculateUntung(inputHasil, Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-rose-400 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Calculated Net Profit */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-300">Untung Bersih Dikira:</span>
                <span className="text-emerald-400 text-sm font-mono">{formatRM(inputUntungBersih)}</span>
              </div>

              {/* Dividen & Bil Ahli */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kadar Dividen Agihan (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputPeratusDividen}
                    onChange={(e) => setInputPeratusDividen(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-amber-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Dividen Agihan (RM)</label>
                  <input
                    type="number"
                    value={inputDividenRM}
                    onChange={(e) => setInputDividenRM(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-amber-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Balance Sheet Highlights */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Total Aset (RM)</label>
                  <input
                    type="number"
                    value={inputTotalAset}
                    onChange={(e) => setInputTotalAset(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-blue-300 rounded-xl px-2.5 py-1.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Liabiliti (RM)</label>
                  <input
                    type="number"
                    value={inputTotalLiabiliti}
                    onChange={(e) => setInputTotalLiabiliti(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Total Ekuiti (RM)</label>
                  <input
                    type="number"
                    value={inputTotalEkuiti}
                    onChange={(e) => setInputTotalEkuiti(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-300 rounded-xl px-2.5 py-1.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Juruaudit & Catatan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Firma Juruaudit Bertauliah SKM</label>
                <input
                  type="text"
                  value={inputJuruaudit}
                  onChange={(e) => setInputJuruaudit(e.target.value)}
                  placeholder="e.g. Tetuan Azman & Co."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Minit AGM / SKM</label>
                <input
                  type="text"
                  value={inputCatatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="e.g. Diluluskan pada AGM Ke-14"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg"
                >
                  Simpan Rekod Tahun {inputTahun}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Multi-Year Audit Summary Document */}
      <div id="printable-financial-years" className="hidden print:block bg-white text-slate-900 p-8 text-xs font-sans space-y-4">
        <div className="text-center border-b-2 border-slate-900 pb-3">
          <h2 className="font-black text-base uppercase">KOPERASI PERKHIDMATAN & USAHAWAN BERHAD</h2>
          <p className="font-bold text-xs uppercase text-slate-700">LAPORAN PENYATA KEWANGAN PERBANDINGAN TERAUDIT (2023 - 2026)</p>
          <p className="text-[10px] text-slate-500">Akaun Disediakan Mengikut Seksyen 57 Akta Koperasi 1993 • Suruhanjaya Koperasi Malaysia (SKM)</p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-400 p-2 font-bold">Ringkasan Butiran Perakaunan (RM)</th>
              {rekodTahunanList.map(r => (
                <th key={r.tahun} className="border border-slate-400 p-2 text-right font-bold">
                  Tahun {r.tahun}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-400 p-2 font-bold">Jumlah Hasil Operasi (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.jumlahHasil)}</td>
              ))}
            </tr>
            <tr>
              <td className="border border-slate-400 p-2">Jumlah Belanja Operasi (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.jumlahBelanja)}</td>
              ))}
            </tr>
            <tr className="font-bold bg-slate-50">
              <td className="border border-slate-400 p-2">Untung Bersih Operasi (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.untungBersih)}</td>
              ))}
            </tr>
            <tr>
              <td className="border border-slate-400 p-2">Agihan Dividen Syer Ahli (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.dividenAgihanRM)} ({r.peratusDividen}%)</td>
              ))}
            </tr>
            <tr className="font-bold">
              <td className="border border-slate-400 p-2">Jumlah Aset Koperasi (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.totalAset)}</td>
              ))}
            </tr>
            <tr>
              <td className="border border-slate-400 p-2">Jumlah Ekuiti Ahli (RM)</td>
              {rekodTahunanList.map(r => (
                <td key={r.tahun} className="border border-slate-400 p-2 text-right font-mono">{formatRM(r.totalEkuiti)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>



    </div>
  );
};
