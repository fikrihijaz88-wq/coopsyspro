/**
 * Modul Pemeriksa Pematuhan (Compliance Checker)
 * Semakan automatik terhadap Akta Koperasi 1993, Peraturan-Peraturan Koperasi 1995,
 * Garis Panduan SKM & Undang-undang Kecil Koperasi.
 */

import React, { useState, useMemo } from 'react';
import {
  Ahli, CartaAkaun, Transaksi, PembiayaanAhli, Mesyuarat,
  DokumenSokongan, AnggotaJawatankuasa, RekodKewanganTahunan,
  KategoriPematuhan, SumberPeraturan, StatusPematuhan,
} from '../types';
import { semakPematuhan, labelStatusPematuhan, labelSumberPeraturan } from '../utils/complianceEngine';
import {
  ShieldCheck, ShieldAlert, ShieldX, Search, Filter, RefreshCw,
  Scale, Gavel, BookOpen, FileWarning, CheckCircle2, AlertTriangle,
  XCircle, HelpCircle, Printer, ClipboardList, ArrowRight,
  LayoutDashboard, ListChecks, Landmark, Lightbulb,
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ComplianceCheckerProps {
  ahliList: Ahli[];
  cartaAkaun: CartaAkaun[];
  transaksiList: Transaksi[];
  pembiayaanList: PembiayaanAhli[];
  mesyuaratList: Mesyuarat[];
  dokumenList: DokumenSokongan[];
  jawatanKuasaList: AnggotaJawatankuasa[];
  rekodTahunanList: RekodKewanganTahunan[];
  untungBersihSemasa: number;
  kadarDividenCadangan?: number;
  onNavigateToTab?: (tab: string) => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

const STATUS_STYLES: Record<StatusPematuhan, { badge: string; dot: string; icon: React.ReactNode; color: string }> = {
  PATUH: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: '#34d399',
  },
  AMARAN: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    dot: 'bg-amber-400',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    color: '#fbbf24',
  },
  TIDAK_PATUH: {
    badge: 'bg-red-500/15 text-red-300 border-red-500/40',
    dot: 'bg-red-400',
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    color: '#f87171',
  },
  TIDAK_DAPAT_DINILAI: {
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    dot: 'bg-slate-400',
    icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
    color: '#94a3b8',
  },
};

const KATEGORI_ICON: Record<KategoriPematuhan, React.ReactNode> = {
  KEWANGAN: <BookOpen className="w-4 h-4" />,
  TADBIR_UTUS: <Landmark className="w-4 h-4" />,
  MESYUARAT: <ClipboardList className="w-4 h-4" />,
  KEAHLIAN: <ShieldCheck className="w-4 h-4" />,
  PEMBIAYAAN: <Scale className="w-4 h-4" />,
  DOKUMEN: <FileWarning className="w-4 h-4" />,
};

const SUMBER_ICON: Record<SumberPeraturan, React.ReactNode> = {
  AKTA_1993: <Gavel className="w-4 h-4" />,
  GARIS_PANDUAN_SKM: <BookOpen className="w-4 h-4" />,
  UNDANG2_KECIL: <Scale className="w-4 h-4" />,
};

export const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({
  ahliList,
  cartaAkaun,
  transaksiList,
  pembiayaanList,
  mesyuaratList,
  dokumenList,
  jawatanKuasaList,
  rekodTahunanList,
  untungBersihSemasa,
  kadarDividenCadangan = 7.5,
  onNavigateToTab,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';

  const [activeView, setActiveView] = useState<'DASHBOARD' | 'SENARAI_SEMAK'>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sumberFilter, setSumberFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [semakanTrigger, setSemakanTrigger] = useState<number>(0);

  // Jalankan semakan pematuhan automatik
  const laporan = useMemo(
    () => semakPematuhan({
      ahliList,
      cartaAkaun,
      transaksiList,
      pembiayaanList,
      mesyuaratList,
      dokumenList,
      jawatanKuasaList,
      rekodTahunanList,
      untungBersihSemasa,
      kadarDividenCadangan,
    }),
    [ahliList, cartaAkaun, transaksiList, pembiayaanList, mesyuaratList, dokumenList,
     jawatanKuasaList, rekodTahunanList, untungBersihSemasa, kadarDividenCadangan, semakanTrigger]
  );

  // Isu kritikal (TIDAK_PATUH) untuk panel tindakan
  const isuKritikal = laporan.hasil.filter(h => h.status === 'TIDAK_PATUH');
  const amaran = laporan.hasil.filter(h => h.status === 'AMARAN');

  // Kategori breakdown
  const kategoriRingkasan = useMemo(() => {
    const map = new Map<KategoriPematuhan, { patuh: number; total: number }>();
    laporan.hasil.forEach(h => {
      const k = h.peraturan.kategori;
      const curr = map.get(k) || { patuh: 0, total: 0 };
      curr.total += 1;
      if (h.status === 'PATUH') curr.patuh += 1;
      map.set(k, curr);
    });
    return Array.from(map.entries()).map(([kategori, v]) => ({ kategori, ...v }));
  }, [laporan]);

  const filteredHasil = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return laporan.hasil.filter(h => {
      const matchesSearch =
        !q ||
        h.peraturan.tajuk.toLowerCase().includes(q) ||
        h.peraturan.kod.toLowerCase().includes(q) ||
        (h.peraturan.rujukanUndang2 || '').toLowerCase().includes(q) ||
        h.nilaiSemasa?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
      const matchesSumber = sumberFilter === 'ALL' || h.peraturan.sumber === sumberFilter;

      return matchesSearch && matchesStatus && matchesSumber;
    });
  }, [laporan.hasil, searchQuery, statusFilter, sumberFilter]);

  const skorColor = laporan.skorKeseluruhan >= 80 ? '#34d399' : laporan.skorKeseluruhan >= 60 ? '#fbbf24' : '#f87171';
  const tarafSkor = laporan.skorKeseluruhan >= 80
    ? (isEN ? 'Healthy' : 'Sihat')
    : laporan.skorKeseluruhan >= 60
    ? (isEN ? 'Needs Attention' : 'Perlu Perhatian')
    : (isEN ? 'Critical' : 'Kritikal');

  const navigateFor = (kategori: KategoriPematuhan) => {
    const map: Record<KategoriPematuhan, string> = {
      KEWANGAN: 'accounting',
      TADBIR_UTUS: 'governance',
      MESYUARAT: 'meetings',
      KEAHLIAN: 'members',
      PEMBIAYAAN: 'financing',
      DOKUMEN: 'documents',
    };
    onNavigateToTab?.(map[kategori]);
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            {isEN ? 'Regulatory Compliance Checker' : 'Pemeriksa Pematuhan Peraturan'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isEN
              ? 'Automated checks against Co-operative Societies Act 1993, SKM Guidelines & By-Laws.'
              : 'Semakan automatik terhadap Akta Koperasi 1993, Garis Panduan SKM & Undang-undang Kecil.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSemakanTrigger(t => t + 1)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {isEN ? 'Run Compliance Scan' : 'Jalankan Semakan'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            {isEN ? 'Print Report' : 'Cetak Laporan'}
          </button>
        </div>
      </div>

      {/* ===== VIEW TOGGLE ===== */}
      <div className="flex gap-2">
        {([
          { id: 'DASHBOARD', label: isEN ? 'Compliance Dashboard' : 'Papan Pematuhan', icon: LayoutDashboard },
          { id: 'SENARAI_SEMAK', label: isEN ? 'Full Checklist' : 'Senarai Semak Penuh', icon: ListChecks },
        ] as const).map(v => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeView === v.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {activeView === 'DASHBOARD' ? (
        <>
          {/* ===== SKOR RINGKASAN ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Skor keseluruhan */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="72%"
                    outerRadius="100%"
                    data={[{ name: 'skor', value: laporan.skorKeseluruhan, fill: skorColor }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{laporan.skorKeseluruhan}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    {isEN ? 'Compliance Score' : 'Skor Pematuhan'}
                  </span>
                </div>
              </div>
              <span
                className="mt-3 px-3 py-1 rounded-full text-xs font-bold border"
                style={{ color: skorColor, borderColor: `${skorColor}66`, backgroundColor: `${skorColor}15` }}
              >
                {tarafSkor}
              </span>
              <p className="text-[11px] text-slate-500 mt-3 text-center">
                {isEN ? 'Last scan:' : 'Semakan terakhir:'} {laporan.tarikhSemakan}
              </p>
            </div>

            {/* Status breakdown */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                {isEN ? 'Regulation Status Breakdown' : 'Ringkasan Status Peraturan'}
              </h3>
              {([
                { status: 'PATUH' as StatusPematuhan, count: laporan.bilanganPatuh },
                { status: 'AMARAN' as StatusPematuhan, count: laporan.bilanganAmaran },
                { status: 'TIDAK_PATUH' as StatusPematuhan, count: laporan.bilanganTidakPatuh },
                { status: 'TIDAK_DAPAT_DINILAI' as StatusPematuhan, count: laporan.bilanganTidakDapatDinilai },
              ]).map(({ status, count }) => (
                <button
                  key={status}
                  onClick={() => { setActiveView('SENARAI_SEMAK'); setStatusFilter(status); }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/40"
                >
                  <span className="flex items-center gap-2">
                    {STATUS_STYLES[status].icon}
                    <span className="text-xs font-semibold text-slate-200">{labelStatusPematuhan(status, isEN)}</span>
                  </span>
                  <span className="text-lg font-black" style={{ color: STATUS_STYLES[status].color }}>{count}</span>
                </button>
              ))}
              <p className="text-[11px] text-slate-500">
                {isEN
                  ? 'Total regulations assessed from live system data.'
                  : 'Jumlah peraturan dinilai daripada data sistem semasa.'}
              </p>
            </div>

            {/* Breakdown kategori */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">
                {isEN ? 'Compliance by Category' : 'Pematuhan Mengikut Kategori'}
              </h3>
              {kategoriRingkasan.map(({ kategori, patuh, total }) => {
                const pct = Math.round((patuh / total) * 100);
                const color = pct === 100 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
                return (
                  <button
                    key={kategori}
                    onClick={() => navigateFor(kategori)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                        <span className="text-slate-500">{KATEGORI_ICON[kategori]}</span>
                        {labelKategori(kategori, isEN)}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-xs font-bold" style={{ color }}>{patuh}/{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== ISU KRITIKAL & TINDAKAN ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tidak patuh */}
            <div className="bg-red-950/20 rounded-xl border border-red-900/40 p-6">
              <h3 className="text-sm font-bold text-red-300 flex items-center gap-2 mb-4">
                <ShieldX className="w-4 h-4" />
                {isEN ? 'Critical Non-Compliance' : 'Ketidakpatuhan Kritikal'}
                <span className="ml-auto bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {isuKritikal.length}
                </span>
              </h3>
              {isuKritikal.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">
                    {isEN ? 'No critical non-compliance detected.' : 'Tiada ketidakpatuhan kritikal dikesan.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {isuKritikal.map(h => (
                    <div key={h.peraturan.kod} className="p-3 rounded-lg bg-slate-900/70 border border-red-900/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-100">{h.peraturan.tajuk}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {h.peraturan.kod} · {h.peraturan.rujukanUndang2}
                          </p>
                        </div>
                        {SUMBER_ICON[h.peraturan.sumber]}
                      </div>
                      {h.catatan && <p className="text-[11px] text-red-200/80 mt-2 leading-relaxed">{h.catatan}</p>}
                      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-300 bg-slate-800/60 rounded-md px-2 py-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{h.peraturan.tindakanPembetulan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amaran */}
            <div className="bg-amber-950/20 rounded-xl border border-amber-900/40 p-6">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4" />
                {isEN ? 'Warnings To Monitor' : 'Amaran Perlu Dipantau'}
                <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {amaran.length}
                </span>
              </h3>
              {amaran.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">
                    {isEN ? 'No active warnings.' : 'Tiada amaran aktif.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {amaran.map(h => (
                    <div key={h.peraturan.kod} className="p-3 rounded-lg bg-slate-900/70 border border-amber-900/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-100">{h.peraturan.tajuk}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {h.peraturan.kod} · {h.peraturan.rujukanUndang2}
                          </p>
                        </div>
                        {SUMBER_ICON[h.peraturan.sumber]}
                      </div>
                      {h.catatan && <p className="text-[11px] text-amber-200/80 mt-2 leading-relaxed">{h.catatan}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notis rujukan undang-undang */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-start gap-3">
            <Scale className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isEN
                ? 'This automated assessment is derived from live SPPKM data (accounts, members, meetings, financing & documents). It complements but does not replace formal legal advice or audits by the Co-operative Commission of Malaysia (SKM). By-law parameters (minimum shares, entrance fees, board terms) should be adjusted to match your registered by-laws.'
                : 'Penilaian automatik ini diterbitkan daripada data sistem SPPKM semasa (perakaunan, keahlian, mesyuarat, pembiayaan & dokumen). Ia melengkapi tetapi tidak menggantikan nasihat undang-undang formal atau audit oleh Suruhanjaya Koperasi Malaysia (SKM). Parameter undang-undang kecil (syer minimum, yuran masuk, tempoh lantikan) perlu disesuaikan dengan undang-undang kecil koperasi anda yang berdaftar.'}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* ===== FILTERS ===== */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEN ? 'Search regulation, section, value...' : 'Cari peraturan, seksyen, nilai...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">{isEN ? 'All Statuses' : 'Semua Status'}</option>
              <option value="PATUH">{isEN ? 'Compliant' : 'Patuh'}</option>
              <option value="AMARAN">{isEN ? 'Warning' : 'Amaran'}</option>
              <option value="TIDAK_PATUH">{isEN ? 'Non-Compliant' : 'Tidak Patuh'}</option>
              <option value="TIDAK_DAPAT_DINILAI">{isEN ? 'Not Assessable' : 'Tidak Dapat Dinilai'}</option>
            </select>
            <select
              value={sumberFilter}
              onChange={e => setSumberFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">{isEN ? 'All Sources' : 'Semua Sumber'}</option>
              <option value="AKTA_1993">{isEN ? 'Act 1993' : 'Akta 1993'}</option>
              <option value="GARIS_PANDUAN_SKM">{isEN ? 'SKM Guidelines' : 'Garis Panduan SKM'}</option>
              <option value="UNDANG2_KECIL">{isEN ? 'By-Laws' : 'Undang-undang Kecil'}</option>
            </select>
          </div>

          {/* ===== SENARAI SEMAK ===== */}
          <div className="space-y-2">
            {filteredHasil.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                {isEN ? 'No regulations match your filters.' : 'Tiada peraturan sepadan dengan penapis.'}
              </div>
            )}
            {filteredHasil.map(h => {
              const isExpanded = expandedId === h.peraturan.kod;
              const style = STATUS_STYLES[h.status];
              return (
                <div
                  key={h.peraturan.kod}
                  className={`rounded-xl border transition-colors ${
                    isExpanded ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : h.peraturan.kod)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    {style.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100 truncate">{h.peraturan.tajuk}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${style.badge}`}>
                          {h.peraturan.kod}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        {SUMBER_ICON[h.peraturan.sumber]}
                        {labelSumberPeraturan(h.peraturan.sumber, isEN)}
                        {h.peraturan.rujukanUndang2 && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono">{h.peraturan.rujukanUndang2}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                        {labelStatusPematuhan(h.status, isEN)}
                      </span>
                      {h.nilaiSemasa && (
                        <span className="text-[10px] text-slate-500 max-w-[240px] text-right truncate">{h.nilaiSemasa}</span>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-800/40 rounded-lg p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            {isEN ? 'Regulatory Requirement' : 'Keperluan Peraturan'}
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {isEN ? h.peraturan.deskripsiEN : h.peraturan.deskripsiBM}
                          </p>
                        </div>
                        <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              {isEN ? 'Current Value' : 'Nilai Semasa'}
                            </p>
                            <p className="text-[11px] text-slate-200 font-mono">{h.nilaiSemasa || '—'}</p>
                          </div>
                          {h.hadPeraturan && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                {isEN ? 'Statutory Limit' : 'Had Peraturan'}
                              </p>
                              <p className="text-[11px] text-slate-200 font-mono">{h.hadPeraturan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {h.catatan && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-300 bg-slate-800/40 rounded-lg px-3 py-2 leading-relaxed">
                          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{h.catatan}</span>
                        </div>
                      )}
                      {h.status !== 'PATUH' && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-200 bg-indigo-950/40 border border-indigo-900/40 rounded-lg px-3 py-2 leading-relaxed">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>
                            <span className="font-bold">{isEN ? 'Corrective action: ' : 'Tindakan pembetulan: '}</span>
                            {h.peraturan.tindakanPembetulan}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

function labelKategori(kategori: KategoriPematuhan, isEN: boolean): string {
  const map: Record<KategoriPematuhan, [string, string]> = {
    KEWANGAN: ['Kewangan & Statutori', 'Finance & Statutory'],
    TADBIR_UTUS: ['Tadbir Urus', 'Governance'],
    MESYUARAT: ['Mesyuarat', 'Meetings'],
    KEAHLIAN: ['Keahlian & Syer', 'Membership & Shares'],
    PEMBIAYAAN: ['Pembiayaan', 'Financing'],
    DOKUMEN: ['Dokumen', 'Documents'],
  };
  return isEN ? map[kategori][1] : map[kategori][0];
}
