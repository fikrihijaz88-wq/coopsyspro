import React, { useState, useMemo } from 'react';
import { Ahli } from '../types';
import { excelExport } from '../utils/excelExport';
import {
  PieChart,
  Coins,
  Percent,
  Printer,
  Download,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Building,
  User,
  Calculator,
  TrendingUp,
  Sliders,
  Search,
  Award,
  DollarSign,
  Sparkles,
  HelpCircle,
  Info,
  Calendar,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';

interface DividendDistributionProps {
  ahliList: Ahli[];
  totalUntungBersih: number;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const DividendDistribution: React.FC<DividendDistributionProps> = ({
  ahliList,
  totalUntungBersih,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';

  // Active Sub-Tab: 'AGIHAN_SEBENAR' | 'SIMULASI_PROSPEK' | 'PANDUAN_ZAKAT'
  const [activeTab, setActiveTab] = useState<'AGIHAN_SEBENAR' | 'SIMULASI_PROSPEK' | 'PANDUAN_ZAKAT'>('AGIHAN_SEBENAR');

  // --- ACTUAL DISTRIBUTION STATES ---
  const [kadarDividen, setKadarDividen] = useState<number>(7.5); // % (Max 10% under Akta Koperasi 1993)
  const [potongZakatPerniagaan, setPotongZakatPerniagaan] = useState<boolean>(true); // Corporate Zakat 2.5%
  const [potongZakatDividenAhli, setPotongZakatDividenAhli] = useState<boolean>(true); // Member Dividend Zakat 2.5%
  const [selectedAhliVoucher, setSelectedAhliVoucher] = useState<Ahli | null>(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');

  // --- PROJECTION SIMULATION STATES ---
  const [simulatedNetProfit, setSimulatedNetProfit] = useState<number>(
    totalUntungBersih > 0 ? totalUntungBersih : 350000
  );
  const [simulatedDividendRate, setSimulatedDividendRate] = useState<number>(8.0);
  const [simulatedShareGrowthRate, setSimulatedShareGrowthRate] = useState<number>(10.0); // 10% annual growth in shares
  const [simulatedCorporateZakat, setSimulatedCorporateZakat] = useState<boolean>(true);
  const [simulatedMemberZakat, setSimulatedMemberZakat] = useState<boolean>(true);
  const [selectedMemberForSimulationId, setSelectedMemberForSimulationId] = useState<string>('');

  // Filter active members
  const activeMembers = useMemo(() => {
    return ahliList.filter(a => a.status === 'AKTIF');
  }, [ahliList]);

  // Default selected member for projection if none selected
  const activeMemberForSimulation = useMemo(() => {
    if (!selectedMemberForSimulationId && activeMembers.length > 0) {
      return activeMembers[0];
    }
    return activeMembers.find(a => a.id === selectedMemberForSimulationId) || activeMembers[0];
  }, [activeMembers, selectedMemberForSimulationId]);

  const totalModalSyerKeseluruhan = useMemo(() => {
    return activeMembers.reduce((acc, curr) => acc + curr.modalSyer, 0);
  }, [activeMembers]);

  // Format Currency helper
  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // --- 1. ACTUAL DISTRIBUTION CALCULATIONS ---
  // Statutory Deductions (Akta Koperasi 1993)
  const kwrs12 = Math.max(0, totalUntungBersih * 0.12); // Kumpulan Wang Rizab Statutori 12%
  const kwpk3 = Math.max(0, totalUntungBersih * 0.03);   // Kumpulan Wang Pelajaran Koperasi 3%
  const kwp1 = Math.max(0, totalUntungBersih * 0.01);    // Kumpulan Wang Pembangunan Koperasi 1%
  const totalStatutoriDeductions = kwrs12 + kwpk3 + kwp1;

  // Zakat Perniagaan Koperasi (2.5% of net profit or net profit after statutory)
  const zakatPerniagaanRM = potongZakatPerniagaan ? Math.max(0, totalUntungBersih * 0.025) : 0;

  // Untung Bersih Boleh Diagih (Net Distributable Profit)
  const untungBolehDiagih = Math.max(0, totalUntungBersih - totalStatutoriDeductions - zakatPerniagaanRM);

  // Total required dividend funds
  const totalDividenKasarRM = totalModalSyerKeseluruhan * (kadarDividen / 100);
  const totalZakatDividenAhliRM = potongZakatDividenAhli ? totalDividenKasarRM * 0.025 : 0;
  const totalDividenBersihRM = totalDividenKasarRM - totalZakatDividenAhliRM;

  const isDividenValid = kadarDividen <= 10.0; // Seksyen 57 Akta Koperasi 1993
  const isAffordable = totalDividenKasarRM <= untungBolehDiagih;

  // Filtered member list for search
  const filteredActiveMembers = useMemo(() => {
    if (!searchMemberQuery.trim()) return activeMembers;
    const q = searchMemberQuery.toLowerCase();
    return activeMembers.filter(
      a => a.nama.toLowerCase().includes(q) || a.noAhli.toLowerCase().includes(q) || a.noKp.includes(q)
    );
  }, [activeMembers, searchMemberQuery]);

  // --- 2. PROJECTION SIMULATION CALCULATIONS ---
  const simKWRS = Math.max(0, simulatedNetProfit * 0.12);
  const simKWPK = Math.max(0, simulatedNetProfit * 0.03);
  const simKWP = Math.max(0, simulatedNetProfit * 0.01);
  const simStatutoriTotal = simKWRS + simKWPK + simKWP;

  const simZakatPerniagaanRM = simulatedCorporateZakat ? Math.max(0, simulatedNetProfit * 0.025) : 0;
  const simDistributableProfit = Math.max(0, simulatedNetProfit - simStatutoriTotal - simZakatPerniagaanRM);

  const simTotalDividendGrossRM = totalModalSyerKeseluruhan * (simulatedDividendRate / 100);
  const simTotalDividendZakatRM = simulatedMemberZakat ? simTotalDividendGrossRM * 0.025 : 0;
  const simTotalDividendNetRM = simTotalDividendGrossRM - simTotalDividendZakatRM;
  const simSurplusBalance = simDistributableProfit - simTotalDividendGrossRM;

  // Individual Member 3-Year Projection Calculations
  const member3YearProjection = useMemo(() => {
    if (!activeMemberForSimulation) return [];

    const baseShares = activeMemberForSimulation.modalSyer;
    const yearsData = [];

    for (let yr = 1; yr <= 3; yr++) {
      // Compounded share growth
      const projectedShares = baseShares * Math.pow(1 + simulatedShareGrowthRate / 100, yr - 1);
      const grossDividend = projectedShares * (simulatedDividendRate / 100);
      const zakatDividen = simulatedMemberZakat ? grossDividend * 0.025 : 0;
      const netDividend = grossDividend - zakatDividen;
      const effectiveYield = projectedShares > 0 ? (netDividend / projectedShares) * 100 : 0;

      yearsData.push({
        tahun: `${isEN ? 'Year' : 'Tahun'} ${yr}`,
        tahunNum: yr,
        SyerDiunjurkan: Math.round(projectedShares * 100) / 100,
        DividenKasar: Math.round(grossDividend * 100) / 100,
        ZakatDividen: Math.round(zakatDividen * 100) / 100,
        DividenBersih: Math.round(netDividend * 100) / 100,
        PeratusPulangan: Math.round(effectiveYield * 100) / 100
      });
    }

    return yearsData;
  }, [activeMemberForSimulation, simulatedShareGrowthRate, simulatedDividendRate, simulatedMemberZakat, isEN]);

  // Recharts Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <p className="font-extrabold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' ? formatRM(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {isEN ? 'Section 57 Co-op Act & Zakat Compliant' : 'Pematuhan Seksyen 57 Akta Koperasi & Zakat'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/80">
              {activeMembers.length} {isEN ? 'Active Share Members' : 'Ahli Syer Aktif'}
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-400" /> 
            <span>{isEN ? 'Dividend Distribution & Zakat Simulation Engine' : 'Pengagihan Dividen, Zakat & Simulasi Prospek Ahli'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Calculate statutory SKM deductions, simulate dividend payouts & Zakat Perniagaan / Dividen for individual members.'
              : 'Pengiraan dividen syer bulanan, statutori SKM, pengiraan Zakat Koperasi & simulasi unjuran hasil dividen individu ahli.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs shrink-0 flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">{isEN ? 'Current Net Profit:' : 'Untung Bersih Semasa:'}</span>
              <p className="text-base font-bold text-white">{formatRM(totalUntungBersih)}</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">{isEN ? 'Distributable Profit:' : 'Untung Boleh Diagih:'}</span>
              <p className="text-base font-bold text-emerald-400">{formatRM(untungBolehDiagih)}</p>
            </div>
          </div>

          <button
            onClick={() => {
              excelExport.exportDividendSchedule(
                ahliList,
                kadarDividen,
                'Koperasi_Warga_Berdaya',
                2026
              );
            }}
            className="px-3.5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 shrink-0"
            title="Muat turun Jadual Dividen & Format Pindahan Bank (Excel)"
          >
            <Download className="w-4 h-4" />
            <span>{isEN ? 'Export Excel' : 'Eksport Excel'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('AGIHAN_SEBENAR')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'AGIHAN_SEBENAR'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-300" />
          <span>{isEN ? 'Actual Dividend & Zakat Distribution' : 'Pengagihan Dividen & Zakat Semasa'}</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULASI_PROSPEK')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'SIMULASI_PROSPEK'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calculator className="w-4 h-4 text-indigo-300" />
          <span>{isEN ? 'Individual Member Projection Simulator' : 'Simulasi Unjuran Dividen & Zakat Ahli'}</span>
          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] rounded-full font-mono">
            {isEN ? 'PROJECTION' : 'PROSPEK'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PANDUAN_ZAKAT')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'PANDUAN_ZAKAT'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>{isEN ? 'Zakat Compliance & Guide' : 'Panduan Zakat Koperasi & Ahli'}</span>
        </button>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-TAB 1: ACTUAL DIVIDEND & ZAKAT DISTRIBUTION */}
      {/* ========================================================================================= */}
      {activeTab === 'AGIHAN_SEBENAR' && (
        <div className="space-y-6">
          
          {/* Dividend Control & Compliance Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Rate & Zakat Setup Column */}
            <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Percent className="w-4 h-4 text-emerald-400" /> {isEN ? 'Dividend & Zakat Rate Setup' : 'Tetapan Kadar Dividen & Zakat'}
              </h3>

              {/* Rate Input */}
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">
                  {isEN ? 'Proposed Dividend Rate (% p.a.)' : 'Kadar Dividen Cadangan (% p.a.)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.25}
                    value={kadarDividen}
                    onChange={(e) => setKadarDividen(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-black text-xl rounded-xl px-3.5 py-2.5 focus:border-emerald-500 outline-none"
                  />
                  <span className="text-slate-400 font-bold text-lg">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Seksyen 57 Akta Koperasi 1993 menetapkan kadar dividen tidak melebihi 10.0%.
                </p>
              </div>

              {/* Zakat Perniagaan Koperasi Toggle */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                      {isEN ? 'Corporate Co-op Zakat (2.5%)' : 'Zakat Perniagaan Koperasi (2.5%)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEN ? 'Deduct 2.5% from net profit for State Zakat Board' : 'Ditolak daripada untung bersih sebelum agihan'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPotongZakatPerniagaan(!potongZakatPerniagaan)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      potongZakatPerniagaan ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        potongZakatPerniagaan ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {potongZakatPerniagaan && (
                  <div className="text-right text-xs font-mono font-extrabold text-amber-400 border-t border-slate-800/80 pt-1.5">
                    {formatRM(zakatPerniagaanRM)}
                  </div>
                )}
              </div>

              {/* Auto Zakat Dividen Ahli Toggle */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      {isEN ? 'Deduct Member Zakat at Source (2.5%)' : 'Potong Zakat Dividen Ahli di Punca (2.5%)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEN ? 'Auto-deduct 2.5% Zakat from individual dividend payouts' : 'Auto-potong 2.5% daripada bayaran dividen ahli'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPotongZakatDividenAhli(!potongZakatDividenAhli)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      potongZakatDividenAhli ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        potongZakatDividenAhli ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {potongZakatDividenAhli && (
                  <div className="text-right text-xs font-mono font-extrabold text-emerald-400 border-t border-slate-800/80 pt-1.5">
                    {formatRM(totalZakatDividenAhliRM)} ({isEN ? 'Total Pooled Zakat' : 'Terkumpul Bagi Ahli'})
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span>{isEN ? 'Total Member Share Capital:' : 'Jumlah Modal Syer:'}</span>
                  <span className="font-semibold text-white">{formatRM(totalModalSyerKeseluruhan)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{isEN ? 'Gross Dividend Required:' : 'Jumlah Dividen Kasar:'}</span>
                  <span className="font-bold text-amber-300">{formatRM(totalDividenKasarRM)}</span>
                </div>
                {potongZakatDividenAhli && (
                  <div className="flex justify-between text-emerald-400 font-semibold text-[11px]">
                    <span>(-) Potongan Zakat Dividen (2.5%):</span>
                    <span>-{formatRM(totalZakatDividenAhliRM)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5 font-bold">
                  <span>{isEN ? 'Net Dividend Payable:' : 'Nett Dividen Dibayar Ahli:'}</span>
                  <span className="text-emerald-400 font-mono">{formatRM(totalDividenBersihRM)}</span>
                </div>
              </div>

              {!isDividenValid && (
                <div className="p-3 bg-rose-950 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  Kadar dividen melebihi 10% melanggar Seksyen 57 Akta Koperasi 1993.
                </div>
              )}

              {isDividenValid && isAffordable && (
                <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Kadar dividen & zakat mematuhi syarat Akta serta mencukupi daripada untung bersih.
                </div>
              )}

              {isDividenValid && !isAffordable && (
                <div className="p-3 bg-amber-950 border border-amber-800 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  Keuntungan bersih tidak mencukupi untuk kadar dividen {kadarDividen}%.
                </div>
              )}
            </div>

            {/* Breakdown Statutori SKM & Zakat Summary */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  {isEN ? 'SKM Statutory Deductions & Co-op Zakat Breakdown (2026)' : 'Pengagihan Keuntungan Statutori SKM & Zakat Koperasi (Tahun 2026)'}
                </h3>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full">
                  Akta Koperasi 1993
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold">KWRS (12%)</span>
                  <p className="text-base font-black text-emerald-400 mt-1">{formatRM(kwrs12)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Rizab Statutori SKM</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold">KWPK (3%)</span>
                  <p className="text-base font-black text-blue-400 mt-1">{formatRM(kwpk3)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kumpulan Wang Pelajaran</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold">KWP (1%)</span>
                  <p className="text-base font-black text-purple-400 mt-1">{formatRM(kwp1)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kumpulan Wang Pembangunan</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-900/50">
                  <span className="text-amber-300 font-semibold">Zakat Koperasi (2.5%)</span>
                  <p className="text-base font-black text-amber-400 mt-1">
                    {potongZakatPerniagaan ? formatRM(zakatPerniagaanRM) : 'RM 0.00'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {potongZakatPerniagaan ? 'Ditolak daripada untung' : 'Tidak diaktifkan'}
                  </p>
                </div>
              </div>

              {/* Net Distributable Summary Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {isEN ? 'Net Distributable Surplus After Statutory & Zakat:' : 'Baki Untung Bersih Boleh Diagih (Selepas Statutori & Zakat Koperasi):'}
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">{formatRM(untungBolehDiagih)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">{isEN ? 'Required For Dividends:' : 'Diperlukan Untuk Dividen Kasar:'}</span>
                    <span className="text-lg font-extrabold text-amber-300">{formatRM(totalDividenKasarRM)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-400">
                    <span className="font-semibold text-slate-300">Status Cadangan AGM:</span> Perlu diluluskan oleh Mesyuarat Agung Tahunan Koperasi
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold text-[11px]">
                    SIAP DRAF AGM 2026
                  </span>
                </div>
              </div>

              {/* Zakat Payment Note */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs text-indigo-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Nota Penyata Zakat Koperasi:</span>
                  {potongZakatDividenAhli ? (
                    <span>
                      Potongan Zakat Dividen Ahli di punca sebanyak 2.5% ({formatRM(totalZakatDividenAhliRM)}) akan disalurkan secara pukal bagi pihak ahli kepada Pusat Zakat Negeri / PPZ MAIWP.
                    </span>
                  ) : (
                    <span>
                      Zakat dividen ahli tidak dipotong secara automatik. Ahli bertanggungjawab menunaikan zakat pelaburan / dividen secara bersendirian sekiranya cukup nisab dan haul.
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Individual Member Dividend List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
            
            {/* Header and Search */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{isEN ? 'Member Dividend & Zakat Statement List' : 'Senarai Pengiraan Dividen & Zakat Ahli'} ({kadarDividen}% p.a.)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEN ? 'Kaedah Baki Modal Syer Dipegang' : 'Kaedah baki modal syer terkumpul ahli'}
                </p>
              </div>

              {/* Member Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isEN ? 'Search member name or ID...' : 'Cari nama atau No. Ahli...'}
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Member Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">No. Ahli & Nama</th>
                    <th className="px-4 py-3.5 text-right">Modal Syer (RM)</th>
                    <th className="px-4 py-3.5 text-right">Dividen Kasar ({kadarDividen}%)</th>
                    <th className="px-4 py-3.5 text-right">Zakat Dividen (2.5%)</th>
                    <th className="px-4 py-3.5 text-right">Dividen Bersih (RM)</th>
                    <th className="px-4 py-3.5">Akaun Bank Ahli</th>
                    <th className="px-4 py-3.5 text-center">Baucer & Penyata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredActiveMembers.length > 0 ? (
                    filteredActiveMembers.map((ahli) => {
                      const dividenKasarRM = ahli.modalSyer * (kadarDividen / 100);
                      const zakatDividenRM = potongZakatDividenAhli ? dividenKasarRM * 0.025 : 0;
                      const dividenBersihRM = dividenKasarRM - zakatDividenRM;

                      return (
                        <tr key={ahli.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white">
                            {ahli.nama}
                            <div className="text-[11px] text-emerald-400 font-mono font-normal flex items-center gap-1.5 mt-0.5">
                              <span>{ahli.noAhli}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 font-sans">{ahli.noKp}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold text-emerald-400 font-mono">
                            {formatRM(ahli.modalSyer)}
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold text-amber-300 font-mono">
                            {formatRM(dividenKasarRM)}
                          </td>

                          <td className="px-4 py-3.5 text-right font-semibold text-rose-300 font-mono">
                            {potongZakatDividenAhli ? (
                              <span>-{formatRM(zakatDividenRM)}</span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Dibayar Ahli</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right font-black text-emerald-300 text-sm font-mono">
                            {formatRM(dividenBersihRM)}
                          </td>

                          <td className="px-4 py-3.5 text-slate-300">
                            <div className="font-semibold text-white">{ahli.maklumatBank.namaBank}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{ahli.maklumatBank.noAkaun}</div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => setSelectedAhliVoucher(ahli)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 mx-auto transition-all shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" /> Baucer & Zakat
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 text-xs font-semibold">
                        Tiada ahli aktif ditemui mengikut kriteria carian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 2: INDIVIDUAL MEMBER PROJECTION SIMULATOR */}
      {/* ========================================================================================= */}
      {activeTab === 'SIMULASI_PROSPEK' && (
        <div className="space-y-6">

          {/* Controls Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>{isEN ? 'Interactive Dividend & Zakat Projection Simulator' : 'Simulasi Unjuran Dividen, Syer & Zakat Ahli (3 Tahun)'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEN
                    ? 'Adjust annual profit, dividend rates & share growth to simulate individual member returns over 3 years.'
                    : 'Ubah anggaran keuntungan tahunan, kadar dividen & kadar pertumbuhan syer untuk melihat simulasi hasil pulangan ahli.'}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/80 flex items-center gap-1.5 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {isEN ? 'Real-Time Projection Engine' : 'Enjin Unjuran Masa-Nyata'}
              </span>
            </div>

            {/* Slider & Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 1. Projected Net Surplus Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    {isEN ? 'Projected Annual Net Surplus' : 'Untung Bersih Tahunan Diunjurkan'}
                  </label>
                  <span className="text-sm font-black text-emerald-400 font-mono">{formatRM(simulatedNetProfit)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={25000}
                  value={simulatedNetProfit}
                  onChange={(e) => setSimulatedNetProfit(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>RM 50,000</span>
                  <span>RM 1,000,000</span>
                  <span>RM 2,000,000</span>
                </div>
              </div>

              {/* 2. Simulated Dividend Rate Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-400" />
                    {isEN ? 'Target Dividend Rate' : 'Kadar Dividen Unjuran'}
                  </label>
                  <span className="text-sm font-black text-amber-400 font-mono">{simulatedDividendRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={simulatedDividendRate}
                  onChange={(e) => setSimulatedDividendRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.0%</span>
                  <span>5.0%</span>
                  <span>10.0% (Max Akta)</span>
                </div>
              </div>

              {/* 3. Share Growth Rate Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    {isEN ? 'Annual Share Capital Growth' : 'Kadar Pertumbuhan Syer Tahunan'}
                  </label>
                  <span className="text-sm font-black text-indigo-400 font-mono">{simulatedShareGrowthRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={2.5}
                  value={simulatedShareGrowthRate}
                  onChange={(e) => setSimulatedShareGrowthRate(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Tetap)</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>

            </div>

            {/* Zakat Options Row in Simulation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={simulatedCorporateZakat}
                    onChange={(e) => setSimulatedCorporateZakat(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>{isEN ? 'Include Corporate Zakat (2.5%)' : 'Sertakan Zakat Perniagaan Koperasi (2.5%)'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={simulatedMemberZakat}
                    onChange={(e) => setSimulatedMemberZakat(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>{isEN ? 'Deduct Member Zakat (2.5%)' : 'Potong Zakat Dividen Ahli di Punca (2.5%)'}</span>
                </label>
              </div>

              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baki Keuntungan Diunjurkan: <strong className="text-white font-mono">{formatRM(simSurplusBalance)}</strong></span>
              </div>
            </div>

          </div>

          {/* Individual Member Focus Card & Interactive Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Individual Member Selector & Summary */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {isEN ? 'Select Member for Individual Projection:' : 'Pilih Ahli Untuk Unjuran Individu:'}
                </label>
                <select
                  value={activeMemberForSimulation?.id || ''}
                  onChange={(e) => setSelectedMemberForSimulationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 focus:border-indigo-500 outline-none"
                >
                  {activeMembers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama} ({a.noAhli}) - Syer: RM{a.modalSyer.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {activeMemberForSimulation && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-black text-white text-sm">{activeMemberForSimulation.nama}</h4>
                      <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{activeMemberForSimulation.noAhli} • {activeMemberForSimulation.jawatan}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md text-[10px] font-bold">
                      {activeMemberForSimulation.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Baki Modal Syer Semasa:</span>
                      <span className="font-bold text-white font-mono">{formatRM(activeMemberForSimulation.modalSyer)}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Unjuran Pertumbuhan Syer:</span>
                      <span className="font-bold text-indigo-400 font-mono">+{simulatedShareGrowthRate}% / tahun</span>
                    </div>

                    <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-2">
                      <span>Dividen Kasar Tahun 1 ({simulatedDividendRate}%):</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {formatRM(activeMemberForSimulation.modalSyer * (simulatedDividendRate / 100))}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Zakat Dividen (2.5%):</span>
                      <span className="font-bold text-rose-300 font-mono">
                        {simulatedMemberZakat ? `-${formatRM(activeMemberForSimulation.modalSyer * (simulatedDividendRate / 100) * 0.025)}` : 'RM 0.00'}
                      </span>
                    </div>

                    <div className="flex justify-between text-emerald-400 font-black text-sm border-t border-slate-800 pt-2">
                      <span>JUMLAH BERSIH TAHUN 1:</span>
                      <span className="font-mono">
                        {formatRM(
                          activeMemberForSimulation.modalSyer * (simulatedDividendRate / 100) * (simulatedMemberZakat ? 0.975 : 1)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-[11px] text-indigo-300">
                💡 <strong>Tip Unjuran:</strong> Modal syer diunjurkan meningkat berdasarkan simpanan bulanan dan pembelian syer baru secara konsisten oleh ahli.
              </div>
            </div>

            {/* Right: Recharts 3-Year Projection Bar Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>Unjuran Dividen Kasar vs Zakat vs Dividen Bersih (3 Tahun)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Carta unjuran hasil dividen individu ahli bagi {activeMemberForSimulation?.nama}
                  </p>
                </div>
                <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-800 font-bold px-2.5 py-1 rounded-full">
                  Recharts Visual Engine
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={member3YearProjection} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="tahun" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `RM${val}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="DividenKasar" name="Dividen Kasar (RM)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ZakatDividen" name="Zakat Dividen 2.5% (RM)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="DividenBersih" name="Dividen Bersih Diterima (RM)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 3-Year Summary Cards Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                {member3YearProjection.map((item) => (
                  <div key={item.tahun} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{item.tahun}</span>
                    <span className="text-xs font-bold text-slate-300 block mt-0.5">Syer: {formatRM(item.SyerDiunjurkan)}</span>
                    <span className="text-sm font-black text-emerald-400 block mt-1">{formatRM(item.DividenBersih)}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">Yield: {item.PeratusPulangan}%</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Full Member Projection Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>Jadual Simulasi Unjuran Semua Ahli ({simulatedDividendRate}% p.a., Pertumbuhan Syer {simulatedShareGrowthRate}%)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Anggaran hasil dividen dan potongan zakat individu bagi semua ahli aktif
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" /> Cetak Laporan Unjuran
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">Ahli Koperasi</th>
                    <th className="px-4 py-3.5 text-right">Modal Syer Semasa</th>
                    <th className="px-4 py-3.5 text-right">Unjuran Syer (+{simulatedShareGrowthRate}%)</th>
                    <th className="px-4 py-3.5 text-right">Dividen Kasar ({simulatedDividendRate}%)</th>
                    <th className="px-4 py-3.5 text-right">Zakat (2.5%)</th>
                    <th className="px-4 py-3.5 text-right">Dividen Bersih (RM)</th>
                    <th className="px-4 py-3.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeMembers.map((a) => {
                    const projShares = a.modalSyer * (1 + simulatedShareGrowthRate / 100);
                    const projGross = projShares * (simulatedDividendRate / 100);
                    const projZakat = simulatedMemberZakat ? projGross * 0.025 : 0;
                    const projNet = projGross - projZakat;

                    return (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-sans font-bold text-white">
                          {a.nama}
                          <div className="text-[11px] text-emerald-400 font-mono font-normal">{a.noAhli}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-300">{formatRM(a.modalSyer)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-indigo-300">{formatRM(projShares)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-amber-300">{formatRM(projGross)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-rose-300">
                          {simulatedMemberZakat ? `-${formatRM(projZakat)}` : 'RM 0.00'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-emerald-400 text-sm">{formatRM(projNet)}</td>
                        <td className="px-4 py-3.5 text-center font-sans">
                          <button
                            onClick={() => {
                              setSelectedMemberForSimulationId(a.id);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg text-[10px] font-bold"
                          >
                            Lihat Graf Unjuran
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 3: ZAKAT COMPLIANCE & EDUCATIONAL GUIDE */}
      {/* ========================================================================================= */}
      {activeTab === 'PANDUAN_ZAKAT' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                Panduan Hukum & Syariah
              </span>
              <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Panduan Pengurusan Zakat Koperasi & Ahli (Malaysia)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Garis panduan standard pengiraan Zakat Perniagaan Koperasi & Zakat Dividen Ahli berdasarkan Muzakarah Jawatankuasa Fatwa Kebangsaan & SKM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Zakat Perniagaan Koperasi */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  1. Zakat Perniagaan Koperasi (Corporate Zakat)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Koperasi sebagai entiti perniagaan sah beragama Islam wajib mengeluarkan <strong>Zakat Perniagaan (2.5%)</strong> sekiranya melepasi syarat Nisab (setaraf 85 gram emas, ~RM 24,000+) dan cukup Haul (1 tahun).
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Formula Pengiraan Syariah:</span>
                  <code className="text-amber-300 text-[11px] font-mono block">
                    Zakat Perniagaan = 2.5% × [Untung Bersih Koperasi Boleh Dikenakan Zakat]
                  </code>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Zakat ini ditolak sebelum agihan dividen dilaksanakan kepada ahli.
                  </p>
                </div>
              </div>

              {/* Card 2: Zakat Dividen & Syer Ahli */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  2. Zakat Dividen & Syer Individual Ahli
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dividen yang diterima oleh ahli dikategorikan sebagai <strong>Zakat Pendapatan / Pelaburan (2.5%)</strong>. Koperasi boleh menyediakan kemudahan <strong>Potongan Di Punca</strong> untuk disalurkan ke Pusat Zakat Negeri.
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Formula Potongan Di Punca Ahli:</span>
                  <code className="text-emerald-300 text-[11px] font-mono block">
                    Zakat Dividen Ahli = 2.5% × [Jumlah Dividen Kasar Diterima]
                  </code>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Ahli menerima Dividen Bersih secara langsung dalam akaun bank mereka.
                  </p>
                </div>
              </div>

            </div>

            {/* State Zakat Boards Listing */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Senarai Lembaga Zakat Negeri Utama Untuk Penyerahan Koperasi:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 pt-1">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">PPZ-MAIWP (KL/Putrajaya)</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">Lembaga Zakat Selangor (LZS)</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">Lembaga Zakat Kedah (LZNK)</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">MAINJ / MAIPk / MAIM</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Member Dividend Slip & PDF Statement Modal */}
      {selectedAhliVoucher && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-5 my-8">
            
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  PENYATA RASMI PDF
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ref: PENYATA-DIV-2026/{selectedAhliVoucher.noAhli}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const gross = selectedAhliVoucher.modalSyer * (kadarDividen / 100);
                    const zakat = potongZakatDividenAhli ? gross * 0.025 : 0;
                    const net = gross - zakat;

                    const txtContent = `===========================================================
KOPERASI PERKHIDMATAN & USAHAWAN BERHAD (SPPKM / SKM)
PENYATA DIVIDEN & ZAKAT INDIVIDU AHLI - TAHUN KEWANGAN 2026
===========================================================
No. Rujukan Penyata : PENYATA-DIV-2026/${selectedAhliVoucher.noAhli}
Tarikh Dikeluarkan  : ${new Date().toLocaleDateString('ms-MY')}

MAKLUMAT AHLI:
- Nama Ahli        : ${selectedAhliVoucher.nama}
- No. Ahli / MyKad  : ${selectedAhliVoucher.noAhli} / ${selectedAhliVoucher.noKp}
- Jawatan / Unit   : ${selectedAhliVoucher.jawatan}
- Akaun Bank       : ${selectedAhliVoucher.maklumatBank.namaBank} (${selectedAhliVoucher.maklumatBank.noAkaun})

RINGKASAN PENYATA DIVIDEN & ZAKAT:
1. Baki Modal Syer Ahli              : RM ${selectedAhliVoucher.modalSyer.toFixed(2)}
2. Kadar Dividen Diluluskan AGM     : ${kadarDividen}% p.a.
3. Jumlah Dividen Kasar             : RM ${gross.toFixed(2)}
4. Potongan Zakat Dividen (2.5%)    : -RM ${zakat.toFixed(2)} ${potongZakatDividenAhli ? '(Potongan Di Punca)' : '(Dibayar Ahli)'}
-----------------------------------------------------------
JUMLAH NETT DIBAYAR KE AKAUN BANK   : RM ${net.toFixed(2)}
===========================================================
Pematuhan Seksyen 57 Akta Koperasi 1993 & Syariat Zakat
Saluran Zakat Disalurkan Ke Lembaga Zakat Negeri Pilihan
===========================================================`;

                    const blob = new Blob([txtContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Penyata_Dividen_Zakat_${selectedAhliVoucher.noAhli}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Download TXT
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Export PDF
                </button>

                <button
                  onClick={() => setSelectedAhliVoucher(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Container Statement Document (Designed like a White Paper PDF Letterhead) */}
            <div id="printable-statement" className="bg-white text-slate-900 rounded-xl p-7 shadow-xl border border-slate-200 space-y-6">
              
              {/* Document Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="w-6 h-6 text-emerald-800 shrink-0" />
                    <div>
                      <h2 className="font-black text-emerald-900 text-base uppercase tracking-tight">
                        KOPERASI PERKHIDMATAN & USAHAWAN BERHAD
                      </h2>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Didaftarkan Di Bawah Akta Koperasi 1993 (Suruhanjaya Koperasi Malaysia - SKM)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-1 rounded border border-emerald-300">
                    PENYATA RASMI DIVIDEN & ZAKAT
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Tahun Kewangan 2026</p>
                </div>
              </div>

              {/* Statement Title & Reference Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Penerima Penyata / Ahli:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedAhliVoucher.nama}</p>
                  <p className="text-slate-600 font-mono text-[11px]">No. Ahli: {selectedAhliVoucher.noAhli} | IC: {selectedAhliVoucher.noKp}</p>
                  <p className="text-slate-500 text-[11px]">{selectedAhliVoucher.jawatan}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Butiran Transaksi:</span>
                  <p className="text-[11px] text-slate-700"><strong>No. Rujukan:</strong> <span className="font-mono">PENYATA-DIV-2026/{selectedAhliVoucher.noAhli}</span></p>
                  <p className="text-[11px] text-slate-700"><strong>Tarikh Penyata:</strong> {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-[11px] text-slate-700"><strong>Mod Agihan:</strong> Kredit Terus Akaun Bank</p>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                  Ringkasan Pengiraan Dividen & Potongan Zakat
                </h4>

                <table className="w-full text-left text-xs border border-slate-300 rounded overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Butiran Unsur / Akta</th>
                      <th className="p-2.5 text-center">Kadar / Terma</th>
                      <th className="p-2.5 text-right">Amaun (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2.5 font-sans font-bold text-slate-900">1. Baki Modal Syer Ahli Terkumpul</td>
                      <td className="p-2.5 text-center font-sans text-slate-600">Syer Aktif</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatRM(selectedAhliVoucher.modalSyer)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-bold text-slate-900">2. Kadar Dividen Disahkan Mesyuarat Agung (AGM)</td>
                      <td className="p-2.5 text-center font-sans text-emerald-800 font-bold">{kadarDividen}% p.a.</td>
                      <td className="p-2.5 text-right font-bold text-emerald-800">
                        +{formatRM(selectedAhliVoucher.modalSyer * (kadarDividen / 100))}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-sans font-bold text-slate-800">JUMLAH DIVIDEN KASAR HAK AHLI</td>
                      <td className="p-2.5 text-center font-sans text-slate-500">Seksyen 57 Akta Koperasi</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatRM(selectedAhliVoucher.modalSyer * (kadarDividen / 100))}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans text-rose-900 font-medium">
                        3. Potongan Zakat Dividen di Punca (2.5%)
                        <span className="block text-[10px] font-normal text-slate-500">
                          {potongZakatDividenAhli ? 'Disalurkan terus ke Lembaga Zakat Negeri bagi pihak ahli' : 'Dibayar sendiri oleh ahli'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-sans text-rose-900">2.5% Kadar Zakat</td>
                      <td className="p-2.5 text-right font-bold text-rose-800">
                        {potongZakatDividenAhli ? (
                          `-${formatRM(selectedAhliVoucher.modalSyer * (kadarDividen / 100) * 0.025)}`
                        ) : (
                          'RM 0.00'
                        )}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 border-t-2 border-emerald-700">
                      <td className="p-3 font-sans font-black text-emerald-950 text-sm">JUMLAH NETT DIBAYAR (NET PAYABLE)</td>
                      <td className="p-3 text-center font-sans font-bold text-emerald-900 text-xs">Pindahan Bank</td>
                      <td className="p-3 text-right font-black text-emerald-950 text-base">
                        {formatRM(
                          selectedAhliVoucher.modalSyer * (kadarDividen / 100) * (potongZakatDividenAhli ? 0.975 : 1)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Account Details & Note */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Maklumat Akaun Bank Penerima:</span>
                  <p className="font-bold text-slate-900">{selectedAhliVoucher.maklumatBank.namaBank}</p>
                  <p className="font-mono text-slate-700">{selectedAhliVoucher.maklumatBank.noAkaun}</p>
                  <p className="text-[10px] text-emerald-800 font-bold mt-1">Status: Disahkan Bertauliah</p>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block uppercase mb-0.5">Pengesahan Zakat & Syariah:</span>
                  Penyata ini mengesahkan pengagihan dividen bagi tahun kewangan 2026.
                  {potongZakatDividenAhli
                    ? ' Zakat dividen 2.5% telah dipotong di punca dan dihantar ke Lembaga Zakat Negeri secara berpusat.'
                    : ' Sila pastikan zakat dividen ditunaikan sekiranya baki simpanan melepasi Nisab & Haul.'}
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-700">
                <div>
                  <p className="font-bold text-slate-900">Koperasi Perkhidmatan & Usahawan Berhad</p>
                  <p className="text-[10px] text-slate-500">Jabatan Kewangan & Pengurusan Keahlian</p>
                </div>

                <div className="text-center w-48">
                  <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-500 text-xs">
                    [Tandatangan Digital Bertauliah]
                  </div>
                  <p className="font-bold text-slate-900 text-[11px]">Bendahari / Pengurus Kewangan</p>
                  <p className="text-[9px] text-slate-500">Koperasi SKM Malaysia</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
