import React, { useState, useMemo } from 'react';
import { 
  AsetTetap, 
  KategoriAsetTetap, 
  KaedahSusutnilai, 
  StatusAset, 
  RekodSusutnilaiTahunan 
} from '../types';
import { 
  Building2, 
  Truck, 
  Monitor, 
  Armchair, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingDown, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Download, 
  Trash2, 
  RefreshCw,
  Tag,
  Check,
  ShoppingBag
} from 'lucide-react';

interface FixedAssetManagementProps {
  assetList: AsetTetap[];
  onAddAsset: (asset: AsetTetap) => void;
  onUpdateAsset: (id: string, asset: Partial<AsetTetap>) => void;
  onRunDepreciation: (year: number) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const FixedAssetManagement: React.FC<FixedAssetManagementProps> = ({
  assetList,
  onAddAsset,
  onUpdateAsset,
  onRunDepreciation,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'DAFTAR_ASET' | 'JADUAL_SUSUTNILAI' | 'PELUPUSAN_ASET' | 'LAPORAN_SKM'>('DAFTAR_ASET');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDisposalModal, setShowDisposalModal] = useState<boolean>(false);
  const [selectedAssetForDisposal, setSelectedAssetForDisposal] = useState<AsetTetap | null>(null);

  // New Asset Form State
  const [assetNama, setAssetNama] = useState<string>('');
  const [assetKategori, setAssetKategori] = useState<KategoriAsetTetap>('MESIN_KELENGKAPAN_POS');
  const [assetKos, setAssetKos] = useState<number>(15000);
  const [assetNilaiSisa, setAssetNilaiSisa] = useState<number>(1000);
  const [assetJangkaHayat, setAssetJangkaHayat] = useState<number>(5);
  const [assetKadar, setAssetKadar] = useState<number>(20);
  const [assetKaedah, setAssetKaedah] = useState<KaedahSusutnilai>('GARIS_LURUS');
  const [assetPembekal, setAssetPembekal] = useState<string>('');
  const [assetNoInvois, setAssetNoInvois] = useState<string>(`INV-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`);
  const [assetLokasi, setAssetLokasi] = useState<string>('Kedai POS Koperasi');
  const [assetTarikh, setAssetTarikh] = useState<string>(new Date().toISOString().split('T')[0]);

  // Disposal Form State
  const [disposalTarikh, setDisposalTarikh] = useState<string>(new Date().toISOString().split('T')[0]);
  const [disposalHarga, setDisposalHarga] = useState<number>(0);
  const [disposalCatatan, setDisposalCatatan] = useState<string>('Pelupusan aset usang / rosak');

  // Depreciation run state
  const [selectedDepYear, setSelectedDepYear] = useState<number>(2026);
  const [depSuccessMsg, setDepSuccessMsg] = useState<string | null>(null);

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // Aggregates
  const totalKosAsal = useMemo(() => 
    assetList.filter(a => a.status === 'AKTIF').reduce((sum, a) => sum + a.kosAsal, 0),
    [assetList]
  );

  const totalSusutnilaiTerkumpul = useMemo(() => 
    assetList.filter(a => a.status === 'AKTIF').reduce((sum, a) => sum + a.susutnilaiTerkumpulSemasa, 0),
    [assetList]
  );

  const totalNilaiBukuBersih = useMemo(() => 
    assetList.filter(a => a.status === 'AKTIF').reduce((sum, a) => sum + a.nilaiBukuBersihSemasa, 0),
    [assetList]
  );

  const totalAsetAktif = useMemo(() => 
    assetList.filter(a => a.status === 'AKTIF').length,
    [assetList]
  );

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assetList.filter(a => {
      const matchQuery = !searchQuery || 
        a.namaAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tagAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.pembekal.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori = selectedKategoriFilter === 'ALL' || a.kategori === selectedKategoriFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;

      return matchQuery && matchKategori && matchStatus;
    });
  }, [assetList, searchQuery, selectedKategoriFilter, selectedStatusFilter]);

  // Form Submit: Add Asset
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNama || assetKos <= 0) return;

    const tagNumber = String(assetList.length + 1).padStart(3, '0');
    const newAsset: AsetTetap = {
      id: `AST-${Date.now()}`,
      tagAset: `AST-${new Date().getFullYear()}/${tagNumber}`,
      namaAset: assetNama,
      kategori: assetKategori,
      tarikhPerolehan: assetTarikh,
      pembekal: assetPembekal || 'Pembekal Berdaftar',
      noInvoisBaucar: assetNoInvois,
      lokasi: assetLokasi,
      kosAsal: Number(assetKos),
      nilaiSisa: Number(assetNilaiSisa),
      jangkaHayatTahun: Number(assetJangkaHayat),
      kadarSusutnilaiPeratus: Number(assetKadar),
      kaedahSusutnilai: assetKaedah,
      susutnilaiTerkumpulSemasa: 0,
      nilaiBukuBersihSemasa: Number(assetKos),
      status: 'AKTIF',
      sejarahSusutnilai: []
    };

    onAddAsset(newAsset);
    setShowAddModal(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setAssetNama('');
    setAssetKos(15000);
    setAssetNilaiSisa(1000);
    setAssetPembekal('');
    setAssetLokasi('Kedai POS Koperasi');
  };

  // Form Submit: Dispose Asset
  const handleDisposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForDisposal) return;

    const untungRugi = Number(disposalHarga) - selectedAssetForDisposal.nilaiBukuBersihSemasa;
    onUpdateAsset(selectedAssetForDisposal.id, {
      status: 'DILUPUSKAN',
      tarikhPelupusan: disposalTarikh,
      hargaJualanPelupusan: Number(disposalHarga),
      untungRugiPelupusan: untungRugi,
      catatanPelupusan: disposalCatatan
    });

    setShowDisposalModal(false);
    setSelectedAssetForDisposal(null);
  };

  const handleExecuteDepreciation = () => {
    onRunDepreciation(selectedDepYear);
    setDepSuccessMsg(`Pengiraan susutnilai tahun ${selectedDepYear} telah dijana dan dikemaskini dalam lejar.`);
    setTimeout(() => setDepSuccessMsg(null), 5000);
  };

  const getKategoriLabel = (kategori: KategoriAsetTetap) => {
    switch (kategori) {
      case 'PREMIS_BANGUNAN': return 'Premis / Bangunan Kedai';
      case 'KENDERAAN': return 'Kenderaan Koperasi';
      case 'MESIN_KELENGKAPAN_POS': return 'Mesin & Kelengkapan POS';
      case 'KOMPUTER_IT_SOFTWARE': return 'Komputer, Server & IT';
      case 'PERABOT_PERALATAN_PEJABAT': return 'Perabot & Peralatan Pejabat';
      case 'PENGUBAHSUAIAN_PREMIS': return 'Pengubahsuaian Bangunan';
      default: return 'Harta Tetap Am';
    }
  };

  const getKategoriIcon = (kategori: KategoriAsetTetap) => {
    switch (kategori) {
      case 'PREMIS_BANGUNAN': return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'KENDERAAN': return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'MESIN_KELENGKAPAN_POS': return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'KOMPUTER_IT_SOFTWARE': return <Monitor className="w-4 h-4 text-cyan-400" />;
      case 'PERABOT_PERALATAN_PEJABAT': return <Armchair className="w-4 h-4 text-purple-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Pematuhan Garis Panduan Audit SKM (GP1)
            </span>
            <span className="text-xs text-slate-400">Daftar Harta Tetap & Susutnilai Automatik</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" /> Daftar Harta Tetap & Jadual Susutnilai Automatik
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengurusan aset premis, kenderaan, peralatan POS dan pengiraan susutnilai tahunan automatik terus ke Lejar Am.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Daftar Aset Baharu
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Daftar Aset
          </button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Kos Asal */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Kos Asal Harta Tetap (Cost)</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            {formatRM(totalKosAsal)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Jumlah Aset Berdaftar:</span>
            <strong className="text-indigo-400 font-bold">{totalAsetAktif} Unit Aktif</strong>
          </div>
        </div>

        {/* Card 2: Susutnilai Terkumpul */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Susutnilai Terkumpul (Accumulated)</span>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-800/60">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">
            {formatRM(totalSusutnilaiTerkumpul)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Akaun Kontra Lejar:</span>
            <span className="text-rose-400 font-mono">Kod 1080 SKM</span>
          </div>
        </div>

        {/* Card 3: Nilai Buku Bersih (NBV) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Nilai Buku Bersih (Net Book Value)</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">
            {formatRM(totalNilaiBukuBersih)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Kedudukan Kunci Kira-Kira:</span>
            <span className="text-emerald-400 font-semibold">Bawaan Bersih 2026</span>
          </div>
        </div>

        {/* Card 4: Enjin Susutnilai Automatik */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Kaedah Susutnilai</span>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800/60">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-black text-amber-300">
            Garis Lurus (Straight-Line)
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Pematuhan Audit:</span>
            <span className="text-amber-400 font-semibold">100% Automatik</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('DAFTAR_ASET')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'DAFTAR_ASET' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Daftar Terperinci Harta Tetap ({assetList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('JADUAL_SUSUTNILAI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'JADUAL_SUSUTNILAI' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-4 h-4" /> Enjin & Jadual Susutnilai Automatik
        </button>

        <button
          onClick={() => setActiveSubTab('PELUPUSAN_ASET')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PELUPUSAN_ASET' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" /> Rekod Pelupusan & Jualan Aset
        </button>

        <button
          onClick={() => setActiveSubTab('LAPORAN_SKM')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'LAPORAN_SKM' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Laporan Statutori Harta Tetap SKM
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DAFTAR TERPERINCI HARTA TETAP */}
      {/* ========================================================================= */}
      {activeSubTab === 'DAFTAR_ASET' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari tag aset, nama aset, lokasi, pembekal..."
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
                <option value="ALL">Semua Kategori Aset</option>
                <option value="PREMIS_BANGUNAN">Premis / Bangunan</option>
                <option value="KENDERAAN">Kenderaan Koperasi</option>
                <option value="MESIN_KELENGKAPAN_POS">Mesin / Kelengkapan POS</option>
                <option value="KOMPUTER_IT_SOFTWARE">Komputer & IT</option>
                <option value="PERABOT_PERALATAN_PEJABAT">Perabot Pejabat</option>
                <option value="PENGUBAHSUAIAN_PREMIS">Pengubahsuaian Premis</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif Digunakan</option>
                <option value="DILUPUSKAN">Telah Dilupuskan</option>
              </select>
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const depPercentage = asset.kosAsal > 0 ? (asset.susutnilaiTerkumpulSemasa / asset.kosAsal) * 100 : 0;

              return (
                <div 
                  key={asset.id} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-lg space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          {asset.tagAset}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {asset.kategori.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {asset.namaAset}
                      </h4>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                      {getKategoriIcon(asset.kategori)}
                    </div>
                  </div>

                  {/* Financial Values */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Kos Perolehan Asal:</span>
                      <div className="font-bold text-white">{formatRM(asset.kosAsal)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Nilai Buku Bersih (NBV):</span>
                      <div className="font-bold text-emerald-400">{formatRM(asset.nilaiBukuBersihSemasa)}</div>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px]">Kadar Susutnilai:</span>
                      <div className="font-semibold text-amber-300">{asset.kadarSusutnilaiPeratus}% ({asset.jangkaHayatTahun} Thn)</div>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px]">Susutnilai Terkumpul:</span>
                      <div className="font-semibold text-rose-400">{formatRM(asset.susutnilaiTerkumpulSemasa)}</div>
                    </div>
                  </div>

                  {/* Depreciation Progress */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Susutnilai Terkumpul:</span>
                      <span className="font-bold text-slate-300">{depPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full transition-all" style={{ width: `${Math.min(100, depPercentage)}%` }} />
                    </div>
                  </div>

                  {/* Meta details & Action */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                    <span className="truncate max-w-[170px]">{asset.lokasi}</span>
                    
                    {asset.status === 'AKTIF' && (
                      <button
                        onClick={() => {
                          setSelectedAssetForDisposal(asset);
                          setDisposalHarga(asset.nilaiBukuBersihSemasa);
                          setShowDisposalModal(true);
                        }}
                        className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Lupus Aset
                      </button>
                    )}

                    {asset.status === 'DILUPUSKAN' && (
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        DILUPUSKAN
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ENJIN & JADUAL SUSUTNILAI AUTOMATIK */}
      {/* ========================================================================= */}
      {activeSubTab === 'JADUAL_SUSUTNILAI' && (
        <div className="space-y-4">
          
          {/* Depreciation Action Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Enjin Pengiraan Susutnilai Automatik Tahunan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Jana catatan susutnilai tahunan bagi semua harta tetap aktif mengikut kaedah Garis Lurus (Straight-Line) secara automatik ke lejar akaun.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDepYear}
                onChange={(e) => setSelectedDepYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs focus:outline-none"
              >
                <option value={2026}>Tahun Kewangan 2026</option>
                <option value={2025}>Tahun Kewangan 2025</option>
                <option value={2024}>Tahun Kewangan 2024</option>
              </select>

              <button
                onClick={handleExecuteDepreciation}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/40 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Jana Jurnal Susutnilai
              </button>
            </div>
          </div>

          {depSuccessMsg && (
            <div className="p-3.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{depSuccessMsg}</span>
            </div>
          )}

          {/* Table of Depreciation Schedules */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Tag & Nama Aset</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5 text-right">Kos Asal (RM)</th>
                    <th className="px-4 py-3.5 text-center">Kadar %</th>
                    <th className="px-4 py-3.5 text-right">Susutnilai Tahunan (RM)</th>
                    <th className="px-4 py-3.5 text-right">Susutnilai Terkumpul (RM)</th>
                    <th className="px-4 py-3.5 text-right">Nilai Buku Bersih (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {assetList.map((asset) => {
                    const depreciableBase = Math.max(0, asset.kosAsal - asset.nilaiSisa);
                    const annualDep = Math.round((depreciableBase * (asset.kadarSusutnilaiPeratus / 100)) * 100) / 100;

                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/40 font-sans">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{asset.namaAset}</div>
                          <div className="text-[11px] text-indigo-300 font-mono">{asset.tagAset} • Belian: {asset.tarikhPerolehan}</div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-300">
                          {getKategoriLabel(asset.kategori)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-200">
                          {formatRM(asset.kosAsal)}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-amber-300">
                          {asset.kadarSusutnilaiPeratus}%
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-300">
                          {formatRM(annualDep)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-rose-400">
                          {formatRM(asset.susutnilaiTerkumpulSemasa)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-400 text-sm">
                          {formatRM(asset.nilaiBukuBersihSemasa)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-950 font-black text-white border-t-2 border-slate-800 text-xs">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right uppercase">Jumlah Keseluruhan:</td>
                    <td className="px-4 py-3 text-right font-mono text-indigo-300">{formatRM(totalKosAsal)}</td>
                    <td></td>
                    <td className="px-4 py-3 text-right font-mono text-rose-300">
                      {formatRM(assetList.reduce((s, a) => s + Math.round((Math.max(0, a.kosAsal - a.nilaiSisa) * (a.kadarSusutnilaiPeratus / 100)) * 100) / 100, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-400">{formatRM(totalSusutnilaiTerkumpul)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatRM(totalNilaiBukuBersih)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: REKOD PELUPUSAN & JUALAN ASET */}
      {/* ========================================================================= */}
      {activeSubTab === 'PELUPUSAN_ASET' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" /> Daftar Pelupusan, Jualan & Hapus Kira Harta Tetap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mengikut Garis Panduan Tatacara Pengurusan Aset Koperasi SKM bagi pelupusan aset rosak atau usang.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Tag & Nama Aset</th>
                    <th className="px-4 py-3">Tarikh Dilupuskan</th>
                    <th className="px-4 py-3 text-right">Kos Asal (RM)</th>
                    <th className="px-4 py-3 text-right">Nilai Buku Semasa (RM)</th>
                    <th className="px-4 py-3 text-right">Harga Jualan (RM)</th>
                    <th className="px-4 py-3 text-right">Untung / (Rugi) (RM)</th>
                    <th className="px-4 py-3">Catatan / Sebab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {assetList.filter(a => a.status === 'DILUPUSKAN').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500 font-sans">
                        Tiada rekod pelupusan aset dalam tempoh kewangan semasa. Semua aset berada dalam keadaan aktif beroperasi.
                      </td>
                    </tr>
                  ) : (
                    assetList.filter(a => a.status === 'DILUPUSKAN').map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-850 font-sans">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{asset.namaAset}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{asset.tagAset}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{asset.tarikhPelupusan}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatRM(asset.kosAsal)}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatRM(asset.nilaiBukuBersihSemasa)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatRM(asset.hargaJualanPelupusan)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${
                          (asset.untungRugiPelupusan || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {formatRM(asset.untungRugiPelupusan)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{asset.catatanPelupusan}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: LAPORAN STATUTORI HARTA TETAP SKM (PRINTABLE / PDF) */}
      {/* ========================================================================= */}
      {activeSubTab === 'LAPORAN_SKM' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Printable Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-6 print:border-black">
            <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-1">
              SURUHANJAYA KOPERASI MALAYSIA (SKM) • GARIS PANDUAN AUDIT GP1
            </div>
            <h1 className="text-xl font-black text-white uppercase print:text-black">
              DAFTAR HARTA TETAP & JADUAL SUSUTNILAI TERAUDIT TAHUN 2026
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
              Laporan Penilaian Nilai Buku Bersih (NBV) Mengikut Standard Perakaunan Koperasi Malaysia
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
              <div className="text-slate-400">Tarikh Cetakan:</div>
              <strong className="text-white print:text-black">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3">
            <table className="w-full text-left text-xs border border-slate-800 print:border-black">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="p-2.5">Tag ID</th>
                  <th className="p-2.5">Keterangan Aset</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5 text-right">Kos Asal (RM)</th>
                  <th className="p-2.5 text-right">Susutnilai Terkumpul (RM)</th>
                  <th className="p-2.5 text-right">Nilai Buku Bersih (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {assetList.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-mono text-indigo-300 print:text-black">{a.tagAset}</td>
                    <td className="p-2.5 font-bold text-white print:text-black">{a.namaAset}</td>
                    <td className="p-2.5 text-slate-400 print:text-gray-700">{getKategoriLabel(a.kategori)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{formatRM(a.kosAsal)}</td>
                    <td className="p-2.5 text-right font-mono text-rose-400 print:text-black">{formatRM(a.susutnilaiTerkumpulSemasa)}</td>
                    <td className="p-2.5 text-right font-mono font-black text-emerald-400 print:text-black">{formatRM(a.nilaiBukuBersihSemasa)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 font-black text-white border-t-2 border-slate-800 print:bg-gray-200 print:text-black text-xs">
                <tr>
                  <td colSpan={3} className="p-2.5 text-right uppercase">Jumlah Nilai Keseluruhan:</td>
                  <td className="p-2.5 text-right font-mono text-indigo-300 print:text-black">{formatRM(totalKosAsal)}</td>
                  <td className="p-2.5 text-right font-mono text-rose-400 print:text-black">{formatRM(totalSusutnilaiTerkumpul)}</td>
                  <td className="p-2.5 text-right font-mono text-emerald-400 print:text-black">{formatRM(totalNilaiBukuBersih)}</td>
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
      {/* MODAL 1: DAFTAR ASET BAHARU */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Pendaftaran Harta Tetap Baharu
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar pembelian premis, kenderaan, peralatan atau mesin kedai.
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
                <label className="block text-slate-300 font-semibold mb-1">Nama / Keterangan Aset *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peti Sejuk Komersial 2 Pintu / Van Koperasi"
                  value={assetNama}
                  onChange={(e) => setAssetNama(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Harta Tetap *</label>
                  <select
                    value={assetKategori}
                    onChange={(e) => {
                      const k = e.target.value as KategoriAsetTetap;
                      setAssetKategori(k);
                      if (k === 'PREMIS_BANGUNAN') { setAssetKadar(2); setAssetJangkaHayat(50); }
                      else if (k === 'KENDERAAN') { setAssetKadar(20); setAssetJangkaHayat(5); }
                      else if (k === 'MESIN_KELENGKAPAN_POS') { setAssetKadar(20); setAssetJangkaHayat(5); }
                      else if (k === 'KOMPUTER_IT_SOFTWARE') { setAssetKadar(33.33); setAssetJangkaHayat(3); }
                      else { setAssetKadar(10); setAssetJangkaHayat(10); }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PREMIS_BANGUNAN">Premis / Bangunan (2%)</option>
                    <option value="KENDERAAN">Kenderaan Koperasi (20%)</option>
                    <option value="MESIN_KELENGKAPAN_POS">Mesin & Kelengkapan POS (20%)</option>
                    <option value="KOMPUTER_IT_SOFTWARE">Komputer, Server & IT (33.3%)</option>
                    <option value="PERABOT_PERALATAN_PEJABAT">Perabot & Peralatan Pejabat (10%)</option>
                    <option value="PENGUBAHSUAIAN_PREMIS">Pengubahsuaian Premis (10%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kos Perolehan Asal (RM) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={assetKos}
                    onChange={(e) => setAssetKos(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nilai Sisa / Pelupusan (RM)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={assetNilaiSisa}
                    onChange={(e) => setAssetNilaiSisa(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kadar Susutnilai (% setahun)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={assetKadar}
                    onChange={(e) => setAssetKadar(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Pembekal / Syarikat</label>
                  <input
                    type="text"
                    placeholder="Nama Syarikat Pembekal"
                    value={assetPembekal}
                    onChange={(e) => setAssetPembekal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Invois / Baucar Bayaran</label>
                  <input
                    type="text"
                    value={assetNoInvois}
                    onChange={(e) => setAssetNoInvois(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lokasi Aset Ditempatkan</label>
                  <input
                    type="text"
                    value={assetLokasi}
                    onChange={(e) => setAssetLokasi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarikh Perolehan / Belian</label>
                  <input
                    type="date"
                    value={assetTarikh}
                    onChange={(e) => setAssetTarikh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  <CheckCircle2 className="w-4 h-4" /> Simpan Pendaftaran Aset
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PELUPUSAN ASET */}
      {/* ========================================================================= */}
      {showDisposalModal && selectedAssetForDisposal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" /> Borang Pelupusan Harta Tetap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aset: <strong className="text-indigo-300">{selectedAssetForDisposal.namaAset}</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowDisposalModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisposalSubmit} className="space-y-3.5 text-xs">
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kos Asal:</span>
                  <span className="font-bold text-white">{formatRM(selectedAssetForDisposal.kosAsal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nilai Buku Semasa (NBV):</span>
                  <span className="font-bold text-emerald-400">{formatRM(selectedAssetForDisposal.nilaiBukuBersihSemasa)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh Pelupusan</label>
                <input
                  type="date"
                  required
                  value={disposalTarikh}
                  onChange={(e) => setDisposalTarikh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Harga Jualan / Nilai Skrap (RM)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={disposalHarga}
                  onChange={(e) => setDisposalHarga(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sebab & Catatan Pelupusan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aset rosak teruk / Usang & diganti baharu"
                  value={disposalCatatan}
                  onChange={(e) => setDisposalCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDisposalModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Sahkan Pelupusan Aset
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
