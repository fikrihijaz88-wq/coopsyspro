import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Lock, 
  KeyRound, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Globe, 
  Phone, 
  Mail, 
  CreditCard, 
  Sparkles,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { SystemUser, CoopBasicProfile } from '../types';
import { UserRole, ROLE_DEFINITIONS } from '../utils/rbac';

interface SystemAdminSettingsProps {
  users: SystemUser[];
  coopProfile: CoopBasicProfile;
  onAddUser: (user: Omit<SystemUser, 'id' | 'tarikhDaftar'>) => void;
  onUpdateUser: (id: string, updates: Partial<SystemUser>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateCoopProfile: (profile: Partial<CoopBasicProfile>) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
  currentUser?: { name: string; role: string; email: string } | null;
}

export const SystemAdminSettings: React.FC<SystemAdminSettingsProps> = ({
  users = [],
  coopProfile,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateCoopProfile,
  language = 'BM',
  userRole,
  currentUser,
}) => {
  const isEN = language === 'EN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN_VERTTERE';

  const [activeSubTab, setActiveSubTab] = useState<'USERS' | 'COOP_PROFILE' | 'SECURITY_SHIELD'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Modals State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<SystemUser | null>(null);
  const [newTempPassword, setNewTempPassword] = useState<string>('');

  // Form State for Adding User
  const [formData, setFormData] = useState({
    nama: '',
    emel: '',
    noTelefon: '',
    peranan: 'BENDAHARI' as UserRole,
    statusAkaun: 'AKTIF' as 'AKTIF' | 'DISEKAT',
    catatan: '',
  });

  // Profile Form State
  const [editProfile, setEditProfile] = useState<CoopBasicProfile>({ ...coopProfile });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.emel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.noTelefon && u.noTelefon.includes(searchQuery));
    
    const matchesRole = filterRole === 'ALL' || u.peranan === filterRole;
    return matchesSearch && matchesRole;
  });

  // Handle Submit Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.emel) {
      alert('Sila lengkapkan nama dan e-mel pengguna.');
      return;
    }

    onAddUser({
      nama: formData.nama,
      emel: formData.emel,
      noTelefon: formData.noTelefon,
      peranan: formData.peranan,
      statusAkaun: formData.statusAkaun,
      catatan: formData.catatan || `Akaun dicipta oleh ${currentUser?.name || 'Super Admin'}`,
    });

    setShowAddUserModal(false);
    setFormData({
      nama: '',
      emel: '',
      noTelefon: '',
      peranan: 'BENDAHARI',
      statusAkaun: 'AKTIF',
      catatan: '',
    });
    showToast(`Pengguna baru ${formData.nama} (${formData.peranan}) berjaya didaftarkan!`);
  };

  // Handle Save Profile
  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCoopProfile(editProfile);
    showToast('Maklumat asas & profil rasmi koperasi berjaya dikemaskini!');
  };

  // Handle Reset Password Generator
  const triggerResetPassword = (user: SystemUser) => {
    const generated = `Kop@${Math.floor(100000 + Math.random() * 900000)}`;
    setNewTempPassword(generated);
    setResettingPasswordUser(user);
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
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Pentadbiran Sistem & Pengurusan Akses
              </span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 bg-purple-950 text-purple-300 text-xs font-extrabold px-2.5 py-1 rounded-full border border-purple-700">
                  👑 Super Admin (Verttere Solutions)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                  🏛️ Pentadbir Koperasi
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isEN ? 'System Users & Basic Co-op Settings' : 'Pengurusan Pengguna & Tetapan Asas Koperasi'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Pengurusan pengguna berdaftar (*Add/Remove/Lock Users*), tetapan profil asas koperasi, dan panel perlindungan data sulit anggota mengikut piawaian keselamatan SKM &amp; PDPA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {isEN ? 'Add New User' : 'Tambah Pengguna Baru'}
            </button>

            <button
              onClick={() => setActiveSubTab('SECURITY_SHIELD')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              {isEN ? 'Data Privacy Shield' : 'Polisi Privasi & Keselamatan'}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner for Super Admin */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xl font-bold">
              🔒
            </div>
            <div>
              <h4 className="text-xs font-black text-purple-300 uppercase tracking-wide">
                Polisi Perlindungan Privasi Koperasi Aktif (Data Isolation Shield)
              </h4>
              <p className="text-[11px] text-slate-300">
                Akses Super Admin dihadkan kepada fungsi asas platform: <strong>Pelepasan Bayaran Escrow</strong>, <strong>Pengurusan Pengguna (Add/Remove User)</strong>, <strong>Profil Asas Koperasi</strong>, dan <strong>Log Keselamatan</strong>. Maklumat sulit seperti Buku Lejar Perakaunan, Untung Rugi, Agihan Dividen, Potongan Gaji, dan Pinjaman Peribadi Ahli adalah dilindungi daripada vendor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2 pb-2">
        <button
          onClick={() => setActiveSubTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'USERS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Pengurusan Pengguna ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('COOP_PROFILE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'COOP_PROFILE'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Maklumat &amp; Profil Asas Koperasi
        </button>

        <button
          onClick={() => setActiveSubTab('SECURITY_SHIELD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'SECURITY_SHIELD'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Perlindungan Data &amp; Keselamatan (PDPA)
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: USERS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'USERS' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, e-mel atau no tel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Semua Peranan</option>
                <option value="SUPER_ADMIN_VERTTERE">Super Admin Verttere</option>
                <option value="BENDAHARI">Bendahari Koperasi</option>
                <option value="PENGERUSI_ALK">Pengerusi ALK</option>
                <option value="SETIAUSAHA">Setiausaha</option>
                <option value="AUDITOR_JAD">Pemeriksa JAD</option>
                <option value="JURUWANG_POS">Juruwang POS</option>
                <option value="AHLI_KOPERASI">Anggota Koperasi</option>
              </select>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Tambah User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3">Peranan (Role)</th>
                    <th className="px-4 py-3">Status Akaun</th>
                    <th className="px-4 py-3">Tarikh Daftar</th>
                    <th className="px-4 py-3">Log Masuk Terakhir</th>
                    <th className="px-4 py-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                        Tiada pengguna sepadan dengan carian anda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const roleDef = ROLE_DEFINITIONS[user.peranan] || {
                        label: user.peranan,
                        badgeColor: 'bg-slate-800 text-slate-300',
                      };

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white flex items-center gap-2">
                              {user.nama}
                              {user.peranan === 'SUPER_ADMIN_VERTTERE' && (
                                <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700 px-1.5 py-0.2 rounded">
                                  Platform
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{user.emel}</span>
                              {user.noTelefon && <span>• {user.noTelefon}</span>}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${roleDef.badgeColor}`}>
                              {roleDef.label}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {user.statusAkaun === 'AKTIF' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                                <UserCheck className="w-3 h-3" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
                                <UserX className="w-3 h-3" /> Disekat
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {user.tarikhDaftar}
                          </td>

                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {user.terakhirLogMasuk || 'Belum log masuk'}
                          </td>

                          <td className="px-4 py-3.5 text-right space-x-1">
                            {/* Toggle Lock/Unlock */}
                            <button
                              onClick={() => {
                                const newStatus = user.statusAkaun === 'AKTIF' ? 'DISEKAT' : 'AKTIF';
                                onUpdateUser(user.id, { statusAkaun: newStatus });
                                showToast(`Status akaun ${user.nama} ditukar kepada ${newStatus}`);
                              }}
                              title={user.statusAkaun === 'AKTIF' ? 'Sekat Akaun' : 'Aktifkan Akaun'}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                            >
                              {user.statusAkaun === 'AKTIF' ? (
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => triggerResetPassword(user)}
                              title="Set Semula Kata Laluan"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 rounded-lg transition-all"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingUser(user)}
                              title="Kemaskini Pengguna"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete (Cannot delete Super Admin if only 1) */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Padam Pengguna"
                              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: COOP BASIC PROFILE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'COOP_PROFILE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Maklumat &amp; Tetapan Asas Koperasi
              </h3>
              <p className="text-xs text-slate-400">
                Maklumat asas profil rasmi koperasi dan akaun bank penerima bagi tujuan pelepasan dana dan dokumen statutori.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {editProfile.statusLangganan}
            </span>
          </div>

          <form onSubmit={handleSaveProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Rasmi Koperasi: *</label>
                <input
                  type="text"
                  required
                  value={editProfile.namaKoperasi}
                  onChange={e => setEditProfile({ ...editProfile, namaKoperasi: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kod Koperasi Sistem: *</label>
                <input
                  type="text"
                  required
                  value={editProfile.kodKoperasi}
                  onChange={e => setEditProfile({ ...editProfile, kodKoperasi: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">No. Pendaftaran SKM: *</label>
                <input
                  type="text"
                  required
                  value={editProfile.noPendaftaranSKM}
                  onChange={e => setEditProfile({ ...editProfile, noPendaftaranSKM: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tarikh Penubuhan Rasmi:</label>
                <input
                  type="date"
                  value={editProfile.tarikhPenubuhan}
                  onChange={e => setEditProfile({ ...editProfile, tarikhPenubuhan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Address */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">
                Alamat &amp; Saluran Perhubungan
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Alamat Premis / Pejabat:</label>
                  <input
                    type="text"
                    value={editProfile.alamatPerniagaan}
                    onChange={e => setEditProfile({ ...editProfile, alamatPerniagaan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Poskod:</label>
                  <input
                    type="text"
                    value={editProfile.poskod}
                    onChange={e => setEditProfile({ ...editProfile, poskod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bandar:</label>
                  <input
                    type="text"
                    value={editProfile.bandar}
                    onChange={e => setEditProfile({ ...editProfile, bandar: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Negeri:</label>
                  <input
                    type="text"
                    value={editProfile.negeri}
                    onChange={e => setEditProfile({ ...editProfile, negeri: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">No. Telefon Rasmi:</label>
                  <input
                    type="text"
                    value={editProfile.noTelefonRasmi}
                    onChange={e => setEditProfile({ ...editProfile, noTelefonRasmi: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Emel Rasmi Koperasi:</label>
                  <input
                    type="email"
                    value={editProfile.emelRasmi}
                    onChange={e => setEditProfile({ ...editProfile, emelRasmi: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Laman Web Rasmi:</label>
                  <input
                    type="text"
                    value={editProfile.lamanWeb || ''}
                    onChange={e => setEditProfile({ ...editProfile, lamanWeb: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Official Operating Bank Account */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Akaun Bank Operasi Rasmi Koperasi (Penerima Escrow Payout)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nama Bank:</label>
                  <input
                    type="text"
                    value={editProfile.namaBankOperasi}
                    onChange={e => setEditProfile({ ...editProfile, namaBankOperasi: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nombor Akaun Bank:</label>
                  <input
                    type="text"
                    value={editProfile.noAkaunBankOperasi}
                    onChange={e => setEditProfile({ ...editProfile, noAkaunBankOperasi: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nama Pemegang Akaun:</label>
                  <input
                    type="text"
                    value={editProfile.namaPemegangAkaunBank}
                    onChange={e => setEditProfile({ ...editProfile, namaPemegangAkaunBank: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Simpan Profil Koperasi
              </button>
            </div>
          </form>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DATA PRIVACY & PDPA SHIELD */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'SECURITY_SHIELD' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Prinsip Pengasingan Data Sulit &amp; Perlindungan PDPA Koperasi
                </h3>
                <p className="text-xs text-slate-400">
                  Struktur keselamatan teknikal yang menjamin kerahsiaan maklumat perakaunan, ahli, dan pengurusan koperasi daripada akses tanpa kebenaran.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Confidential Data Protected */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  Maklumat Sulit Koperasi (Dilindungi &amp; Terhad kepada Staff Koperasi Sahaja)
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span><strong>Buku Tunai &amp; Lejar Am:</strong> Semua rekod transaksi debit/kredit lejar am.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span><strong>Penyata Kewangan SKM:</strong> Lembaran Imbangan, Untung Rugi, dan Imbangan Duga.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span><strong>Potongan Gaji &amp; Pinjaman Ahli:</strong> Baki pinjaman Murabahah, permohonan pembiayaan peribadi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span><strong>Agihan Dividen:</strong> Pengiraan keuntungan dan bahagian dividen tunai individu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span><strong>Minit Mesyuarat Tertutup &amp; Audit JAD:</strong> Dokumen perbincangan resolusi ALK.</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: Allowed Super Admin Scope */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Skop &amp; Kuasa Dibenarkan Bagi Super Admin (Platform Verttere)
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Pelepasan Dana Escrow (*Payment Release*):</strong> Meluluskan dan memindahkan bayaran transit ke akaun rasmi koperasi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Pengurusan Pengguna (*User Management*):</strong> Menambah, memadam, mengunci, dan menetapkan peranan (*RBAC*).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Tetapan Asas Koperasi:</strong> Mengemaskini alamat, no telefon, dan no akaun bank rasmi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Konfigurasi API Gateway:</strong> Menetapkan API Key SecurePay/ToyyibPay dan caj platform.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Log Keselamatan Sistem:</strong> Memantau jejak audit log masuk dan cubaan pencerobohan.</span>
                  </li>
                </ul>
              </div>

            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-200">🛡️ Pemantauan Keselamatan Sesi:</div>
              <p>Sistem dilengkapi mekanisme pemutus sesi automatik 15 minit (*Idle Session Timeout*) dan penyulitan TLS 1.3 bagi memastikan keselamatan data maksimum di setiap peranti.</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD NEW USER */}
      {/* ------------------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Daftar Pengguna Sistem Baru
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Penuh Pengguna: *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Zaki Bin Sulaiman"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Alamat Emel (Sebagai ID Log Masuk): *</label>
                <input
                  type="email"
                  required
                  placeholder="contoh@koperasi.my"
                  value={formData.emel}
                  onChange={e => setFormData({ ...formData, emel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombor Telefon Bimbit:</label>
                <input
                  type="text"
                  placeholder="012-3456789"
                  value={formData.noTelefon}
                  onChange={e => setFormData({ ...formData, noTelefon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Peranan Pengguna (*Role Assignment*): *</label>
                <select
                  value={formData.peranan}
                  onChange={e => setFormData({ ...formData, peranan: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BENDAHARI">Bendahari Koperasi (Akses Kewangan &amp; Payout Request)</option>
                  <option value="PENGERUSI_ALK">Pengerusi ALK (Tadbir Urus &amp; Kelulusan)</option>
                  <option value="SETIAUSAHA">Setiausaha (Minit AGM &amp; Dokumen)</option>
                  <option value="AUDITOR_JAD">Pemeriksa Akaun JAD (Audit Dalaman)</option>
                  <option value="JURUWANG_POS">Juruwang POS (Kaunter Jualan)</option>
                  <option value="AHLI_KOPERASI">Anggota Koperasi (Portal Ahli)</option>
                  {isSuperAdmin && (
                    <option value="SUPER_ADMIN_VERTTERE">Super Admin Verttere (Platform &amp; Payout Release)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Akaun:</label>
                <select
                  value={formData.statusAkaun}
                  onChange={e => setFormData({ ...formData, statusAkaun: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AKTIF">Aktif (Boleh Log Masuk)</option>
                  <option value="DISEKAT">Disekat (Akses Dikunci)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Daftar Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT USER */}
      {/* ------------------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Kemaskini Pengguna ({editingUser.nama})
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateUser(editingUser.id, {
                nama: editingUser.nama,
                emel: editingUser.emel,
                noTelefon: editingUser.noTelefon,
                peranan: editingUser.peranan,
                statusAkaun: editingUser.statusAkaun,
              });
              setEditingUser(null);
              showToast(`Maklumat pengguna ${editingUser.nama} berjaya dikemaskini.`);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Penuh:</label>
                <input
                  type="text"
                  required
                  value={editingUser.nama}
                  onChange={e => setEditingUser({ ...editingUser, nama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Emel:</label>
                <input
                  type="email"
                  required
                  value={editingUser.emel}
                  onChange={e => setEditingUser({ ...editingUser, emel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">No. Telefon:</label>
                <input
                  type="text"
                  value={editingUser.noTelefon || ''}
                  onChange={e => setEditingUser({ ...editingUser, noTelefon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Peranan:</label>
                <select
                  value={editingUser.peranan}
                  onChange={e => setEditingUser({ ...editingUser, peranan: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BENDAHARI">Bendahari Koperasi</option>
                  <option value="PENGERUSI_ALK">Pengerusi ALK</option>
                  <option value="SETIAUSAHA">Setiausaha</option>
                  <option value="AUDITOR_JAD">Pemeriksa JAD</option>
                  <option value="JURUWANG_POS">Juruwang POS</option>
                  <option value="AHLI_KOPERASI">Anggota Koperasi</option>
                  {isSuperAdmin && (
                    <option value="SUPER_ADMIN_VERTTERE">Super Admin Verttere</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Akaun:</label>
                <select
                  value={editingUser.statusAkaun}
                  onChange={e => setEditingUser({ ...editingUser, statusAkaun: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="DISEKAT">Disekat</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE USER CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Sahkan Pemadaman Pengguna
              </h3>
              <button onClick={() => setDeletingUser(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Adakah anda pasti ingin memadam pengguna <strong className="text-white">{deletingUser.nama}</strong> ({deletingUser.emel})? Akaun ini tidak lagi boleh mengakses sistem.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteUser(deletingUser.id);
                  setDeletingUser(null);
                  showToast(`Pengguna ${deletingUser.nama} telah dipadam.`);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Padam Pengguna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RESET PASSWORD GENERATED */}
      {/* ------------------------------------------------------------- */}
      {resettingPasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                Kata Laluan Sementara Dijana
              </h3>
              <button onClick={() => setResettingPasswordUser(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Kata laluan sementara telah dijana untuk <strong className="text-white">{resettingPasswordUser.nama}</strong>:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 text-center">
              <span className="text-lg font-black text-emerald-400 font-mono tracking-wider">
                {newTempPassword}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Sila berikan kata laluan sementara ini kepada pengguna. Pengguna akan diminta menukar kata laluan pada log masuk seterusnya.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setResettingPasswordUser(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Selesai &amp; Salin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
