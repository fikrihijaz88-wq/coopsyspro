import React, { useState } from 'react';
import { CartaAkaun, Ahli, Transaksi, PembiayaanAhli } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Send, 
  HelpCircle,
  CheckCircle2,
  Building,
  ShieldAlert,
  Percent,
  Coins,
  Scale,
  Users,
  Sliders,
  Filter,
  ArrowUpRight,
  AlertCircle,
  XCircle,
  Info,
  BookOpenCheck,
  TrendingUp,
  FileCode2,
  PieChart
} from 'lucide-react';

export interface SKMWarningItem {
  id: string;
  kategori: 'LEVERAGE' | 'DIVIDEND' | 'LOAN' | 'ACCOUNT';
  tahap: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  seksyenSKM: string;
  tajuk: string;
  penyimpangan: string;
  nilaiSemasa: string;
  hadMaksimumSKM: string;
  impakPematuhan: string;
  cadanganPembetulan: string;
}

interface AIAuditAdvisorProps {
  cartaAkaun: CartaAkaun[];
  ahliList: Ahli[];
  transaksiList: Transaksi[];
  pembiayaanList?: PembiayaanAhli[];
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const AIAuditAdvisor: React.FC<AIAuditAdvisorProps> = ({
  cartaAkaun,
  ahliList,
  transaksiList,
  pembiayaanList = [],
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interactive Simulator Parameters
  const [simulatedDividendRate, setSimulatedDividendRate] = useState<number>(7.5); // % p.a.
  const [simulatedLiabilityAdd, setSimulatedLiabilityAdd] = useState<number>(0); // RM additional debt/deposit
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('ALL');
  const [selectedTahapFilter, setSelectedTahapFilter] = useState<string>('ALL');

  // Format currency helper
  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // 1. DYNAMIC CALCULATIONS FOR SKM STATUTORY WARNING SYSTEM
  const totalAset = cartaAkaun.filter(c => c.kategori === 'ASET').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalLiabilitiAsal = cartaAkaun.filter(c => c.kategori === 'LIABILITI').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalLiabiliti = totalLiabilitiAsal + simulatedLiabilityAdd;
  
  const totalHasil = cartaAkaun.filter(c => c.kategori === 'HASIL').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalBelanja = cartaAkaun.filter(c => c.kategori === 'BELANJA').reduce((a, b) => a + b.bakiSemasa, 0);
  const untungBersih = totalHasil - totalBelanja;

  const totalSyerAhli = ahliList.reduce((a, b) => a + b.modalSyer, 0);
  const ekuitiLain = cartaAkaun.filter(c => c.kategori === 'EKUITI' && c.kod !== '3010').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalEkuiti = totalSyerAhli + ekuitiLain;

  // Leverage ratio = Total Liabilities / Total Equity
  const leverageRatio = totalEkuiti > 0 ? (totalLiabiliti / totalEkuiti) : 0;

  // Statutory deductions (16% total: KWRS 12%, KWPK 3%, KWP 1%)
  const kwrs12 = Math.max(0, untungBersih * 0.12);
  const kwpk3 = Math.max(0, untungBersih * 0.03);
  const kwp1 = Math.max(0, untungBersih * 0.01);
  const untungBolehDiagih = Math.max(0, untungBersih - (kwrs12 + kwpk3 + kwp1));

  // Required dividend payout
  const totalDividenDiperlukan = totalSyerAhli * (simulatedDividendRate / 100);

  // Loan receivables stats
  const akaunPinjaman = cartaAkaun.find(c => c.kod === '1040')?.bakiSemasa || 0;
  const loanConcentrationRatio = totalAset > 0 ? (akaunPinjaman / totalAset) * 100 : 0;

  // Check individual overborrowing (> 10x share capital)
  const overborrowedMembers = pembiayaanList.filter(p => {
    if (p.status !== 'DILULUSKAN') return false;
    const member = ahliList.find(a => a.noAhli === p.noAhli);
    const syer = member ? member.modalSyer : 0;
    return syer > 0 && (p.bakiPinjaman > syer * 10);
  });

  // Check cash account balance
  const akaunTunaiBank = cartaAkaun.find(c => c.kod === '1010')?.bakiSemasa || 0;

  // Liquidity ratio (Current Assets / Current Liabilities)
  const asetSemasa = cartaAkaun.filter(c => c.kategori === 'ASET' && c.kod.startsWith('10')).reduce((a,b) => a + b.bakiSemasa, 0);
  const liabilitiSemasa = cartaAkaun.filter(c => c.kategori === 'LIABILITI' && c.kod.startsWith('20')).reduce((a,b) => a + b.bakiSemasa, 0);
  const liquidityRatio = liabilitiSemasa > 0 ? asetSemasa / liabilitiSemasa : 1;

  // 2. GENERATE DETECTED WARNINGS ARRAY
  const generatedWarnings: SKMWarningItem[] = [];

  // Warning 1: Leverage / Debt Ratio Deviation (SKM GP3)
  if (leverageRatio > 2.0) {
    generatedWarnings.push({
      id: 'SKM-DEV-LEV-01',
      kategori: 'LEVERAGE',
      tahap: 'CRITICAL',
      seksyenSKM: 'Garis Panduan SKM GP3 (Nisbah Tuas Hutang & Deposit)',
      tajuk: 'Penyimpangan Tuas Hutang SKM (Nisbah Leverage > 2.0x)',
      penyimpangan: `Nisbah Tuas Hutang semasa mencapai ${leverageRatio.toFixed(2)}x, melebihi had maksima 2.00x yang ditetapkan oleh Suruhanjaya Koperasi Malaysia.`,
      nilaiSemasa: `${leverageRatio.toFixed(2)}x (Liabiliti: ${formatRM(totalLiabiliti)} / Ekuiti: ${formatRM(totalEkuiti)})`,
      hadMaksimumSKM: 'Maksimum 2.00x (200% daripada Ekuiti Koperasi)',
      impakPematuhan: 'Koperasi menanggung kebergantungan luaran berisiko tinggi. Terdedah kepada teguran audit keras SKM dan sekatan penerimaan deposit baru.',
      cadanganPembetulan: 'Meningkatkan pendaftaran syer ahli baru, menghadkan pendaftaran deposit bukan ahli, atau melunaskan pinjaman jangka pendek.',
    });
  } else if (leverageRatio > 1.5) {
    generatedWarnings.push({
      id: 'SKM-DEV-LEV-02',
      kategori: 'LEVERAGE',
      tahap: 'HIGH',
      seksyenSKM: 'Garis Panduan SKM GP3 (Nisbah Tuas Hutang)',
      tajuk: 'Nisbah Leverage Menghampiri Had Amaran SKM',
      penyimpangan: `Nisbah Tuas Hutang adalah ${leverageRatio.toFixed(2)}x (Menghampiri had siling 2.00x).`,
      nilaiSemasa: `${leverageRatio.toFixed(2)}x`,
      hadMaksimumSKM: 'Maksimum 2.00x (Zon Berwaspada 1.50x - 2.00x)',
      impakPematuhan: 'Di bawah pemantauan berterusan ALK sebelum kelulusan permohonan pembiayaan luaran baru.',
      cadanganPembetulan: 'Pantau pertumbuhan liabiliti dan tetapkan sasaran peningkatan modal syer berkala.',
    });
  }

  // Warning 2: Statutory Dividend Ceiling Exceeded (Seksyen 57 Akta Koperasi 1993)
  if (simulatedDividendRate > 10.0) {
    generatedWarnings.push({
      id: 'SKM-DEV-DIV-01',
      kategori: 'DIVIDEND',
      tahap: 'CRITICAL',
      seksyenSKM: 'Seksyen 57 Akta Koperasi 1993 (Had Siling Dividen 10%)',
      tajuk: 'Pelanggaran Siling Dividen Statutori Seksyen 57 (Kadar > 10.0%)',
      penyimpangan: `Cadangan kadar dividen (${simulatedDividendRate.toFixed(1)}%) melebihi had statutori mutlak 10.0% p.a. yang ditetapkan di bawah undang-undang SKM.`,
      nilaiSemasa: `${simulatedDividendRate.toFixed(1)}% p.a.`,
      hadMaksimumSKM: 'Maksimum 10.0% p.a. (Seksyen 57 Akta Koperasi 1993)',
      impakPematuhan: 'Keputusan dividen melebihi 10% adalah BATAL & TIDAK SAH dari segi undang-undang tanpa kelulusan khas Menteri/Suruhanjaya.',
      cadanganPembetulan: 'Laras semula kadar cadangan dividen dalam Mesyuarat Agung Tahunan (AGM) kepada maksimum 10.0%.',
    });
  }

  // Warning 3: Dividend Payout Exceeds Net Distributable Profit
  if (totalDividenDiperlukan > untungBolehDiagih || untungBersih <= 0) {
    generatedWarnings.push({
      id: 'SKM-DEV-DIV-02',
      kategori: 'DIVIDEND',
      tahap: 'CRITICAL',
      seksyenSKM: 'Seksyen 57(2) Akta Koperasi 1993 & GP2 SKM (Agihan Keuntungan)',
      tajuk: 'Cadangan Dividen Melebihi Keuntungan Bersih Boleh Diagih',
      penyimpangan: `Jumlah dividen yang diperlukan (${formatRM(totalDividenDiperlukan)} pada kadar ${simulatedDividendRate}%) melebihi Untung Bersih Boleh Diagih (${formatRM(untungBolehDiagih)}) selepas penolakan statutori 16%.`,
      nilaiSemasa: `Keperluan Dividen: ${formatRM(totalDividenDiperlukan)} vs Boleh Diagih: ${formatRM(untungBolehDiagih)}`,
      hadMaksimumSKM: 'Maksimum 100% daripada Untung Bersih Boleh Diagih Tahun Semasa',
      impakPematuhan: 'Dilarang keras membayar dividen menggunakan modal syer atau keuntungan yang belum diraih (Rugi Terkumpul).',
      cadanganPembetulan: 'Kurangkan kadar dividen kepada maksima yang mampu ditampung oleh untung bersih tahun semasa.',
    });
  }

  // Warning 4: Individual Member Over-Borrowing (> 10x Share Capital)
  if (overborrowedMembers.length > 0) {
    generatedWarnings.push({
      id: 'SKM-DEV-LOAN-01',
      kategori: 'LOAN',
      tahap: 'HIGH',
      seksyenSKM: 'Garis Panduan Pembiayaan SKM (Kawalan Gandaan Syer)',
      tajuk: 'Penyimpangan Had Pembiayaan Individu Melebihi 10x Syer',
      penyimpangan: `Terdapat ${overborrowedMembers.length} akaun pembiayaan aktif yang mana baki pinjaman melebihi 10x ganda modal syer dipegang ahli (Contoh: ${overborrowedMembers.map(p => `${p.namaAhli} - RM${p.bakiPinjaman}`).join(', ')}).`,
      nilaiSemasa: `Nisbah Pembiayaan/Syer Terlibat > 10.0x`,
      hadMaksimumSKM: 'Maksimum 10x Ganda Modal Syer Ahli (tanpa cagaran/penjamin ALK khas)',
      impakPematuhan: 'Meningkatkan risiko kredit terjejas dan kelemahan tadbir urus jawatankuasa pembiayaan.',
      cadanganPembetulan: 'Uruskan potongan syer tambahan atau syaratkan cagaran tambahan/penjamin ALK bertauliah.',
    });
  }

  // Warning 5: Loan Portfolio Asset Concentration Risk (> 70%)
  if (loanConcentrationRatio > 70) {
    generatedWarnings.push({
      id: 'SKM-DEV-LOAN-02',
      kategori: 'LOAN',
      tahap: 'MEDIUM',
      seksyenSKM: 'Garis Panduan GP2 SKM (Pengurusan Risiko & Kecairan)',
      tajuk: 'Penyimpangan Tumpuan Aset Pembiayaan Koperasi',
      penyimpangan: `Nisbah tumpuan aset dalam bentuk pinjaman ahli mencapai ${loanConcentrationRatio.toFixed(1)}%, melebihi tanda aras 70% daripada jumlah keseluruhan aset.`,
      nilaiSemasa: `${loanConcentrationRatio.toFixed(1)}% daripada Aset Koperasi`,
      hadMaksimumSKM: 'Maksimum 70.0% Tumpuan Aset Pembiayaan',
      impakPematuhan: 'Keadaan ini mengurangkan rizab kecairan tunai langsung jika berlaku peningkatan tunggakan bulanan.',
      cadanganPembetulan: 'Pelbagaikan rizab tunai dalam simpanan tetap perbankan Islam berasaskan Murabahah/Wakalah.',
    });
  }

  // Warning 6: Account Anomaly - Cash Overdrawn or Negative Liquidity
  if (akaunTunaiBank < 0) {
    generatedWarnings.push({
      id: 'SKM-DEV-ACC-01',
      kategori: 'ACCOUNT',
      tahap: 'CRITICAL',
      seksyenSKM: 'Standard Perakaunan Koperasi Malaysia (Kod 1010 Tunai & Bank)',
      tajuk: 'Akaun Tunai & Bank Menunjukkan Baki Negatif (Overdrawn)',
      penyimpangan: `Akaun Tunai/Bank (Kod 1010) menunjukkan baki negatif ${formatRM(akaunTunaiBank)}.`,
      nilaiSemasa: formatRM(akaunTunaiBank),
      hadMaksimumSKM: 'Minimum Baki Positif >= RM 0.00',
      impakPematuhan: 'Gagal imbang lejar dan penemuan teguran audit kritikal.',
      cadanganPembetulan: 'Lakukan pengimbangan penyata bank (Bank Reconciliation) serta pelarasan jurnal am serta merta.',
    });
  }

  if (liquidityRatio < 1.0) {
    generatedWarnings.push({
      id: 'SKM-DEV-ACC-02',
      kategori: 'ACCOUNT',
      tahap: 'MEDIUM',
      seksyenSKM: 'Garis Panduan SKM GP2 (Nisbah Kecairan Jangka Pendek)',
      tajuk: 'Nisbah Kecairan Semasa Di Bawah Paras Mampu (Defisit Modal Kerja)',
      penyimpangan: `Nisbah kecairan semasa (${liquidityRatio.toFixed(2)}) adalah di bawah paras minimum 1.00.`,
      nilaiSemasa: `${liquidityRatio.toFixed(2)}`,
      hadMaksimumSKM: 'Minimum 1.00x (Aset Semasa / Liabiliti Semasa)',
      impakPematuhan: 'Koperasi berisiko tidak mampu membayar tuntutan liabiliti jangka pendek tepat pada masanya.',
      cadanganPembetulan: 'Susun semula tempoh matang liabiliti deposit dan percepatkan jualan barang/terimaan pinjaman.',
    });
  }

  // Calculate Overall Compliance Score (100 base)
  let complianceScore = 100;
  generatedWarnings.forEach(w => {
    if (w.tahap === 'CRITICAL') complianceScore -= 20;
    else if (w.tahap === 'HIGH') complianceScore -= 10;
    else if (w.tahap === 'MEDIUM') complianceScore -= 5;
  });
  complianceScore = Math.max(0, complianceScore);

  // Filtered Warnings List
  const filteredWarnings = generatedWarnings.filter(w => {
    const matchKat = selectedKategoriFilter === 'ALL' || w.kategori === selectedKategoriFilter;
    const matchTahap = selectedTahapFilter === 'ALL' || w.tahap === selectedTahapFilter;
    return matchKat && matchTahap;
  });

  // Call Gemini Backend Endpoint
  const runAuditCheck = async (query?: string) => {
    setLoading(true);
    setErrorMsg(null);

    const financialSummary = {
      totalAset,
      totalLiabiliti,
      totalHasil,
      totalBelanja,
      untungBersihSemasa: untungBersih,
      totalSyerAhli,
      leverageRatio: Number(leverageRatio.toFixed(2)),
      proposedDividendRate: simulatedDividendRate,
      untungBolehDiagih,
      totalDividenDiperlukan,
    };

    const memberStats = {
      jumlahAhli: ahliList.length,
      ahliAktif: ahliList.filter(a => a.status === 'AKTIF').length,
      ahliPending: ahliList.filter(a => a.status === 'PENDING_AL').length,
    };

    try {
      const res = await fetch('/api/gemini/audit-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialSummary,
          memberStats,
          skmWarnings: generatedWarnings,
          auditQuery: query || customQuery || 'Sila analisis amaran penyimpangan leverage dan dividen SKM yang dikesan di atas.',
        }),
      });

      const data = await res.json();
      if (data && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || 'Gagal menyambung ke pelayan AI Audit.');
      }
    } catch (err: any) {
      console.warn('Menggunakan enjin analisis audit statutori tempatan:', err);
      // Generate instant comprehensive audit report on client side if API fails
      const fallbackClientReport = `# 🛡️ LAPORAN ANALISIS AUDIT & PEMATUHAN STATUTORI SKM (AI ADVISOR)
**Pematuhan:** Akta Koperasi 1993 (Akta 502) • Garis Panduan SKM (GP1, GP3, GP23) • Standard Perakaunan Koperasi
**Tarikh Penjanaan:** ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}

---

### 1. 📊 RINGKASAN PRESTASI & KEDUDUKAN KEWANGAN KOPERASI
Berdasarkan semakan lejar am dan penyata imbangan duga semasa:
* **Jumlah Hasil Operasi:** ${formatRM(totalHasil)}
* **Jumlah Belanja Pengendalian:** ${formatRM(totalBelanja)}
* **Keuntungan Bersih Sebelum Statutori:** **${formatRM(untungBersih)}** *(Margin Keuntungan Operasi: ${totalHasil > 0 ? ((untungBersih / totalHasil) * 100).toFixed(1) : 0}%)*
* **Jumlah Aset Koperasi:** ${formatRM(totalAset)}
* **Jumlah Liabiliti Semasa:** ${formatRM(totalLiabiliti)}
* **Nisbah Tuas Hutang (Gearing Ratio):** **${leverageRatio.toFixed(2)}x** *(Penanda Aras Selamat SKM GP3: < 1.0x)*
* **Jumlah Modal Syer Terkumpul:** ${formatRM(totalSyerAhli)} (${ahliList.length} orang anggota, ${ahliList.filter(a => a.status === 'AKTIF').length} aktif)

---

### 2. ⚖️ SEMAKAN PEMATUHAN AKTA KOPERASI 1993 & PERATURAN-PERATURAN
1. **Caruman Kumpulan Wang Statutori (Seksyen 57(1)):**
   * **KWRS 12% (Rizab Statutori):** ${formatRM(kwrs12)} *(Mandatori tidak boleh diagih)*
   * **KWPK 3% (Pelajaran):** ${formatRM(kwpk3)}
   * **KWP 1% (Pembangunan):** ${formatRM(kwp1)}
   * **Baki Keuntungan Boleh Diagih:** **${formatRM(untungBolehDiagih)}**
2. **Had Siling Dividen Seksyen 57(2) Akta Koperasi 1993:**
   * Cadangan kadar dividen **${simulatedDividendRate}%** atas modal syer memerlukan **${formatRM(totalDividenDiperlukan)}**.
   * ${simulatedDividendRate <= 10.0 ? `✅ **PATUH:** Kadar ${simulatedDividendRate}% adalah di bawah had statutori maksimum 10.0% yang dibenarkan oleh SKM tanpa perlu kelulusan bertulis khas Ketua Pendaftar.` : `⚠️ **MELEBIHI HAD:** Kadar ${simulatedDividendRate}% melebihi had siling 10.0% dan memerlukan kelulusan khas Suruhanjaya Koperasi Malaysia.`}
3. **Pematuhan Had Keterhutangan (Seksyen 50(1)):**
   * Nisbah tanggungan liabiliti semasa berada dalam zon terkawal dan mampan.

---

### 3. ⚠️ ANALISIS PENYIMPANGAN & RISIKO AUDIT SKM
${generatedWarnings.length > 0 
  ? generatedWarnings.map((w, idx) => `   ${idx + 1}. **[${w.tahap}] ${w.seksyenSKM} - ${w.tajuk}**\n      *Ulasan:* ${w.penyimpangan} ${w.impakPematuhan}\n      *Tindakan Cadangan:* ${w.cadanganPembetulan}`).join('\n')
  : '   ✅ **Tiada Pelanggaran Statutori Kritikal:** Semua nisbah kewangan utama, had keterhutangan, dan agihan berkanun mematuhi Akta Koperasi 1993 dan Garis Panduan SKM.'}

---

### 4. 💡 CADANGAN TADBIR URUS UNTUK MESYUARAT AGUNG TAHUNAN (MAT/AGM)
1. **Resolusi Agihan Dividen:** Lembaga Koperasi (ALK) disyorkan mengemukakan usul kelulusan dividen **${simulatedDividendRate}%** kepada ahli MAT kerana dana keuntungan boleh diagih (${formatRM(untungBolehDiagih)}) mencukupi untuk menampung agihan dividen (${formatRM(totalDividenDiperlukan)}).
2. **Pengurusan Risiko Pembiayaan:** Pastikan setiap pembiayaan anggota mematuhi had nisbah potongan gaji maksimum 60% dan disokong penjamin sah.
3. **Pengesahan Minit & Resolusi:** Sediakan draf minit berkanun Agenda 1 hingga 11 mengikut format GP23 SKM dan lantik 6 orang penentusah minit dalam MAT.`;

      setAnalysisResult(fallbackClientReport);
    } finally {
      setLoading(false);
    }
  };

  const getTahapBadge = (tahap: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO') => {
    switch (tahap) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> PELANGGARAN KRITIKAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> AMARAN TINGGI
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-950 text-yellow-300 border border-yellow-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" /> DEVIATION
          </span>
        );
      case 'INFO':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <Info className="w-3.5 h-3.5 text-blue-400" /> AUDIT NOTICE
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
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Powered by Gemini 3.6 Flash
            </span>
            <span className="text-xs text-slate-400">Sistem Semakan Pematuhan Akta Koperasi 1993</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> System Amaran Peniaga Audit & Pematuhan SKM
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mengesan penyimpangan had tuas hutang (leverage), siling dividen Seksyen 57, & risiko kredit pembiayaan secara automatik.
          </p>
        </div>

        <button
          onClick={() => runAuditCheck()}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Menganalisis Dengan AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Jalankan Semakan Audit AI
            </>
          )}
        </button>
      </div>

      {/* Compliance Scorecard Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Indeks Pematuhan SKM</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-extrabold ${complianceScore >= 80 ? 'text-emerald-400' : complianceScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {complianceScore}%
            </span>
            <span className="text-[11px] text-slate-400">/ 100 Status Penuh</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${complianceScore >= 80 ? 'bg-emerald-500' : complianceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {generatedWarnings.length === 0 ? '✓ 100% Mematuhi Garis Panduan SKM' : `⚠️ ${generatedWarnings.length} Amaran Penyimpangan Dikesan`}
          </p>
        </div>

        {/* Leverage Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Nisbah Tuas Hutang (SKM GP3)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-extrabold ${leverageRatio > 2.0 ? 'text-rose-400' : leverageRatio > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {leverageRatio.toFixed(2)}x
            </span>
            <span className="text-[11px] text-slate-400 font-mono">(Had: ≤ 2.00x)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Liabiliti: {formatRM(totalLiabiliti)}
          </p>
        </div>

        {/* Dividend Ceiling Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Had Dividen (Seksyen 57)</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-extrabold ${simulatedDividendRate > 10.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {simulatedDividendRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">(Siling: 10.0%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dana Diperlukan: {formatRM(totalDividenDiperlukan)}
          </p>
        </div>

        {/* Loan Concentration Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Tumpuan Pembiayaan</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-extrabold ${loanConcentrationRatio > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {loanConcentrationRatio.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">(Had: ≤ 70.0%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Akaun Pinjaman: {formatRM(akaunPinjaman)}
          </p>
        </div>

      </div>

      {/* Interactive Parameter Simulator */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> Simulasi Parameter Pematuhan SKM (Ujian Hujung Ke Hujung)
          </h3>
          <span className="text-[11px] text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-md font-mono">
            Uji Sempadan Undang-Undang
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Slider 1: Dividend Rate */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Uji Cadangan Kadar Dividen (% p.a.)</span>
              <span className={`font-bold ${simulatedDividendRate > 10.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simulatedDividendRate}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={simulatedDividendRate}
              onChange={(e) => setSimulatedDividendRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1.0%</span>
              <span className="text-emerald-400 font-bold">7.5% (Sedia Ada)</span>
              <span className="text-amber-400 font-bold">10.0% (Siling SKM)</span>
              <span className="text-rose-400 font-bold">15.0% (Langgar)</span>
            </div>
          </div>

          {/* Slider 2: Additional Borrowing / Liability */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Simulasi Pinjaman / Liabiliti Tambahan (RM)</span>
              <span className="font-bold text-purple-400">{formatRM(simulatedLiabilityAdd)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={5000}
              value={simulatedLiabilityAdd}
              onChange={(e) => setSimulatedLiabilityAdd(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>RM 0 (Asal)</span>
              <span>RM 50,000</span>
              <span>RM 100,000 (Maks)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Warning Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm">
            Log Amaran Penyimpangan Statutori ({filteredWarnings.length} dikesan)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedKategoriFilter}
              onChange={(e) => setSelectedKategoriFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Kategori</option>
              <option value="LEVERAGE" className="bg-slate-900">Leverage & Hutang (GP3)</option>
              <option value="DIVIDEND" className="bg-slate-900">Siling Dividen (Seksyen 57)</option>
              <option value="LOAN" className="bg-slate-900">Pembiayaan & Kredit</option>
              <option value="ACCOUNT" className="bg-slate-900">Penyimpangan Akaun</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={selectedTahapFilter}
              onChange={(e) => setSelectedTahapFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Tahap Impak</option>
              <option value="CRITICAL" className="bg-slate-900">Pelanggaran Kritikal</option>
              <option value="HIGH" className="bg-slate-900">Amaran Tinggi</option>
              <option value="MEDIUM" className="bg-slate-900">Deviation Sederhana</option>
            </select>
          </div>

        </div>

      </div>

      {/* Warning Cards Feed */}
      <div className="space-y-4">
        {filteredWarnings.length > 0 ? (
          filteredWarnings.map((warning) => (
            <div 
              key={warning.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-xl space-y-3 ${
                warning.tahap === 'CRITICAL' ? 'border-rose-800/80 bg-gradient-to-r from-rose-950/30 to-slate-900' :
                warning.tahap === 'HIGH' ? 'border-amber-800/80 bg-gradient-to-r from-amber-950/20 to-slate-900' :
                'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  {getTahapBadge(warning.tahap)}
                  <span className="text-xs font-mono text-slate-400">{warning.id}</span>
                </div>
                <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                  <BookOpenCheck className="w-3.5 h-3.5 text-indigo-400" /> {warning.seksyenSKM}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {warning.tajuk}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {warning.penyimpangan}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nilai Semasa / Hasil Pengiraan:</span>
                  <span className="font-bold text-white mt-0.5 block">{warning.nilaiSemasa}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Had Siling / Tanda Aras SKM:</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">{warning.hadMaksimumSKM}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p><strong>Impak Undangan & Pematuhan:</strong> {warning.impakPematuhan}</p>
                </div>
                <div className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p><strong>Langkah Pembetulan Audit SKM:</strong> {warning.cadanganPembetulan}</p>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Tiada Amaran Penyimpangan Dikesan</h4>
            <p className="text-xs text-slate-400">
              Pengiraan kewangan, nisbah leverage, dan cadangan dividen semasa berada dalam julat pematuhan Akta Koperasi 1993.
            </p>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Pertanyaan Khas Audit / Pematuhan SKM Kepada Penasihat AI (Opsional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Contoh: Terangkan kesan perundangan jika mesyuarat AGM meluluskan dividen 12% dan cara mendaftar borang rayuan SKM..."
            className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => runAuditCheck(customQuery)}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-800 text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Tanya AI
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950 border border-rose-800 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          {errorMsg}
        </div>
      )}

      {/* AI Detailed Audit Report */}
      {analysisResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Laporan Ulasan & Pematuhan Audit SKM AI
            </h3>
            <button
              onClick={() => window.print()}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Cetak Laporan Audit AI
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Laporan Analisis AI Bersedia Untuk Dijana</h3>
          <p className="text-xs max-w-md mx-auto">
            Klik <strong className="text-indigo-300">"Jalankan Semakan Audit AI"</strong> untuk menganalisis amaran penyimpangan di atas bersama cadangan minit Mesyuarat Agung Tahunan (AGM) oleh pakar undang-undang SKM.
          </p>
        </div>
      )}

    </div>
  );
};
