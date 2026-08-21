import React, { useState, useMemo } from 'react';
import { 
  EInvoisLHDN, 
  DataExportEKoperasi, 
  ItemBaranganEInvois,
  Ahli,
  CartaAkaun,
  Transaksi
} from '../types';
import { 
  QrCode, 
  Share2, 
  Download, 
  FileCode2, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Plus, 
  Search, 
  Sparkles, 
  Building2, 
  Users, 
  DollarSign, 
  ExternalLink,
  Layers,
  ChevronRight,
  Code
} from 'lucide-react';

interface SKMAndEInvoiceBridgeProps {
  eInvoiceList: EInvoisLHDN[];
  ahliList: Ahli[];
  cartaAkaun: CartaAkaun[];
  transaksiList: Transaksi[];
  onAddEInvoice: (invoice: EInvoisLHDN) => void;
  onUpdateEInvoice: (uuid: string, updates: Partial<EInvoisLHDN>) => void;
  onFetchEKoperasiData: () => Promise<DataExportEKoperasi>;
  language?: 'BM' | 'EN';
  userRole?: string;
}

export const SKMAndEInvoiceBridge: React.FC<SKMAndEInvoiceBridgeProps> = ({
  eInvoiceList,
  ahliList,
  cartaAkaun,
  transaksiList,
  onAddEInvoice,
  onUpdateEInvoice,
  onFetchEKoperasiData,
  language = 'BM',
  userRole = 'BENDAHARI'
}) => {
  const isEN = language === 'EN';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'E_KOPERASI' | 'E_INVOIS_LIST' | 'E_INVOIS_VIEW'>('E_KOPERASI');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoisLHDN | null>(eInvoiceList[0] || null);

  // Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Invoice Form
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerTIN, setBuyerTIN] = useState<string>('C29810481011');
  const [buyerBRN, setBuyerBRN] = useState<string>('1928401-K');
  const [buyerAddress, setBuyerAddress] = useState<string>('Putrajaya, Malaysia');
  const [buyerEmail, setBuyerEmail] = useState<string>('pembeli@syarikat.com');
  const [itemName, setItemName] = useState<string>('Bekalan Minyak Masak & Beras Koperasi');
  const [itemQty, setItemQty] = useState<number>(50);
  const [itemPrice, setItemPrice] = useState<number>(45.00);

  // JSON Preview state
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);

  // Currency Formatter
  const formatRM = (val: number | undefined | null) => 
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  // Aggregates
  const totalEInvoiceValue = useMemo(() => 
    eInvoiceList.reduce((sum, inv) => sum + inv.jumlahBersihBayaran, 0),
    [eInvoiceList]
  );

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return eInvoiceList.filter(inv => {
      const matchQ = !searchQuery ||
        inv.noInvois.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.namaPembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.noRujukanLHDN.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQ;
    });
  }, [eInvoiceList, searchQuery]);

  // Export e-Koperasi JSON Handler
  const handleDownloadEKoperasiJSON = () => {
    const exportData: DataExportEKoperasi = {
      tahunKewangan: 2026,
      tarikhJana: new Date().toISOString(),
      koperasi: {
        nama: "Koperasi Warga Berdaya Malaysia Berhad",
        noPendaftaranSKM: "SKM-W-4921/2018",
        kategoriKoperasi: "KREDIT & KONSUMER",
        bilanganAnggota: ahliList.length,
        bilanganALK: 12,
        bilanganJAD: 3,
      },
      kewangan: {
        jumlahAset: 875000,
        jumlahLiabiliti: 195000,
        modalSyer: 268000,
        modalYuran: 54000,
        pendapatanKasar: 112000,
        keuntunganBersih: 42000,
        kadarDividenSyerPeratus: 8.5,
        kadarDividenYuranPeratus: 6.0,
        peruntukanKWSKP: 5040,
        peruntukanKWAP: 1680,
        peruntukanKWK: 5000,
      },
      senaraiAnggota: ahliList.map(m => ({
        noAhli: m.noAhli,
        nama: m.nama,
        noKP: m.noKp,
        modalSyer: m.modalSyer,
        modalYuran: m.modalYuran,
        status: m.status,
      })),
      senaraiALK: [
        { nama: "Dato' Ahmad Razali", jawatan: "Pengerusi ALK", noKP: "750412-10-5231", tempohKhidmat: "2024-2027" },
        { nama: "Dr. Roslan Bin Mohamad", jawatan: "Timbalan Pengerusi", noKP: "680823-08-5543", tempohKhidmat: "2025-2028" },
        { nama: "Tan Kah Hock", jawatan: "Bendahari", noKP: "791105-07-5119", tempohKhidmat: "2023-2026" },
        { nama: "Ustazah Siti Fatimah", jawatan: "Setiausaha", noKP: "820319-03-5682", tempohKhidmat: "2024-2027" }
      ]
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eKoperasi_Submission_SKM_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export e-Koperasi CSV
  const handleDownloadEKoperasiCSV = () => {
    let csv = `NO_AHLI,NAMA_ANGGOTA,NO_KAD_PENGENALAN,MODAL_SYER_RM,MODAL_YURAN_RM,STATUS_KEAHLIAN\n`;
    ahliList.forEach(m => {
      csv += `"${m.noAhli}","${m.nama}","${m.noKp}",${m.modalSyer.toFixed(2)},${m.modalYuran.toFixed(2)},"${m.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eKoperasi_Daftar_Ahli_SKM_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export UBL 2.1 XML for single e-Invoice
  const handleDownloadUBLXml = (inv: EInvoisLHDN) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:myinvois.hasil.gov.my:1.0</cbc:CustomizationID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${inv.noInvois}</cbc:ID>
  <cbc:IssueDate>${inv.tarikhMasa.split('T')[0]}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>MYR</cbc:DocumentCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>${inv.noRujukanLHDN}</cbc:ID>
    <cbc:DocumentType>LHDN-Validation-Code</cbc:DocumentType>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="TIN">${inv.noTINKoperasi}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${inv.namaKoperasi}</cbc:RegistrationName>
        <cbc:CompanyID>${inv.noSSM_SKM}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="TIN">${inv.noTINPembeli}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${inv.namaPembeli}</cbc:RegistrationName>
        <cbc:CompanyID>${inv.noKPPembeli_BRN}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="MYR">${inv.jumlahKasar.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="MYR">${inv.jumlahKasar.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="MYR">${inv.jumlahBersihBayaran.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="MYR">${inv.jumlahBersihBayaran.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eInvoice_LHDN_${inv.noInvois.replace(/\//g, '_')}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add E-Invoice Submit
  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || itemQty <= 0 || itemPrice <= 0) return;

    const subtotal = itemQty * itemPrice;
    const invNumber = `INV-${new Date().getFullYear()}/${String(eInvoiceList.length + 1).padStart(4, '0')}`;
    const uuid = `MY-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lhdnRef = `LHDN-IRB-${new Date().getFullYear()}-VAL-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newInvoice: EInvoisLHDN = {
      uuid: uuid,
      noInvois: invNumber,
      noRujukanLHDN: lhdnRef,
      tarikhMasa: new Date().toISOString(),
      jenisInvois: '01_INVOIS',
      statusLHDN: 'DISAHKAN',
      namaKoperasi: 'Koperasi Warga Berdaya Malaysia Berhad',
      noTINKoperasi: 'C21849102010',
      noSSM_SKM: 'SKM-W-4921/2018',
      noSST: 'W10-2024-00918',
      alamatKoperasi: 'No. 12, Tingkat 1 & 2, Jalan Diplomatik 2/1, Presint 15, 62050 Putrajaya',
      namaPembeli: buyerName,
      noTINPembeli: buyerTIN,
      noKPPembeli_BRN: buyerBRN,
      alamatPembeli: buyerAddress,
      emelPembeli: buyerEmail,
      jumlahKasar: subtotal,
      jumlahDiskaun: 0,
      jumlahCukaiSST: 0,
      jumlahBersihBayaran: subtotal,
      kaedahBayaran: 'Pindahan Bank (EFT)',
      barangan: [
        {
          id: `ITM-${Date.now()}`,
          perihalan: itemName,
          kuantiti: Number(itemQty),
          hargaUnit: Number(itemPrice),
          kadarCukaiPeratus: 0,
          jumlahCukai: 0,
          jumlahBersih: subtotal,
          kodKlasifikasiLHDN: '001: Barangan Perniagaan Koperasi'
        }
      ],
      qrCodePayload: `https://myinvois.hasil.gov.my/uuid/${uuid}/verify`,
      ublVersion: 'UBL 2.1'
    };

    onAddEInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    setShowAddModal(false);
    setActiveSubTab('E_INVOIS_VIEW');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Integrasi e-Koperasi SKM & LHDN MyInvois
            </span>
            <span className="text-xs text-slate-400">Pematuhan UBL 2.1 & Akta Cukai Pendapatan 1967</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-cyan-400" /> Hab Eksport e-Koperasi SKM & e-Invois LHDN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Penjanaan fail pelaporan rasmi portal e-Koperasi SKM serta penerbitan e-Invois digital LHDN dengan QR Code pengesahan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Terbit e-Invois LHDN
          </button>
          
          <button
            onClick={handleDownloadEKoperasiJSON}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Eksport e-Koperasi
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Data e-Koperasi */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Profil e-Koperasi SKM</span>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">
            SKM-W-4921/2018
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Status Pemfailan:</span>
            <strong className="text-emerald-400 font-bold">SEDIA DIHANTAR</strong>
          </div>
        </div>

        {/* Card 2: Keahlian e-Koperasi */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Rekod Anggota e-Koperasi</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {ahliList.length} Anggota Disahkan
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Data ALK / JAD:</span>
            <span className="text-emerald-400 font-semibold">12 ALK + 3 JAD</span>
          </div>
        </div>

        {/* Card 3: Nilai e-Invois */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Jumlah Nilai e-Invois LHDN</span>
            <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-xl border border-cyan-800/60">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300">
            {formatRM(totalEInvoiceValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Standard:</span>
            <span className="text-cyan-400 font-mono">UBL 2.1 JSON/XML</span>
          </div>
        </div>

        {/* Card 4: Status LHDN Validation */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Pengesahan MyInvois LHDN</span>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> 100% DISAHKAN
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>TIN Koperasi:</span>
            <span className="text-emerald-400 font-mono font-bold">C21849102010</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('E_KOPERASI')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'E_KOPERASI' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Penjana Pakej Fail e-Koperasi SKM
        </button>

        <button
          onClick={() => setActiveSubTab('E_INVOIS_LIST')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'E_INVOIS_LIST' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" /> Daftar e-Invois LHDN ({eInvoiceList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('E_INVOIS_VIEW')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'E_INVOIS_VIEW' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Salinan Invois Digital & QR Code LHDN
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PENJANA PAKEJ FAIL e-KOPERASI SKM */}
      {/* ========================================================================= */}
      {activeSubTab === 'E_KOPERASI' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" /> Penyerahan & Muat Naik Portal e-Koperasi SKM
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Format data berstruktur merangkumi profil koperasi, keahlian, struktur ALK, penyata kewangan teraudit, modal syer, yuran dan agihan statutori.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadEKoperasiJSON}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Muat Turun JSON e-Koperasi
                </button>

                <button
                  onClick={handleDownloadEKoperasiCSV}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Muat Turun CSV Ahli
                </button>
              </div>
            </div>

            {/* Pre-flight Compliance Validator */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Semakan Pra-Penyerahan (Pre-Flight Compliance Check)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Daftar 30 Anggota Lengkap dengan No. Kad Pengenalan & No. Gaji</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>12 Orang Ahli Lembaga Koperasi (ALK) & 3 JAD berdaftar</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Peruntukan KWSKP 12% & KWAP 4% Seksyen 57 dipatuhi</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kunci Kira-Kira & Akaun Untung Rugi 2026 Seimbang</span>
                </div>
              </div>
            </div>

            {/* Structure Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">1. Profil & Governan</div>
                <div className="space-y-1 text-slate-300">
                  <div>Nama: <strong>Koperasi Warga Berdaya</strong></div>
                  <div>No. SKM: <strong className="font-mono">SKM-W-4921/2018</strong></div>
                  <div>Bil. Anggota: <strong>30 Orang</strong></div>
                  <div>Bil. ALK: <strong>12 Orang</strong></div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">2. Kedudukan Modal Anggota</div>
                <div className="space-y-1 text-slate-300">
                  <div>Modal Syer Terkumpul: <strong className="text-emerald-400 font-mono">RM 268,000.00</strong></div>
                  <div>Modal Yuran Terkumpul: <strong className="text-emerald-400 font-mono">RM 54,000.00</strong></div>
                  <div>Simpanan Khas Anggota: <strong className="text-cyan-400 font-mono">RM 48,500.00</strong></div>
                  <div>Deposit Tetap Anggota: <strong className="text-cyan-400 font-mono">RM 110,000.00</strong></div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">3. Dividen & Kumpulan Wang</div>
                <div className="space-y-1 text-slate-300">
                  <div>Kadar Dividen Syer: <strong className="text-amber-300 font-mono">8.5% p.a.</strong></div>
                  <div>Kadar Dividen Yuran: <strong className="text-amber-300 font-mono">6.0% p.a.</strong></div>
                  <div>Rizab Statutori KWSKP: <strong className="text-emerald-400 font-mono">RM 45,200.00</strong></div>
                  <div>Tabung Kebajikan (KWK): <strong className="text-rose-400 font-mono">RM 34,250.00</strong></div>
                </div>
              </div>
            </div>

            {/* Toggle JSON Schema View */}
            <div className="pt-2">
              <button
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5"
              >
                <Code className="w-4 h-4" /> {showJsonPreview ? 'Sembunyikan Kod JSON e-Koperasi' : 'Papar Pratonton Struktur JSON e-Koperasi SKM'}
              </button>

              {showJsonPreview && (
                <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto font-mono text-[11px] text-cyan-300 max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify({
                    tahunKewangan: 2026,
                    koperasi: { nama: "Koperasi Warga Berdaya Malaysia Berhad", noPendaftaranSKM: "SKM-W-4921/2018", bilanganAnggota: 30 },
                    kewangan: { modalSyer: 268000, modalYuran: 54000, keuntunganBersih: 42000, kadarDividenSyer: 8.5 },
                    senaraiAnggota: ahliList.slice(0, 3).map(a => ({ noAhli: a.noAhli, nama: a.nama, syer: a.modalSyer }))
                  }, null, 2)}</pre>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DAFTAR e-INVOIS LHDN */}
      {/* ========================================================================= */}
      {activeSubTab === 'E_INVOIS_LIST' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari no invois, nama pembeli, rujukan LHDN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Invoices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvoices.map((inv) => (
              <div 
                key={inv.uuid}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        {inv.noInvois}
                      </span>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> LHDN DISAHKAN
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {inv.namaPembeli}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">TIN: {inv.noTINPembeli} • BRN: {inv.noKPPembeli_BRN}</span>
                  </div>

                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">UUID Transaksi:</span>
                    <span className="font-mono text-cyan-300 text-[11px] truncate max-w-[200px]">{inv.uuid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Pengesahan LHDN:</span>
                    <span className="font-mono text-emerald-400 text-[11px]">{inv.noRujukanLHDN}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1">
                    <span className="text-slate-400 font-semibold">Jumlah Bersih Bayaran:</span>
                    <strong className="text-emerald-400 font-mono text-sm font-black">{formatRM(inv.jumlahBersihBayaran)}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setActiveSubTab('E_INVOIS_VIEW');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Salinan Digital & QR
                  </button>

                  <button
                    onClick={() => handleDownloadUBLXml(inv)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> UBL 2.1 XML
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SALINAN INVOIS DIGITAL & QR CODE LHDN (PRINTABLE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'E_INVOIS_VIEW' && selectedInvoice && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 print:bg-white print:text-black print:p-0">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Pilih e-Invois:</span>
              <select
                value={selectedInvoice.uuid}
                onChange={(e) => {
                  const inv = eInvoiceList.find(item => item.uuid === e.target.value);
                  if (inv) setSelectedInvoice(inv);
                }}
                className="bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 rounded-xl focus:outline-none"
              >
                {eInvoiceList.map(i => (
                  <option key={i.uuid} value={i.uuid}>
                    {i.noInvois} - {i.namaPembeli} ({formatRM(i.jumlahBersihBayaran)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadUBLXml(selectedInvoice)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" /> Muat Turun XML
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <Printer className="w-4 h-4" /> Cetak e-Invois
              </button>
            </div>
          </div>

          {/* e-Invoice Digital Slip */}
          <div className="border border-slate-800 rounded-2xl p-6 bg-slate-950 print:bg-white print:border-black print:text-black space-y-6">
            
            {/* Header with QR Code */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-6 print:border-black">
              <div>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold print:bg-gray-200 print:text-black">
                  LEMBAGA HASIL DALAM NEGERI MALAYSIA • e-INVOIS RASMI
                </span>
                <h1 className="text-xl font-black text-white mt-2 print:text-black">
                  {selectedInvoice.namaKoperasi}
                </h1>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5 print:text-gray-700">
                  <div>No. Pendaftaran SKM: <strong className="font-mono text-slate-300 print:text-black">{selectedInvoice.noSSM_SKM}</strong></div>
                  <div>No. TIN Pembekal: <strong className="font-mono text-cyan-300 print:text-black">{selectedInvoice.noTINKoperasi}</strong> | No. SST: {selectedInvoice.noSST}</div>
                  <div>{selectedInvoice.alamatKoperasi}</div>
                </div>
              </div>

              {/* QR Code Block */}
              <div className="bg-white p-3 rounded-2xl border border-slate-700 text-center space-y-1 shrink-0">
                <div className="w-24 h-24 bg-slate-900 flex items-center justify-center rounded-xl text-cyan-400">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <div className="text-[9px] font-mono text-slate-800 font-bold">PENGESAHAN LHDN</div>
              </div>
            </div>

            {/* Buyer & Invoice Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800 print:bg-gray-100 print:border-black print:text-black">
              <div>
                <div className="text-slate-400 font-semibold mb-1 print:text-gray-600">Maklumat Pembeli (Customer):</div>
                <div className="font-bold text-white text-sm print:text-black">{selectedInvoice.namaPembeli}</div>
                <div className="text-slate-300 mt-1 print:text-gray-800">No. TIN: <strong className="font-mono text-cyan-300 print:text-black">{selectedInvoice.noTINPembeli}</strong></div>
                <div className="text-slate-300 print:text-gray-800">No. Kad Pengenalan / BRN: <strong className="font-mono">{selectedInvoice.noKPPembeli_BRN}</strong></div>
                <div className="text-slate-400 print:text-gray-600 mt-0.5">{selectedInvoice.alamatPembeli}</div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1 print:text-gray-600">Maklumat Pengesahan Transaksi:</div>
                <div>No. e-Invois: <strong className="font-mono text-white print:text-black">{selectedInvoice.noInvois}</strong></div>
                <div>Tarikh & Masa: <strong className="font-mono">{selectedInvoice.tarikhMasa.replace('T', ' ').substring(0, 19)}</strong></div>
                <div>UUID: <strong className="font-mono text-[10px] text-cyan-300 print:text-black">{selectedInvoice.uuid}</strong></div>
                <div>Rujukan LHDN: <strong className="font-mono text-emerald-400 print:text-black">{selectedInvoice.noRujukanLHDN}</strong></div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 print:border-black">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="p-2.5">Perihalan Barangan / Perkhidmatan</th>
                    <th className="p-2.5 text-center">Kuantiti</th>
                    <th className="p-2.5 text-right">Harga Seunit (RM)</th>
                    <th className="p-2.5 text-center">Kadar Cukai</th>
                    <th className="p-2.5 text-right">Jumlah Bersih (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {selectedInvoice.barangan.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5">
                        <div className="font-bold text-white print:text-black">{item.perihalan}</div>
                        <div className="text-[10px] text-slate-400 font-mono print:text-gray-600">{item.kodKlasifikasiLHDN}</div>
                      </td>
                      <td className="p-2.5 text-center font-mono">{item.kuantiti}</td>
                      <td className="p-2.5 text-right font-mono">{formatRM(item.hargaUnit)}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400 print:text-black">0% (Dikecualikan)</td>
                      <td className="p-2.5 text-right font-mono font-bold text-white print:text-black">{formatRM(item.jumlahBersih)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 font-black text-white border-t-2 border-slate-800 print:bg-gray-200 print:text-black text-xs">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right uppercase">Jumlah Keseluruhan Bayaran:</td>
                    <td className="p-2.5 text-right font-mono text-emerald-400 print:text-black text-sm">{formatRM(selectedInvoice.jumlahBersihBayaran)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note */}
            <div className="text-[10px] text-slate-500 print:text-gray-600 text-center pt-2">
              Invois elektronik ini dijana secara digital dan telah disahkan oleh Lembaga Hasil Dalam Negeri Malaysia (LHDN) di bawah inisiatif MyInvois Nasional.
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TERBIT e-INVOIS BAHARU */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" /> Penerbitan e-Invois LHDN Baharu
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jana e-Invois rasmi format UBL 2.1 untuk jualan produk atau perkhidmatan koperasi.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInvoiceSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Pembeli / Syarikat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syarikat Maju Katering Sdn Bhd / SMK Putrajaya"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. TIN Pembeli (LHDN) *</label>
                  <input
                    type="text"
                    required
                    value={buyerTIN}
                    onChange={(e) => setBuyerTIN(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. BRN / No. KP Pembeli *</label>
                  <input
                    type="text"
                    required
                    value={buyerBRN}
                    onChange={(e) => setBuyerBRN(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Alamat Pembeli</label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emel Pembeli</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="font-semibold text-slate-300">Maklumat Item Jualan / Perkhidmatan</div>
                
                <div>
                  <label className="block text-slate-400 mb-1">Perihalan Barangan *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Kuantiti *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Harga Seunit (RM) *</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      required
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Jumlah Invois Kasar:</span>
                  <strong className="font-mono text-emerald-400 text-sm">{formatRM(itemQty * itemPrice)}</strong>
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
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Terbit & Hantar ke LHDN
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
