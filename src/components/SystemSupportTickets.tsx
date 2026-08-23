import React, { useState } from 'react';
import { 
  HelpCircle, 
  PlusCircle, 
  Bug, 
  Sparkles, 
  MinusCircle, 
  Database, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Search, 
  Filter, 
  User, 
  ArrowRight, 
  FileText, 
  CheckCheck,
  Send,
  Eye,
  Trash2,
  Phone,
  Mail,
  Layers
} from 'lucide-react';
import { SystemSupportTicket, KategoriTiket, KeutamaanTiket, StatusTiket } from '../types';

interface SystemSupportTicketsProps {
  tickets: SystemSupportTicket[];
  onCreateTicket: (ticket: Omit<SystemSupportTicket, 'id' | 'noTiket' | 'tarikhCipta' | 'status'>) => void;
  onUpdateTicketStatus: (id: string, status: StatusTiket, resolutionNotes?: string, adminName?: string) => void;
  onDeleteTicket?: (id: string) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
  currentUser?: { name: string; role: string; email: string } | null;
}

export const SystemSupportTickets: React.FC<SystemSupportTicketsProps> = ({
  tickets = [],
  onCreateTicket,
  onUpdateTicketStatus,
  onDeleteTicket,
  language = 'BM',
  userRole,
  currentUser,
}) => {
  const isEN = language === 'EN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN_VERTTERE';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketForAction, setSelectedTicketForAction] = useState<SystemSupportTicket | null>(null);
  const [selectedTicketForView, setSelectedTicketForView] = useState<SystemSupportTicket | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState<KategoriTiket>('RALAT_SISTEM');
  const [newPriority, setNewPriority] = useState<KeutamaanTiket>('TINGGI');
  const [newModule, setNewModule] = useState<string>('POS & Kaunter Jualan');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhone, setNewPhone] = useState('012-3344556');

  // Resolution Form State (Super Admin)
  const [actionStatus, setActionStatus] = useState<StatusTiket>('SELESAI_DIBETULKAN');
  const [actionNotes, setActionNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics Calculations
  const totalPending = tickets.filter(t => t.status === 'MENUNGGU_TINDAKAN').length;
  const totalInReview = tickets.filter(t => t.status === 'SEDANG_DISEMAK').length;
  const totalResolved = tickets.filter(t => t.status === 'SELESAI_DIBETULKAN').length;
  const totalCritical = tickets.filter(t => t.keutamaan === 'KRITIKAL' && t.status !== 'SELESAI_DIBETULKAN').length;

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.noTiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tajuk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pemohonNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.modulTerlibat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = filterCategory === 'ALL' || t.kategori === filterCategory;
    const matchesPriority = filterPriority === 'ALL' || t.keutamaan === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesCat && matchesPriority && matchesStatus;
  });

  // Handle Submit New Ticket
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Sila masukkan tajuk dan deskripsi permohonan/ralat.');
      return;
    }

    onCreateTicket({
      kategori: newCategory,
      keutamaan: newPriority,
      modulTerlibat: newModule,
      tajuk: newTitle.trim(),
      deskripsi: newDescription.trim(),
      pemohonNama: currentUser?.name || 'Kakitangan Koperasi',
      pemohonEmel: currentUser?.email || 'staf@koperasi.my',
      pemohonPeranan: currentUser?.role || 'Kakitangan',
      pemohonTelefon: newPhone,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    showToast('Tiket permohonan / aduan sistem telah berjaya dihantar ke Super Admin Verttere Solutions!');
  };

  // Handle Admin Resolution Submit
  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForAction) return;

    onUpdateTicketStatus(
      selectedTicketForAction.id,
      actionStatus,
      actionNotes || 'Tindakan telah disahkan dan diselesaikan oleh Super Admin Verttere.',
      currentUser?.name || 'Fikri Hijaz (Super Admin Verttere)'
    );

    setSelectedTicketForAction(null);
    setActionNotes('');
    showToast(`Tiket ${selectedTicketForAction.noTiket} telah dikemaskini kepada status: ${actionStatus}`);
  };

  // Helper Badge Colors
  const getCategoryBadge = (kategori: KategoriTiket) => {
    switch (kategori) {
      case 'RALAT_SISTEM':
        return { label: 'Ralat / Bug', color: 'bg-rose-950 text-rose-300 border-rose-800', icon: Bug };
      case 'PENAMBAHAN_FUNGSI':
        return { label: 'Penambahan Fungsi', color: 'bg-emerald-950 text-emerald-300 border-emerald-800', icon: Sparkles };
      case 'PENGURANGAN_KEMASKINI':
        return { label: 'Pengurangan / Permudah', color: 'bg-amber-950 text-amber-300 border-amber-800', icon: MinusCircle };
      case 'PEMBETULAN_DATA':
        return { label: 'Pembetulan Data', color: 'bg-indigo-950 text-indigo-300 border-indigo-800', icon: Database };
      case 'AKSES_KESELAMATAN':
        return { label: 'Akses & Sekuriti', color: 'bg-purple-950 text-purple-300 border-purple-800', icon: ShieldCheck };
      default:
        return { label: 'Lain-lain', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: MessageSquare };
    }
  };

  const getPriorityBadge = (keutamaan: KeutamaanTiket) => {
    switch (keutamaan) {
      case 'KRITIKAL':
        return 'bg-rose-600 text-white font-black animate-pulse';
      case 'TINGGI':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'SEDERHANA':
        return 'bg-indigo-900 text-indigo-300 border border-indigo-700';
      case 'RENDAH':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getStatusBadge = (status: StatusTiket) => {
    switch (status) {
      case 'MENUNGGU_TINDAKAN':
        return { label: '⏳ Menunggu Tindakan', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'SEDANG_DISEMAK':
        return { label: '🔍 Sedang Disemak', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'SELESAI_DIBETULKAN':
        return { label: '✅ Selesai Dibetulkan', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'DITOLAK':
        return { label: '❌ Ditolak', color: 'bg-rose-950 text-rose-300 border-rose-800' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-indigo-900/80 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-700">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Sistem Tiket Bantuan, Ralat &amp; Permohonan
              </span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 bg-purple-950 text-purple-300 text-xs font-extrabold px-2.5 py-1 rounded-full border border-purple-700">
                  👑 Super Admin Inbox (Verttere Solutions)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                  🏛️ Saluran Terus ke Pasukan Teknikal Verttere
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isEN ? 'System Support & Feature Request Tickets' : 'Tiket Aduan Ralat, Pembetulan & Permohonan Sistem'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              {isSuperAdmin
                ? 'Pusat Kawalan Tiket Super Admin: Terima notifikasi permohonan penambahan, pengurangan, ralat sistem, atau pembetulan data daripada pengguna koperasi serta kemaskini status penyelesaian.'
                : 'Kemukakan sebarang laporan ralat (*bug*), cadangan penambahan fungsi, pengurangan/kemaskini modul, atau pembetulan data terus kepada Super Admin Verttere Solutions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {isEN ? 'Submit New Ticket' : 'Hantar Tiket Baru'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Action */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Menunggu Tindakan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-400">{totalPending} Tiket</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Perlu semakan Super Admin</p>
          </div>
        </div>

        {/* In Review */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Sedang Disemak</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-indigo-300">{totalInReview} Tiket</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Dalam proses pembaikan/patch</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Selesai Dibetulkan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-400">{totalResolved} Tiket</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Telah selesai &amp; dimaklumkan</p>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Ralat Kritikal Terbuka</span>
            <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-400">{totalCritical} Tiket</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Keutamaan tertinggi</p>
          </div>
        </div>

      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no tiket, tajuk, modul, pemohon..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_TINDAKAN">⏳ Menunggu Tindakan</option>
            <option value="SEDANG_DISEMAK">🔍 Sedang Disemak</option>
            <option value="SELESAI_DIBETULKAN">✅ Selesai Dibetulkan</option>
            <option value="DITOLAK">❌ Ditolak</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="RALAT_SISTEM">🐞 Ralat / Bug</option>
            <option value="PENAMBAHAN_FUNGSI">✨ Penambahan Fungsi</option>
            <option value="PENGURANGAN_KEMASKINI">➖ Pengurangan / Kemaskini</option>
            <option value="PEMBETULAN_DATA">🛠️ Pembetulan Data</option>
            <option value="AKSES_KESELAMATAN">🔑 Akses &amp; Sekuriti</option>
            <option value="LAIN_LAIN">💬 Lain-lain</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Keutamaan</option>
            <option value="KRITIKAL">🔴 Kritikal</option>
            <option value="TINGGI">🟠 Tinggi</option>
            <option value="SEDERHANA">🟡 Sederhana</option>
            <option value="RENDAH">🔵 Rendah</option>
          </select>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-xs">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-bold text-slate-400">Tiada tiket dijumpai</p>
            <p className="text-[11px] mt-1">Gunakan butang "Hantar Tiket Baru" untuk menghantar laporan ralat atau permohonan ke Super Admin.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const catBadge = getCategoryBadge(ticket.kategori);
            const CatIcon = catBadge.icon;
            const statusBadge = getStatusBadge(ticket.status);

            return (
              <div 
                key={ticket.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {ticket.noTiket}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${catBadge.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {catBadge.label}
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(ticket.keutamaan)}`}>
                      {ticket.keutamaan}
                    </span>

                    <span className="text-xs text-slate-400 font-medium bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                      Modul: {ticket.modulTerlibat}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Body Content */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{ticket.tajuk}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {ticket.deskripsi}
                  </p>
                </div>

                {/* Resolution section if available */}
                {ticket.catatanPenyelesaian && (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center text-emerald-300 font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Tindakan / Pembetulan Super Admin ({ticket.tindakanAdminOleh || 'Super Admin Verttere'}):
                      </span>
                      {ticket.tarikhTindakan && (
                        <span className="text-slate-400 font-mono text-[10px]">{ticket.tarikhTindakan}</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs">
                      {ticket.catatanPenyelesaian}
                    </p>
                  </div>
                )}

                {/* Footer details & Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span>
                      Pemohon: <strong className="text-slate-200">{ticket.pemohonNama}</strong> ({ticket.pemohonPeranan})
                    </span>
                    <span>•</span>
                    <span className="font-mono">{ticket.tarikhCipta}</span>
                    {ticket.pemohonTelefon && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-indigo-300">{ticket.pemohonTelefon}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setSelectedTicketForView(ticket)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Lihat Terperinci
                    </button>

                    {/* Super Admin Action Button */}
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setSelectedTicketForAction(ticket);
                          setActionStatus(ticket.status === 'MENUNGGU_TINDAKAN' ? 'SEDANG_DISEMAK' : ticket.status);
                          setActionNotes(ticket.catatanPenyelesaian || '');
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Buat Pembetulan &amp; Tindakan
                      </button>
                    )}

                    {onDeleteTicket && (
                      <button
                        onClick={() => onDeleteTicket(ticket.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Padam Rekod Tiket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: SUBMIT NEW TICKET */}
      {/* ------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Hantar Tiket Permohonan / Aduan Sistem
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Tiket ini akan dihantar terus kepada Super Admin (Verttere Solutions) untuk tindakan semakan, penambahbaikan perisian, atau pembetulan data.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kategori Permohonan: *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as KategoriTiket)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="RALAT_SISTEM">🐞 Ralat Sistem / Bug</option>
                    <option value="PENAMBAHAN_FUNGSI">✨ Penambahan Fungsi Baru</option>
                    <option value="PENGURANGAN_KEMASKINI">➖ Pengurangan / Permudah Fungsi</option>
                    <option value="PEMBETULAN_DATA">🛠️ Pembetulan Rekod / Data</option>
                    <option value="AKSES_KESELAMATAN">🔑 Isu Akses / Sekuriti</option>
                    <option value="LAIN_LAIN">💬 Pertanyaan Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tahap Keutamaan: *</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as KeutamaanTiket)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="KRITIKAL">🔴 Kritikal (Menjejaskan Operasi Langsung)</option>
                    <option value="TINGGI">🟠 Tinggi</option>
                    <option value="SEDERHANA">🟡 Sederhana</option>
                    <option value="RENDAH">🔵 Rendah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Modul Terlibat: *</label>
                <select
                  value={newModule}
                  onChange={e => setNewModule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="POS & Kaunter Jualan">POS &amp; Kedai Koperasi</option>
                  <option value="Perakaunan & Lejar Am">Perakaunan &amp; Lejar Am</option>
                  <option value="Penyesuaian Bank & Buku Tunai">Penyesuaian Bank</option>
                  <option value="Pengurusan Ahli & Modal Syer">Pengurusan Ahli &amp; Syer</option>
                  <option value="Gateway & Pelepasan Escrow">Gateway &amp; Escrow Settlement</option>
                  <option value="Pembiayaan Ahli Murabahah">Pembiayaan Ahli</option>
                  <option value="Simpanan Khas & Deposit">Simpanan Khas &amp; Deposit</option>
                  <option value="Tabung Kebajikan & Khairat">Tabung Kebajikan</option>
                  <option value="e-Koperasi & e-Invois LHDN">e-Koperasi &amp; e-Invois</option>
                  <option value="Laporan Berautomatik AGM">Laporan Berautomatik AGM</option>
                  <option value="Notifikasi WhatsApp & SMS">Notifikasi WhatsApp &amp; SMS</option>
                  <option value="Pentadbiran & Akses Pengguna">Pengurusan Pengguna</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tajuk Permohonan / Ralat: *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Butang cetak penyata bulanan tidak bertindak balas..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Deskripsi Terperinci &amp; Langkah Terlibat: *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Terangkan secara jelas masalah atau fungsi yang dipohon, mesej ralat (jika ada), atau sebarang pembetulan yang diperlukan..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombor Telefon Untuk Dihubungi:</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Hantar Tiket ke Verttere
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: SUPER ADMIN RESOLUTION & CORRECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedTicketForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300">
                  👑
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Tindakan Super Admin ({selectedTicketForAction.noTiket})</h3>
                  <p className="text-[11px] text-purple-300">Pemohon: {selectedTicketForAction.pemohonNama} ({selectedTicketForAction.pemohonPeranan})</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicketForAction(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-white">{selectedTicketForAction.tajuk}</div>
              <p className="text-slate-300 text-[11px]">{selectedTicketForAction.deskripsi}</p>
            </div>

            <form onSubmit={handleResolutionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Tindakan Baru: *</label>
                <select
                  value={actionStatus}
                  onChange={e => setActionStatus(e.target.value as StatusTiket)}
                  className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="SEDANG_DISEMAK">🔍 Sedang Disemak / Dalam Pembinaan Patch</option>
                  <option value="SELESAI_DIBETULKAN">✅ Selesai Dibetulkan / Telah Dikemaskini</option>
                  <option value="DITOLAK">❌ Ditolak / Di luar skop semasa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Catatan Tindakan &amp; Nota Pembetulan: *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nyatakan perubahan yang dibuat, versi patch, atau penerangan penyelesaian untuk pemohon..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForAction(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan &amp; Maklumkan Pemohon
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: VIEW TICKET DETAILS */}
      {/* ------------------------------------------------------------- */}
      {selectedTicketForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {selectedTicketForView.noTiket}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedTicketForView.tajuk}</h3>
              </div>
              <button onClick={() => setSelectedTicketForView(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Kategori</span>
                <div className="font-semibold text-slate-200">{selectedTicketForView.kategori}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Keutamaan</span>
                <div className="font-semibold text-amber-400">{selectedTicketForView.keutamaan}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Modul</span>
                <div className="font-semibold text-slate-200">{selectedTicketForView.modulTerlibat}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Tarikh Hantar</span>
                <div className="font-semibold text-slate-200 font-mono">{selectedTicketForView.tarikhCipta}</div>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="font-bold text-slate-300">Deskripsi Permohonan:</label>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {selectedTicketForView.deskripsi}
              </div>
            </div>

            {selectedTicketForView.catatanPenyelesaian && (
              <div className="text-xs space-y-1.5">
                <label className="font-bold text-emerald-400">Nota Penyelesaian Super Admin:</label>
                <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 text-slate-200 leading-relaxed">
                  <p>{selectedTicketForView.catatanPenyelesaian}</p>
                  <p className="text-[10px] text-emerald-400 mt-2 font-mono">
                    Tindakan oleh {selectedTicketForView.tindakanAdminOleh} pada {selectedTicketForView.tarikhTindakan}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTicketForView(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
