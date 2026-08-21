import React, { useState, useMemo } from 'react';
import { 
  TuntutanKebajikan, 
  TabungKebajikanSummary, 
  CarumanKebajikanAhli, 
  Ahli, 
  JenisTuntutanKebajikan, 
  StatusTuntutanKebajikan 
} from '../types';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  User, 
  Users, 
  Coins, 
  Building2, 
  Calendar, 
  Receipt, 
  ChevronRight, 
  Sparkles, 
  Download, 
  GraduationCap, 
  Activity, 
  Flame, 
  HandHeart,
  Award
} from 'lucide-react';

interface WelfareFundManagementProps {
  tuntutanList: TuntutanKebajikan[];
  summary: TabungKebajikanSummary;
  ahliList: Ahli[];
  onAddClaim: (claim: TuntutanKebajikan) => void;
  onUpdateClaimStatus: (id: string, status: StatusTuntutanKebajikan, noBaucar?: string, catatan?: string) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const WelfareFundManagement: React.FC<WelfareFundManagementProps> = ({
  tuntutanList,
  summary,
  ahliList,
  onAddClaim,
  onUpdateClaimStatus,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'TUNTUTAN' | 'CARUMAN' | 'LEJAR_KWK' | 'PENYATA_RASMI'>('TUNTUTAN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [selectedClaimForAction, setSelectedClaimForAction] = useState<TuntutanKebajikan | null>(null);

  // New Claim Form State
  const [selectedAhliId, setSelectedAhliId] = useState<string>(ahliList[0]?.id || '1');
  const [claimJenis, setClaimJenis] = useState<JenisTuntutanKebajikan>('KHAIRAT_KEMATIAN_WARIS');
  const [claimJumlah, setClaimJumlah] = useState<number>(2000);
  const [claimPenerima, setClaimPenerima] = useState<string>('');
  const [claimBank, setClaimBank] = useState<string>('Bank Islam Malaysia Berhad');
  const [claimAkaunBank, setClaimAkaunBank] = useState<string>('');
  const [claimHubungan, setClaimHubungan] = useState<'SENDIRI' | 'PASANGAN' | 'ANAK' | 'IBU_BAPA' | 'WARIS_BERDAFTAR'>('SENDIRI');
  const [claimDokumen, setClaimDokumen] = useState<string>('Sijil Kematian / Surat Discaj Hospital');
  const [claimTarikhKejadian, setClaimTarikhKejadian] = useState<string>(new Date().toISOString().split('T')[0]);
  const [claimCatatan, setClaimCatatan] = useState<string>('');

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return tuntutanList.filter(c => {
      const matchQuery = !searchQuery || 
        c.namaAhli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.noAhli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.noRujukan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.namaPenerima.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori = selectedKategoriFilter === 'ALL' || c.jenisTuntutan === selectedKategoriFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;

      return matchQuery && matchKategori && matchStatus;
    });
  }, [tuntutanList, searchQuery, selectedKategoriFilter, selectedStatusFilter]);

  // Aggregates
  const totalTuntutanDibayar = useMemo(() => 
    tuntutanList.filter(c => c.status === 'DIBAYAR').reduce((sum, c) => sum + c.jumlahDiluluskan, 0),
    [tuntutanList]
  );

  const totalTuntutanMenunggu = useMemo(() => 
    tuntutanList.filter(c => c.status === 'DRAF' || c.status === 'DISEMAK_SETIAUSAHA' || c.status === 'DILULUSKAN_ALK').length,
    [tuntutanList]
  );

  const bakiSemasaKWK = summary.bakiAwalTahun + summary.peruntukanUntungStatutori + summary.jumlahCarumanTahunSemasa - totalTuntutanDibayar;

  // Selected Ahli Helper
  const currentSelectedAhli = ahliList.find(a => a.id === selectedAhliId);

  // Form Submit
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedAhli || claimJumlah <= 0) return;

    const newClaim: TuntutanKebajikan = {
      id: `TKB-${Date.now()}`,
      noRujukan: `TKB-${new Date().getFullYear()}/${String(tuntutanList.length + 1).padStart(3, '0')}`,
      ahliId: currentSelectedAhli.id,
      noAhli: currentSelectedAhli.noAhli,
      namaAhli: currentSelectedAhli.nama,
      noKp: currentSelectedAhli.noKp,
      jenisTuntutan: claimJenis,
      tarikhPermohonan: new Date().toISOString().split('T')[0],
      tarikhKejadian: claimTarikhKejadian,
      jumlahDipohon: Number(claimJumlah),
      jumlahDiluluskan: Number(claimJumlah),
      namaPenerima: claimPenerima || currentSelectedAhli.nama,
      noAkaunBankPenerima: claimAkaunBank || '12029020194821',
      namaBank: claimBank,
      hubunganPenerima: claimHubungan,
      dokumenSokongan: claimDokumen,
      status: 'DISEMAK_SETIAUSAHA',
      catatan: claimCatatan || 'Permohonan kebajikan direkodkan dalam sistem'
    };

    onAddClaim(newClaim);
    setShowClaimModal(false);
    resetForm();
  };

  const resetForm = () => {
    setClaimJumlah(2000);
    setClaimPenerima('');
    setClaimAkaunBank('');
    setClaimCatatan('');
  };

  const getJenisLabel = (jenis: JenisTuntutanKebajikan) => {
    switch (jenis) {
      case 'KHAIRAT_KEMATIAN_ANGGOTA': return 'Khairat Kematian (Anggota)';
      case 'KHAIRAT_KEMATIAN_WARIS': return 'Khairat Kematian (Waris)';
      case 'BANTUAN_HOSPITAL_SAKIT': return 'Bantuan Rawatan / Wad Hospital';
      case 'BANTUAN_BENCANA_KEBAKARAN': return 'Bantuan Bencana / Kebakaran';
      case 'KECEMERLANGAN_PENDIDIKAN': return 'Hadiah Kecemerlangan Pendidikan';
      case 'BANTUAN_PERKAHWINAN': return 'Sumbangan Perkahwinan';
      default: return 'Bantuan Kebajikan Am';
    }
  };

  const getJenisIcon = (jenis: JenisTuntutanKebajikan) => {
    switch (jenis) {
      case 'KHAIRAT_KEMATIAN_ANGGOTA':
      case 'KHAIRAT_KEMATIAN_WARIS':
        return <HandHeart className="w-4 h-4 text-rose-400" />;
      case 'BANTUAN_HOSPITAL_SAKIT':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'BANTUAN_BENCANA_KEBAKARAN':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'KECEMERLANGAN_PENDIDIKAN':
        return <GraduationCap className="w-4 h-4 text-blue-400" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getStatusBadge = (status: StatusTuntutanKebajikan) => {
    switch (status) {
      case 'DIBAYAR':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SELESAI DIBAYAR
          </span>
        );
      case 'DILULUSKAN_ALK':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <Award className="w-3 h-3 text-indigo-400" /> DILULUSKAN ALK
          </span>
        );
      case 'DISEMAK_SETIAUSAHA':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <Clock className="w-3 h-3 text-amber-400" /> DISEMAK SETIAUSAHA
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <XCircle className="w-3 h-3 text-rose-400" /> DITOLAK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <FileText className="w-3 h-3 text-slate-400" /> DRAF
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" /> Seksyen 57(3) Akta Koperasi 1993
            </span>
            <span className="text-xs text-slate-400">Garis Panduan Pengurusan Tabung Kebajikan Anggota</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-rose-400" /> Tabung Kebajikan, Khairat Kematian & Manfaat Anggota
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengurusan caruman kebajikan anggota, tuntutan khairat kematian waris, bantuan perubatan/bencana, dan lejar Kumpulan Wang Kebajikan (KWK).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Permohonan Tuntutan Baru
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Penyata KWK
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Baki Semasa KWK */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Baki Kumpulan Wang Kebajikan</span>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-800/60">
              <HandHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-300">
            {formatRM(bakiSemasaKWK)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Baki Awal Tahun:</span>
            <span className="text-slate-300 font-medium">{formatRM(summary.bakiAwalTahun)}</span>
          </div>
        </div>

        {/* Card 2: Jumlah Caruman YTD */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Caruman Terkumpul Ahli (YTD)</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">
            {formatRM(summary.jumlahCarumanTahunSemasa)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Keahlian Mencarum:</span>
            <strong className="text-emerald-400 font-bold">{ahliList.length} Orang (100%)</strong>
          </div>
        </div>

        {/* Card 3: Tuntutan Dibayar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Jumlah Tuntutan Dibayar</span>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800/60">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {formatRM(totalTuntutanDibayar)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Tuntutan Dalam Proses:</span>
            <strong className="text-amber-400 font-bold">{totalTuntutanMenunggu} Kes</strong>
          </div>
        </div>

        {/* Card 4: Peruntukan Statutori Untung */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Peruntukan Untung Sek 57(3)</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            {formatRM(summary.peruntukanUntungStatutori)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Agihan Keuntungan MAT:</span>
            <span className="text-indigo-400 font-semibold">Diluluskan Perwakilan</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('TUNTUTAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'TUNTUTAN' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HandHeart className="w-4 h-4" /> Pengurusan Tuntutan & Manfaat ({tuntutanList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('CARUMAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'CARUMAN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Daftar Caruman Anggota ({ahliList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('LEJAR_KWK')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'LEJAR_KWK' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" /> Lejar Kumpulan Wang Kebajikan
        </button>

        <button
          onClick={() => setActiveSubTab('PENYATA_RASMI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PENYATA_RASMI' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Penyata Statutori Kebajikan SKM
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PENGURUSAN TUNTUTAN & MANFAAT */}
      {/* ========================================================================= */}
      {activeSubTab === 'TUNTUTAN' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari rujukan, nama ahli, no ahli, penerima..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedKategoriFilter}
                onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Jenis Tuntutan</option>
                <option value="KHAIRAT_KEMATIAN_ANGGOTA">Khairat Kematian (Anggota)</option>
                <option value="KHAIRAT_KEMATIAN_WARIS">Khairat Kematian (Waris)</option>
                <option value="BANTUAN_HOSPITAL_SAKIT">Bantuan Rawatan Wad Hospital</option>
                <option value="BANTUAN_BENCANA_KEBAKARAN">Bantuan Bencana / Ribut</option>
                <option value="KECEMERLANGAN_PENDIDIKAN">Kecemerlangan Pendidikan</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="DIBAYAR">Selesai Dibayar</option>
                <option value="DILULUSKAN_ALK">Diluluskan ALK</option>
                <option value="DISEMAK_SETIAUSAHA">Dalam Semakan</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Claims List Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">No. Rujukan & Tarikh</th>
                    <th className="px-4 py-3.5">Maklumat Ahli Pemohon</th>
                    <th className="px-4 py-3.5">Jenis Manfaat Kebajikan</th>
                    <th className="px-4 py-3.5">Penerima & Akaun Bank</th>
                    <th className="px-4 py-3.5 text-right">Jumlah (RM)</th>
                    <th className="px-4 py-3.5 text-center">Status & Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white font-mono">{claim.noRujukan}</div>
                        <div className="text-[11px] text-slate-400">{claim.tarikhPermohonan}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-100">{claim.namaAhli}</div>
                        <div className="text-[11px] text-slate-400 font-mono">No. Ahli: {claim.noAhli} • {claim.noKp}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          {getJenisIcon(claim.jenisTuntutan)}
                          <span>{getJenisLabel(claim.jenisTuntutan)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {claim.dokumenSokongan}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-200">{claim.namaPenerima} ({claim.hubunganPenerima})</div>
                        <div className="text-[10px] text-slate-400 font-mono">{claim.namaBank}: {claim.noAkaunBankPenerima}</div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-black text-rose-300 text-sm">
                        {formatRM(claim.jumlahDiluluskan || claim.jumlahDipohon)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {getStatusBadge(claim.status)}

                          {/* Action Buttons */}
                          {claim.status === 'DISEMAK_SETIAUSAHA' && (
                            <button
                              onClick={() => onUpdateClaimStatus(claim.id, 'DILULUSKAN_ALK', undefined, 'Diluluskan oleh Lembaga Koperasi')}
                              className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Luluskan ALK
                            </button>
                          )}

                          {claim.status === 'DILULUSKAN_ALK' && (
                            <button
                              onClick={() => {
                                const noBaucar = `BP-KBJ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`;
                                onUpdateClaimStatus(claim.id, 'DIBAYAR', noBaucar, 'Bayaran telah dipindahkan melalui transaksi bank');
                              }}
                              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Bayar Baucar
                            </button>
                          )}

                          {claim.status === 'DIBAYAR' && claim.noBaucarBayaran && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Baucar: {claim.noBaucarBayaran}
                            </span>
                          )}
                        </div>
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
      {/* SUB-TAB 2: DAFTAR CARUMAN ANGGOTA (RM 10 / BULAN) */}
      {/* ========================================================================= */}
      {activeSubTab === 'CARUMAN' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Jadual Caruman Tabung Kebajikan Anggota (Tahun 2026)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kadar Caruman Statutori: <strong className="text-emerald-300">RM 10.00 / bulan (RM 120.00 / tahun)</strong> ditolak secara automatik melalui potongan gaji bulanan.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Jumlah Anggota Mencarum:</span>
                <div className="text-lg font-black text-emerald-400">{ahliList.length} Orang (RM {ahliList.length * 120}.00/tahun)</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">No. Ahli</th>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">No. Kad Pengenalan</th>
                    <th className="px-4 py-3">Majikan / Cawangan</th>
                    <th className="px-4 py-3 text-right">Caruman Bulanan</th>
                    <th className="px-4 py-3 text-right">Terkumpul 2026</th>
                    <th className="px-4 py-3 text-center">Status Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ahliList.map((ahli) => (
                    <tr key={ahli.id} className="hover:bg-slate-850 transition-colors font-sans">
                      <td className="px-4 py-3 font-bold text-indigo-300 font-mono">{ahli.noAhli}</td>
                      <td className="px-4 py-3 font-semibold text-white">{ahli.nama}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{ahli.noKp}</td>
                      <td className="px-4 py-3 text-slate-300">{ahli.majikan}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">RM 10.00</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">RM 120.00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LAYAK MANFAAT
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
      {/* SUB-TAB 3: LEJAR KUMPULAN WANG KEBAJIKAN (KWK) */}
      {/* ========================================================================= */}
      {activeSubTab === 'LEJAR_KWK' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" /> Lejar Terperinci Kumpulan Wang Kebajikan (Akaun Kod 3070)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Penyata imbangan kemasukan peruntukan statutori & caruman tolak perbelanjaan bantuan kebajikan.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Baki Terkini Lejar KWK:</span>
              <div className="text-xl font-black text-rose-300">{formatRM(bakiSemasaKWK)}</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Tarikh</th>
                  <th className="px-4 py-3">Perihal / Butiran Transaksi</th>
                  <th className="px-4 py-3">No. Dokumen / Rujukan</th>
                  <th className="px-4 py-3 text-right">Masuk / Kredit (RM)</th>
                  <th className="px-4 py-3 text-right">Keluar / Debit (RM)</th>
                  <th className="px-4 py-3 text-right">Baki Terkumpul (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-01-01</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Baki Awal Kumpulan Wang Kebajikan Bawaan Ke Hadapan</td>
                  <td className="px-4 py-3 text-slate-400">KWK-BAKI-2025</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatRM(summary.bakiAwalTahun)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRM(summary.bakiAwalTahun)}</td>
                </tr>

                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-01-15</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Peruntukan Statutori Keuntungan Bersih MAT (Seksyen 57(3))</td>
                  <td className="px-4 py-3 text-slate-400">RES-MAT-2026/04</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatRM(summary.peruntukanUntungStatutori)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRM(summary.bakiAwalTahun + summary.peruntukanUntungStatutori)}</td>
                </tr>

                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-02-14</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Bayaran Khairat Kematian Waris (Ahli C004: Mohd Haziq)</td>
                  <td className="px-4 py-3 text-indigo-300">BP-KBJ-2026/012</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right text-rose-400">{formatRM(2000)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRM(31450)}</td>
                </tr>

                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-04-22</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Bayaran Bantuan Kemasukan Hospital (Ahli C011: Puan Zaiton)</td>
                  <td className="px-4 py-3 text-indigo-300">BP-KBJ-2026/015</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right text-rose-400">{formatRM(500)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRM(30950)}</td>
                </tr>

                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-05-08</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Hadiah Kecemerlangan SPM Anak Ahli (Ahli C007: Ahmad Faris)</td>
                  <td className="px-4 py-3 text-indigo-300">BP-KBJ-2026/019</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right text-rose-400">{formatRM(300)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRM(30650)}</td>
                </tr>

                <tr className="hover:bg-slate-850">
                  <td className="px-4 py-3 text-slate-400 font-sans">2026-08-20</td>
                  <td className="px-4 py-3 text-white font-semibold font-sans">Kutipan Caruman Bulanan Kebajikan 30 Anggota (Jan - Ogos)</td>
                  <td className="px-4 py-3 text-slate-400">RST-KBJ-2026/YTD</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatRM(summary.jumlahCarumanTahunSemasa)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">-</td>
                  <td className="px-4 py-3 text-right font-black text-rose-300">{formatRM(bakiSemasaKWK)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PENYATA STATUTORI RASMI TABUNG KEBAJIKAN (PRINTABLE / PDF) */}
      {/* ========================================================================= */}
      {activeSubTab === 'PENYATA_RASMI' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Printable Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-6 print:border-black">
            <div className="text-xs font-bold tracking-widest text-rose-400 uppercase mb-1">
              SURUHANJAYA KOPERASI MALAYSIA (SKM) • SEKSYEN 57(3) AKTA KOPERASI 1993
            </div>
            <h1 className="text-xl font-black text-white uppercase print:text-black">
              PENYATA KUMPULAN WANG KEBAJIKAN & KHAIRAT KEMATIAN ANGGOTA
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
              Laporan Terperinci Penerimaan Caruman, Peruntukan Statutori & Pembayaran Manfaat Kebajikan Tahun 2026
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
              <div className="text-slate-400">Jumlah Ahli Dilindungi:</div>
              <strong className="text-white print:text-black">{ahliList.length} Orang</strong>
            </div>
            <div>
              <div className="text-slate-400">Tarikh Cetakan Penyata:</div>
              <strong className="text-white print:text-black">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          </div>

          {/* Statement Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-1.5 print:text-black">
              1. Imbangan Akaun Kumpulan Wang Kebajikan (KWK)
            </h3>
            
            <table className="w-full text-left text-xs border border-slate-800 print:border-black">
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                <tr>
                  <td className="p-3 font-semibold text-slate-300 print:text-black">Baki Awal Kumpulan Wang Kebajikan (1 Jan 2026)</td>
                  <td className="p-3 text-right font-bold text-white print:text-black">{formatRM(summary.bakiAwalTahun)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 print:text-black">Tambah: Peruntukan Statutori Keuntungan Bersih (Seksyen 57(3) Akta Koperasi 1993)</td>
                  <td className="p-3 text-right font-bold text-emerald-400 print:text-black">{formatRM(summary.peruntukanUntungStatutori)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 print:text-black">Tambah: Jumlah Caruman Kebajikan Anggota ({ahliList.length} Anggota x RM 120/tahun)</td>
                  <td className="p-3 text-right font-bold text-emerald-400 print:text-black">{formatRM(summary.jumlahCarumanTahunSemasa)}</td>
                </tr>
                <tr className="bg-slate-950 font-bold print:bg-gray-100">
                  <td className="p-3 text-white print:text-black uppercase">Jumlah Dana Kebajikan Boleh Digunakan:</td>
                  <td className="p-3 text-right text-indigo-300 print:text-black font-black">{formatRM(summary.bakiAwalTahun + summary.peruntukanUntungStatutori + summary.jumlahCarumanTahunSemasa)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-rose-300 print:text-black">Tolak: Jumlah Pembayaran Manfaat & Tuntutan Kebajikan ({tuntutanList.filter(c => c.status === 'DIBAYAR').length} Kes Selesai)</td>
                  <td className="p-3 text-right font-bold text-rose-400 print:text-black">({formatRM(totalTuntutanDibayar)})</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-950 font-black text-white border-t-2 border-slate-800 print:bg-gray-200 print:text-black text-sm">
                <tr>
                  <td className="p-3 uppercase">Baki Bersih Kumpulan Wang Kebajikan (31 Disember 2026):</td>
                  <td className="p-3 text-right text-rose-300 print:text-black">{formatRM(bakiSemasaKWK)}</td>
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
      {/* MODAL: PERMOHONAN TUNTUTAN KEBAJIKAN BAHARU */}
      {/* ========================================================================= */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HandHeart className="w-5 h-5 text-rose-400" /> Permohonan Tuntutan Tabung Kebajikan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Borang rasmi tuntutan khairat kematian, perubatan & bantuan anggota.
                </p>
              </div>
              <button 
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Ahli Pemohon *</label>
                <select
                  value={selectedAhliId}
                  onChange={(e) => {
                    setSelectedAhliId(e.target.value);
                    const found = ahliList.find(a => a.id === e.target.value);
                    if (found) setClaimPenerima(found.nama);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {ahliList.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.noAhli} - {a.nama} ({a.noKp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jenis Manfaat Tuntutan *</label>
                  <select
                    value={claimJenis}
                    onChange={(e) => {
                      const j = e.target.value as JenisTuntutanKebajikan;
                      setClaimJenis(j);
                      if (j === 'KHAIRAT_KEMATIAN_ANGGOTA' || j === 'KHAIRAT_KEMATIAN_WARIS') setClaimJumlah(2000);
                      else if (j === 'BANTUAN_HOSPITAL_SAKIT') setClaimJumlah(500);
                      else if (j === 'BANTUAN_BENCANA_KEBAKARAN') setClaimJumlah(1000);
                      else if (j === 'KECEMERLANGAN_PENDIDIKAN') setClaimJumlah(300);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="KHAIRAT_KEMATIAN_ANGGOTA">Khairat Kematian (Anggota)</option>
                    <option value="KHAIRAT_KEMATIAN_WARIS">Khairat Kematian (Waris)</option>
                    <option value="BANTUAN_HOSPITAL_SAKIT">Bantuan Rawatan Wad Hospital</option>
                    <option value="BANTUAN_BENCANA_KEBAKARAN">Bantuan Bencana / Ribut</option>
                    <option value="KECEMERLANGAN_PENDIDIKAN">Kecemerlangan Pendidikan</option>
                    <option value="BANTUAN_PERKAHWINAN">Sumbangan Perkahwinan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Dipohon (RM) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={claimJumlah}
                    onChange={(e) => setClaimJumlah(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-rose-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Penerima Bayaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama waris atau ahli"
                    value={claimPenerima}
                    onChange={(e) => setClaimPenerima(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hubungan Penerima</label>
                  <select
                    value={claimHubungan}
                    onChange={(e) => setClaimHubungan(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="SENDIRI">Sendiri (Anggota)</option>
                    <option value="PASANGAN">Pasangan (Suami/Isteri)</option>
                    <option value="ANAK">Anak</option>
                    <option value="IBU_BAPA">Ibu / Bapa</option>
                    <option value="WARIS_BERDAFTAR">Waris Berdaftar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Bank Penerima *</label>
                  <input
                    type="text"
                    required
                    value={claimBank}
                    onChange={(e) => setClaimBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Akaun Bank *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 12029020194821"
                    value={claimAkaunBank}
                    onChange={(e) => setClaimAkaunBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarikh Kejadian</label>
                  <input
                    type="date"
                    value={claimTarikhKejadian}
                    onChange={(e) => setClaimTarikhKejadian(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dokumen Sokongan</label>
                  <input
                    type="text"
                    value={claimDokumen}
                    onChange={(e) => setClaimDokumen(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan / Justifikasi Permohonan</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan permohonan..."
                  value={claimCatatan}
                  onChange={(e) => setClaimCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Hantar Permohonan Tuntutan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
