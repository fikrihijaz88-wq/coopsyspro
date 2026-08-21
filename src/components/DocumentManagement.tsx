import React, { useState } from 'react';
import { DokumenSokongan, KategoriDokumen, StatusPengesahanDokumen } from '../types';
import { 
  FileCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  Building2, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Eye, 
  Trash2, 
  AlertTriangle,
  Globe,
  Plus,
  Bell,
  Send,
  Check,
  Zap,
  AlertCircle
} from 'lucide-react';

interface DocumentManagementProps {
  dokumenList: DokumenSokongan[];
  onAddDokumen: (doc: DokumenSokongan) => void;
  onUpdateStatusDokumen: (id: string, newStatus: StatusPengesahanDokumen, catatan?: string) => void;
  onDeleteDokumen: (id: string) => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
  onAddLog?: (tajuk: string, butiran: string) => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  dokumenList,
  onAddDokumen,
  onUpdateStatusDokumen,
  onDeleteDokumen,
  language = 'BM',
  setLanguage,
  onAddLog
}) => {
  const isEN = language === 'EN';

  // Filters & State
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DokumenSokongan | null>(null);

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [namaFail, setNamaFail] = useState<string>('');
  const [kategori, setKategori] = useState<KategoriDokumen>('KAD_PENGENALAN');
  const [rujukan, setRujukan] = useState<string>('');
  const [sumberMuatNaik, setSumberMuatNaik] = useState<string>('Urus Setia Koperasi');
  const [catatan, setCatatan] = useState<string>('');
  const [jumlahPengeluaran, setJumlahPengeluaran] = useState<string>('');
  const [simulatedFile, setSimulatedFile] = useState<File | null>(null);

  // Reminder Modal State
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [reminderTarget, setReminderTarget] = useState<string>('Bendahari & Juruaudit Dalaman ALK');
  const [reminderFrequency, setReminderFrequency] = useState<string>('DAILY');
  const [reminderNotes, setReminderNotes] = useState<string>('');
  const [reminderAlertBanner, setReminderAlertBanner] = useState<{ text: string; time: string } | null>(null);

  const pendingDocsCount = dokumenList.filter(d => d.status === 'PENDING_SEMAKAN').length;

  const handleSendAutomatedReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const timeStr = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

    if (onAddLog) {
      onAddLog(
        'Peringatan Kelulusan Dokumen Berautomatik',
        `Peringatan automatik dihantar kepada [${reminderTarget}] bagi ${pendingDocsCount} dokumen menunggu semakan. Kekerapan: ${reminderFrequency}. Nota: ${reminderNotes || 'Sila semak & sahkan segera.'}`
      );
    }

    setReminderAlertBanner({
      text: isEN
        ? `Automated reminder alert dispatched to ${reminderTarget} for ${pendingDocsCount} pending document approvals.`
        : `Notifikasi peringatan berautomatik disebarkan kepada ${reminderTarget} bagi ${pendingDocsCount} dokumen yang menunggu kelulusan.`,
      time: timeStr
    });

    setShowReminderModal(false);
    setReminderNotes('');
  };

  // Helper formatting
  const formatRM = (val?: number) => {
    if (val === undefined || val === null) return 'RM 0.00';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  const getKategoriBadge = (kat: KategoriDokumen) => {
    switch (kat) {
      case 'KAD_PENGENALAN':
        return { label: isEN ? 'IC Copy' : 'Kad Pengenalan', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'SIJIL_PENDAFTARAN':
        return { label: isEN ? 'Co-op Certificate' : 'Sijil Pendaftaran SKM', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'BIL_INVOIS':
        return { label: isEN ? 'Bill / Invoice' : 'Bil & Invois', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'BAUCAR_PEMBAYARAN':
        return { label: isEN ? 'Payment Voucher' : 'Baucar Pembayaran', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'MINIT_MESYUARAT':
        return { label: isEN ? 'Minutes (Disbursement)' : 'Minit Mesyuarat Pengeluaran', color: 'bg-purple-950 text-purple-300 border-purple-800' };
      default:
        return { label: isEN ? 'Other' : 'Dokumen Lain', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFile(file);
      if (!namaFail) setNamaFail(file.name);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaFail || !rujukan) return;

    const saiz = simulatedFile ? `${(simulatedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB';
    const newDoc: DokumenSokongan = {
      id: `DOK-${Date.now()}`,
      namaFail,
      kategori,
      rujukan,
      tarikhMuatNaik: new Date().toISOString().split('T')[0],
      saizFail: saiz,
      status: 'PENDING_SEMAKAN',
      sumberMuatNaik,
      catatanPengesahan: catatan || (isEN ? 'Uploaded for verification.' : 'Dimuat naik untuk pengesahan audit.'),
      jumlahPengeluaranRM: jumlahPengeluaran ? Number(jumlahPengeluaran) : undefined
    };

    onAddDokumen(newDoc);
    if (onAddLog) {
      onAddLog(
        'Muat Naik Dokumen Pengesahan',
        `Dokumen ${namaFail} (${kategori}) dimuat naik untuk rujukan: ${rujukan}.`
      );
    }

    setShowUploadModal(false);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setNamaFail('');
    setKategori('KAD_PENGENALAN');
    setRujukan('');
    setCatatan('');
    setJumlahPengeluaran('');
    setSimulatedFile(null);
  };

  // Filtered list
  const filteredDocs = dokumenList.filter(d => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      d.namaFail.toLowerCase().includes(query) ||
      d.rujukan.toLowerCase().includes(query) ||
      d.sumberMuatNaik.toLowerCase().includes(query);

    const matchesKat = filterKategori === 'ALL' || d.kategori === filterKategori;
    const matchesStat = filterStatus === 'ALL' || d.status === filterStatus;

    return matchesSearch && matchesKat && matchesStat;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>
              {isEN ? 'Document Verification & Audit Repository' : 'Pusat Muat Naik & Pengesahan Dokumen Koperasi'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN 
              ? 'Upload & verify IC copies, SKM certificates, invoices, payment vouchers, & meeting minutes for disbursement approvals.'
              : 'Muat naik & sahkan salinan IC, Sijil SKM, bil & invois, baucar pembayaran, serta Minit Mesyuarat bagi kelulusan pengeluaran duit.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {setLanguage && (
            <button
              onClick={() => setLanguage(isEN ? 'BM' : 'EN')}
              className="px-3 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{isEN ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
            </button>
          )}

          <button
            onClick={() => setShowReminderModal(true)}
            className="px-3.5 py-2.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/80 text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 relative"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>{isEN ? 'Automated Approval Reminders' : 'Peringatan Kelulusan Berautomatik'}</span>
            {pendingDocsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingDocsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" /> {isEN ? 'Upload New Document' : 'Muat Naik Dokumen Baru'}
          </button>
        </div>
      </div>

      {/* Active Automated Reminder Alert Banner */}
      {reminderAlertBanner && (
        <div className="bg-amber-950/80 border border-amber-700/90 p-4 rounded-xl text-xs flex items-start justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="text-amber-200 font-bold block mb-0.5">
                {isEN ? '🔔 Automated Approval Reminder Alert Dispatched' : '🔔 Notifikasi Peringatan Kelulusan Dokumen Berautomatik Aktif'}
              </strong>
              <p className="text-amber-100/90">{reminderAlertBanner.text}</p>
              <span className="text-[10px] font-mono text-amber-400/80 mt-1 block">
                {isEN ? 'Triggered at:' : 'Masa Penghantaran:'} {reminderAlertBanner.time} • Status Log Sistem Audit: DILOGKAN
              </span>
            </div>
          </div>
          <button
            onClick={() => setReminderAlertBanner(null)}
            className="text-amber-400 hover:text-amber-200 p-1"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SKM Governance Notice */}
      <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-1">
          <strong className="text-emerald-300 font-bold">
            {isEN ? 'SKM Governance & Disbursement Verification Rule:' : 'Garis Panduan Pematuhan SKM & Pengeluaran Duit Koperasi:'}
          </strong>
          <p>
            {isEN 
              ? 'Every fund disbursement (pengeluaran duit) must be backed by approved ALK Meeting Minutes, verified invoices, & authorized payment vouchers under the Co-operative Societies Act 1993.'
              : 'Setiap pengeluaran duit koperasi wajib mempunyai bukti Minit Mesyuarat ALK yang disahkan, invois berpadanan, dan Baucar Pembayaran (PV) yang ditandatangani untuk tujuan pemeriksaan audit SKM.'}
          </p>
        </div>
      </div>

      {/* Category Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="text-slate-400 text-[11px] mb-1">{isEN ? 'IC Copies' : 'Kad Pengenalan'}</div>
          <div className="text-lg font-bold text-indigo-400">
            {dokumenList.filter(d => d.kategori === 'KAD_PENGENALAN').length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="text-slate-400 text-[11px] mb-1">{isEN ? 'Co-op Certificate' : 'Sijil SKM'}</div>
          <div className="text-lg font-bold text-emerald-400">
            {dokumenList.filter(d => d.kategori === 'SIJIL_PENDAFTARAN').length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="text-slate-400 text-[11px] mb-1">{isEN ? 'Invoices & Bills' : 'Bil & Invois'}</div>
          <div className="text-lg font-bold text-amber-400">
            {dokumenList.filter(d => d.kategori === 'BIL_INVOIS').length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="text-slate-400 text-[11px] mb-1">{isEN ? 'Payment Vouchers' : 'Baucar Bayaran'}</div>
          <div className="text-lg font-bold text-cyan-400">
            {dokumenList.filter(d => d.kategori === 'BAUCAR_PEMBAYARAN').length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-[11px] mb-1">{isEN ? 'Disbursement Minutes' : 'Minit Mesyuarat'}</div>
          <div className="text-lg font-bold text-purple-400">
            {dokumenList.filter(d => d.kategori === 'MINIT_MESYUARAT').length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEN ? "Search file, reference, or uploader..." : "Cari nama fail, rujukan, atau pemuat naik..."}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2"
          >
            <option value="ALL">{isEN ? 'All Categories' : 'Semua Kategori'}</option>
            <option value="KAD_PENGENALAN">{isEN ? 'IC Copy' : 'Kad Pengenalan'}</option>
            <option value="SIJIL_PENDAFTARAN">{isEN ? 'Co-op Certificate' : 'Sijil Pendaftaran SKM'}</option>
            <option value="BIL_INVOIS">{isEN ? 'Bills & Invoices' : 'Bil & Invois'}</option>
            <option value="BAUCAR_PEMBAYARAN">{isEN ? 'Payment Vouchers' : 'Baucar Pembayaran'}</option>
            <option value="MINIT_MESYUARAT">{isEN ? 'Minutes for Disbursement' : 'Minit Mesyuarat Pengeluaran'}</option>
            <option value="LAIN_LAIN">{isEN ? 'Others' : 'Lain-lain'}</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2"
          >
            <option value="ALL">{isEN ? 'All Status' : 'Semua Status'}</option>
            <option value="DISAHKAN">{isEN ? 'Verified' : 'Disahkan'}</option>
            <option value="PENDING_SEMAKAN">{isEN ? 'Pending Review' : 'Menunggu Semakan'}</option>
            <option value="DITOLAK">{isEN ? 'Rejected' : 'Ditolak'}</option>
          </select>
        </div>
      </div>

      {/* Document Repository Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isEN ? 'Document Name & Category' : 'Nama Dokumen & Kategori'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Reference & Source' : 'Rujukan / Tujuan'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Upload Date' : 'Tarikh Muat Naik'}</th>
                <th className="px-4 py-3.5 text-right">{isEN ? 'Disbursement (RM)' : 'Amaun Duit (RM)'}</th>
                <th className="px-4 py-3.5">{isEN ? 'Verification Status' : 'Status Pengesahan'}</th>
                <th className="px-4 py-3.5 text-center">{isEN ? 'Actions' : 'Tindakan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => {
                const katBadge = getKategoriBadge(doc.kategori);
                return (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Document Name */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{doc.namaFail}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${katBadge.color}`}>
                          {katBadge.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{doc.saizFail}</span>
                      </div>
                    </td>

                    {/* Reference & Source */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-medium">{doc.rujukan}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isEN ? 'By:' : 'Oleh:'} {doc.sumberMuatNaik}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      {doc.tarikhMuatNaik}
                    </td>

                    {/* Amount if applicable */}
                    <td className="px-4 py-3.5 text-right font-bold font-mono">
                      {doc.jumlahPengeluaranRM ? (
                        <span className="text-emerald-400">{formatRM(doc.jumlahPengeluaranRM)}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {doc.status === 'DISAHKAN' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {isEN ? 'VERIFIED' : 'DISAHKAN'}
                        </span>
                      )}
                      {doc.status === 'PENDING_SEMAKAN' && (
                        <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-400" /> {isEN ? 'PENDING REVIEW' : 'MENUNGGU SEMAKAN'}
                        </span>
                      )}
                      {doc.status === 'DITOLAK' && (
                        <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <XCircle className="w-3 h-3 text-rose-400" /> {isEN ? 'REJECTED' : 'DITOLAK'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                          title={isEN ? "View document details & audit log" : "Lihat butiran dokumen & log audit"}
                        >
                          <Eye className="w-4 h-4 text-emerald-400" />
                        </button>
                        
                        {doc.status === 'PENDING_SEMAKAN' && (
                          <>
                            <button
                              onClick={() => {
                                if (onAddLog) {
                                  onAddLog(
                                    'Peringatan Kelulusan Dokumen',
                                    `Peringatan segera dihantar bagi dokumen "${doc.namaFail}" (Rujukan: ${doc.rujukan}) yang menunggu kelulusan.`
                                  );
                                }
                                setReminderAlertBanner({
                                  text: isEN 
                                    ? `Urgent reminder dispatched for document "${doc.namaFail}".`
                                    : `Peringatan kelulusan segera dihantar kepada pihak pengurusan bagi dokumen "${doc.namaFail}".`,
                                  time: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
                                });
                              }}
                              className="p-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg transition-colors"
                              title={isEN ? "Send Quick Approval Reminder" : "Hantar Peringatan Kelulusan Segera"}
                            >
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            <button
                              onClick={() => onUpdateStatusDokumen(doc.id, 'DISAHKAN', isEN ? 'Verified by Internal Auditor' : 'Disahkan oleh Juruaudit Dalaman / ALK')}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-semibold transition-colors"
                              title={isEN ? "Approve & Verify" : "Sahkan Dokumen"}
                            >
                              {isEN ? 'Approve' : 'Sahkan'}
                            </button>
                            <button
                              onClick={() => onUpdateStatusDokumen(doc.id, 'DITOLAK', isEN ? 'Rejected due to incomplete info' : 'Ditolak kerana maklumat tidak lengkap')}
                              className="px-2 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold transition-colors"
                              title={isEN ? "Reject Document" : "Tolak Dokumen"}
                            >
                              {isEN ? 'Reject' : 'Tolak'}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onDeleteDokumen(doc.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title={isEN ? "Delete Document" : "Padam Dokumen"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    {isEN 
                      ? 'No documents found in repository matching criteria.' 
                      : 'Tiada dokumen dijumpai mengikut carian/kategori.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View / Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <FileCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">{selectedDoc.namaFail}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedDoc.id} • {selectedDoc.saizFail}</p>
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-slate-300">
                  <strong>{isEN ? 'Category:' : 'Kategori Dokumen:'}</strong>{' '}
                  <span className="text-emerald-400">{getKategoriBadge(selectedDoc.kategori).label}</span>
                </p>
                <p className="text-slate-300">
                  <strong>{isEN ? 'Purpose / Reference:' : 'Tujuan / Rujukan:'}</strong> {selectedDoc.rujukan}
                </p>
                <p className="text-slate-300">
                  <strong>{isEN ? 'Uploader:' : 'Pemuat Naik:'}</strong> {selectedDoc.sumberMuatNaik}
                </p>
                <p className="text-slate-300">
                  <strong>{isEN ? 'Upload Date:' : 'Tarikh Muat Naik:'}</strong> {selectedDoc.tarikhMuatNaik}
                </p>
                {selectedDoc.jumlahPengeluaranRM && (
                  <p className="text-slate-300">
                    <strong>{isEN ? 'Fund Disbursement Amount:' : 'Jumlah Pengeluaran Duit:'}</strong>{' '}
                    <span className="text-emerald-400 font-bold">{formatRM(selectedDoc.jumlahPengeluaranRM)}</span>
                  </p>
                )}
                <p className="text-slate-300">
                  <strong>{isEN ? 'Verification Note:' : 'Catatan Pengesahan:'}</strong>{' '}
                  <span className="text-slate-200 italic">{selectedDoc.catatanPengesahan || 'Tiada catatan'}</span>
                </p>
              </div>

              {/* Simulated Document Preview Box */}
              <div className="border border-dashed border-slate-700 bg-slate-950 p-6 rounded-xl text-center space-y-2">
                <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-white font-bold">{selectedDoc.namaFail}</p>
                <p className="text-slate-400 text-[11px]">
                  {isEN ? 'Document preview verified & stored in encrypted SKM cloud vault.' : 'Pratonton dokumen rasmi tersimpan secara selamat dalam storan awan SKM.'}
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-bold">
                    {isEN ? 'PDF Hash: SHA256-OK-VERIFIED' : 'Kod Pengesahan Hash: SHA256-SAH'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                {isEN ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Form */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <span>{isEN ? 'Upload Document for Verification & Disbursement' : 'Muat Naik Dokumen Sokongan & Pengesahan'}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              
              {/* Dropzone File Selector */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Choose Document File (PDF, PNG, JPG) *' : 'Pilih Fail Dokumen (PDF, PNG, JPG) *'}
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950 p-4 rounded-xl text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    id="doc-file-upload"
                  />
                  <label htmlFor="doc-file-upload" className="cursor-pointer block space-y-1">
                    <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-white font-semibold">
                      {simulatedFile ? simulatedFile.name : (isEN ? 'Click to select file or drag & drop' : 'Klik untuk pilih fail atau seret dokumen ke sini')}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {isEN ? 'Supported: IC, SKM Certificate, Invoices, Vouchers, Minutes' : 'Sokongan: IC, Sijil SKM, Invois, Baucar & Minit Mesyuarat'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Document Category */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Document Category *' : 'Kategori Dokumen *'}
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriDokumen)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="KAD_PENGENALAN">{isEN ? 'IC Copy (Salinan Kad Pengenalan Ahli/ALK)' : 'Kad Pengenalan (IC Ahli / ALK)'}</option>
                  <option value="SIJIL_PENDAFTARAN">{isEN ? 'SKM Co-op Registration Certificate' : 'Sijil Pendaftaran Koperasi SKM'}</option>
                  <option value="BIL_INVOIS">{isEN ? 'Bill / Supplier Invoice' : 'Bil & Invois Pembekal / Operasi'}</option>
                  <option value="BAUCAR_PEMBAYARAN">{isEN ? 'Payment Voucher (PV)' : 'Baucar Pembayaran (Payment Voucher)'}</option>
                  <option value="MINIT_MESYUARAT">{isEN ? 'Meeting Minutes for Money Disbursement' : 'Minit Mesyuarat ALK untuk Pengeluaran Duit'}</option>
                  <option value="LAIN_LAIN">{isEN ? 'Other Supporting Document' : 'Dokumen Sokongan Lain'}</option>
                </select>
              </div>

              {/* Document Title / Name */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Document File Name / Title *' : 'Nama Fail / Tajuk Dokumen *'}
                </label>
                <input
                  type="text"
                  required
                  value={namaFail}
                  onChange={(e) => setNamaFail(e.target.value)}
                  placeholder={isEN ? "Example: Minit_Mesyuarat_Pengeluaran_RM50k.pdf" : "Contoh: Minit_Mesyuarat_Pengeluaran_RM50k.pdf"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Reference / Purpose */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Purpose / Reference / Co-op Member No. *' : 'Tujuan / Rujukan / No. Ahli Koperasi *'}
                </label>
                <input
                  type="text"
                  required
                  value={rujukan}
                  onChange={(e) => setRujukan(e.target.value)}
                  placeholder={isEN ? "Example: Kelulusan Pengeluaran Duit RM50,000 (Minit ALK 02/2026)" : "Contoh: Kelulusan Pengeluaran Duit RM50,000 (Minit ALK 02/2026 Fasal 4.2)"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Amount if Disbursement / Voucher */}
              {(kategori === 'MINIT_MESYUARAT' || kategori === 'BAUCAR_PEMBAYARAN' || kategori === 'BIL_INVOIS') && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Disbursement Amount (RM) - Optional' : 'Jumlah Pengeluaran Duit (RM) - Jika Berkaitan'}
                  </label>
                  <input
                    type="number"
                    value={jumlahPengeluaran}
                    onChange={(e) => setJumlahPengeluaran(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              )}

              {/* Source / Uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Uploaded By' : 'Pemuat Naik / Jabatan'}
                  </label>
                  <input
                    type="text"
                    value={sumberMuatNaik}
                    onChange={(e) => setSumberMuatNaik(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {isEN ? 'Notes / Justification' : 'Catatan / Justifikasi Pengesahan'}
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder={isEN ? "Example: Verified by Secretary" : "Contoh: Telah disemak oleh Setiausaha"}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  {isEN ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40"
                >
                  {isEN ? 'Upload & Save Document' : 'Muat Naik & Simpan Dokumen'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Automated Approval Reminders Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>{isEN ? 'Automated Approval Reminder Config' : 'Tetapan Notifikasi & Peringatan Kelulusan Dokumen'}</span>
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAutomatedReminder} className="space-y-4 text-xs">
              
              <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-slate-300">
                  <p className="font-bold text-amber-300">
                    {pendingDocsCount}{' '}
                    {isEN ? 'document(s) currently pending approval / verification.' : 'dokumen semasa menunggu kelulusan & pengesahan.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isEN 
                      ? 'Automated alerts notify officers via dashboard banners & audit activity logs.'
                      : 'Peringatan automatik akan disebarkan kepada pegawai terlibat serta dicatat ke dalam Log Aktiviti Audit.'}
                  </p>
                </div>
              </div>

              {/* Recipient Officer */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Target Officer / Recipient *' : 'Pegawai Sasaran / Penerima Peringatan *'}
                </label>
                <select
                  value={reminderTarget}
                  onChange={(e) => setReminderTarget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Bendahari & Juruaudit Dalaman ALK">Bendahari & Juruaudit Dalaman ALK</option>
                  <option value="Setiausaha & Pengerusi Koperasi">Setiausaha & Pengerusi Koperasi</option>
                  <option value="Semua Ahli Lembaga Koperasi (ALK)">Semua Ahli Lembaga Koperasi (ALK)</option>
                  <option value="Urus Setia Kelulusan Pengeluaran Duit">Urus Setia Kelulusan Pengeluaran Duit</option>
                </select>
              </div>

              {/* Schedule Frequency */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Automated Alert Frequency *' : 'Kekerapan Peringatan Berautomatik *'}
                </label>
                <select
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="DAILY">{isEN ? 'Daily Until Approved' : 'Setiap Hari Sehingga Disahkan (Daily)'}</option>
                  <option value="IMMEDIATE_PUSH">{isEN ? 'Immediate High-Priority Push Alert' : 'Serta-Merta (Immediate Push Alert)'}</option>
                  <option value="EVERY_3_DAYS">{isEN ? 'Every 3 Days' : 'Setiap 3 Hari'}</option>
                  <option value="WEEKLY">{isEN ? 'Weekly (Every Monday)' : 'Mingguan (Setiap Isnin)'}</option>
                </select>
              </div>

              {/* Custom Reminder Note */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {isEN ? 'Urgent Note / Message' : 'Nota Peringatan / Mesej Segera'}
                </label>
                <textarea
                  rows={2}
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  placeholder={isEN ? "Example: Mohon sahkan Minit Mesyuarat pengeluaran RM50,000 sebelum mesyuarat audit SKM." : "Contoh: Mohon sahkan Minit Mesyuarat pengeluaran RM50,000 sebelum mesyuarat audit SKM."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  {isEN ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEN ? 'Dispatch Automated Reminder' : 'Hantar & Aktifkan Peringatan'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
