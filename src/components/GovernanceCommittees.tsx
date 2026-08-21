import React, { useState, useMemo } from 'react';
import { Ahli, AnggotaJawatankuasa, KategoriKepimpinan } from '../types';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Building,
  Award,
  Calendar,
  Phone,
  Mail,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Briefcase,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
  Edit2,
  Trash2
} from 'lucide-react';

interface GovernanceCommitteesProps {
  jawatanKuasaList: AnggotaJawatankuasa[];
  ahliList: Ahli[];
  onAddJawatankuasa: (newMember: AnggotaJawatankuasa) => void;
  onUpdateJawatankuasa?: (updatedMember: AnggotaJawatankuasa) => void;
  onDeleteJawatankuasa?: (id: string) => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const GovernanceCommittees: React.FC<GovernanceCommitteesProps> = ({
  jawatanKuasaList,
  ahliList,
  onAddJawatankuasa,
  onUpdateJawatankuasa,
  onDeleteJawatankuasa,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';

  // Active Sub-Tab: 'CARTA_ORGANISASI' | 'ALK' | 'GILIRAN_1_3' | 'JAD'
  const [activeTab, setActiveTab] = useState<'CARTA_ORGANISASI' | 'ALK' | 'GILIRAN_1_3' | 'JAD'>('CARTA_ORGANISASI');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add / Edit Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<AnggotaJawatankuasa | null>(null);

  // Form Inputs
  const [selectedAhliId, setSelectedAhliId] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [noAhli, setNoAhli] = useState<string>('');
  const [noKp, setNoKp] = useState<string>('');
  const [kategori, setKategori] = useState<KategoriKepimpinan>('ALK');
  const [jawatanKoperasi, setJawatanKoperasi] = useState<string>('Anggota ALK');
  const [portfolio, setPortfolio] = useState<string>('Biro Kewangan & Pelaburan');
  const [tarikhLantikan, setTarikhLantikan] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tempohKhidmat, setTempohKhidmat] = useState<string>('Sesi 2024/2026 (2 Tahun)');
  const [noTelefon, setNoTelefon] = useState<string>('');
  const [eMel, setEMel] = useState<string>('');
  const [catatanSKM, setCatatanSKM] = useState<string>('Diluluskan di bawah Resolusi Mesyuarat Agung');

  // Filtered Lists
  const alkMembers = useMemo(() => {
    return jawatanKuasaList.filter(m => m.kategori === 'ALK');
  }, [jawatanKuasaList]);

  const jadMembers = useMemo(() => {
    return jawatanKuasaList.filter(m => m.kategori === 'JAD');
  }, [jawatanKuasaList]);

  const filteredMembers = useMemo(() => {
    return jawatanKuasaList.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.nama.toLowerCase().includes(q) ||
        m.noAhli.toLowerCase().includes(q) ||
        m.jawatanKoperasi.toLowerCase().includes(q) ||
        (m.portfolio && m.portfolio.toLowerCase().includes(q)) ||
        m.noKp.includes(q);

      const matchesCategory =
        activeTab === 'CARTA_ORGANISASI'
          ? true
          : activeTab === 'ALK'
          ? m.kategori === 'ALK'
          : m.kategori === 'JAD';

      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [jawatanKuasaList, searchQuery, activeTab, statusFilter]);

  // Handle Member selection change in form
  const handleSelectAhli = (id: string) => {
    setSelectedAhliId(id);
    const found = ahliList.find(a => a.id === id);
    if (found) {
      setNama(found.nama);
      setNoAhli(found.noAhli);
      setNoKp(found.noKp);
      setNoTelefon(found.noTelefon);
      setEMel(found.eMel);
    }
  };

  const handleOpenAddModal = (defaultKategori: KategoriKepimpinan = 'ALK') => {
    setEditingMember(null);
    setKategori(defaultKategori);
    setJawatanKoperasi(defaultKategori === 'ALK' ? 'Anggota ALK' : 'Anggota JAD');
    setPortfolio(defaultKategori === 'ALK' ? 'Biro Kewangan & Pelaburan' : 'Audit Kewangan SKM');
    setSelectedAhliId('');
    setNama('');
    setNoAhli('');
    setNoKp('');
    setNoTelefon('');
    setEMel('');
    setCatatanSKM('Diluluskan di bawah Resolusi Mesyuarat Agung Tahunan');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (member: AnggotaJawatankuasa) => {
    setEditingMember(member);
    setKategori(member.kategori);
    setJawatanKoperasi(member.jawatanKoperasi);
    setPortfolio(member.portfolio || '');
    setNama(member.nama);
    setNoAhli(member.noAhli);
    setNoKp(member.noKp);
    setTarikhLantikan(member.tarikhLantikan);
    setTempohKhidmat(member.tempohKhidmat);
    setNoTelefon(member.noTelefon);
    setEMel(member.eMel);
    setCatatanSKM(member.catatanSKM || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !jawatanKoperasi) return;

    if (editingMember && onUpdateJawatankuasa) {
      const updated: AnggotaJawatankuasa = {
        ...editingMember,
        nama,
        noAhli: noAhli || editingMember.noAhli,
        noKp: noKp || editingMember.noKp,
        kategori,
        jawatanKoperasi,
        portfolio,
        tarikhLantikan,
        tempohKhidmat,
        noTelefon: noTelefon || editingMember.noTelefon,
        eMel: eMel || editingMember.eMel,
        catatanSKM,
      };
      onUpdateJawatankuasa(updated);
    } else {
      const newMember: AnggotaJawatankuasa = {
        id: `${kategori}-${Date.now()}`,
        noAhli: noAhli || `KOP-2026-${String(jawatanKuasaList.length + 1).padStart(3, '0')}`,
        nama,
        noKp: noKp || '000000-00-0000',
        kategori,
        jawatanKoperasi,
        portfolio,
        tarikhLantikan,
        tempohKhidmat,
        status: 'AKTIF',
        noTelefon: noTelefon || '012-0000000',
        eMel: eMel || 'ahli@koperasi.my',
        catatanSKM,
      };
      onAddJawatankuasa(newMember);
    }

    setShowAddModal(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Kategori",
      "Jawatan Koperasi",
      "Nama Penuh",
      "No. Ahli",
      "No. KP",
      "Portfolio / Biro",
      "Tarikh Lantikan",
      "Tempoh Khidmat",
      "Status",
      "No. Telefon",
      "E-Mel",
      "Catatan SKM / AGM"
    ];

    const rows = filteredMembers.map(m => [
      `"${m.kategori}"`,
      `"${m.jawatanKoperasi}"`,
      `"${m.nama.replace(/"/g, '""')}"`,
      `"${m.noAhli}"`,
      `"${m.noKp}"`,
      `"${(m.portfolio || '').replace(/"/g, '""')}"`,
      `"${m.tarikhLantikan}"`,
      `"${m.tempohKhidmat}"`,
      `"${m.status}"`,
      `"${m.noTelefon}"`,
      `"${m.eMel}"`,
      `"${(m.catatanSKM || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Senarai_ALK_dan_JAD_Koperasi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {isEN ? 'Pematuhan Seksyen 42, 44 & 47 Akta Koperasi 1993' : 'Pematuhan Seksyen 42, 44 & 47 Akta Koperasi 1993'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/80">
              {alkMembers.length} ALK | {jadMembers.length} JAD
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>{isEN ? 'Board of Directors (ALK) & Internal Audit Committee (JAD)' : 'Pengurusan Kepimpinan Koperasi (ALK & JAD)'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Official registry & organizational structure of Ahli Lembaga Koperasi (ALK) & Jawatankuasa Audit Dalaman (JAD).'
              : 'Senarai rasmi keanggotaan Ahli Lembaga Koperasi (ALK) & Jawatankuasa Audit Dalaman (JAD) berdaftar di bawah Suruhanjaya Koperasi Malaysia (SKM).'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>{isEN ? 'Print / Export PDF' : 'Cetak Senarai Rasmi'}</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('ALK')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>{isEN ? 'Add ALK / JAD Member' : 'Lantik ALK / JAD Baru'}</span>
          </button>
        </div>
      </div>

      {/* Main Sub-Tabs */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('CARTA_ORGANISASI')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'CARTA_ORGANISASI'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-300" />
            <span>{isEN ? 'Organisational Chart' : 'Carta Organisasi ALK & JAD'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ALK')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'ALK'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-300" />
            <span>{isEN ? 'Board of Directors (12 ALK)' : '12 Ahli Lembaga (ALK)'}</span>
            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] rounded-full font-mono font-bold">
              {alkMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('GILIRAN_1_3')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'GILIRAN_1_3'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isEN ? '1/3 ALK Rotation (Section 42)' : 'Giliran 1/3 ALK (Seksyen 42)'}</span>
            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] rounded-full font-mono font-bold">
              4/Tahun
            </span>
          </button>

          <button
            onClick={() => setActiveTab('JAD')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'JAD'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>{isEN ? 'Internal Audit Committee (JAD)' : 'Audit Dalaman (JAD)'}</span>
            <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 text-[10px] rounded-full font-mono font-bold">
              {jadMembers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isEN ? 'Search name, role or ID...' : 'Cari nama, jawatan, no ahli...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* CARTA ORGANISASI VIEW */}
      {/* ========================================================================================= */}
      {activeTab === 'CARTA_ORGANISASI' && (
        <div className="space-y-6">

          {/* ALK Board Executive Summary */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" />
                  <span>Struktur Carta Kepimpinan Ahli Lembaga Koperasi (ALK)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Berdaftar di bawah Seksyen 42 Akta Koperasi 1993 • Dilantik semasa Mesyuarat Agung Tahunan (AGM)
                </p>
              </div>

              <button
                onClick={() => handleOpenAddModal('ALK')}
                className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Lantik ALK Baru
              </button>
            </div>

            {/* Top Leadership Cards Grid (Pengerusi, Setiausaha, Bendahari) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Pengerusi ALK */}
              {alkMembers.filter(m => m.jawatanKoperasi.toLowerCase().includes('pengerusi')).map(m => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-emerald-800/80 relative space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider">
                      {m.jawatanKoperasi}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.noAhli}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm">{m.nama}</h4>
                    <p className="text-[11px] text-emerald-400 font-medium mt-0.5">{m.portfolio}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Tempoh Sesi:</span>
                      <span className="text-slate-300 font-semibold">{m.tempohKhidmat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarikh Lantikan:</span>
                      <span className="text-slate-300 font-semibold">{m.tarikhLantikan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">{m.noTelefon}</span>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Kemaskini
                    </button>
                  </div>
                </div>
              ))}

              {/* Setiausaha ALK */}
              {alkMembers.filter(m => m.jawatanKoperasi.toLowerCase().includes('setiausaha')).map(m => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-indigo-800/80 relative space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wider">
                      {m.jawatanKoperasi}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.noAhli}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm">{m.nama}</h4>
                    <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{m.portfolio}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Tempoh Sesi:</span>
                      <span className="text-slate-300 font-semibold">{m.tempohKhidmat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarikh Lantikan:</span>
                      <span className="text-slate-300 font-semibold">{m.tarikhLantikan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">{m.noTelefon}</span>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Kemaskini
                    </button>
                  </div>
                </div>
              ))}

              {/* Bendahari ALK */}
              {alkMembers.filter(m => m.jawatanKoperasi.toLowerCase().includes('bendahari')).map(m => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-amber-800/80 relative space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                      {m.jawatanKoperasi}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.noAhli}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm">{m.nama}</h4>
                    <p className="text-[11px] text-amber-400 font-medium mt-0.5">{m.portfolio}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Tempoh Sesi:</span>
                      <span className="text-slate-300 font-semibold">{m.tempohKhidmat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarikh Lantikan:</span>
                      <span className="text-slate-300 font-semibold">{m.tarikhLantikan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">{m.noTelefon}</span>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Kemaskini
                    </button>
                  </div>
                </div>
              ))}

            </div>

            {/* Other ALK Board Members Grid */}
            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3">
                Anggota Lembaga Koperasi (ALK Biro & Portfolio)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alkMembers.filter(m => !['pengerusi', 'setiausaha', 'bendahari'].some(role => m.jawatanKoperasi.toLowerCase().includes(role))).map(m => (
                  <div key={m.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{m.nama}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{m.noAhli}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{m.portfolio || m.jawatanKoperasi}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                      <span>{m.tempohKhidmat}</span>
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="text-slate-400 hover:text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* JAD Committee Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Jawatankuasa Audit Dalaman (JAD Koperasi)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Berdaftar di bawah Seksyen 47 Akta Koperasi 1993 • Bertanggungjawab mengaudit akaun, operasional & buku lejar
                </p>
              </div>

              <button
                onClick={() => handleOpenAddModal('JAD')}
                className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Lantik JAD Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jadMembers.map(m => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                      {m.jawatanKoperasi}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.noAhli}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm">{m.nama}</h4>
                    <p className="text-[11px] text-amber-300 font-medium mt-0.5">{m.portfolio}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Tempoh Khidmat:</span>
                      <span className="text-slate-300 font-semibold">{m.tempohKhidmat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarikh Lantikan:</span>
                      <span className="text-slate-300 font-semibold">{m.tarikhLantikan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">{m.noTelefon}</span>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Kemaskini
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* 1/3 ALK ROTATION & STATUTORY RETIREMENT MATRIX (SEKSYEN 42 & UUK) */}
      {/* ========================================================================================= */}
      {activeTab === 'GILIRAN_1_3' && (
        <div className="space-y-6">
          {/* Statutory Rule Banner */}
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-800/80 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-900/80 text-amber-300 border border-amber-600/80 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pematuhan Statutori Seksyen 42 Akta Koperasi 1993 & UUK
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-mono font-bold">
                12 ALK / 3 = 4 Anggota Setahun
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              Sistem Giliran Pengunduran 1/3 Anggota Lembaga Koperasi (ALK)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mengikut <strong>Undang-Undang Kecil (UUK) Standard Koperasi dan Seksyen 42 Akta Koperasi 1993</strong>, daripada <strong>12 orang Ahli Lembaga Koperasi (ALK)</strong>, seramai <strong>satu pertiga (1/3) iaitu 4 orang ALK</strong> yang paling lama memegang jawatan hendaklah <strong>mengundur diri mengikut giliran</strong> pada setiap Mesyuarat Agung Tahunan (MAT). Anggota yang mengundur diri adalah layak untuk dipilih semula (<em>re-elected</em>) atau digantikan dengan calon anggota baharu.
            </p>
          </div>

          {/* 3 Rotational Groups Grid (Kumpulan A, B, C) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Kumpulan Giliran A */}
            <div className="bg-slate-900 border border-blue-800/80 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 font-mono">
                    1/3 ALK — KUMPULAN GILIRAN 1
                  </span>
                  <h4 className="text-base font-extrabold text-white">Kumpulan Giliran A</h4>
                </div>
                <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-xl text-xs font-mono font-bold">
                  4 ALK
                </span>
              </div>

              <div className="bg-slate-950/90 p-3 rounded-xl border border-blue-900/60 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Giliran Bersara:</span>
                  <span className="text-blue-300 font-bold">MAT 2024 / MAT 2027</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Tempoh Perkhidmatan:</span>
                  <span className="text-white font-bold">3 Tahun (Sesi 2024/2027)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Status Sesi Semasa:</span>
                  <span className="text-emerald-400 font-bold">Dipilih Semula (MAT Ke-15)</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {alkMembers.filter(m => m.kumpulanGiliran === 'KUMPULAN_A' || ['ALK-001', 'ALK-004', 'ALK-006', 'ALK-007'].includes(m.id)).map((m, idx) => (
                  <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-white">{m.nama}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 ml-6">{m.jawatanKoperasi} • {m.portfolio}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800 shrink-0">
                      {m.noAhli}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kumpulan Giliran B */}
            <div className="bg-slate-900 border border-purple-800/80 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">
                    1/3 ALK — KUMPULAN GILIRAN 2
                  </span>
                  <h4 className="text-base font-extrabold text-white">Kumpulan Giliran B</h4>
                </div>
                <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-xl text-xs font-mono font-bold">
                  4 ALK
                </span>
              </div>

              <div className="bg-slate-950/90 p-3 rounded-xl border border-purple-900/60 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Giliran Bersara:</span>
                  <span className="text-purple-300 font-bold">MAT 2025 / MAT 2028</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Tempoh Perkhidmatan:</span>
                  <span className="text-white font-bold">3 Tahun (Sesi 2025/2028)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Status Sesi Semasa:</span>
                  <span className="text-emerald-400 font-bold">Selesai Pemilihan (MAT Ke-16)</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {alkMembers.filter(m => m.kumpulanGiliran === 'KUMPULAN_B' || ['ALK-002', 'ALK-005', 'ALK-008', 'ALK-009'].includes(m.id)).map((m, idx) => (
                  <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-white">{m.nama}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 ml-6">{m.jawatanKoperasi} • {m.portfolio}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800 shrink-0">
                      {m.noAhli}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kumpulan Giliran C */}
            <div className="bg-slate-900 border border-amber-800/80 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                    1/3 ALK — KUMPULAN GILIRAN 3
                  </span>
                  <h4 className="text-base font-extrabold text-white">Kumpulan Giliran C</h4>
                </div>
                <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-xl text-xs font-mono font-bold">
                  4 ALK
                </span>
              </div>

              <div className="bg-slate-950/90 p-3 rounded-xl border border-amber-900/60 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Giliran Bersara:</span>
                  <span className="text-amber-300 font-bold">MAT 2026 / MAT 2029</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Tempoh Perkhidmatan:</span>
                  <span className="text-white font-bold">3 Tahun (Sesi 2026/2029)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Status Sesi Semasa:</span>
                  <span className="text-emerald-400 font-bold">Selesai Pemilihan (MAT Ke-17)</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {alkMembers.filter(m => m.kumpulanGiliran === 'KUMPULAN_C' || ['ALK-003', 'ALK-010', 'ALK-011', 'ALK-012'].includes(m.id)).map((m, idx) => (
                  <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-white">{m.nama}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 ml-6">{m.jawatanKoperasi} • {m.portfolio}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800 shrink-0">
                      {m.noAhli}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Historical & Forward Rotation Cycle Timeline */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Matriks Garis Masa Kitaran Pengunduran & Pemilihan MAT Mengikut Tahun</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Tahun MAT</th>
                    <th className="py-2.5 px-3">Mesyuarat Agung</th>
                    <th className="py-2.5 px-3">Kumpulan 1/3 Mengundur Diri</th>
                    <th className="py-2.5 px-3">Bil. Kerusi</th>
                    <th className="py-2.5 px-3">Keputusan Pemilihan & Pencalonan</th>
                    <th className="py-2.5 px-3">Tempoh Sesi Mandat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white font-mono">2024</td>
                    <td className="py-2.5 px-3">MAT Ke-15 (22 Jun 2024)</td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">Kumpulan Giliran A</td>
                    <td className="py-2.5 px-3 font-mono">4 Orang</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">4 Orang Dipilih Semula (Dato' Razali, Devadasan, Hj Ismail, Pn Salmah)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">2024 — 2027</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white font-mono">2025</td>
                    <td className="py-2.5 px-3">MAT Ke-16 (17 Mei 2025)</td>
                    <td className="py-2.5 px-3 font-bold text-purple-400">Kumpulan Giliran B</td>
                    <td className="py-2.5 px-3 font-mono">4 Orang</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">2 Dipilih Semula + 2 Lantikan Baharu (En. Khairul & En. Arumugam)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">2025 — 2028</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white font-mono">2026</td>
                    <td className="py-2.5 px-3">MAT Ke-17 (25 Apr 2026)</td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">Kumpulan Giliran C</td>
                    <td className="py-2.5 px-3 font-mono">4 Orang</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">2 Dipilih Semula + 2 Lantikan Baharu (Dr. Nor Aini & Che Wan Fadzil)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">2026 — 2029</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-emerald-950/20">
                    <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">2027</td>
                    <td className="py-2.5 px-3 font-bold text-white">MAT Ke-18 (27 Mac 2027)</td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">Kumpulan Giliran A (Kitaran 2)</td>
                    <td className="py-2.5 px-3 font-mono">4 Orang</td>
                    <td className="py-2.5 px-3 text-blue-300 font-medium">Pengunduran 4 ALK Kumpulan A & Pembukaan Undian Terbuka MAT</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">2027 — 2030</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* ALK & JAD DATA TABLE VIEWS */}
      {/* ========================================================================================= */}
      {(activeTab === 'ALK' || activeTab === 'JAD') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
          
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                {activeTab === 'ALK' ? <UserCheck className="w-4 h-4 text-indigo-400" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
                <span>
                  {activeTab === 'ALK'
                    ? 'Senarai Ahli Lembaga Koperasi (ALK) Berdaftar'
                    : 'Senarai Jawatankuasa Audit Dalaman (JAD) Berdaftar'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === 'ALK'
                  ? 'Pengurusan pentadbiran, dasar & mesyuarat jawatankuasa ALK Koperasi'
                  : 'Pengawasan akaun kewangan, audit dalaman & pematuhan garis panduan SKM'}
              </p>
            </div>

            <button
              onClick={() => handleOpenAddModal(activeTab)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Lantik {activeTab} Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Nama Kepimpinan</th>
                  <th className="px-4 py-3.5">Jawatan Koperasi</th>
                  <th className="px-4 py-3.5">Portfolio / Biro</th>
                  <th className="px-4 py-3.5">Sesi & Tarikh Lantikan</th>
                  <th className="px-4 py-3.5">Maklumat Perhubungan</th>
                  <th className="px-4 py-3.5">Pematuhan / SKM</th>
                  <th className="px-4 py-3.5 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {m.nama}
                        <div className="text-[11px] text-emerald-400 font-mono font-normal mt-0.5">
                          {m.noAhli} • {m.noKp}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          m.kategori === 'ALK'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {m.jawatanKoperasi}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 font-medium">
                        {m.portfolio || '-'}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <div className="font-bold text-slate-200">{m.tempohKhidmat}</div>
                        <div className="text-slate-400 text-[10px]">Lantikan: {m.tarikhLantikan}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 text-[11px]">
                        <div>{m.noTelefon}</div>
                        <div className="text-slate-400 font-mono text-[10px]">{m.eMel}</div>
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-400 max-w-xs">
                        {m.catatanSKM || 'Diluluskan Mesyuarat Agung'}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 bg-slate-800 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-slate-700 transition-all"
                            title="Kemaskini Rekod"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteJawatankuasa && (
                            <button
                              onClick={() => onDeleteJawatankuasa(m.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-900 text-rose-300 rounded-lg border border-slate-700 transition-all"
                              title="Padam Rekod"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 text-xs font-semibold">
                      Tiada rekod kepimpinan ditemui bagi kriteria carian ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* ADD / EDIT APPOINTMENT MODAL */}
      {/* ========================================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>{editingMember ? 'Kemaskini Lantikan Kepimpinan' : 'Borang Pelantikan ALK / JAD Baru'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* Select Member from existing registry */}
              {!editingMember && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-bold">
                    Pilih daripada Senarai Ahli Koperasi Terdaftar:
                  </label>
                  <select
                    value={selectedAhliId}
                    onChange={(e) => handleSelectAhli(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 focus:border-emerald-500 outline-none font-semibold"
                  >
                    <option value="">-- Pilih Ahli Koperasi (Atau Isi Manual Below) --</option>
                    {ahliList.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nama} ({a.noAhli}) - IC: {a.noKp}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategori & Jawatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Kepimpinan</label>
                  <select
                    value={kategori}
                    onChange={(e) => {
                      const kat = e.target.value as KategoriKepimpinan;
                      setKategori(kat);
                      setJawatanKoperasi(kat === 'ALK' ? 'Anggota ALK' : 'Anggota JAD');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="ALK">ALK (Ahli Lembaga Koperasi)</option>
                    <option value="JAD">JAD (Jawatankuasa Audit Dalaman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jawatan Rasmi</label>
                  <input
                    type="text"
                    value={jawatanKoperasi}
                    onChange={(e) => setJawatanKoperasi(e.target.value)}
                    placeholder="e.g. Pengerusi ALK, Setiausaha, Bendahari"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Nama & IC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Penuh Kepimpinan</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama mengikut MyKad"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Ahli / IC</label>
                  <input
                    type="text"
                    value={noAhli}
                    onChange={(e) => setNoAhli(e.target.value)}
                    placeholder="e.g. KOP-2026-001"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Portfolio & Tempoh Sesi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portfolio / Biro Tugas</label>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="e.g. Biro Kewangan & Pelaburan"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tempoh Sesi Khidmat</label>
                  <input
                    type="text"
                    value={tempohKhidmat}
                    onChange={(e) => setTempohKhidmat(e.target.value)}
                    placeholder="e.g. Sesi 2024/2026 (2 Tahun)"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Tarikh Lantikan & Telefon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarikh Pelantikan AGM/ALK</label>
                  <input
                    type="date"
                    value={tarikhLantikan}
                    onChange={(e) => setTarikhLantikan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Telefon Bimbit</label>
                  <input
                    type="text"
                    value={noTelefon}
                    onChange={(e) => setNoTelefon(e.target.value)}
                    placeholder="012-3456789"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Catatan SKM */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Kelulusan SKM / AGM</label>
                <input
                  type="text"
                  value={catatanSKM}
                  onChange={(e) => setCatatanSKM(e.target.value)}
                  placeholder="e.g. Diluluskan di bawah Resolusi Mesyuarat Agung Tahunan"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  {editingMember ? 'Simpan Kemaskini' : 'Sahkan Pelantikan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Official Document Structure for ALK & JAD */}
      <div id="printable-alk-jad" className="hidden print:block bg-white text-slate-900 p-8 text-xs font-sans space-y-4">
        <div className="text-center border-b-2 border-slate-900 pb-3">
          <h2 className="font-black text-base uppercase">KOPERASI PERKHIDMATAN & USAHAWAN BERHAD</h2>
          <p className="font-bold text-xs uppercase text-slate-700">SENARAI RASMI KEANGGOTAAN AHLI LEMBAGA KOPERASI (ALK) & JAWATANKUASA AUDIT DALAMAN (JAD)</p>
          <p className="text-[10px] text-slate-500">Pematuhan Seksyen 42, 44 & 47 Akta Koperasi 1993 • Suruhanjaya Koperasi Malaysia (SKM)</p>
        </div>

        <div>
          <h3 className="font-bold text-xs uppercase border-b border-slate-400 pb-1 mb-2">1. Ahli Lembaga Koperasi (ALK)</h3>
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-400 p-1.5">No. Ahli</th>
                <th className="border border-slate-400 p-1.5">Nama Penuh</th>
                <th className="border border-slate-400 p-1.5">Jawatan ALK</th>
                <th className="border border-slate-400 p-1.5">Portfolio / Biro</th>
                <th className="border border-slate-400 p-1.5">Sesi Khidmat</th>
              </tr>
            </thead>
            <tbody>
              {alkMembers.map(m => (
                <tr key={m.id}>
                  <td className="border border-slate-400 p-1.5 font-mono">{m.noAhli}</td>
                  <td className="border border-slate-400 p-1.5 font-bold">{m.nama}</td>
                  <td className="border border-slate-400 p-1.5 font-bold">{m.jawatanKoperasi}</td>
                  <td className="border border-slate-400 p-1.5">{m.portfolio || '-'}</td>
                  <td className="border border-slate-400 p-1.5">{m.tempohKhidmat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-bold text-xs uppercase border-b border-slate-400 pb-1 mb-2">2. Jawatankuasa Audit Dalaman (JAD)</h3>
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-400 p-1.5">No. Ahli</th>
                <th className="border border-slate-400 p-1.5">Nama Penuh</th>
                <th className="border border-slate-400 p-1.5">Jawatan JAD</th>
                <th className="border border-slate-400 p-1.5">Tugas Pemeriksaan</th>
                <th className="border border-slate-400 p-1.5">Sesi Khidmat</th>
              </tr>
            </thead>
            <tbody>
              {jadMembers.map(m => (
                <tr key={m.id}>
                  <td className="border border-slate-400 p-1.5 font-mono">{m.noAhli}</td>
                  <td className="border border-slate-400 p-1.5 font-bold">{m.nama}</td>
                  <td className="border border-slate-400 p-1.5 font-bold">{m.jawatanKoperasi}</td>
                  <td className="border border-slate-400 p-1.5">{m.portfolio || '-'}</td>
                  <td className="border border-slate-400 p-1.5">{m.tempohKhidmat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
