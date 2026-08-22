import React, { useState } from 'react';
import { Ahli, StatusAhli } from '../types';
import { excelExport } from '../utils/excelExport';
import { api } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  Coins, 
  Receipt, 
  FileText, 
  Phone, 
  Mail, 
  Building, 
  ShieldAlert,
  ChevronRight,
  Eye,
  Plus,
  Globe,
  Download,
  GraduationCap,
  Award
} from 'lucide-react';

interface MemberManagementProps {
  ahliList: Ahli[];
  onAddAhli: (newAhli: Ahli) => void;
  onUpdateStatusAhli: (id: string, newStatus: StatusAhli) => void;
  onTambahSyerAhli: (id: string, jumlahSyer: number, jumlahYuran: number) => void;
  searchQuery: string;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
  onNavigateToGovernance?: () => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  ahliList,
  onAddAhli,
  onUpdateStatusAhli,
  onTambahSyerAhli,
  searchQuery,
  language = 'BM',
  setLanguage,
  onNavigateToGovernance,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedAhli, setSelectedAhli] = useState<Ahli | null>(null);
  const [showSyerModal, setShowSyerModal] = useState<boolean>(false);

  const isEN = language === 'EN';

  // Modal form states
  const [nama, setNama] = useState('');
  const [noKp, setNoKp] = useState('');
  const [noTelefon, setNoTelefon] = useState('');
  const [eMel, setEMel] = useState('');
  const [jawatanStaf, setJawasanStaf] = useState('Pegawai Kanan');
  const [noGaji, setNoGaji] = useState('');
  const [majikan, setMajikan] = useState('Kementerian Pendidikan Malaysia');
  const [pendidikanTertinggi, setPendidikanTertinggi] = useState<string>('Ijazah Sarjana Muda (Bachelor Degree)');
  const [pekerjaanPerniagaanSemasa, setPekerjaanPerniagaanSemasa] = useState<string>('Penjawat Awam / Perniagaan Kedai Online');
  const [modalSyerAwal, setModalSyerAwal] = useState<number>(500);
  const [yuranBulanan, setYuranBulanan] = useState<number>(50);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      "No. Ahli",
      "Nama Penuh",
      "No. KP",
      "Pendidikan Tertinggi",
      "Pekerjaan / Perniagaan Semasa",
      "No. Telefon",
      "E-Mel",
      "Jawatan / Staf",
      "No. Gaji",
      "Majikan",
      "Tarikh Sertai",
      "Status ALK",
      "Modal Syer (RM)",
      "Yuran Bulanan (RM)",
      "Baki Pinjaman (RM)",
      "Nama Waris",
      "Hubungan Waris",
      "No. KP Waris",
      "No. Tel Waris",
      "Nama Bank",
      "No. Akaun Bank"
    ];

    const rows = filteredMembers.map(a => [
      `"${a.noAhli}"`,
      `"${a.nama.replace(/"/g, '""')}"`,
      `"${a.noKp}"`,
      `"${(a.pendidikanTertinggi || 'Ijazah Sarjana Muda').replace(/"/g, '""')}"`,
      `"${(a.pekerjaanPerniagaanSemasa || 'Penjawat Awam').replace(/"/g, '""')}"`,
      `"${a.noTelefon}"`,
      `"${a.eMel}"`,
      `"${a.jawatanStaf.replace(/"/g, '""')}"`,
      `"${a.noGaji}"`,
      `"${a.majikan.replace(/"/g, '""')}"`,
      `"${a.tarikhSertai}"`,
      `"${a.status}"`,
      a.modalSyer,
      a.yuranBulanan,
      a.bakiPinjaman,
      `"${(a.waris?.nama || '').replace(/"/g, '""')}"`,
      `"${a.waris?.hubungan || ''}"`,
      `"${a.waris?.noKp || ''}"`,
      `"${a.waris?.noTelefon || ''}"`,
      `"${(a.maklumatBank?.namaBank || '').replace(/"/g, '""')}"`,
      `"${a.maklumatBank?.noAkaun || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Senarai_Ahli_Koperasi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Waris & Bank
  const [namaWaris, setNamaWaris] = useState('');
  const [hubunganWaris, setHubunganWaris] = useState('Isteri');
  const [noKpWaris, setNoKpWaris] = useState('');
  const [noTelWaris, setNoTelWaris] = useState('');
  const [namaBank, setNamaBank] = useState('Bank Islam Malaysia Berhad');
  const [noAkaunBank, setNoAkaunBank] = useState('');

  // Syer topup modal
  const [syerTambah, setSyerTambah] = useState<number>(100);
  const [yuranTambah, setYuranTambah] = useState<number>(50);

  // Helper to highlight matching text in table and details card
  const highlightText = (text: string | number | undefined | null, query: string) => {
    if (text === undefined || text === null) return '';
    const str = String(text);
    if (!query || !query.trim()) return str;

    const trimmedQuery = query.trim().toLowerCase();
    const strLower = str.toLowerCase();
    const firstMatch = strLower.indexOf(trimmedQuery);

    if (firstMatch === -1) return str;

    const parts: Array<{ text: string; isMatch: boolean }> = [];
    let lastIndex = 0;

    while (lastIndex < str.length) {
      const matchIndex = strLower.indexOf(trimmedQuery, lastIndex);
      if (matchIndex === -1) {
        parts.push({ text: str.slice(lastIndex), isMatch: false });
        break;
      }
      if (matchIndex > lastIndex) {
        parts.push({ text: str.slice(lastIndex, matchIndex), isMatch: false });
      }
      parts.push({
        text: str.slice(matchIndex, matchIndex + trimmedQuery.length),
        isMatch: true,
      });
      lastIndex = matchIndex + trimmedQuery.length;
    }

    return (
      <>
        {parts.map((part, idx) =>
          part.isMatch ? (
            <mark
              key={idx}
              className="bg-amber-400 text-slate-950 font-black px-1 py-0.5 rounded shadow-sm inline-block"
            >
              {part.text}
            </mark>
          ) : (
            part.text
          )
        )}
      </>
    );
  };

  // Set of 12 Official ALK Members
  const ALK_NO_AHLI_SET = new Set([
    'KOP-2021-001', 'KOP-2021-002', 'KOP-2021-003', 'KOP-2022-012',
    'KOP-2022-033', 'KOP-2021-008', 'KOP-2022-045', 'KOP-2023-019',
    'KOP-2022-061', 'KOP-2021-005', 'KOP-2023-042', 'KOP-2022-077'
  ]);

  // Filter logic
  const filteredMembers = ahliList.filter((a) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      a.nama.toLowerCase().includes(query) ||
      a.noAhli.toLowerCase().includes(query) ||
      a.noKp.includes(query) ||
      a.noGaji.toLowerCase().includes(query) ||
      a.jawatanStaf.toLowerCase().includes(query) ||
      a.majikan.toLowerCase().includes(query);

    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'ALK') return matchesSearch && ALK_NO_AHLI_SET.has(a.noAhli);
    return matchesSearch && a.status === filterStatus;
  });

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noKp) return;

    const newNoAhli = `KOP-2026-${String(ahliList.length + 1).padStart(3, '0')}`;
    const newAhli: Ahli = {
      id: `AHLI-${Date.now()}`,
      noAhli: newNoAhli,
      nama,
      noKp,
      noTelefon: noTelefon || '012-0000000',
      eMel: eMel || `${noGaji.toLowerCase()}@koperasi.my`,
      jawatanStaf,
      noGaji: noGaji || 'G-0000',
      majikan,
      pendidikanTertinggi: pendidikanTertinggi || 'Ijazah Sarjana Muda (Bachelor Degree)',
      pekerjaanPerniagaanSemasa: pekerjaanPerniagaanSemasa || 'Penjawat Awam / Perniagaan Kedai Online',
      tarikhSertai: new Date().toISOString().split('T')[0],
      status: 'PENDING_AL', // Requiring ALK Board approval
      yuranMasuk: 10,
      modalSyer: Number(modalSyerAwal),
      yuranBulanan: Number(yuranBulanan),
      bakiPinjaman: 0,
      waris: {
        nama: namaWaris || (isEN ? 'No Information' : 'Tiada Maklumat'),
        hubungan: hubunganWaris,
        noKp: noKpWaris || '000000-00-0000',
        noTelefon: noTelWaris || '012-0000000',
      },
      maklumatBank: {
        namaBank,
        noAkaun: noAkaunBank || '000000000000',
      },
    };

    onAddAhli(newAhli);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNama('');
    setNoKp('');
    setNoTelefon('');
    setEMel('');
    setNoGaji('');
    setNamaWaris('');
    setNoKpWaris('');
    setNoTelWaris('');
    setNoAkaunBank('');
  };

  const handleTambahSyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAhli) return;

    onTambahSyerAhli(selectedAhli.id, Number(syerTambah), Number(yuranTambah));
    setShowSyerModal(false);
  };

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>
              {isEN ? 'Member Management & Share Capital Module' : 'Modul Pengurusan Ahli & Modal Syer'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN 
              ? 'Register new members, manage share capital, monthly fees, & nominee registration under Co-operative Societies Act 1993.'
              : 'Daftar ahli baru, pengurusan modal syer terbitan, yuran bulanan, & penamaan waris mengikut Akta Koperasi 1993.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {onNavigateToGovernance && (
            <button
              onClick={onNavigateToGovernance}
              className="px-3.5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              title={isEN ? "View ALK & JAD Board List" : "Lihat Senarai Keanggotaan ALK & JAD"}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{isEN ? 'ALK & JAD' : 'Senarai ALK & JAD'}</span>
            </button>
          )}

          {setLanguage && (
            <button
              onClick={() => setLanguage(isEN ? 'BM' : 'EN')}
              className="px-3 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              title={isEN ? "Tukar ke Bahasa Malaysia" : "Switch to English"}
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{isEN ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
            </button>
          )}

          <button
            onClick={() => excelExport.exportMembersList(ahliList, 'Koperasi_Warga_Berdaya')}
            className="px-3.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 border border-teal-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm flex-1 sm:flex-none"
            title="Eksport senarai induk ahli lengkap ke format Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-teal-300" />
            <span>{isEN ? 'Excel Masterlist' : 'Eksport Excel'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm flex-1 sm:flex-none"
            title={isEN ? "Export filtered member list to CSV" : "Muat turun senarai ahli terkini ke fail CSV"}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isEN ? 'CSV' : 'CSV'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all shrink-0 flex-1 sm:flex-none"
          >
            <UserPlus className="w-4 h-4" /> {isEN ? 'New Member Application' : 'Permohonan Ahli Baru'}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Indicator */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${filterStatus === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            {isEN ? 'All' : 'Semua'} ({ahliList.length})
          </button>
          <button
            onClick={() => setFilterStatus('ALK')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${filterStatus === 'ALK' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'text-slate-400 hover:text-white'}`}
          >
            ⭐ {isEN ? '12 Board of Directors (ALK)' : '12 Ahli Lembaga (ALK)'} ({ahliList.filter(a => ALK_NO_AHLI_SET.has(a.noAhli)).length})
          </button>
          <button
            onClick={() => setFilterStatus('AKTIF')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${filterStatus === 'AKTIF' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'}`}
          >
            {isEN ? 'Active' : 'Aktif'} ({ahliList.filter(a => a.status === 'AKTIF').length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_AL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${filterStatus === 'PENDING_AL' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-white'}`}
          >
            {isEN ? 'Pending Board Approval' : 'Menunggu Kelulusan ALK'} ({ahliList.filter(a => a.status === 'PENDING_AL').length})
          </button>
          <button
            onClick={() => setFilterStatus('BERHENTI')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${filterStatus === 'BERHENTI' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-white'}`}
          >
            {isEN ? 'Resigned' : 'Berhenti'} ({ahliList.filter(a => a.status === 'BERHENTI').length})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {searchQuery.trim() && (
            <span className="bg-amber-950 text-amber-300 border border-amber-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEN ? 'Search Filter:' : 'Carian Hilight:'}</span>
              <strong className="text-amber-200">"{searchQuery}"</strong>
            </span>
          )}
          <span>
            {isEN ? 'Showing' : 'Menunjukkan'} <strong className="text-white">{filteredMembers.length}</strong> {isEN ? 'members' : 'ahli'}
          </span>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isEN ? 'Member / Co-op No.' : 'Ahli / No. Koperasi'}</th>
                <th className="px-4 py-3.5">{isEN ? 'IC No. & Designation' : 'No. KP & Jawatan'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Status / Board' : 'Status & Peranan'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Share Capital (RM)' : 'Modal Syer (RM)'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Monthly Fee' : 'Yuran Bulanan'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Loan Balance' : 'Baki Pinjaman'}</th>
                <th className="px-4 py-3.5 text-center">{isEN ? 'Actions' : 'Tindakan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.map((ahli) => (
                <tr key={ahli.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Name & No Ahli */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-white text-sm">
                        {highlightText(ahli.nama, searchQuery)}
                      </div>
                      {ALK_NO_AHLI_SET.has(ahli.noAhli) && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-950 text-indigo-300 border border-indigo-800 tracking-wider">
                          12 ALK
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {highlightText(ahli.noAhli, searchQuery)}
                    </div>
                  </td>

                  {/* IC & Position */}
                  <td className="px-4 py-3.5">
                    <div className="text-slate-200">
                      {highlightText(ahli.noKp, searchQuery)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {highlightText(ahli.jawatanStaf, searchQuery)} ({highlightText(ahli.noGaji, searchQuery)})
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      {ahli.status === 'AKTIF' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {isEN ? 'ACTIVE' : 'AKTIF'}
                        </span>
                      )}
                      {ahli.status === 'PENDING_AL' && (
                        <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-400" /> {isEN ? 'PENDING BOARD' : 'MENUNGGU ALK'}
                        </span>
                      )}
                      {ahli.status === 'BERHENTI' && (
                        <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <XCircle className="w-3 h-3 text-rose-400" /> {isEN ? 'RESIGNED' : 'BERHENTI'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Share Capital */}
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-400 text-sm">
                    {formatRM(ahli.modalSyer)}
                  </td>

                  {/* Monthly Fee */}
                  <td className="px-4 py-3.5 text-right text-slate-200">
                    {formatRM(ahli.yuranBulanan)} {isEN ? '/ mo' : '/ bln'}
                  </td>

                  {/* Loan Balance */}
                  <td className="px-4 py-3.5 text-right font-semibold text-purple-300">
                    {ahli.bakiPinjaman > 0 ? formatRM(ahli.bakiPinjaman) : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedAhli(ahli)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title={isEN ? "View Member & Nominee Card" : "Lihat Kad Ahli & Waris"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {ahli.status === 'PENDING_AL' && (
                        <button
                          onClick={() => onUpdateStatusAhli(ahli.id, 'AKTIF')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                          title={isEN ? "Approve Membership by ALK Board" : "Luluskan Keahlian oleh ALK"}
                        >
                          {isEN ? 'Approve' : 'Lulus ALK'}
                        </button>
                      )}

                      {ahli.status === 'AKTIF' && (
                        <button
                          onClick={() => {
                            setSelectedAhli(ahli);
                            setShowSyerModal(true);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800 rounded-lg text-[11px] font-medium transition-colors"
                          title={isEN ? "Add Share / Fee" : "Tambah Syer / Yuran"}
                        >
                          {isEN ? '+ Share' : '+ Syer'}
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {isEN 
                      ? 'No members found matching your search query.' 
                      : 'Tiada ahli dijumpai mengikut carian.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details & Nominee Card Drawer/Modal */}
      {selectedAhli && !showSyerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedAhli(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-lg">
                {selectedAhli.nama.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {highlightText(selectedAhli.nama, searchQuery)}
                </h3>
                <p className="text-xs text-emerald-400 font-mono">
                  {isEN ? 'Member No.:' : 'No. Ahli:'} {highlightText(selectedAhli.noAhli, searchQuery)} • {isEN ? 'Joined:' : 'Sertai:'} {selectedAhli.tarikhSertai}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 mb-2">
                  {isEN ? 'Service & Employment Info' : 'Maklumat Perkhidmatan'}
                </h4>
                <p className="text-slate-300"><strong>{isEN ? 'IC No.:' : 'No. KP:'}</strong> {highlightText(selectedAhli.noKp, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Highest Education:' : 'Tahap Pendidikan Tertinggi:'}</strong> <span className="text-emerald-300 font-semibold">{selectedAhli.pendidikanTertinggi || 'Ijazah Sarjana Muda'}</span></p>
                <p className="text-slate-300"><strong>{isEN ? 'Current Job / Business:' : 'Pekerjaan / Perniagaan Semasa:'}</strong> <span className="text-amber-300 font-semibold">{selectedAhli.pekerjaanPerniagaanSemasa || 'Penjawat Awam / Perniagaan Kedai Online'}</span></p>
                <p className="text-slate-300"><strong>{isEN ? 'Employer:' : 'Majikan:'}</strong> {highlightText(selectedAhli.majikan, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Designation:' : 'Jawatan:'}</strong> {highlightText(selectedAhli.jawatanStaf, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Salary No.:' : 'No. Gaji:'}</strong> {highlightText(selectedAhli.noGaji, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Phone / Email:' : 'Telefon / eMel:'}</strong> {highlightText(selectedAhli.noTelefon, searchQuery)} • {highlightText(selectedAhli.eMel, searchQuery)}</p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs">
                <h4 className="font-bold text-emerald-400 text-sm border-b border-slate-700 pb-2 mb-2">
                  {isEN ? 'Shares & Fees Summary' : 'Ringkasan Syer & Yuran'}
                </h4>
                <p className="text-slate-300"><strong>{isEN ? 'Issued Share Capital:' : 'Modal Syer Terbitan:'}</strong> <span className="text-emerald-400 font-bold">{formatRM(selectedAhli.modalSyer)}</span></p>
                <p className="text-slate-300"><strong>{isEN ? 'Monthly Fee:' : 'Yuran Bulanan:'}</strong> {formatRM(selectedAhli.yuranBulanan)} {isEN ? '/ month' : '/ bulan'}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Member Loan Balance:' : 'Baki Pinjaman Ahli:'}</strong> {formatRM(selectedAhli.bakiPinjaman)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Entrance Fee (Registration):' : 'Yuran Masuk (Pendaftaran):'}</strong> {isEN ? 'RM 10.00 (Paid)' : 'RM 10.00 (Telah dibayar)'}</p>
              </div>
            </div>

            {/* Waris & Bank Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">
                  {isEN ? 'Nominee Details (Waris)' : 'Penamaan Waris (Nominee)'}
                </h4>
                <p className="text-slate-200"><strong>{isEN ? 'Nominee Name:' : 'Nama Waris:'}</strong> {highlightText(selectedAhli.waris.nama, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Relationship:' : 'Hubungan:'}</strong> {selectedAhli.waris.hubungan}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Nominee IC No.:' : 'No. KP Waris:'}</strong> {selectedAhli.waris.noKp}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Phone No.:' : 'No. Telefon:'}</strong> {selectedAhli.waris.noTelefon}</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-2">
                  {isEN ? 'Member Bank Account (Dividend Payout)' : 'Akaun Bank Ahli (Bayaran Dividen)'}
                </h4>
                <p className="text-slate-200"><strong>{isEN ? 'Bank:' : 'Bank:'}</strong> {highlightText(selectedAhli.maklumatBank.namaBank, searchQuery)}</p>
                <p className="text-slate-300"><strong>{isEN ? 'Account No.:' : 'No. Akaun:'}</strong> {highlightText(selectedAhli.maklumatBank.noAkaun, searchQuery)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedAhli(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                {isEN ? 'Close Member Card' : 'Tutup Kad Ahli'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Register New Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>
                  {isEN ? 'New Co-op Membership Application Form' : 'Borang Permohonan Keahlian Baru Koperasi'}
                </span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Full Name (As per MyKad) *' : 'Nama Penuh Ahli (Mengikut MyKad) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder={isEN ? "Example: Encik Khairul Anuar Bin Ahmad" : "Contoh: Encik Khairul Anuar Bin Ahmad"}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'IC Number (MyKad) *' : 'No. Kad Pengenalan (MyKad) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={noKp}
                    onChange={(e) => setNoKp(e.target.value)}
                    placeholder="880512-10-5432"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>{isEN ? 'Highest Education Background *' : 'Latar Belakang Pendidikan Tertinggi *'}</span>
                </label>
                <select
                  value={pendidikanTertinggi}
                  onChange={(e) => setPendidikanTertinggi(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Ijazah Sarjana Muda (Bachelor Degree)">Ijazah Sarjana Muda (Bachelor Degree)</option>
                  <option value="Sarjana / Master">Sarjana / Master</option>
                  <option value="Doktor Falsafah (PhD)">Doktor Falsafah (PhD)</option>
                  <option value="STPM / Matrikulasi / Diploma">STPM / Matrikulasi / Diploma</option>
                  <option value="SPM / MCE / Sijil">SPM / MCE / Sijil</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Current Occupation / Business *' : 'Pekerjaan / Perniagaan Semasa *'}
                </label>
                <input
                  type="text"
                  required
                  value={pekerjaanPerniagaanSemasa}
                  onChange={(e) => setPekerjaanPerniagaanSemasa(e.target.value)}
                  placeholder={isEN ? "Example: Civil Servant / E-Commerce Online Store" : "Contoh: Penjawat Awam / Perniagaan Kedai Dalam Talian"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Staff Payroll / Salary No.' : 'No. Gaji Staf / Kakitangan'}
                  </label>
                  <input
                    type="text"
                    value={noGaji}
                    onChange={(e) => setNoGaji(e.target.value)}
                    placeholder="G-9812"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Mobile Phone No.' : 'No. Telefon Bimbit'}
                  </label>
                  <input
                    type="text"
                    value={noTelefon}
                    onChange={(e) => setNoTelefon(e.target.value)}
                    placeholder="012-3456789"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Email Address' : 'Alamat eMel'}
                  </label>
                  <input
                    type="email"
                    value={eMel}
                    onChange={(e) => setEMel(e.target.value)}
                    placeholder="ahli@koperasi.my"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Shares & Fees */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400">
                  {isEN ? 'Share Capital & Registration Fee (Co-operative Act 1993)' : 'Bayaran Syer & Yuran Pendaftaran (Akta Koperasi 1993)'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isEN ? 'Entrance Fee (Registration)' : 'Yuran Masuk (Pendaftaran)'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={isEN ? "RM 10.00 (Fixed)" : "RM 10.00 (Tetap)"}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isEN ? 'Initial Share Capital (Min. RM 100)' : 'Modal Syer Awal (Min. RM 100)'}
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={modalSyerAwal}
                      onChange={(e) => setModalSyerAwal(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isEN ? 'Monthly Fee (Payroll Deduction)' : 'Yuran Bulanan (Potongan Gaji)'}
                    </label>
                    <input
                      type="number"
                      min={30}
                      step={10}
                      value={yuranBulanan}
                      onChange={(e) => setYuranBulanan(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Nominee */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400">
                  {isEN ? 'Nominee Details (Waris / Nominee)' : 'Penamaan Waris (Waris / Nominee)'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">{isEN ? 'Nominee Name' : 'Nama Waris'}</label>
                    <input
                      type="text"
                      value={namaWaris}
                      onChange={(e) => setNamaWaris(e.target.value)}
                      placeholder={isEN ? "Spouse / Father / Mother Name" : "Nama Pasangan / Bapa / Ibu"}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">{isEN ? 'Relationship' : 'Hubungan'}</label>
                    <select
                      value={hubunganWaris}
                      onChange={(e) => setHubunganWaris(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Suami">{isEN ? 'Husband (Suami)' : 'Suami'}</option>
                      <option value="Isteri">{isEN ? 'Wife (Isteri)' : 'Isteri'}</option>
                      <option value="Bapa">{isEN ? 'Father (Bapa)' : 'Bapa'}</option>
                      <option value="Ibu">{isEN ? 'Mother (Ibu)' : 'Ibu'}</option>
                      <option value="Anak">{isEN ? 'Child (Anak)' : 'Anak'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  {isEN ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40"
                >
                  {isEN ? 'Submit Membership Application' : 'Hantar Permohonan Keahlian'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Topup Syer */}
      {showSyerModal && selectedAhli && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              {isEN ? 'Add Share Capital / Monthly Fee' : 'Tambah Syer / Yuran Ahli'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isEN ? 'Member:' : 'Ahli:'} <strong className="text-white">{selectedAhli.nama}</strong> ({selectedAhli.noAhli})
            </p>

            <form onSubmit={handleTambahSyerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">
                  {isEN ? 'Add Share Capital (RM)' : 'Tambah Modal Syer (RM)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={syerTambah}
                  onChange={(e) => setSyerTambah(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  {isEN ? 'Add Monthly Fee (RM)' : 'Tambah Yuran Bulanan (RM)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={yuranTambah}
                  onChange={(e) => setYuranTambah(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              {/* SecurePay Online Gateway Banner */}
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-indigo-300">Bayar Online via SecurePay</div>
                  <div className="text-[10px] text-indigo-400/80">FPX, DuitNow QR & Kad (Transit Escrow)</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const total = (syerTambah || 0) + (yuranTambah || 0);
                    if (total <= 0) {
                      alert('Sila masukkan jumlah syer atau yuran terlebih dahulu.');
                      return;
                    }
                    try {
                      const res = await api.createGatewayBill({
                        kategoriTransaksi: 'TAMBAH_SYER',
                        perihal: `Tambah Modal Syer / Yuran - ${selectedAhli.nama} (${selectedAhli.noAhli})`,
                        namaPembayar: selectedAhli.nama,
                        noKP: selectedAhli.noKp,
                        noAhli: selectedAhli.noAhli,
                        emel: selectedAhli.eMel || 'ahli@koperasi.my',
                        noTelefon: selectedAhli.noTelefon || '012-3456789',
                        jumlahKasar: total
                      });
                      alert(`✅ Pautan SecurePay Dijana!\n\nNo Pesanan: ${res.billCode}\nJumlah: RM${res.transaction.jumlahKasar}\nCaj Platform Verttere: RM${res.cajPlatform}\nBersih Koperasi: RM${res.jumlahBersih}\n\nURL Pembayaran:\n${res.paymentUrl}`);
                      onTambahSyerAhli(selectedAhli.id, syerTambah, yuranTambah);
                      setShowSyerModal(false);
                    } catch (err: any) {
                      alert(`Ralat menjana pesanan SecurePay: ${err.message}`);
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg shadow transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Bayar SecurePay
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSyerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  {isEN ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  {isEN ? 'Update & Record Receipt' : 'Kemaskini (Tunai/Manual)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
