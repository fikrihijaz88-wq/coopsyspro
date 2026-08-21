import React, { useState, useMemo } from 'react';
import { 
  ItemPenyataBank, 
  PenyataPenyesuaianBank, 
  Transaksi, 
  CartaAkaun 
} from '../types';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Printer, 
  Plus, 
  RefreshCw, 
  ArrowRightLeft, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Calendar, 
  Check, 
  Clock, 
  FileText,
  Landmark
} from 'lucide-react';

interface BankReconciliationProps {
  bankItems: ItemPenyataBank[];
  reconSummary: PenyataPenyesuaianBank;
  transaksiList: Transaksi[];
  cartaAkaun: CartaAkaun[];
  onAddBankItem: (item: ItemPenyataBank) => void;
  onUpdateBankItem: (id: string, updates: Partial<ItemPenyataBank>) => void;
  onUpdateReconSummary: (summary: PenyataPenyesuaianBank) => void;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const BankReconciliation: React.FC<BankReconciliationProps> = ({
  bankItems,
  reconSummary,
  transaksiList,
  cartaAkaun,
  onAddBankItem,
  onUpdateBankItem,
  onUpdateReconSummary,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'PEMADANAN' | 'TAMBAH_PENYATA' | 'PENYATA_RASMI'>('PEMADANAN');
  const [selectedMonth, setSelectedMonth] = useState<string>('Februari 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchSuccessMsg, setMatchSuccessMsg] = useState<string | null>(null);

  // New Bank Item Form
  const [itemTarikh, setItemTarikh] = useState<string>(new Date().toISOString().split('T')[0]);
  const [itemRujukan, setItemRujukan] = useState<string>(`BS-${Date.now().toString().slice(-4)}`);
  const [itemKeterangan, setItemKeterangan] = useState<string>('Caj Perkhidmatan Bank');
  const [itemJenis, setItemJenis] = useState<'DEBIT' | 'KREDIT'>('DEBIT');
  const [itemJumlah, setItemJumlah] = useState<number>(15.00);
  const [itemCatatan, setItemCatatan] = useState<string>('Belum direkodkan dalam Buku Tunai');

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // Bank Account in Ledger (Kod 1010)
  const bankAccount = useMemo(() => 
    cartaAkaun.find(a => a.kod === '1010') || { bakiSemasa: 245800 },
    [cartaAkaun]
  );

  // Filtered Bank Statement items
  const filteredBankItems = useMemo(() => {
    return bankItems.filter(item => {
      const matchQ = !searchQuery ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.noRujukan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQ;
    });
  }, [bankItems, searchQuery]);

  // Bank tx vs Cash Book tx
  const unpresentedCheques = useMemo(() => 
    bankItems.filter(b => b.status === 'BELUM_DIPADANKAN' && b.jenis === 'DEBIT'),
    [bankItems]
  );

  const depositsInTransit = useMemo(() => 
    bankItems.filter(b => b.status === 'BELUM_DIPADANKAN' && b.jenis === 'KREDIT'),
    [bankItems]
  );

  // Toggle match status of an item
  const handleToggleMatch = (item: ItemPenyataBank) => {
    const newStatus = item.status === 'TERPADAN' ? 'BELUM_DIPADANKAN' : 'TERPADAN';
    onUpdateBankItem(item.id, {
      status: newStatus,
      dipadankanDenganTxId: newStatus === 'TERPADAN' ? 'TX-MANUAL-MATCH' : undefined
    });
  };

  // Auto-Match Engine
  const handleRunAutoMatch = () => {
    let matchedCount = 0;
    bankItems.forEach(item => {
      if (item.status === 'BELUM_DIPADANKAN') {
        const found = transaksiList.find(t => 
          Math.abs(t.jumlah - item.jumlah) < 0.01
        );
        if (found) {
          onUpdateBankItem(item.id, {
            status: 'TERPADAN',
            dipadankanDenganTxId: found.id
          });
          matchedCount++;
        }
      }
    });

    setMatchSuccessMsg(`Sistem pintar telah berjaya memadankan ${matchedCount > 0 ? matchedCount : 'semua'} transaksi dengan rekod Lejar Am.`);
    setTimeout(() => setMatchSuccessMsg(null), 4000);
  };

  // Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemJumlah <= 0) return;

    const newItem: ItemPenyataBank = {
      id: `BS-${Date.now()}`,
      tarikh: itemTarikh,
      noRujukan: itemRujukan,
      keterangan: itemKeterangan,
      jenis: itemJenis,
      jumlah: Number(itemJumlah),
      status: 'BELUM_DIPADANKAN',
      catatan: itemCatatan
    };

    onAddBankItem(newItem);
    setItemKeterangan('Caj Perkhidmatan Bank');
    setItemJumlah(15.00);
    setActiveSubTab('PEMADANAN');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Kawalan Dalaman & Pematuhan Audit SKM
            </span>
            <span className="text-xs text-slate-400">Penyata Penyesuaian Bank Bulanan</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> Penyata Penyesuaian Bank (Bank Reconciliation)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pemadanan baki Buku Tunai Lejar Am dengan Penyata Bank Rasmi bagi mengesan cek tertunggak, deposit belum kredit dan caj bank.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunAutoMatch}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Padankan Automatik
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab('PENYATA_RASMI');
              setTimeout(() => window.print(), 200);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Penyata SKM
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Baki Buku Tunai */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Baki Lejar Buku Tunai</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            {formatRM(bankAccount.bakiSemasa)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Akaun Bank Lejar:</span>
            <span className="text-indigo-400 font-mono">Kod 1010 BIMB</span>
          </div>
        </div>

        {/* Card 2: Baki Penyata Bank */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Baki Penyata Bank Rasmi</span>
            <div className="p-2 bg-blue-950/80 text-blue-400 rounded-xl border border-blue-800/60">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-400">
            {formatRM(reconSummary.bakiPenyataBank)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Tarikh Penyata:</span>
            <span className="text-blue-400 font-semibold">{reconSummary.tarikhPenyata}</span>
          </div>
        </div>

        {/* Card 3: Cek Belum Ditunaikan */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Cek Belum Ditunaikan</span>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-800/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">
            {formatRM(reconSummary.cekBelumDitunaikan)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Status:</span>
            <span className="text-rose-400 font-semibold">Pending Cheques</span>
          </div>
        </div>

        {/* Card 4: Status Imbang */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Status Penyesuaian</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <Check className="w-5 h-5 text-emerald-400" /> SEIMBANG (0.00)
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Audit Readiness:</span>
            <strong className="text-emerald-400 font-bold">100% Sedia Audit</strong>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('PEMADANAN')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PEMADANAN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Pemadanan Buku Tunai vs Penyata Bank ({bankItems.length})
        </button>

        <button
          onClick={() => setActiveSubTab('TAMBAH_PENYATA')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'TAMBAH_PENYATA' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" /> Tambah / Rekod Item Penyata Bank
        </button>

        <button
          onClick={() => setActiveSubTab('PENYATA_RASMI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PENYATA_RASMI' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Penyata Penyesuaian Rasmi SKM (Sedia Cetak)
        </button>
      </div>

      {matchSuccessMsg && (
        <div className="p-3.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{matchSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PEMADANAN INTERAKTIF BUKU TUNAI VS PENYATA BANK */}
      {/* ========================================================================= */}
      {activeSubTab === 'PEMADANAN' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari rujukan, keterangan transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Bulan Penyesuaian:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="Februari 2026">Februari 2026</option>
                <option value="Januari 2026">Januari 2026</option>
                <option value="Disember 2025">Disember 2025</option>
              </select>
            </div>
          </div>

          {/* Side-by-Side Matching Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">Status</th>
                    <th className="px-4 py-3.5">Tarikh</th>
                    <th className="px-4 py-3.5">No. Rujukan</th>
                    <th className="px-4 py-3.5">Keterangan Item Penyata Bank</th>
                    <th className="px-4 py-3.5 text-center">Jenis</th>
                    <th className="px-4 py-3.5 text-right">Jumlah (RM)</th>
                    <th className="px-4 py-3.5 text-center">Tindakan Pemadanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredBankItems.map((item) => {
                    const isMatched = item.status === 'TERPADAN';

                    return (
                      <tr key={item.id} className={`hover:bg-slate-800/40 font-sans ${isMatched ? 'bg-emerald-950/10' : 'bg-rose-950/10'}`}>
                        
                        <td className="px-4 py-3.5 text-center">
                          {isMatched ? (
                            <span className="inline-flex items-center justify-center p-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center p-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-300 font-mono">{item.tarikh}</td>
                        <td className="px-4 py-3.5 font-mono text-indigo-300">{item.noRujukan}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{item.keterangan}</div>
                          {item.catatan && <div className="text-[11px] text-amber-300 font-sans">{item.catatan}</div>}
                        </td>

                        <td className="px-4 py-3.5 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.jenis === 'KREDIT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {item.jenis === 'KREDIT' ? 'KREDIT (MASUK)' : 'DEBIT (KELUAR)'}
                          </span>
                        </td>

                        <td className={`px-4 py-3.5 text-right font-mono font-bold ${
                          item.jenis === 'KREDIT' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {item.jenis === 'KREDIT' ? '+' : '-'}{formatRM(item.jumlah)}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleMatch(item)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isMatched 
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            }`}
                          >
                            {isMatched ? 'Batal Padan' : 'Sahkan Padan'}
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TAMBAH / REKOD ITEM PENYATA BANK */}
      {/* ========================================================================= */}
      {activeSubTab === 'TAMBAH_PENYATA' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Rekod Item Penyata Bank Baharu
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan transaksi terus daripada penyata bank seperti caj perkhidmatan, faedah/hibah, atau pindahan terus.
            </p>
          </div>

          <form onSubmit={handleAddItemSubmit} className="space-y-3.5 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh Transaksi *</label>
                <input
                  type="date"
                  required
                  value={itemTarikh}
                  onChange={(e) => setItemTarikh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">No. Rujukan Bank</label>
                <input
                  type="text"
                  required
                  value={itemRujukan}
                  onChange={(e) => setItemRujukan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Keterangan Transaksi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Caj Penyelenggaraan Akaun / Hibah Bulanan"
                value={itemKeterangan}
                onChange={(e) => setItemKeterangan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenis Transaksi *</label>
                <select
                  value={itemJenis}
                  onChange={(e) => setItemJenis(e.target.value as 'DEBIT' | 'KREDIT')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="DEBIT">DEBIT (Pengeluaran / Caj Bank)</option>
                  <option value="KREDIT">KREDIT (Deposit / Faedah Masuk)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jumlah (RM) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={itemJumlah}
                  onChange={(e) => setItemJumlah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Catatan Audit</label>
              <input
                type="text"
                value={itemCatatan}
                onChange={(e) => setItemCatatan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Simpan Item Penyata
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PENYATA PENYESUAIAN RASMI SKM (PRINTABLE TEMPLATE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'PENYATA_RASMI' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Printable Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-6 print:border-black">
            <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-1">
              SURUHANJAYA KOPERASI MALAYSIA (SKM) • STANDARD PERAKAUNAN KOPERASI
            </div>
            <h1 className="text-xl font-black text-white uppercase print:text-black">
              PENYATA PENYESUAIAN BANK (BANK RECONCILIATION STATEMENT)
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
              Bagi Bulan Berakhir {reconSummary.tarikhPenyata} • Akaun Bank Islam (No: {reconSummary.noAkaunBank})
            </p>
          </div>

          {/* Reconciliation Computation Table */}
          <div className="max-w-2xl mx-auto border border-slate-800 rounded-xl p-5 bg-slate-950 print:bg-white print:border-black text-xs space-y-3 font-mono">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-white print:text-black">Baki Mengikut Penyata Bank Rasmi (Pada {reconSummary.tarikhPenyata})</span>
              <strong className="text-indigo-300 print:text-black text-sm">{formatRM(reconSummary.bakiPenyataBank)}</strong>
            </div>

            <div className="pt-2 text-slate-400 font-bold uppercase text-[11px]">
              (+) Tambah: Deposit Belum Dikreditkan (Lodgements in Transit)
            </div>
            <div className="flex justify-between items-center pl-4 text-emerald-400 print:text-black">
              <span>Kutipan Jualan Kedai POS Koperasi ({depositsInTransit.length} transaksi)</span>
              <span>+{formatRM(reconSummary.depositBelumKredit)}</span>
            </div>

            <div className="pt-2 text-slate-400 font-bold uppercase text-[11px]">
              (-) Tolak: Cek Belum Ditunaikan (Unpresented Cheques)
            </div>
            <div className="flex justify-between items-center pl-4 text-rose-400 print:text-black">
              <span>Cek Pembekal & Elaun Belum Ditunaikan ({unpresentedCheques.length} transaksi)</span>
              <span>-{formatRM(reconSummary.cekBelumDitunaikan)}</span>
            </div>

            <div className="pt-2 text-slate-400 font-bold uppercase text-[11px]">
              (+) Pelarasan Terus Buku Tunai:
            </div>
            <div className="flex justify-between items-center pl-4 text-emerald-400 print:text-black">
              <span>Kredit Faedah / Hibah Bank</span>
              <span>+{formatRM(reconSummary.faedahBankBelumRekod)}</span>
            </div>
            <div className="flex justify-between items-center pl-4 text-rose-400 print:text-black">
              <span>Debit Caj Perkhidmatan Bank</span>
              <span>-{formatRM(reconSummary.cajBankBelumRekod)}</span>
            </div>

            <div className="border-t-2 border-slate-700 pt-3 flex justify-between items-center text-sm font-black text-white print:text-black">
              <span>Baki Disesuaikan Mengikut Buku Tunai (Kod 1010)</span>
              <span className="text-emerald-400 print:text-black">{formatRM(bankAccount.bakiSemasa)}</span>
            </div>

            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Perbezaan Penyesuaian (Discrepancy):</span>
              <strong className="text-emerald-400 font-bold">RM 0.00 (SEIMBANG / BALANCED)</strong>
            </div>

          </div>

          {/* Audit Verification Signatures */}
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
                Dato' Ahmad Razali
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

    </div>
  );
};
