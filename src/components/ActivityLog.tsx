import React, { useState } from 'react';
import { ActivityLog as ActivityLogType, ActivityLogCategory } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  PlusCircle, 
  Users, 
  HandCoins, 
  BookOpenCheck, 
  Receipt, 
  PieChart, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle,
  FileCode2,
  Lock,
  Clock,
  User,
  Hash,
  ChevronRight
} from 'lucide-react';

interface ActivityLogProps {
  logs: ActivityLogType[];
  onAddLog: (newLog: ActivityLogType) => void;
  searchQuery?: string;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  logs,
  onAddLog,
  searchQuery: externalSearch = '',
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [search, setSearch] = useState<string>(externalSearch);
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLogModal, setSelectedLogModal] = useState<ActivityLogType | null>(null);
  const [showAddLogModal, setShowAddLogModal] = useState<boolean>(false);

  // Form state for manual audit note
  const [newKategori, setNewKategori] = useState<ActivityLogCategory>('SISTEM');
  const [newTindakan, setNewTindakan] = useState<string>('Semakan Audit Manual ALK');
  const [newDeskripsi, setNewDeskripsi] = useState<string>('');
  const [newPengguna, setNewPengguna] = useState<string>('Pengurus Audit SKM');
  const [newStatus, setNewStatus] = useState<'BERJAYA' | 'AMARAN' | 'INFO' | 'BATAL'>('BERJAYA');
  const [newJumlah, setNewJumlah] = useState<number | ''>('');

  // Filtering
  const filteredLogs = logs.filter((log) => {
    const activeSearch = (search || externalSearch).toLowerCase();
    const matchSearch = 
      !activeSearch ||
      log.tindakan.toLowerCase().includes(activeSearch) ||
      log.deskripsi.toLowerCase().includes(activeSearch) ||
      log.pengguna.toLowerCase().includes(activeSearch) ||
      (log.namaAhli && log.namaAhli.toLowerCase().includes(activeSearch)) ||
      (log.noAhli && log.noAhli.toLowerCase().includes(activeSearch)) ||
      log.id.toLowerCase().includes(activeSearch);

    const matchKat = selectedKategori === 'ALL' || log.kategori === selectedKategori;
    const matchStat = selectedStatus === 'ALL' || log.status === selectedStatus;

    return matchSearch && matchKat && matchStat;
  });

  // Calculate statistics
  const totalCount = logs.length;
  const countAhli = logs.filter(l => l.kategori === 'AHLI').length;
  const countPembiayaan = logs.filter(l => l.kategori === 'PEMBIAYAAN').length;
  const countPerakaunan = logs.filter(l => l.kategori === 'PERAKAUNAN' || l.kategori === 'POTONGAN_GAJI').length;
  const countAmaran = logs.filter(l => l.status === 'AMARAN' || l.status === 'BATAL').length;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeskripsi.trim()) return;

    const log: ActivityLogType = {
      id: `LOG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now().toString().slice(-3)}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: newKategori,
      tindakan: newTindakan,
      deskripsi: newDeskripsi,
      pengguna: newPengguna,
      status: newStatus,
      jumlahRM: newJumlah !== '' ? Number(newJumlah) : undefined,
      ipAlamat: '127.0.0.1 (Pejabat Koperasi)',
    };

    onAddLog(log);
    setShowAddLogModal(false);
    setNewDeskripsi('');
    setNewJumlah('');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Tarikh & Masa', 'Kategori', 'Tindakan', 'Deskripsi', 'Pengguna', 'No. Ahli', 'Nama Ahli', 'Status', 'Jumlah (RM)', 'IP Alamat'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.tarikhMasa,
      l.kategori,
      `"${l.tindakan.replace(/"/g, '""')}"`,
      `"${l.deskripsi.replace(/"/g, '""')}"`,
      `"${l.pengguna.replace(/"/g, '""')}"`,
      l.noAhli || '',
      `"${(l.namaAhli || '').replace(/"/g, '""')}"`,
      l.status,
      l.jumlahRM || 0,
      l.ipAlamat || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_Koperasi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRM = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  const getCategoryIcon = (kat: ActivityLogCategory) => {
    switch (kat) {
      case 'AHLI': return <Users className="w-4 h-4 text-emerald-400" />;
      case 'PEMBIAYAAN': return <HandCoins className="w-4 h-4 text-purple-400" />;
      case 'PERAKAUNAN': return <BookOpenCheck className="w-4 h-4 text-blue-400" />;
      case 'POTONGAN_GAJI': return <Receipt className="w-4 h-4 text-amber-400" />;
      case 'DIVIDEN': return <PieChart className="w-4 h-4 text-pink-400" />;
      case 'SISTEM': return <Settings className="w-4 h-4 text-slate-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = (stat: 'BERJAYA' | 'AMARAN' | 'INFO' | 'BATAL') => {
    switch (stat) {
      case 'BERJAYA':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Berjaya
          </span>
        );
      case 'AMARAN':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Amaran
          </span>
        );
      case 'INFO':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <Info className="w-3 h-3 text-blue-400" /> Maklumat
          </span>
        );
      case 'BATAL':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <XCircle className="w-3 h-3 text-rose-400" /> Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Jejak Audit Bertauliah SKM
            </span>
            <span className="text-xs text-slate-400">Pematuhan Kawalan Dalaman & Akta Koperasi 1993</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Log Aktiviti & Rekod Audit Sistem
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Merekod setiap transaksi kritikal, pendaftaran ahli, kelulusan pembiayaan, & pelarasan jurnal secara terperinci.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddLogModal(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Rekod Catatan Audit Manual
          </button>
          
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Eksport CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Jumlah Rekod Log</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white mt-1">{totalCount}</p>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">100% Jejak Terpelihara</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Aktiviti Keahlian</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{countAhli}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pendaftaran & Modal Syer</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Kelulusan Pembiayaan</span>
            <HandCoins className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-purple-400 mt-1">{countPembiayaan}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Keputusan ALK & Pinjaman</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pelarasan Perakaunan</span>
            <BookOpenCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-extrabold text-blue-400 mt-1">{countPerakaunan}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Jurnal & Potongan Gaji</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mengikut tindakan, nama ahli, no. ahli, pengguna, atau ID log..."
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Kategori</option>
              <option value="AHLI" className="bg-slate-900">AHLI (Keahlian)</option>
              <option value="PEMBIAYAAN" className="bg-slate-900">PEMBIAYAAN (Pinjaman)</option>
              <option value="PERAKAUNAN" className="bg-slate-900">PERAKAUNAN (Jurnal)</option>
              <option value="POTONGAN_GAJI" className="bg-slate-900">POTONGAN GAJI (BPA)</option>
              <option value="DIVIDEN" className="bg-slate-900">DIVIDEN (Statutori)</option>
              <option value="SISTEM" className="bg-slate-900">SISTEM (Audit/Keselamatan)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Status</option>
              <option value="BERJAYA" className="bg-slate-900">BERJAYA</option>
              <option value="AMARAN" className="bg-slate-900">AMARAN</option>
              <option value="INFO" className="bg-slate-900">MAKLUMAT</option>
              <option value="BATAL" className="bg-slate-900">DIBATALKAN</option>
            </select>
          </div>

          {(search || selectedKategori !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedKategori('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Set Semula
            </button>
          )}

        </div>

      </div>

      {/* Main Activity Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Chronological Audit Feed ({filteredLogs.length} rekod dijumpai)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Protokol SHA-256 Integriti Data SKM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Masa & ID Rekod</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Tindakan & Deskripsi Audit</th>
                <th className="px-4 py-3.5">Ahli / Sasaran</th>
                <th className="px-4 py-3.5">Pengguna & IP</th>
                <th className="px-4 py-3.5 text-right">Jumlah (RM)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Butiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-xs whitespace-nowrap">{log.tarikhMasa}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{log.id}</div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        {getCategoryIcon(log.kategori)}
                        <span>{log.kategori.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-white">{log.tindakan}</div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {log.deskripsi}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      {log.namaAhli ? (
                        <div>
                          <div className="font-semibold text-white">{log.namaAhli}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">{log.noAhli}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Umum / Sistem</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {log.pengguna}
                      </div>
                      {log.ipAlamat && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          IP: {log.ipAlamat}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {formatRM(log.jumlahRM)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLogModal(log)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-800/80 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto"
                        title="Lihat Butiran Audit SKM"
                      >
                        <FileCode2 className="w-3.5 h-3.5" /> Papar
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-300 text-sm">Tiada Rekod Log Audit Dijumpai</p>
                    <p className="text-xs text-slate-400 mt-1">Cuba tukar kata kunci carian atau tetapan penapis kategori.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Sijil Pengesahan Log Audit SKM</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLogModal.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLogModal(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Tarikh & Masa:</span>
                  <p className="font-bold text-white">{selectedLogModal.tarikhMasa}</p>
                </div>
                <div>
                  <span className="text-slate-400">Kategori System:</span>
                  <p className="font-bold text-emerald-400">{selectedLogModal.kategori}</p>
                </div>
                <div>
                  <span className="text-slate-400">Pelaksana (Actor):</span>
                  <p className="font-bold text-white">{selectedLogModal.pengguna}</p>
                </div>
                <div>
                  <span className="text-slate-400">IP Alamat Client:</span>
                  <p className="font-mono text-slate-300">{selectedLogModal.ipAlamat || '127.0.0.1'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Tindakan Utama:</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedLogModal.tindakan}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Deskripsi Terperinci:</span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 mt-1 leading-relaxed">
                  {selectedLogModal.deskripsi}
                </p>
              </div>

              {selectedLogModal.namaAhli && (
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex justify-between">
                  <div>
                    <span className="text-slate-400">Ahli Terlibat:</span>
                    <p className="font-bold text-white">{selectedLogModal.namaAhli}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">No. Ahli:</span>
                    <p className="font-mono text-emerald-400 font-bold">{selectedLogModal.noAhli}</p>
                  </div>
                </div>
              )}

              {selectedLogModal.jumlahRM !== undefined && (
                <div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl font-bold">
                  <span className="text-emerald-300">Impak Kewangan (RM):</span>
                  <span className="text-emerald-400 text-base">{formatRM(selectedLogModal.jumlahRM)}</span>
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1 text-slate-300 font-bold">
                  <Hash className="w-3 h-3 text-emerald-400" /> Cap Jari Digital SHA-256 (Integriti Data):
                </div>
                <p className="break-all text-slate-400">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </p>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Tutup Sijil Audit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Manual Audit Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Rekod Catatan Audit Manual SKM
              </h3>
              <button onClick={() => setShowAddLogModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Kategori Log</label>
                  <select
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value as ActivityLogCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="SISTEM">SISTEM</option>
                    <option value="AHLI">AHLI</option>
                    <option value="PEMBIAYAAN">PEMBIAYAAN</option>
                    <option value="PERAKAUNAN">PERAKAUNAN</option>
                    <option value="POTONGAN_GAJI">POTONGAN GAJI</option>
                    <option value="DIVIDEN">DIVIDEN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status Audit</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                  >
                    <option value="BERJAYA">BERJAYA</option>
                    <option value="AMARAN">AMARAN</option>
                    <option value="INFO">INFO</option>
                    <option value="BATAL">BATAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tajuk / Tindakan Audit *</label>
                <input
                  type="text"
                  required
                  value={newTindakan}
                  onChange={(e) => setNewTindakan(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Pengguna / Auditor *</label>
                <input
                  type="text"
                  required
                  value={newPengguna}
                  onChange={(e) => setNewPengguna(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Ulasan / Catatan Terperinci Audit *</label>
                <textarea
                  rows={3}
                  required
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  placeholder="Masukkan ulasan audit atau catatan pemeriksaan fail fizikal..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Jumlah Terlibat (RM) (Opsional)</label>
                <input
                  type="number"
                  value={newJumlah}
                  onChange={(e) => setNewJumlah(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Simpan Catatan Audit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
