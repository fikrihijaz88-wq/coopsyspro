import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCheck,
  Clock,
  AlertCircle,
  Settings,
  FileText,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Radio,
  Zap,
  DollarSign,
  ShoppingCart,
  Calendar,
  Award,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Sliders
} from 'lucide-react';
import { 
  Ahli, 
  NotificationTemplate, 
  NotificationLog, 
  NotificationConfig, 
  SaluranNotifikasi, 
  JenisPencetusNotifikasi 
} from '../types';

interface WhatsAppSmsNotificationProps {
  ahliList: Ahli[];
  templates: NotificationTemplate[];
  logs: NotificationLog[];
  config: NotificationConfig;
  onSendNotification: (payload: {
    namaPenerima: string;
    noAhli?: string;
    noTelefon: string;
    saluran: SaluranNotifikasi;
    pencetus?: JenisPencetusNotifikasi;
    tajuk?: string;
    mesej: string;
    rujukanTransaksi?: string;
  }) => Promise<{ success: boolean; log: NotificationLog; directWaUrl: string }>;
  onUpdateConfig: (cfg: Partial<NotificationConfig>) => Promise<void>;
  onAddTemplate: (template: NotificationTemplate) => Promise<void>;
  onUpdateTemplate: (id: string, updates: Partial<NotificationTemplate>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const WhatsAppSmsNotification: React.FC<WhatsAppSmsNotificationProps> = ({
  ahliList,
  templates,
  logs,
  config,
  onSendNotification,
  onUpdateConfig,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'logs' | 'settings'>('compose');

  // Compose State
  const [recipientType, setRecipientType] = useState<'SINGLE' | 'ALL_ACTIVE' | 'COMMITTEE'>('SINGLE');
  const [selectedAhliId, setSelectedAhliId] = useState<string>(ahliList[0]?.id || '');
  const [customName, setCustomName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<SaluranNotifikasi>('WHATSAPP');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [messageSubject, setMessageSubject] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastSentUrl, setLastSentUrl] = useState<string | null>(null);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [tmplFormData, setTmplFormData] = useState<Partial<NotificationTemplate>>({
    nama: '',
    kod: '',
    saluran: 'WHATSAPP',
    pencetus: 'MANUAL_BROADCAST',
    tajuk: '',
    kandungan: '',
    aktif: true,
    pembolehUbah: ['{nama}', '{noAhli}', '{jumlah}']
  });

  // Settings State
  const [localConfig, setLocalConfig] = useState<NotificationConfig>(config);
  const [configSaved, setConfigSaved] = useState<boolean>(false);

  // Logs Filter State
  const [logSearch, setLogSearch] = useState<string>('');
  const [logChannelFilter, setLogChannelFilter] = useState<string>('ALL');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('ALL');

  // Target member for Single compose
  const currentMember = ahliList.find(a => a.id === selectedAhliId) || ahliList[0];

  // Helper to replace template placeholders
  const applyPlaceholders = (rawTemplate: string, member?: Ahli) => {
    const target = member || currentMember;
    const now = new Date();
    const dateStr = now.toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
    
    return rawTemplate
      .replace(/{nama}/g, target?.nama || customName || 'Anggota Koperasi')
      .replace(/{noAhli}/g, target?.noAhli || 'KOP-2026-XXX')
      .replace(/{koperasi}/g, 'Koperasi Warga Berdaya Malaysia Berhad')
      .replace(/{jumlah}/g, '250.00')
      .replace(/{noResit}/g, `RESIT-${Date.now().toString().slice(-6)}`)
      .replace(/{perihal}/g, 'Penambahan Modal Syer Anggota')
      .replace(/{tarikh}/g, dateStr)
      .replace(/{masa}/g, timeStr)
      .replace(/{lokasi}/g, 'Dewan Utama Cyberjaya / Google Meet')
      .replace(/{bilangan}/g, 'ke-12')
      .replace(/{tahun}/g, '2025/2026')
      .replace(/{kadarDividen}/g, '6.5')
      .replace(/{maklumatBank}/g, target?.maklumatBank?.noAkaun ? `${target.maklumatBank.namaBank} (***${target.maklumatBank.noAkaun.slice(-4)})` : 'Maybank Islamic (***4921)')
      .replace(/{kaedahBayaran}/g, 'SecurePay FPX')
      .replace(/{noRujukan}/g, 'PB-2026-009')
      .replace(/{linkResit}/g, 'https://fikrihijaz.aila.my/resit/SP-88219')
      .replace(/{linkDokumen}/g, 'https://fikrihijaz.aila.my/agm2026');
  };

  // Sync template selection into compose textarea
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setMessageSubject(tmpl.tajuk);
      setMessageBody(applyPlaceholders(tmpl.kandungan));
      setSelectedChannel(tmpl.saluran);
    }
  };

  // Handle Send Message
  const handleSend = async () => {
    if (!messageBody.trim()) {
      alert(isEN ? 'Please enter message content.' : 'Sila masukkan mesej notifikasi.');
      return;
    }

    setIsSending(true);
    try {
      if (recipientType === 'SINGLE') {
        const phone = customPhone || currentMember?.noTelefon || '012-3456789';
        const name = customName || currentMember?.nama || 'Anggota Koperasi';
        const noAhli = currentMember?.noAhli;

        const tmpl = templates.find(t => t.id === selectedTemplateId);
        const res = await onSendNotification({
          namaPenerima: name,
          noAhli,
          noTelefon: phone,
          saluran: selectedChannel,
          pencetus: tmpl?.pencetus || 'MANUAL_BROADCAST',
          tajuk: messageSubject || 'Notifikasi Rasmi Koperasi',
          mesej: messageBody,
          rujukanTransaksi: `MSG-${Date.now().toString().slice(-6)}`
        });

        setLastSentUrl(res.directWaUrl);
        alert(isEN 
          ? `✅ Notification successfully sent to ${name} (${phone}) via ${selectedChannel}!` 
          : `✅ Notifikasi berjaya dihantar kepada ${name} (${phone}) melalui ${selectedChannel}!`);
      } else {
        // Broadcast Mode
        const targetList = recipientType === 'ALL_ACTIVE' 
          ? ahliList.filter(a => a.status === 'AKTIF')
          : ahliList.filter(a => (a.jawatanStaf && a.jawatanStaf.includes('ALK')) || a.noAhli.includes('ALK') || (a.jawatan && a.jawatan.includes('ALK')));

        let count = 0;
        for (const m of targetList) {
          const personalized = applyPlaceholders(messageBody, m);
          await onSendNotification({
            namaPenerima: m.nama,
            noAhli: m.noAhli,
            noTelefon: m.noTelefon || '012-3456789',
            saluran: selectedChannel,
            pencetus: 'MANUAL_BROADCAST',
            tajuk: messageSubject || 'Hebahan Pukal Koperasi',
            mesej: personalized,
            rujukanTransaksi: `BCAST-${Date.now().toString().slice(-4)}-${m.noAhli}`
          });
          count++;
        }
        alert(isEN 
          ? `✅ Broadcast successfully sent to ${count} members!` 
          : `✅ Hebahan pukal berjaya dihantar kepada ${count} anggota!`);
      }
    } catch (err: any) {
      alert(`Ralat menghantar notifikasi: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  // KPI Calculations
  const totalSent = logs.length;
  const waSent = logs.filter(l => l.saluran === 'WHATSAPP' || l.saluran === 'BOTH').length;
  const smsSent = logs.filter(l => l.saluran === 'SMS').length;
  const successCount = logs.filter(l => l.status === 'BERJAYA').length;
  const successRate = totalSent > 0 ? ((successCount / totalSent) * 100).toFixed(1) : '100';

  // Filtered Logs
  const filteredLogs = logs.filter(l => {
    const matchSearch = 
      l.namaPenerima.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.noTelefon.includes(logSearch) ||
      (l.noAhli && l.noAhli.toLowerCase().includes(logSearch.toLowerCase())) ||
      l.mesej.toLowerCase().includes(logSearch.toLowerCase());
    const matchChannel = logChannelFilter === 'ALL' || l.saluran === logChannelFilter;
    const matchStatus = logStatusFilter === 'ALL' || l.status === logStatusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 border border-emerald-700/40 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Sistem Automasi Notifikasi Multi-Saluran
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-emerald-400" />
              Notifikasi WhatsApp & SMS Automatik
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-2xl">
              Hantar resit pembayaran gateway, e-resit POS, pengumuman AGM, pengkreditan dividen, dan hebahan anggota secara automatik terus ke telefon pintar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-right pr-3 border-r border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Baki Kredit SMS</div>
              <div className="text-xl font-black text-amber-400 flex items-center justify-end gap-1">
                <Radio className="w-4 h-4 text-amber-400" />
                {config.smsBalanceCredits} <span className="text-xs text-slate-400 font-normal">kredit</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Gerbang WhatsApp</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                {config.whatsappProvider === 'DIRECT_WA_LINK' ? 'WhatsApp Direct Link (Aktif)' : 'WhatsApp Cloud API'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Jumlah Mesej</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalSent}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Keseluruhan log direkodkan
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">WhatsApp Dihantar</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{waSent}</div>
          <div className="text-[11px] text-slate-400 mt-1">Resit & Hebahan Digital</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">SMS Dihantar</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{smsSent}</div>
          <div className="text-[11px] text-slate-400 mt-1">SMS Gerbang Telekomunikasi</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Kadar Kejayaan</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{successRate}%</div>
          <div className="text-[11px] text-indigo-300/80 mt-1">Penghantaran Segera</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'compose'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          {isEN ? 'Compose & Broadcast' : 'Hantar Mesej & Hebahan Pukal'}
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          {isEN ? 'Message Templates' : 'Pengurusan Templat Mesej'} ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          {isEN ? 'Delivery Logs' : 'Log Penghantaran & Audit'} ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          {isEN ? 'Automation & Gateway Settings' : 'Tetapan Gerbang & Automasi'}
        </button>
      </div>

      {/* TAB 1: COMPOSE & BROADCAST WITH SMARTPHONE MOCKUP */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 space-y-5 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                {isEN ? 'Compose Notification' : 'Gubah Notifikasi WhatsApp / SMS'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Saluran:</span>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('WHATSAPP')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedChannel === 'WHATSAPP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('SMS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedChannel === 'SMS' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> SMS
                  </button>
                </div>
              </div>
            </div>

            {/* Recipient Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Sasaran Penerima
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('SINGLE')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    recipientType === 'SINGLE'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  Anggota Individu
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('ALL_ACTIVE')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    recipientType === 'ALL_ACTIVE'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  Semua Anggota Aktif ({ahliList.filter(a => a.status === 'AKTIF').length})
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('COMMITTEE')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    recipientType === 'COMMITTEE'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  Anggota ALK & JAD
                </button>
              </div>

              {recipientType === 'SINGLE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Pilih Anggota Berdaftar</label>
                    <select
                      value={selectedAhliId}
                      onChange={(e) => {
                        setSelectedAhliId(e.target.value);
                        const m = ahliList.find(a => a.id === e.target.value);
                        if (m) {
                          setCustomName(m.nama);
                          setCustomPhone(m.noTelefon || '');
                          if (selectedTemplateId) {
                            const tmpl = templates.find(t => t.id === selectedTemplateId);
                            if (tmpl) setMessageBody(applyPlaceholders(tmpl.kandungan, m));
                          }
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      {ahliList.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.noAhli} - {a.nama} ({a.noTelefon || 'Tiada No Tel'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">No. Telefon WhatsApp / SMS</label>
                    <input
                      type="text"
                      placeholder="e.g. 012-3456789"
                      value={customPhone || currentMember?.noTelefon || ''}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Pilih Templat Mesej
                </label>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(selectedTemplateId)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Muat Semula Pembolehubah
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      selectedTemplateId === t.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="p-1.5 bg-slate-900 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                      {t.pencetus === 'BAYARAN_GATEWAY' ? <DollarSign className="w-4 h-4" /> :
                       t.pencetus === 'JUALAN_POS' ? <ShoppingCart className="w-4 h-4" /> :
                       t.pencetus === 'HEBAHAN_AGM' ? <Calendar className="w-4 h-4" /> :
                       t.pencetus === 'AGIHAN_DIVIDEN' ? <Award className="w-4 h-4" /> :
                       <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{t.nama}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{t.tajuk}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject & Body */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tajuk / Subjek Mesej</label>
                <input
                  type="text"
                  placeholder="e.g. Resit Pembayaran Online Koperasi"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-400">Kandungan Mesej</label>
                  <span className="text-[10px] text-slate-500">
                    Sokongan format WhatsApp: *bold*, _italic_, ~strikethrough~
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Tulis mesej anda di sini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white font-mono leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {lastSentUrl && (
                  <a
                    href={lastSentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-950 border border-emerald-600 text-emerald-300 hover:bg-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka di WhatsApp Web / App
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSend}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
                  {isSending 
                    ? (isEN ? 'Sending...' : 'Menghantar...') 
                    : recipientType === 'SINGLE' 
                      ? (isEN ? 'Send Notification' : 'Hantar Notifikasi Sekarang')
                      : (isEN ? 'Send Broadcast to All' : 'Lancarkan Hebahan Pukal')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Smartphone Preview: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Pratonton Telefon Pintar Penerima
            </div>

            {/* Phone Bezel */}
            <div className="w-full max-w-[340px] bg-slate-950 rounded-[40px] p-3 border-4 border-slate-700 shadow-2xl shadow-emerald-950/40 relative">
              {/* Camera Notch */}
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
              </div>

              {/* WhatsApp Screen */}
              <div className="bg-[#0b141a] rounded-[28px] overflow-hidden border border-slate-800 min-h-[460px] flex flex-col justify-between">
                {/* WhatsApp Chat Top Header */}
                <div className="bg-[#202c33] p-3 flex items-center gap-2.5 border-b border-slate-700">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                    KOP
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      Koperasi Warga Berdaya
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Akaun Perniagaan Rasmi (Verified)
                    </div>
                  </div>
                </div>

                {/* Chat Background Pattern & Bubbles */}
                <div className="p-3 space-y-3 flex-1 flex flex-col justify-end bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* Bubble Date Pill */}
                  <div className="self-center bg-[#182229] px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow">
                    Hari Ini
                  </div>

                  {/* Message Bubble */}
                  <div className="self-end max-w-[92%] bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tr-none text-xs shadow-md space-y-1.5 border border-emerald-700/50">
                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider border-b border-emerald-600/40 pb-1">
                      {messageSubject || 'Notifikasi Rasmi Koperasi'}
                    </div>
                    
                    <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans text-slate-100">
                      {messageBody || 'Sila pilih templat atau taip mesej anda untuk melihat pratonton langsung...'}
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/70 pt-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-300 inline" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Bottom Input Bar */}
                <div className="bg-[#202c33] p-2 flex items-center gap-2 border-t border-slate-700">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[10px] text-slate-400 truncate">
                    Mesej auto-dijana oleh Sistem MyCoop...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATE MANAGER */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Senarai Templat Mesej Notifikasi
              </h2>
              <p className="text-xs text-slate-400">
                Urus templat mesej siap guna dengan pembolehubah dinamik untuk pembayaran, jualan POS, dividen, dan mesyuarat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setTmplFormData({
                  nama: '',
                  kod: '',
                  saluran: 'WHATSAPP',
                  pencetus: 'MANUAL_BROADCAST',
                  tajuk: '',
                  kandungan: '',
                  aktif: true,
                  pembolehUbah: ['{nama}', '{noAhli}', '{jumlah}', '{koperasi}']
                });
                setShowTemplateModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> Tambah Templat Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.saluran === 'WHATSAPP' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                        t.saluran === 'SMS' ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                        'bg-indigo-950 border border-indigo-700 text-indigo-300'
                      }`}>
                        {t.saluran}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                        {t.kod}
                      </span>
                    </div>

                    <span className={`w-2.5 h-2.5 rounded-full ${t.aktif ? 'bg-emerald-500' : 'bg-rose-500'}`} title={t.aktif ? 'Aktif' : 'Nyahaktif'} />
                  </div>

                  <h3 className="text-sm font-black text-white">{t.nama}</h3>
                  <div className="text-xs font-bold text-emerald-400">{t.tajuk}</div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {t.kandungan}
                  </div>

                  {/* Variables pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold self-center mr-1">Pembolehubah:</span>
                    {t.pembolehUbah.map(v => (
                      <span key={v} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Pencetus: <strong className="text-slate-200">{t.pencetus.replace('_', ' ')}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplate(t);
                        setTmplFormData(t);
                        setShowTemplateModal(true);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                      title="Kemaskini Templat"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Adakah anda pasti ingin memadamkan templat "${t.nama}"?`)) {
                          await onDeleteTemplate(t.id);
                        }
                      }}
                      className="p-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold cursor-pointer"
                      title="Padam Templat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY LOGS & AUDIT */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari penerima, no. ahli, telefon atau kata kunci mesej..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logChannelFilter}
                onChange={(e) => setLogChannelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Saluran</option>
                <option value="WHATSAPP">WhatsApp Sahaja</option>
                <option value="SMS">SMS Sahaja</option>
              </select>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="BERJAYA">Berjaya</option>
                <option value="GAGAL">Gagal</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Tarikh & Masa</th>
                    <th className="p-4">Penerima & Telefon</th>
                    <th className="p-4">Saluran & Pencetus</th>
                    <th className="p-4">Mesej Notifikasi</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        Tiada rekod log penghantaran ditemui.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          {log.tarikhMasa}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{log.namaPenerima}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            {log.noTelefon} {log.noAhli && <span className="text-slate-400 font-normal">({log.noAhli})</span>}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.saluran === 'WHATSAPP' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                            'bg-amber-950 border border-amber-700 text-amber-300'
                          }`}>
                            {log.saluran}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {log.pencetus.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="text-xs font-bold text-slate-200 truncate">{log.tajuk}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{log.mesej}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            log.status === 'BERJAYA'
                              ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                              : 'bg-rose-950 border border-rose-600 text-rose-300'
                          }`}>
                            {log.status === 'BERJAYA' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-rose-400" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          {log.saluran === 'WHATSAPP' && (
                            <a
                              href={`https://wa.me/${log.noTelefon.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(log.mesej)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Buka Chat WhatsApp"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATION & GATEWAY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Automatic Trigger Toggles */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Zap className="w-5 h-5 text-emerald-400" />
              Suis Pencetus Notifikasi Automatik (*Event Triggers*)
            </h2>
            <p className="text-xs text-slate-400">
              Tentukan transaksi dan peristiwa yang akan menghantar WhatsApp / SMS secara automatik tanpa penglibatan manual.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={localConfig.autoSendPaymentReceipt}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoSendPaymentReceipt: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Auto-Hantar Resit Bayaran Gateway</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hantar resit rasmi digital & pautan muat turun sejurus bayaran SecurePay / ToyyibPay disahkan berjaya.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={localConfig.autoSendPosReceipt}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoSendPosReceipt: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Auto-Hantar E-Resit Jualan POS</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hantar ringkasan belian kedai runcit/pasar mini koperasi kepada anggota sejurus juruwang klik bayar.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={localConfig.autoSendDividendNotice}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoSendDividendNotice: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Auto-Notis Agihan Dividen</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hantar makluman jumlah dividen tahunan dan no akaun bank penerima apabila proses agihan diluluskan.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={localConfig.autoSendAgmReminder}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoSendAgmReminder: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Auto-Peringatan Mesyuarat Agung (AGM)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pemberitahuan tarikh, masa, lokasi mesyuarat agung serta pautan dokumen sokongan minit dan penyata.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={localConfig.autoSendLoanStatus}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoSendLoanStatus: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Auto-Notis Kelulusan Pembiayaan</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Maklumkan status permohonan pembiayaan (Lulus / Ditolak) kepada pemohon sebaik ALK membuat keputusan.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* WhatsApp & SMS Gateway Credentials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WhatsApp Config */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Konfigurasi Gerbang WhatsApp
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Pilihan Mod Penghantaran</label>
                  <select
                    value={localConfig.whatsappProvider}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, whatsappProvider: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DIRECT_WA_LINK">WhatsApp Direct Link (wa.me) - Percuma & Tiada Setup Diperlukan</option>
                    <option value="WHATSAPP_CLOUD_API">Meta WhatsApp Cloud API (Official Business API)</option>
                    <option value="TWILIO">Twilio WhatsApp Messaging API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">No. Telefon Penghantar Koperasi</label>
                  <input
                    type="text"
                    value={localConfig.whatsappSenderNumber || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, whatsappSenderNumber: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="+60123456789"
                  />
                </div>

                {localConfig.whatsappProvider === 'WHATSAPP_CLOUD_API' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">WhatsApp Phone Number ID</label>
                      <input
                        type="text"
                        value={localConfig.whatsappPhoneNumberId || ''}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, whatsappPhoneNumberId: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Permanent Access Token</label>
                      <input
                        type="password"
                        value={localConfig.whatsappAccessToken || ''}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, whatsappAccessToken: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SMS Config */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Konfigurasi Gerbang SMS (Telekomunikasi)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Penyedia Gerbang SMS</label>
                  <select
                    value={localConfig.smsProvider}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, smsProvider: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="SIMULATOR">Simulator Sandbox (Ujian Dalaman Percuma)</option>
                    <option value="BULKSMS_MY">BulkSMS Malaysia API</option>
                    <option value="TWILIO">Twilio Programmable SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Sender ID SMS (Max 11 Aksara)</label>
                  <input
                    type="text"
                    value={localConfig.smsSenderId || 'MYCOOP'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, smsSenderId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">SMS API Key / Token</label>
                  <input
                    type="password"
                    value={localConfig.smsApiKey || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, smsApiKey: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Kredit SMS Semasa:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-400 font-mono">{localConfig.smsBalanceCredits}</span>
                    <button
                      type="button"
                      onClick={() => setLocalConfig(prev => ({ ...prev, smsBalanceCredits: (prev.smsBalanceCredits || 0) + 500 }))}
                      className="px-2.5 py-1 bg-amber-950 border border-amber-700 text-amber-300 text-[10px] font-bold rounded-lg hover:bg-amber-900 cursor-pointer"
                    >
                      + Tambah 500 Kredit (Sandbox)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-2">
            {configSaved && (
              <span className="text-xs text-emerald-400 font-bold self-center flex items-center gap-1">
                <Check className="w-4 h-4" /> Tetapan berjaya disimpan!
              </span>
            )}
            <button
              type="button"
              onClick={async () => {
                await onUpdateConfig(localConfig);
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 3000);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Simpan Semua Tetapan Automasi
            </button>
          </div>
        </div>
      )}

      {/* TEMPLATE CREATE / EDIT MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              {editingTemplate ? 'Kemaskini Templat Mesej' : 'Tambah Templat Mesej Baru'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nama Templat</label>
                <input
                  type="text"
                  value={tmplFormData.nama || ''}
                  onChange={(e) => setTmplFormData(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="e.g. Resit Pembayaran Syer Anggota"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Kod Unik</label>
                  <input
                    type="text"
                    value={tmplFormData.kod || ''}
                    onChange={(e) => setTmplFormData(prev => ({ ...prev, kod: e.target.value.toUpperCase() }))}
                    placeholder="e.g. RECEIPT_SYER"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Saluran</label>
                  <select
                    value={tmplFormData.saluran || 'WHATSAPP'}
                    onChange={(e) => setTmplFormData(prev => ({ ...prev, saluran: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="BOTH">Kedua-duanya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Peristiwa / Pencetus</label>
                <select
                  value={tmplFormData.pencetus || 'MANUAL_BROADCAST'}
                  onChange={(e) => setTmplFormData(prev => ({ ...prev, pencetus: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="BAYARAN_GATEWAY">Bayaran Online Gateway (SecurePay / ToyyibPay)</option>
                  <option value="JUALAN_POS">Jualan POS Kedai Koperasi</option>
                  <option value="HEBAHAN_AGM">Hebahan & Peringatan AGM</option>
                  <option value="AGIHAN_DIVIDEN">Agihan Dividen Tahunan</option>
                  <option value="KELULUSAN_PINJAMAN">Kelulusan Pembiayaan</option>
                  <option value="MANUAL_BROADCAST">Hebahan Manual / Pukal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tajuk Mesej</label>
                <input
                  type="text"
                  value={tmplFormData.tajuk || ''}
                  onChange={(e) => setTmplFormData(prev => ({ ...prev, tajuk: e.target.value }))}
                  placeholder="e.g. Pengesahan Pembayaran Syer Koperasi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-400">Kandungan Templat</label>
                  <span className="text-[10px] text-emerald-400">Klik tag untuk masukkan</span>
                </div>
                {/* Tag chips */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {['{nama}', '{noAhli}', '{jumlah}', '{noResit}', '{tarikh}', '{perihal}', '{koperasi}', '{linkResit}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTmplFormData(prev => ({ ...prev, kandungan: (prev.kandungan || '') + ' ' + tag }))}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 rounded text-[10px] font-mono cursor-pointer transition-all"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={5}
                  value={tmplFormData.kandungan || ''}
                  onChange={(e) => setTmplFormData(prev => ({ ...prev, kandungan: e.target.value }))}
                  placeholder="Tulis templat anda dengan pembolehubah {nama}, {jumlah}, dsb..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!tmplFormData.nama || !tmplFormData.kandungan) {
                    alert('Sila lengkapkan nama dan kandungan templat.');
                    return;
                  }
                  if (editingTemplate) {
                    await onUpdateTemplate(editingTemplate.id, tmplFormData);
                  } else {
                    const newTmpl: NotificationTemplate = {
                      id: `TMPL-${Date.now()}`,
                      kod: tmplFormData.kod || `TMPL_${Date.now().toString().slice(-4)}`,
                      nama: tmplFormData.nama || '',
                      saluran: tmplFormData.saluran || 'WHATSAPP',
                      pencetus: tmplFormData.pencetus || 'MANUAL_BROADCAST',
                      tajuk: tmplFormData.tajuk || 'Notifikasi Koperasi',
                      kandungan: tmplFormData.kandungan || '',
                      aktif: true,
                      pembolehUbah: ['{nama}', '{noAhli}', '{jumlah}', '{koperasi}']
                    };
                    await onAddTemplate(newTmpl);
                  }
                  setShowTemplateModal(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {editingTemplate ? 'Simpan Perubahan' : 'Cipta Templat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
