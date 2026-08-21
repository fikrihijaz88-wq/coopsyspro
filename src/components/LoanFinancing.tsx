import React, { useState } from 'react';
import { PembiayaanAhli, Ahli, JenisPembiayaan, Transaksi } from '../types';
import { calculateLoanRiskScore, AIRiskAssessment } from '../utils/loanRiskAI';
import { 
  HandCoins, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calculator, 
  AlertCircle,
  Brain,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  BarChart2,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

interface LoanFinancingProps {
  pembiayaanList: PembiayaanAhli[];
  ahliList: Ahli[];
  transaksiList?: Transaksi[];
  onAddPembiayaan: (p: PembiayaanAhli) => void;
  onUpdateStatusPembiayaan: (id: string, status: 'DILULUSKAN' | 'DITOLAK') => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const LoanFinancing: React.FC<LoanFinancingProps> = ({
  pembiayaanList,
  ahliList,
  transaksiList = [],
  onAddPembiayaan,
  onUpdateStatusPembiayaan,
  language = 'BM',
}) => {
  const isEN = language === 'EN';

  // Modals state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPembiayaan, setSelectedPembiayaan] = useState<PembiayaanAhli | null>(null);
  const [selectedAIModal, setSelectedAIModal] = useState<PembiayaanAhli | null>(null);

  // Application form state
  const [selectedNoAhli, setSelectedNoAhli] = useState<string>(ahliList[0]?.noAhli || '');
  const [jenis, setJenis] = useState<JenisPembiayaan>('MURABAHAH_BARANGAN');
  const [jumlah, setJumlah] = useState<number>(10000);
  const [kadar, setKadar] = useState<number>(4.5);
  const [tempohBulan, setTempohBulan] = useState<number>(36);
  const [penjamin1, setPenjamin1] = useState<string>('Dato\' Ahmad Razali Bin Zainal');
  const [penjamin2, setPenjamin2] = useState<string>('Siti Nurhaliza Bt Mohd Safian');

  // Calculation for form application
  const untungKeseluruhan = jumlah * (kadar / 100) * (tempohBulan / 12);
  const totalAnggaranBayar = jumlah + untungKeseluruhan;
  const bayaranBulananAnggaran = totalAnggaranBayar / (tempohBulan || 1);

  // Helper: Find member by noAhli
  const currentFormMember = ahliList.find(a => a.noAhli === selectedNoAhli) || ahliList[0];

  // Count active guarantors in form
  const currentPenjaminCount = [penjamin1, penjamin2].filter(p => p.trim().length > 0).length;

  // Live AI Risk Assessment for Form Draft
  const liveFormAIRisk: AIRiskAssessment | null = currentFormMember
    ? calculateLoanRiskScore(
        currentFormMember,
        jumlah,
        bayaranBulananAnggaran,
        jenis,
        currentPenjaminCount,
        pembiayaanList,
        transaksiList
      )
    : null;

  // Helper to get AI Assessment for any existing loan item
  const getLoanAIRisk = (p: PembiayaanAhli): AIRiskAssessment => {
    const m = ahliList.find(a => a.noAhli === p.noAhli) || {
      id: 'AHLI-TEMP',
      noAhli: p.noAhli,
      nama: p.namaAhli,
      noKp: '',
      noTelefon: '',
      eMel: '',
      jawatanStaf: '',
      noGaji: '',
      majikan: '',
      tarikhSertai: '2021-01-01',
      status: 'AKTIF',
      yuranMasuk: 10,
      modalSyer: 4000,
      yuranBulanan: 100,
      bakiPinjaman: p.bakiPinjaman,
      waris: { nama: '', hubungan: '', noKp: '', noTelefon: '' },
      maklumatBank: { namaBank: '', noAkaun: '' },
    };

    return calculateLoanRiskScore(
      m as Ahli,
      p.jumlahPinjaman,
      p.bayaranBulanan,
      p.jenisPembiayaan,
      p.penjamin?.length || 0,
      pembiayaanList,
      transaksiList
    );
  };

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const ahli = ahliList.find(a => a.noAhli === selectedNoAhli);
    if (!ahli) return;

    const newPembiayaan: PembiayaanAhli = {
      id: `PEMB-${Date.now()}`,
      noAhli: ahli.noAhli,
      namaAhli: ahli.nama,
      jenisPembiayaan: jenis,
      jumlahPinjaman: Number(jumlah),
      kadarKeuntungan: Number(kadar),
      tempohBulan: Number(tempohBulan),
      bayaranBulanan: Number(bayaranBulananAnggaran.toFixed(2)),
      bakiPinjaman: Number(jumlah),
      tarikhPermohonan: new Date().toISOString().split('T')[0],
      status: 'PERMOHONAN',
      penjamin: [penjamin1, penjamin2].filter(Boolean),
    };

    onAddPembiayaan(newPembiayaan);
    setShowModal(false);
  };

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // Dashboard Stats Calculations
  const pendingLoans = pembiayaanList.filter(p => p.status === 'PERMOHONAN');
  const approvedLoans = pembiayaanList.filter(p => p.status === 'DILULUSKAN');
  
  // Calculate average AI risk score for pending loans or all loans
  const allRiskScores = pembiayaanList.map(p => getLoanAIRisk(p).score);
  const avgRiskScore = allRiskScores.length > 0
    ? Math.round(allRiskScores.reduce((a, b) => a + b, 0) / allRiskScores.length)
    : 85;

  const lowRiskCount = pembiayaanList.filter(p => getLoanAIRisk(p).grade === 'A').length;
  const medRiskCount = pembiayaanList.filter(p => getLoanAIRisk(p).grade === 'B').length;
  const highRiskCount = pembiayaanList.filter(p => getLoanAIRisk(p).grade === 'C').length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <HandCoins className="w-6 h-6 text-emerald-400" />
            {isEN ? 'Co-operative Member Financing & AI Risk Assessment' : 'Modul Pembiayaan & Model Penilaian Risiko AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Automated AI Credit & Risk Scoring Model analyzing member share contributions, payroll payment history, and DSR before ALK Board approval.'
              : 'Model Penilaian Risiko Pembiayaan berasaskan AI yang menganalisis sejarah caruman syer/yuran, rekod potongan gaji, & nisbah khidmat hutang sebelum kelulusan Mesyuarat ALK.'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> {isEN ? 'New Financing Application' : 'Permohonan Pembiayaan Baru'}
        </button>
      </div>

      {/* AI Risk & Loan Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Pending ALK Applications */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              {isEN ? 'Pending ALK Review' : 'Permohonan Menunggu ALK'}
            </span>
            <div className="text-2xl font-black text-amber-400 flex items-baseline gap-2">
              {pendingLoans.length}
              <span className="text-xs text-slate-400 font-normal">
                ({formatRM(pendingLoans.reduce((a, b) => a + b.jumlahPinjaman, 0))})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 2: AI Risk Score Average */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {isEN ? 'Average AI Risk Score' : 'Purata Skor Risiko AI'}
            </span>
            <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-2">
              {avgRiskScore}
              <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 3: Active Loans Portfolio */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              {isEN ? 'Active Loans Approved' : 'Jumlah Pembiayaan Lulus'}
            </span>
            <div className="text-xl font-bold text-white">
              {formatRM(approvedLoans.reduce((a, b) => a + b.bakiPinjaman, 0))}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{approvedLoans.length} pembiayaan aktif</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 4: AI Risk Distribution Grade */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> {isEN ? 'AI Risk Distribution' : 'Taburan Profil Risiko AI'}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-emerald-950/60 border border-emerald-800/80 p-1.5 rounded-lg text-center">
              <span className="block text-[10px] text-emerald-400 font-bold">Gred A</span>
              <span className="font-extrabold text-white">{lowRiskCount}</span>
            </div>
            <div className="flex-1 bg-amber-950/60 border border-amber-800/80 p-1.5 rounded-lg text-center">
              <span className="block text-[10px] text-amber-400 font-bold">Gred B</span>
              <span className="font-extrabold text-white">{medRiskCount}</span>
            </div>
            <div className="flex-1 bg-rose-950/60 border border-rose-800/80 p-1.5 rounded-lg text-center">
              <span className="block text-[10px] text-rose-400 font-bold">Gred C</span>
              <span className="font-extrabold text-white">{highRiskCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Loan Applications & Active Loans List with AI Assessment Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              {isEN ? 'Loan Applications & Board Review Panel' : 'Senarai Permohonan & Penilaian Risiko Ahli'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEN 
                ? 'Click on the AI Risk Score badge to view comprehensive member financial health & credit risk analysis.'
                : 'Klik butang Laporan AI pada setiap permohonan untuk melihat perincian skor kredit & sokongan bukti caruman.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isEN ? 'Member / App ID' : 'Ahli / No. Permohonan'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Financing Scheme' : 'Skim Pembiayaan'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Amount (RM)' : 'Jumlah Pohon / Lulus'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Monthly' : 'Ansuran Bulanan'}</th>
                <th className="px-4 py-3.5 text-center">{isEN ? 'AI Risk Scoring' : 'Penilaian Risiko AI'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Status' : 'Status ALK'}</th>
                <th className="px-4 py-3.5 text-center">{isEN ? 'Actions' : 'Tindakan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pembiayaanList.map((p) => {
                const aiRisk = getLoanAIRisk(p);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Member Details */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm">{p.namaAhli}</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{p.id} • {p.noAhli}</div>
                    </td>

                    {/* Scheme */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200">
                        {p.jenisPembiayaan.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {p.kadarKeuntungan}% p.a. ({p.tempohBulan} bulan)
                      </div>
                    </td>

                    {/* Loan Amount */}
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-400 text-sm">
                      {formatRM(p.jumlahPinjaman)}
                    </td>

                    {/* Monthly Installment */}
                    <td className="px-4 py-3.5 text-right font-semibold text-white">
                      {formatRM(p.bayaranBulanan)} / bln
                    </td>

                    {/* AI Risk Score Badge & Trigger */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedAIModal(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md group ${
                          aiRisk.grade === 'A'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
                            : aiRisk.grade === 'B'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900/90'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/80 hover:bg-rose-900/90'
                        }`}
                        title="Klik untuk Analisis Lengkap Risiko AI"
                      >
                        <Brain className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>{aiRisk.score}/100</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded uppercase">
                          Gred {aiRisk.grade}
                        </span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {p.status === 'DILULUSKAN' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DILULUSKAN
                        </span>
                      )}
                      {p.status === 'PERMOHONAN' && (
                        <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-400" /> MENUNGGU ALK
                        </span>
                      )}
                      {p.status === 'DITOLAK' && (
                        <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <XCircle className="w-3 h-3 text-rose-400" /> DITOLAK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Quick AI Report Trigger */}
                        <button
                          onClick={() => setSelectedAIModal(p)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                          title="Laporan Risiko AI"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Laporan AI</span>
                        </button>

                        {p.status === 'PERMOHONAN' && (
                          <>
                            <button
                              onClick={() => onUpdateStatusPembiayaan(p.id, 'DILULUSKAN')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              Lulus
                            </button>
                            <button
                              onClick={() => onUpdateStatusPembiayaan(p.id, 'DITOLAK')}
                              className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setSelectedPembiayaan(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                          title="Lihat Jadual Bayaran Balik"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED AI RISK ASSESSMENT MODAL */}
      {selectedAIModal && (() => {
        const aiRisk = getLoanAIRisk(selectedAIModal);
        const member = ahliList.find(a => a.noAhli === selectedAIModal.noAhli);

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl relative">
              
              {/* Modal Top Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-950 border border-emerald-800/80 rounded-xl text-emerald-400">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Laporan Model Penilaian Risiko AI
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 font-mono">
                        v2.4 SKM-AI Engine
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Pembiayaan: <strong className="text-white">{selectedAIModal.namaAhli}</strong> ({selectedAIModal.noAhli}) • Amaun: <span className="text-emerald-400 font-bold">{formatRM(selectedAIModal.jumlahPinjaman)}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAIModal(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
                
                {/* Score Summary & ALK Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Score Card */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-slate-400 font-semibold mb-1">Skor Risiko Kredit AI</span>
                    <div className="text-4xl font-extrabold my-2 flex items-baseline gap-1">
                      <span className={
                        aiRisk.grade === 'A' ? 'text-emerald-400' :
                        aiRisk.grade === 'B' ? 'text-amber-400' : 'text-rose-400'
                      }>{aiRisk.score}</span>
                      <span className="text-sm font-normal text-slate-500">/100</span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      aiRisk.grade === 'A' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      aiRisk.grade === 'B' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {aiRisk.labelBM}
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-200 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Syor Keputusan Mesyuarat ALK:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 mt-1">
                        {aiRisk.recommendationBM}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Syer vs Amaun Pinjaman:</span>
                        <strong className="text-white">{aiRisk.syerToLoanRatioPercent}% ({aiRisk.loanToSyerMultiplier}x)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Had Maksimum Syor AI:</span>
                        <strong className="text-emerald-400">{formatRM(aiRisk.maxRecommendedLoan)}</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 5 Risk Factor Breakdown Bars */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    Pecahan Skor Analisis 5 Unsur Risiko Koperasi
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    
                    {/* Item 1 */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>1. Kecukupan Modal Syer & Yuran (25%)</span>
                        <strong className="text-emerald-400">{aiRisk.breakdown.syerScore}/100</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${aiRisk.breakdown.syerScore}%` }} />
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>2. Rekod Bayaran Potongan Gaji (30%)</span>
                        <strong className="text-emerald-400">{aiRisk.breakdown.paymentScore}/100</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${aiRisk.breakdown.paymentScore}%` }} />
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>3. Nisbah Khidmat Hutang / DSR (25%)</span>
                        <strong className="text-emerald-400">{aiRisk.breakdown.dsrScore}/100</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${aiRisk.breakdown.dsrScore}%` }} />
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>4. Tempoh Keahlian Matang (10%)</span>
                        <strong className="text-emerald-400">{aiRisk.breakdown.tenureScore}/100</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${aiRisk.breakdown.tenureScore}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Positive Factors vs Risk Factors Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Positive Factors */}
                  <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Faktor Menyokong Kelulusan
                    </h5>
                    <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                      {aiRisk.positiveFactorsBM.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Factors */}
                  <div className="bg-rose-950/30 border border-rose-800/50 p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4" /> Faktor Risiko / Amaran Perhatian
                    </h5>
                    {aiRisk.riskFactorsBM.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                        {aiRisk.riskFactorsBM.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-emerald-400 text-[11px]">Tiada amaran risiko kritikal dikesan oleh model AI.</p>
                    )}
                  </div>

                </div>

                {/* Member Profile Quick Summary */}
                {member && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Modal Syer Terbitan:</span>
                      <strong className="text-white">{formatRM(member.modalSyer)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Yuran Bulanan:</span>
                      <strong className="text-white">{formatRM(member.yuranBulanan)}/bln</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Majikan / Jabatan:</span>
                      <strong className="text-slate-200">{member.majikan}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tarikh Menyertai:</span>
                      <strong className="text-slate-200">{member.tarikhSertai}</strong>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer with Direct ALK Decision Buttons */}
              <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Status Semasa: <strong className="text-amber-400">{selectedAIModal.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAIModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Tutup
                  </button>

                  {selectedAIModal.status === 'PERMOHONAN' && (
                    <>
                      <button
                        onClick={() => {
                          onUpdateStatusPembiayaan(selectedAIModal.id, 'DITOLAK');
                          setSelectedAIModal(null);
                        }}
                        className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Tolak Permohonan
                      </button>

                      <button
                        onClick={() => {
                          onUpdateStatusPembiayaan(selectedAIModal.id, 'DILULUSKAN');
                          setSelectedAIModal(null);
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Luluskan Pembiayaan ALK
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal Repayment Schedule Viewer */}
      {selectedPembiayaan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedPembiayaan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <Calculator className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Jadual Bayaran Balik Pembiayaan Ahli</h3>
                <p className="text-xs text-slate-400">Ahli: <strong className="text-white">{selectedPembiayaan.namaAhli}</strong> ({selectedPembiayaan.noAhli})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 text-xs">
              <div>
                <span className="text-slate-400">Jumlah Pinjaman:</span>
                <p className="font-bold text-white text-sm">{formatRM(selectedPembiayaan.jumlahPinjaman)}</p>
              </div>
              <div>
                <span className="text-slate-400">Kadar Keuntungan:</span>
                <p className="font-bold text-emerald-400 text-sm">{selectedPembiayaan.kadarKeuntungan}% p.a.</p>
              </div>
              <div>
                <span className="text-slate-400">Tempoh Bayaran:</span>
                <p className="font-bold text-white text-sm">{selectedPembiayaan.tempohBulan} Bulan</p>
              </div>
              <div>
                <span className="text-slate-400">Bayaran Bulanan:</span>
                <p className="font-bold text-amber-400 text-sm">{formatRM(selectedPembiayaan.bayaranBulanan)}</p>
              </div>
            </div>

            {/* Guarantors */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 mb-4 text-xs">
              <span className="font-bold text-slate-300">Penjamin Diberitahu:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedPembiayaan.penjamin.map((pen, idx) => (
                  <span key={idx} className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-200">
                    Penjamin {idx + 1}: {pen}
                  </span>
                ))}
              </div>
            </div>

            {/* Generated monthly schedule preview */}
            <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Bulan Ke-</th>
                    <th className="px-3 py-2 text-right">Ansuran Bulanan</th>
                    <th className="px-3 py-2 text-right">Pokok (RM)</th>
                    <th className="px-3 py-2 text-right">Untung Koperasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Array.from({ length: Math.min(12, selectedPembiayaan.tempohBulan) }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-mono">Bulan {idx + 1}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-400">{formatRM(selectedPembiayaan.bayaranBulanan)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{formatRM(selectedPembiayaan.bayaranBulanan * 0.85)}</td>
                      <td className="px-3 py-2 text-right text-purple-300">{formatRM(selectedPembiayaan.bayaranBulanan * 0.15)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedPembiayaan(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Tutup Jadual
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NEW LOAN APPLICATION MODAL WITH LIVE AI RISK SIMULATION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-6 p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-400" /> Borang Permohonan Pembiayaan Ahli
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLoan} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Form Inputs (Left 2 cols) */}
                <div className="md:col-span-2 space-y-3">
                  
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Pilih Ahli Koperasi *</label>
                    <select
                      value={selectedNoAhli}
                      onChange={(e) => setSelectedNoAhli(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                    >
                      {ahliList.map(a => (
                        <option key={a.id} value={a.noAhli}>
                          {a.nama} ({a.noAhli} - Syer: RM {a.modalSyer})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Jenis Skim Pembiayaan</label>
                      <select
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value as JenisPembiayaan)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="MURABAHAH_BARANGAN">Pembiayaan Murabahah Barangan</option>
                        <option value="PINJAMAN_DIRI">Pinjaman Diri Ahli</option>
                        <option value="PEMBIAYAN_PENDIDIKAN">Pembiayaan Pendidikan</option>
                        <option value="KENDERAAN">Pembiayaan Kenderaan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Jumlah Pohon (RM) *</label>
                      <input
                        type="number"
                        min={1000}
                        max={50000}
                        step={500}
                        value={jumlah}
                        onChange={(e) => setJumlah(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Kadar Keuntungan (% p.a.)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={kadar}
                        onChange={(e) => setKadar(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Tempoh Bayaran (Bulan)</label>
                      <select
                        value={tempohBulan}
                        onChange={(e) => setTempohBulan(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value={12}>12 Bulan (1 Tahun)</option>
                        <option value={24}>24 Bulan (2 Tahun)</option>
                        <option value={36}>36 Bulan (3 Tahun)</option>
                        <option value={48}>48 Bulan (4 Tahun)</option>
                        <option value={60}>60 Bulan (5 Tahun)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculator Summary */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Anggaran Keuntungan Koperasi:</span>
                      <span className="text-white font-semibold">{formatRM(untungKeseluruhan)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Anggaran Bayaran Bulanan:</span>
                      <span className="text-amber-400 font-bold text-sm">{formatRM(bayaranBulananAnggaran)} / bulan</span>
                    </div>
                  </div>

                  {/* Penjamin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Nama Penjamin 1</label>
                      <input
                        type="text"
                        value={penjamin1}
                        onChange={(e) => setPenjamin1(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Nama penjamin pertama..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Nama Penjamin 2</label>
                      <input
                        type="text"
                        value={penjamin2}
                        onChange={(e) => setPenjamin2(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Nama penjamin kedua..."
                      />
                    </div>
                  </div>

                </div>

                {/* Live AI Risk Assessment Panel (Right col) */}
                {liveFormAIRisk && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2">
                        <Brain className="w-4 h-4" /> Simulasi Risiko AI Real-Time
                      </div>

                      <div className="text-center bg-slate-900 p-3 rounded-xl border border-slate-800 mb-3">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Skor Kelayakan AI</span>
                        <div className={`text-3xl font-black ${
                          liveFormAIRisk.grade === 'A' ? 'text-emerald-400' :
                          liveFormAIRisk.grade === 'B' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {liveFormAIRisk.score} <span className="text-xs font-normal text-slate-500">/100</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 mt-1 block">
                          {liveFormAIRisk.labelBM}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between border-b border-slate-800/60 pb-1">
                          <span className="text-slate-400">Gandaan Syer:</span>
                          <span className="font-bold text-white">{liveFormAIRisk.loanToSyerMultiplier}x Syer</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/60 pb-1">
                          <span className="text-slate-400">Amaun Maksimum Syor:</span>
                          <span className="font-bold text-emerald-400">{formatRM(liveFormAIRisk.maxRecommendedLoan)}</span>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 leading-tight">
                        <span className="font-bold text-amber-400 block mb-0.5">Catatan Model AI:</span>
                        {liveFormAIRisk.recommendationBM}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 italic text-center">
                      *Skor dikemaskini secara automatik mengikut input pembiayaan.
                    </div>

                  </div>
                )}

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <HandCoins className="w-4 h-4" /> Hantar Permohonan kepada ALK
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
