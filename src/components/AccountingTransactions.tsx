import React, { useState, useEffect } from 'react';
import { CartaAkaun, Transaksi, KategoriAkaun, KategoriTransaksi } from '../types';
import { excelExport } from '../utils/excelExport';
import { 
  BookOpenCheck, 
  Receipt, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Scale, 
  Search, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle,
  Hash,
  Download,
  Sparkles,
  Bot,
  Landmark,
  Banknote,
  Zap,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Info,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface AccountingTransactionsProps {
  cartaAkaun: CartaAkaun[];
  transaksiList: Transaksi[];
  onAddTransaksi: (tx: Transaksi) => void;
  searchQuery: string;
  showNewTxModalDirect: boolean;
  onCloseNewTxModalDirect: () => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

interface AIClassificationResult {
  debitKod: string;
  debitNama: string;
  kreditKod: string;
  kreditNama: string;
  kategori: KategoriTransaksi;
  penjelasan: string;
  pintuStatus: 'TERIMAAN' | 'BAYARAN' | 'SYER' | 'PEMBIAYAAN';
  confidence: number;
}

// Smart SKM Co-op AI Double Entry Rules Engine
const classifyTransactionWithAI = (
  text: string,
  amount: number,
  channel: 'BANK' | 'TUNAI',
  cartaList: CartaAkaun[]
): AIClassificationResult => {
  const lower = text.toLowerCase().trim();
  const bankOrCashCode = channel === 'BANK' ? '1010' : '1020';
  const bankOrCashAccount = cartaList.find(c => c.kod === bankOrCashCode);
  const bankOrCashName = bankOrCashAccount 
    ? `${bankOrCashAccount.kod} - ${bankOrCashAccount.namaAkaun}` 
    : (channel === 'BANK' ? '1010 - Bank Islam Malaysia Berhad' : '1020 - Tunai Di Tangan');

  const getAcc = (kod: string, defaultName: string) => {
    const acc = cartaList.find(c => c.kod === kod);
    return {
      kod,
      nama: acc ? `${acc.kod} - ${acc.namaAkaun}` : `${kod} - ${defaultName}`
    };
  };

  // 1. EXPENSE / OUTFLOW (Bayaran Belanja)
  if (
    lower.includes('sewa') ||
    lower.includes('pejabat') ||
    lower.includes('utiliti') ||
    lower.includes('api') ||
    lower.includes('air') ||
    lower.includes('elektrik') ||
    lower.includes('internet') ||
    lower.includes('bil') ||
    lower.includes('alat tulis') ||
    lower.includes('cetak')
  ) {
    const exp = getAcc('5040', 'Belanja Sewa, Utiliti & Alat Tulis Pejabat');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Bayaran Belanja Operasi/Pejabat. Akaun Belanja (${exp.nama}) DIDEBITKAN (Belanja bertambah), manakala Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} (${bankOrCashName}) DIKREDITKAN kerana pengeluaran wang.`,
      pintuStatus: 'BAYARAN',
      confidence: 99
    };
  }

  if (
    lower.includes('gaji') ||
    lower.includes('kwsp') ||
    lower.includes('perkeso') ||
    lower.includes('staf') ||
    lower.includes('pekerja') ||
    lower.includes('pembantu') ||
    lower.includes('upah')
  ) {
    const exp = getAcc('5010', 'Belanja Gaji & Caruman KWSP/PERKESO Staf');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Bayaran Gaji & Emolumen Staf. Akaun Belanja Gaji (${exp.nama}) DIDEBITKAN dan Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
      pintuStatus: 'BAYARAN',
      confidence: 99
    };
  }

  if (
    lower.includes('elaun') ||
    lower.includes('alk') ||
    lower.includes('lembaga') ||
    lower.includes('pengerusi') ||
    lower.includes('setiausaha') ||
    lower.includes('bendahari')
  ) {
    const exp = getAcc('5020', 'Elaun Ahli Lembaga Koperasi (ALK)');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Elaun ALK. Akaun Elaun (${exp.nama}) DIDEBITKAN & Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
      pintuStatus: 'BAYARAN',
      confidence: 98
    };
  }

  if (
    lower.includes('agm') ||
    lower.includes('mesyuarat') ||
    lower.includes('makanan') ||
    lower.includes('makan') ||
    lower.includes('jamuan') ||
    lower.includes('cenderamata')
  ) {
    const exp = getAcc('5030', 'Belanja Penganjuran Mesyuarat Agung Tahunan (AGM)');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Belanja Penganjuran Mesyuarat/AGM. Akaun Belanja AGM (${exp.nama}) DIDEBITKAN & Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
      pintuStatus: 'BAYARAN',
      confidence: 97
    };
  }

  if (
    lower.includes('audit') ||
    lower.includes('guaman') ||
    lower.includes('peguam') ||
    lower.includes('cukai') ||
    lower.includes('zakat') ||
    lower.includes('skm')
  ) {
    const exp = getAcc('5050', 'Belanja Yuran Audit SKM & Guaman');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Yuran Profesional / Audit SKM. Akaun Belanja Audit (${exp.nama}) DIDEBITKAN & Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
      pintuStatus: 'BAYARAN',
      confidence: 98
    };
  }

  // 2. MEMBER SHARE CAPITAL & FEES (Syer & Yuran Ahli)
  if (
    lower.includes('syer') ||
    lower.includes('modal syer') ||
    lower.includes('syer tambahan')
  ) {
    const eq = getAcc('3010', 'Modal Syer Ahli');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: eq.kod,
      kreditNama: eq.nama,
      kategori: 'YURAN_SYER',
      penjelasan: `AI mengesan transaksi ini sebagai Terimaan Modal Syer Ahli. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN (Aset bertambah), manakala Akaun Modal Syer Ahli (${eq.nama}) DIKREDITKAN mengikut Akta Koperasi 1993.`,
      pintuStatus: 'SYER',
      confidence: 100
    };
  }

  if (
    lower.includes('yuran masuk') ||
    lower.includes('pendaftaran') ||
    lower.includes('yuran pendaftaran')
  ) {
    const rev = getAcc('4030', 'Hasil Yuran Masuk Ahli Baru');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: rev.kod,
      kreditNama: rev.nama,
      kategori: 'YURAN_SYER',
      penjelasan: `AI mengesan transaksi ini sebagai Hasil Yuran Masuk Ahli Baru. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Hasil Yuran Masuk (${rev.nama}) DIKREDITKAN.`,
      pintuStatus: 'TERIMAAN',
      confidence: 99
    };
  }

  if (
    lower.includes('yuran bulanan') ||
    lower.includes('yuran ahli') ||
    lower.includes('caruman bulanan')
  ) {
    const liab = getAcc('2020', 'Yuran Terkumpul Ahli (Tunggakan Yuran)');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: liab.kod,
      kreditNama: liab.nama,
      kategori: 'YURAN_SYER',
      penjelasan: `AI mengesan transaksi ini sebagai Terimaan Yuran Bulanan Ahli. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Liabiliti Yuran Ahli (${liab.nama}) DIKREDITKAN.`,
      pintuStatus: 'SYER',
      confidence: 98
    };
  }

  // 3. MEMBER LOAN / FINANCING (Pembiayaan)
  if (
    lower.includes('pembiayaan') ||
    lower.includes('pinjaman') ||
    lower.includes('bayaran balik') ||
    lower.includes('angsuran') ||
    lower.includes('ansuran')
  ) {
    if (lower.includes('pengeluaran') || lower.includes('agihan') || lower.includes('kelulusan')) {
      const ast = getAcc('1040', 'Pembiayaan Ahli Belum Selesai');
      return {
        debitKod: ast.kod,
        debitNama: ast.nama,
        kreditKod: bankOrCashCode,
        kreditNama: bankOrCashName,
        kategori: 'PEMBIAYAN',
        penjelasan: `AI mengesan transaksi ini sebagai Pengeluaran Pembiayaan Baru Ahli. Akaun Aset Pembiayaan (${ast.nama}) DIDEBITKAN & Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
        pintuStatus: 'PEMBIAYAAN',
        confidence: 98
      };
    } else {
      const ast = getAcc('1040', 'Pembiayaan Ahli Belum Selesai');
      return {
        debitKod: bankOrCashCode,
        debitNama: bankOrCashName,
        kreditKod: ast.kod,
        kreditNama: ast.nama,
        kategori: 'PEMBIAYAN',
        penjelasan: `AI mengesan transaksi ini sebagai Bayaran Balik Pembiayaan Ahli. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Aset Pembiayaan (${ast.nama}) DIKREDITKAN.`,
        pintuStatus: 'PEMBIAYAAN',
        confidence: 97
      };
    }
  }

  // 4. REVENUE / SALES / INFLOW
  if (
    lower.includes('jualan') ||
    lower.includes('kedai') ||
    lower.includes('kantin') ||
    lower.includes('barang') ||
    lower.includes('buku') ||
    lower.includes('perniagaan') ||
    lower.includes('hasil') ||
    lower.includes('kutipan') ||
    lower.includes('komisen')
  ) {
    const rev = getAcc('4010', 'Hasil Jualan Kedai & Perniagaan Koperasi');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: rev.kod,
      kreditNama: rev.nama,
      kategori: 'JUALAN_PERNIAGAAN',
      penjelasan: `AI mengesan transaksi ini sebagai Hasil Jualan Perniagaan. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Hasil (${rev.nama}) DIKREDITKAN.`,
      pintuStatus: 'TERIMAAN',
      confidence: 98
    };
  }

  if (
    lower.includes('dividen terima') ||
    lower.includes('pelaburan') ||
    lower.includes('bank rakyat') ||
    lower.includes('angkasa') ||
    lower.includes('faedah simpanan')
  ) {
    const rev = getAcc('4040', 'Hasil Dividen Pelaburan Syer ANGKASA');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: rev.kod,
      kreditNama: rev.nama,
      kategori: 'JUALAN_PERNIAGAAN',
      penjelasan: `AI mengesan transaksi ini sebagai Hasil Dividen/Pelaburan Diterima. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Hasil Dividen (${rev.nama}) DIKREDITKAN.`,
      pintuStatus: 'TERIMAAN',
      confidence: 99
    };
  }

  // 5. GENERIC ACTION FALLBACKS
  if (lower.includes('bayar') || lower.includes('beli') || lower.includes('caj') || lower.includes('belanja')) {
    const exp = getAcc('5040', 'Belanja Sewa, Utiliti & Alat Tulis Pejabat');
    return {
      debitKod: exp.kod,
      debitNama: exp.nama,
      kreditKod: bankOrCashCode,
      kreditNama: bankOrCashName,
      kategori: 'BELANJA_PENTADBIRAN',
      penjelasan: `AI mengesan transaksi ini sebagai Bayaran / Belanja Pentadbiran General. Akaun Belanja (${exp.nama}) DIDEBITKAN & Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIKREDITKAN.`,
      pintuStatus: 'BAYARAN',
      confidence: 90
    };
  }

  if (lower.includes('terima') || lower.includes('dapat') || lower.includes('masuk')) {
    const rev = getAcc('4010', 'Hasil Jualan Kedai & Perniagaan Koperasi');
    return {
      debitKod: bankOrCashCode,
      debitNama: bankOrCashName,
      kreditKod: rev.kod,
      kreditNama: rev.nama,
      kategori: 'JUALAN_PERNIAGAAN',
      penjelasan: `AI mengesan transaksi ini sebagai Terimaan Wang Masuk General. Akaun ${channel === 'BANK' ? 'Bank' : 'Tunai'} DIDEBITKAN & Akaun Hasil (${rev.nama}) DIKREDITKAN.`,
      pintuStatus: 'TERIMAAN',
      confidence: 90
    };
  }

  // Fallback
  const defaultRev = getAcc('4010', 'Hasil Jualan Kedai & Perniagaan Koperasi');
  return {
    debitKod: bankOrCashCode,
    debitNama: bankOrCashName,
    kreditKod: defaultRev.kod,
    kreditNama: defaultRev.nama,
    kategori: 'JURNAL_AM',
    penjelasan: `AI mengesyorkan kemasukan asas perakaunan berkembar. Sila masukkan perihal terperinci untuk klasifikasi automatik yang lebih tepat.`,
    pintuStatus: 'TERIMAAN',
    confidence: 85
  };
};

export const AccountingTransactions: React.FC<AccountingTransactionsProps> = ({
  cartaAkaun,
  transaksiList,
  onAddTransaksi,
  searchQuery,
  showNewTxModalDirect,
  onCloseNewTxModalDirect,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [activeSubTab, setActiveSubTab] = useState<'jurnal' | 'carta' | 'lejar' | 'bukutunai'>('jurnal');
  const [selectedLedgerKod, setSelectedLedgerKod] = useState<string>('1010'); // Default Bank
  const [showModal, setShowModal] = useState<boolean>(showNewTxModalDirect);

  // Mode Selection: 'AI' (Simplified Auto Double Entry) vs 'MANUAL' (Full Accountant Mode)
  const [entryMode, setEntryMode] = useState<'AI' | 'MANUAL'>('AI');
  const [paymentChannel, setPaymentChannel] = useState<'BANK' | 'TUNAI'>('BANK');
  const [showAccountAdjustments, setShowAccountAdjustments] = useState<boolean>(false);

  // Sync state if opened from props
  useEffect(() => {
    if (showNewTxModalDirect) {
      setShowModal(true);
    }
  }, [showNewTxModalDirect]);

  // Form states for new Transaction
  const [perihal, setPerihal] = useState('');
  const [tarikh, setTarikh] = useState<string>(new Date().toISOString().split('T')[0]);
  const [noRujukan, setNoRujukan] = useState(`RST-2026-${String(transaksiList.length + 1).padStart(4, '0')}`);
  const [debitKod, setDebitKod] = useState('1010');
  const [kreditKod, setKreditKod] = useState('4010');
  const [jumlah, setJumlah] = useState<number>(100);
  const [kategori, setKategori] = useState<KategoriTransaksi>('JURNAL_AM');
  const [aiAnalysis, setAiAnalysis] = useState<AIClassificationResult | null>(null);

  // Year Filter State
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');

  // Real-time AI Classification when user updates perihal, jumlah, or paymentChannel in AI mode
  useEffect(() => {
    if (entryMode === 'AI' && !showAccountAdjustments) {
      const result = classifyTransactionWithAI(perihal, jumlah, paymentChannel, cartaAkaun);
      setAiAnalysis(result);
      setDebitKod(result.debitKod);
      setKreditKod(result.kreditKod);
      setKategori(result.kategori);
    }
  }, [perihal, jumlah, paymentChannel, entryMode, cartaAkaun, showAccountAdjustments]);

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perihal || jumlah <= 0) return;

    const newTx: Transaksi = {
      id: `TX-${Date.now()}`,
      tarikh: tarikh || new Date().toISOString().split('T')[0],
      noRujukan,
      perihal,
      debitAkaunKod: debitKod,
      kreditAkaunKod: kreditKod,
      jumlah: Number(jumlah),
      kategori,
      dikemaskiniOleh: entryMode === 'AI' ? 'Auto-Double Entry AI SKM' : (isEN ? 'Co-op Treasurer' : 'Bendahari Koperasi'),
    };

    onAddTransaksi(newTx);
    setShowModal(false);
    if (onCloseNewTxModalDirect) onCloseNewTxModalDirect();
    
    // Reset form
    setPerihal('');
    setJumlah(100);
    setShowAccountAdjustments(false);
    setNoRujukan(`RST-2026-${String(transaksiList.length + 2).padStart(4, '0')}`);
  };

  // Quick Template Chips for easy entry
  const applyQuickTemplate = (desc: string, val: number, channel: 'BANK' | 'TUNAI') => {
    setPerihal(desc);
    setJumlah(val);
    setPaymentChannel(channel);
  };

  // Ledger Filter for Lejar Am View
  const selectedAkaun = cartaAkaun.find(c => c.kod === selectedLedgerKod);
  const ledgerTransactions = transaksiList.filter(
    tx => tx.debitAkaunKod === selectedLedgerKod || tx.kreditAkaunKod === selectedLedgerKod
  );

  // Filtered transactions for main table
  const filteredTx = transaksiList.filter(tx => {
    const matchesSearch =
      tx.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.noRujukan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.namaAhli && tx.namaAhli.toLowerCase().includes(searchQuery.toLowerCase()));

    const txYear = tx.tarikh ? tx.tarikh.substring(0, 4) : '';
    const matchesYear = selectedYearFilter === 'ALL' || txYear === selectedYearFilter;

    return matchesSearch && matchesYear;
  });

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" /> {isEN ? 'Accounting & SKM General Ledger Module' : 'Modul Perakaunan & Lejar Am SKM'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Standard Chart of Accounts, Double-Entry Journaling (Debit/Credit), Cash Book, & General Ledger.'
              : 'Carta Akaun Piawai, Kemasukan Jurnal Berkembar (Debit/Kredit), Buku Tunai, & Lejar Am Koperasi.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              excelExport.exportGeneralLedger(transaksiList, cartaAkaun, 'Koperasi_Warga_Berdaya');
            }}
            className="px-3.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            title="Eksport Buku Jurnal & Carta Akaun ke Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-teal-300" />
            <span>{isEN ? 'Export Ledger (Excel)' : 'Eksport Lejar (Excel)'}</span>
          </button>

          <button
            onClick={() => {
              setShowModal(true);
              setEntryMode('AI');
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> {isEN ? 'Rekod Transaksi AI (Double Entry)' : 'Rekod Transaksi AI (Auto Double Entry)'}
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('jurnal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubTab === 'jurnal' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? 'Journals & Transactions' : 'Senarai Jurnal & Transaksi'} ({transaksiList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('carta')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubTab === 'carta' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? 'SKM Chart of Accounts' : 'Carta Akaun SKM'} ({cartaAkaun.length})
        </button>
        <button
          onClick={() => setActiveSubTab('lejar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubTab === 'lejar' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? 'General Ledger' : 'Lejar Am (General Ledger)'}
        </button>
        <button
          onClick={() => setActiveSubTab('bukutunai')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubTab === 'bukutunai' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          {isEN ? 'Cash & Bank Book' : 'Buku Tunai & Bank'}
        </button>
      </div>

      {/* SUBTAB 1: JURNAL & TRANSAKSI */}
      {activeSubTab === 'jurnal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Year Filter Header Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">{isEN ? 'Filter Year:' : 'Tapis Tahun Rekod:'}</span>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">{isEN ? 'All Years' : 'Semua Tahun (2023 - 2026)'}</option>
                <option value="2026">2026 ({isEN ? 'Current' : 'Tahun Semasa'})</option>
                <option value="2025">2025 ({isEN ? 'Historical' : 'Tahun Lepas'})</option>
                <option value="2024">2024 ({isEN ? 'Historical' : 'Tahun Lepas'})</option>
                <option value="2023">2023 ({isEN ? 'Historical' : 'Tahun Lepas'})</option>
              </select>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {isEN ? 'Showing' : 'Memaparkan'} <span className="text-emerald-400 font-bold">{filteredTx.length}</span> {isEN ? 'transactions' : 'transaksi'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{isEN ? 'Date / Voucher No.' : 'Tarikh / No. Baucer'}</th>
                  <th className="px-4 py-3.5">{isEN ? 'Particulars / Description' : 'Perihal / Catatan'}</th>
                  <th className="px-4 py-3.5">{isEN ? 'Debit Account (Dr)' : 'Akaun Debit (Dr)'}</th>
                  <th className="px-4 py-3.5">{isEN ? 'Credit Account (Cr)' : 'Akaun Kredit (Cr)'}</th>
                  <th className="px-4 py-3.5 text-right">{isEN ? 'Amount (RM)' : 'Jumlah (RM)'}</th>
                  <th className="px-4 py-3.5">{isEN ? 'Entered By' : 'Dikemaskini Oleh'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTx.map((tx) => {
                  const debitAcc = cartaAkaun.find(c => c.kod === tx.debitAkaunKod);
                  const kreditAcc = cartaAkaun.find(c => c.kod === tx.kreditAkaunKod);
                  const isAiRecorded = tx.dikemaskiniOleh?.includes('AI');

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <span className="text-white block font-bold">{tx.tarikh}</span>
                        <span className="text-slate-500 text-[10px]">{tx.noRujukan}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white block">{tx.perihal}</span>
                        {tx.namaAhli && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {tx.namaAhli} ({tx.noAhli})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-950 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded font-mono font-bold text-[11px] block w-fit">
                          {tx.debitAkaunKod}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {debitAcc?.namaAkaun || 'Akaun Debit'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-950 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded font-mono font-bold text-[11px] block w-fit">
                          {tx.kreditAkaunKod}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {kreditAcc?.namaAkaun || 'Akaun Kredit'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white text-sm">
                        {formatRM(tx.jumlah)}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {isAiRecorded ? (
                          <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" /> Auto-AI SKM
                          </span>
                        ) : (
                          tx.dikemaskiniOleh
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CARTA AKAUN SKM */}
      {activeSubTab === 'carta' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-emerald-400" /> Carta Akaun Piawai Koperasi SKM
            </h3>
            <span className="text-xs text-slate-400 font-mono">Format Akta Koperasi 1993</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartaAkaun.map((akaun) => (
              <div key={akaun.kod} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-emerald-400 rounded border border-slate-800">
                      {akaun.kod}
                    </span>
                    <span className="text-xs font-bold text-white">{akaun.namaAkaun}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Kategori: {akaun.kategori} • Normal: {akaun.jenisBaki}
                  </span>
                  {akaun.notaSKM && (
                    <span className="text-[10px] text-indigo-300/80 block mt-0.5 font-mono">
                      Nota SKM: {akaun.notaSKM}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Baki Semasa</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {formatRM(akaun.bakiSemasa)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: LEJAR AM */}
      {activeSubTab === 'lejar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Papar Lejar Bagi Akaun Spesifik</h3>
              <p className="text-xs text-slate-400">Pilih kod akaun untuk melihat jurnal catatan debit dan kredit lejar am.</p>
            </div>

            <select
              value={selectedLedgerKod}
              onChange={(e) => setSelectedLedgerKod(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold font-mono"
            >
              {cartaAkaun.map((c) => (
                <option key={c.kod} value={c.kod}>
                  {c.kod} - {c.namaAkaun} ({c.kategori})
                </option>
              ))}
            </select>
          </div>

          {selectedAkaun && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Akaun Terpilih:</span>
                <span className="text-sm font-bold text-white">{selectedAkaun.kod} - {selectedAkaun.namaAkaun}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-mono">Baki Semasa Lejar:</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">{formatRM(selectedAkaun.bakiSemasa)}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                <tr>
                  <th className="px-4 py-3">Tarikh / Baucer</th>
                  <th className="px-4 py-3">Perihal</th>
                  <th className="px-4 py-3 text-right">Debit (Dr)</th>
                  <th className="px-4 py-3 text-right">Kredit (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ledgerTransactions.map((tx) => {
                  const isDebit = tx.debitAkaunKod === selectedLedgerKod;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono">
                        <span className="text-white font-bold block">{tx.tarikh}</span>
                        <span className="text-slate-500 text-[10px]">{tx.noRujukan}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{tx.perihal}</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-400 font-bold">
                        {isDebit ? formatRM(tx.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-purple-400 font-bold">
                        {!isDebit ? formatRM(tx.jumlah) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: BUKU TUNAI & BANK */}
      {activeSubTab === 'bukutunai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Buku Tunai & Akaun Bank Operasi
            </h3>
            <p className="text-xs text-slate-400">Ringkasan aliran keluar masuk tunai runcit dan akaun bank utama koperasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">🏛️ Akaun Bank Islam Utama (Kod 1010)</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono block">
                {formatRM(cartaAkaun.find(c => c.kod === '1010')?.bakiSemasa || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">Guna untuk transaksi cek, transfer online & terimaan pembiayaan.</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">💵 Tunai Di Tangan / Peti Tunai (Kod 1020)</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono block">
                {formatRM(cartaAkaun.find(c => c.kod === '1020')?.bakiSemasa || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">Guna untuk perbelanjaan tunai runcit & jualan terus kedai.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REKOD TRANSAKSI PENDAFTARAN RINGKAS AI DOUBLE-ENTRY */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-indigo-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-200" /> AI DOUBLE ENTRY
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Pendaftaran Transaksi Perakaunan SKM
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masukkan perihal & jumlah. AI akan menjana rekod Debit & Kredit berkembar automatik secara bebas ralat.
                </p>
              </div>

              <button 
                onClick={() => {
                  setShowModal(false);
                  if (onCloseNewTxModalDirect) onCloseNewTxModalDirect();
                }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs: Mode AI vs Mode Manual */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEntryMode('AI')}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  entryMode === 'AI' 
                    ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-300" />
                Mode AI Pintar (Automatik)
              </button>

              <button
                type="button"
                onClick={() => setEntryMode('MANUAL')}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  entryMode === 'MANUAL' 
                    ? 'bg-slate-800 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                Mode Manual (Akauntan)
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="space-y-4 text-xs">
              
              {/* No Rujukan Baucer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">No. Resit / Baucer Pembayaran *</label>
                  <input
                    type="text"
                    required
                    value={noRujukan}
                    onChange={(e) => setNoRujukan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tarikh Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={tarikh}
                    onChange={(e) => setTarikh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* SIMPLIFIED AI FORM FIELDS */}
              {entryMode === 'AI' ? (
                <>
                  {/* Step 1: Keterangan Transaksi & Quick Templates */}
                  <div className="space-y-2">
                    <label className="block text-slate-200 font-bold flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-indigo-400" />
                      1. Keterangan / Perihal Transaksi *
                    </label>
                    <input
                      type="text"
                      required
                      value={perihal}
                      onChange={(e) => setPerihal(e.target.value)}
                      placeholder="Taip perihal seperti 'Bayaran sewa pejabat', 'Jualan kedai', 'Terima yuran syer ahli'..."
                      className="w-full bg-slate-950 border border-indigo-900/60 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white font-medium placeholder-slate-500 shadow-inner"
                    />

                    {/* Quick Template Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">Templat Ringkas Koperasi (Klik untuk isi cepat):</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate('Bayaran Sewa Pejabat Koperasi', 1200, 'BANK')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-all"
                        >
                          🏢 Sewa Pejabat (RM1,200)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate('Jualan Kedai & Kantin Koperasi', 350, 'TUNAI')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-all"
                        >
                          🛒 Jualan Kedai (RM350)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate('Bayaran Utiliti Elektrik & Air', 280, 'BANK')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-all"
                        >
                          ⚡ Bil Utiliti (RM280)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate('Terimaan Yuran & Syer Ahli Baru', 260, 'BANK')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-all"
                        >
                          👤 Yuran Ahli Baru (RM260)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate('Elaun Mesyuarat ALK Koperasi', 400, 'BANK')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-all"
                        >
                          💼 Elaun ALK (RM400)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 & 3: Amount & Payment Channel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Amount */}
                    <div>
                      <label className="block text-slate-200 font-bold mb-1">2. Jumlah Transaksi (RM) *</label>
                      <input
                        type="number"
                        min={0.01}
                        step={0.01}
                        required
                        value={jumlah}
                        onChange={(e) => setJumlah(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold text-lg font-mono"
                      />
                    </div>

                    {/* Saluran Bayaran (Bank vs Tunai) */}
                    <div>
                      <label className="block text-slate-200 font-bold mb-1">3. Saluran Bayaran *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentChannel('BANK')}
                          className={`p-2 rounded-xl border font-bold text-center flex flex-col items-center justify-center transition-all ${
                            paymentChannel === 'BANK'
                              ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Landmark className="w-4 h-4 mb-0.5" />
                          <span className="text-[11px]">Akaun Bank</span>
                          <span className="text-[9px] font-mono text-slate-400">Kod 1010</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentChannel('TUNAI')}
                          className={`p-2 rounded-xl border font-bold text-center flex flex-col items-center justify-center transition-all ${
                            paymentChannel === 'TUNAI'
                              ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Banknote className="w-4 h-4 mb-0.5" />
                          <span className="text-[11px]">Peti Tunai</span>
                          <span className="text-[9px] font-mono text-slate-400">Kod 1020</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Step 4: Live AI Double-Entry Generated Preview Box */}
                  <div className="bg-slate-950 border-2 border-indigo-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-amber-300" />
                        <span className="font-extrabold text-white text-xs">Penjanai Double Entry Automatik AI</span>
                      </div>

                      <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> SKM 100% Valid
                      </span>
                    </div>

                    {/* Debit & Credit Result Display Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Debit Result */}
                      <div className="bg-slate-900 border border-blue-900/60 p-3 rounded-xl">
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block mb-1">
                          1. Akaun DEBIT (Dr)
                        </span>
                        <span className="font-mono font-extrabold text-white text-xs block">
                          {aiAnalysis?.debitNama || debitKod}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          (+) Penambahan Aset / Belanja
                        </span>
                      </div>

                      {/* Credit Result */}
                      <div className="bg-slate-900 border border-purple-900/60 p-3 rounded-xl">
                        <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block mb-1">
                          2. Akaun KREDIT (Cr)
                        </span>
                        <span className="font-mono font-extrabold text-white text-xs block">
                          {aiAnalysis?.kreditNama || kreditKod}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          (+) Hasil / Ekuiti ATAU (-) Pengurangan Bank
                        </span>
                      </div>

                    </div>

                    {/* AI Logic Explanation */}
                    {aiAnalysis?.penjelasan && (
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> Logik Perakaunan AI:
                        </span>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          {aiAnalysis.penjelasan}
                        </p>
                      </div>
                    )}

                    {/* Toggle Override Options */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setShowAccountAdjustments(!showAccountAdjustments)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        {showAccountAdjustments ? 'Sembunyikan Pelarasan Akaun' : 'Laras Akaun Debit / Kredit Manual'}
                      </button>
                    </div>

                    {/* Custom Adjustments dropdown if toggled */}
                    {showAccountAdjustments && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <div>
                          <label className="block text-blue-400 text-[10px] font-bold mb-1">Pilih Akaun Debit (Dr):</label>
                          <select
                            value={debitKod}
                            onChange={(e) => setDebitKod(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5"
                          >
                            {cartaAkaun.map(c => (
                              <option key={c.kod} value={c.kod}>{c.kod} - {c.namaAkaun}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-purple-400 text-[10px] font-bold mb-1">Pilih Akaun Kredit (Cr):</label>
                          <select
                            value={kreditKod}
                            onChange={(e) => setKreditKod(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5"
                          >
                            {cartaAkaun.map(c => (
                              <option key={c.kod} value={c.kod}>{c.kod} - {c.namaAkaun}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                  </div>
                </>
              ) : (
                /* MANUAL FULL ACCOUNTANT FORM */
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Kategori Transaksi</label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value as KategoriTransaksi)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="JURNAL_AM">Jurnal Am</option>
                      <option value="YURAN_SYER">Terimaan Syer & Yuran</option>
                      <option value="JUALAN_PERNIAGAAN">Jualan Perniagaan</option>
                      <option value="BELANJA_PENTADBIRAN">Belanja Pentadbiran</option>
                      <option value="PEMBIAYAN">Pembiayaan Ahli</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Perihal Transaksi / Catatan *</label>
                    <input
                      type="text"
                      required
                      value={perihal}
                      onChange={(e) => setPerihal(e.target.value)}
                      placeholder="Perihal penuh transaksi..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-blue-400 mb-1 font-bold">1. Akaun DEBIT (Dr) *</label>
                      <select
                        value={debitKod}
                        onChange={(e) => setDebitKod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                      >
                        {cartaAkaun.map((c) => (
                          <option key={c.kod} value={c.kod}>
                            {c.kod} - {c.namaAkaun}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-purple-400 mb-1 font-bold">2. Akaun KREDIT (Cr) *</label>
                      <select
                        value={kreditKod}
                        onChange={(e) => setKreditKod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                      >
                        {cartaAkaun.map((c) => (
                          <option key={c.kod} value={c.kod}>
                            {c.kod} - {c.namaAkaun}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Jumlah Transaksi (RM) *</label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      required
                      value={jumlah}
                      onChange={(e) => setJumlah(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold text-lg font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onCloseNewTxModalDirect) onCloseNewTxModalDirect();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {entryMode === 'AI' ? 'Sahkan & Simpan Transaksi AI' : 'Simpan Transaksi Jurnal'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
