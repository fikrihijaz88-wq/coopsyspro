/**
 * Sistem Perakaunan dan Pengurusan Koperasi Malaysia (SPPKM)
 * Fully compliant with Akta Koperasi 1993 & Suruhanjaya Koperasi Malaysia (SKM)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardOverview } from './components/DashboardOverview';
import { MemberManagement } from './components/MemberManagement';
import { AccountingTransactions } from './components/AccountingTransactions';
import { LoanFinancing } from './components/LoanFinancing';
import { PayrollDeductions } from './components/PayrollDeductions';
import { FinancialStatements } from './components/FinancialStatements';
import { DividendDistribution } from './components/DividendDistribution';
import { ComplianceChecker } from './components/ComplianceChecker';
import { AutomatedReports } from './components/AutomatedReports';
import { AIAuditAdvisor } from './components/AIAuditAdvisor';
import { ActivityLog } from './components/ActivityLog';
import { MeetingManagement } from './components/MeetingManagement';
import { DocumentManagement } from './components/DocumentManagement';
import { PointOfSale } from './components/PointOfSale';
import { GovernanceCommittees } from './components/GovernanceCommittees';
import { SKMFundsTracking } from './components/SKMFundsTracking';
import { WelfareFundManagement } from './components/WelfareFundManagement';
import { FixedAssetManagement } from './components/FixedAssetManagement';
import { MemberSavingsDeposit } from './components/MemberSavingsDeposit';
import { BankReconciliation } from './components/BankReconciliation';
import { SKMAndEInvoiceBridge } from './components/SKMAndEInvoiceBridge';
import { LoginScreen } from './components/LoginScreen';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { api } from './services/api';
import { isTabAllowedForRole, UserRole, ROLE_DEFINITIONS } from './utils/rbac';

import { 
  Ahli, 
  CartaAkaun, 
  Transaksi, 
  PembiayaanAhli, 
  StatusAhli, 
  ActivityLog as ActivityLogType, 
  Mesyuarat, 
  DokumenSokongan, 
  StatusPengesahanDokumen, 
  ItemProdukPOS, 
  TransaksiPOS, 
  AnggotaJawatankuasa, 
  RekodKewanganTahunan,
  DanaGeranSKM,
  RekodPenggunaanDana,
  RekodBayaranBalikPinjamanSKM,
  TuntutanKebajikan,
  TabungKebajikanSummary,
  StatusTuntutanKebajikan,
  AsetTetap,
  AkaunSimpananDeposit,
  TransaksiSimpanan,
  ItemPenyataBank,
  PenyataPenyesuaianBank,
  EInvoisLHDN,
  DataExportEKoperasi
} from './types';
import { 
  INITIAL_AHLI, 
  INITIAL_CARTA_AKAUN, 
  INITIAL_TRANSAKSI, 
  INITIAL_PEMBIAYAAN, 
  INITIAL_LOGS, 
  INITIAL_MESYUARAT, 
  INITIAL_DOKUMEN_SOKONGAN, 
  INITIAL_PRODUK_POS, 
  INITIAL_TRANSAKSI_POS, 
  INITIAL_ALK_JAD, 
  INITIAL_REKOD_KEWANGAN_TAHUNAN,
  INITIAL_DANA_GERAN_SKM,
  INITIAL_TUNTUTAN_KEBAJIKAN,
  INITIAL_TABUNG_KEBAJIKAN,
  INITIAL_ASET_TETAP,
  INITIAL_SIMPANAN_DEPOSIT,
  INITIAL_BANK_STATEMENT_ITEMS,
  INITIAL_BANK_RECON_SUMMARY,
  INITIAL_E_INVOICES
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<'BM' | 'EN'>('BM');

  // User Auth & Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>({
    name: 'Haji Ahmad Zaki',
    role: 'BENDAHARI',
    email: 'bendahari@koperasi.my',
  });
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  // 15-Minute Auto-Logout Timer & Inactivity Detection
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);

  // Core Reactive States
  const [ahliList, setAhliList] = useState<Ahli[]>(INITIAL_AHLI);
  const [cartaAkaun, setCartaAkaun] = useState<CartaAkaun[]>(INITIAL_CARTA_AKAUN);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(INITIAL_TRANSAKSI);
  const [pembiayaanList, setPembiayaanList] = useState<PembiayaanAhli[]>(INITIAL_PEMBIAYAAN);
  const [logs, setLogs] = useState<ActivityLogType[]>(INITIAL_LOGS);
  const [mesyuaratList, setMesyuaratList] = useState<Mesyuarat[]>(INITIAL_MESYUARAT);
  const [dokumenList, setDokumenList] = useState<DokumenSokongan[]>(INITIAL_DOKUMEN_SOKONGAN);
  const [produkList, setProdukList] = useState<ItemProdukPOS[]>(INITIAL_PRODUK_POS);
  const [transaksiPosList, setTransaksiPosList] = useState<TransaksiPOS[]>(INITIAL_TRANSAKSI_POS);
  const [jawatanKuasaList, setJawatanKuasaList] = useState<AnggotaJawatankuasa[]>(INITIAL_ALK_JAD);
  const [rekodTahunanList, setRekodTahunanList] = useState<RekodKewanganTahunan[]>(INITIAL_REKOD_KEWANGAN_TAHUNAN);
  const [danaList, setDanaList] = useState<DanaGeranSKM[]>(INITIAL_DANA_GERAN_SKM);
  const [tuntutanList, setTuntutanList] = useState<TuntutanKebajikan[]>(INITIAL_TUNTUTAN_KEBAJIKAN);
  const [welfareSummary, setWelfareSummary] = useState<TabungKebajikanSummary>(INITIAL_TABUNG_KEBAJIKAN);
  const [assetList, setAssetList] = useState<AsetTetap[]>(INITIAL_ASET_TETAP);
  const [savingsList, setSavingsList] = useState<AkaunSimpananDeposit[]>(INITIAL_SIMPANAN_DEPOSIT);
  const [bankItems, setBankItems] = useState<ItemPenyataBank[]>(INITIAL_BANK_STATEMENT_ITEMS);
  const [bankReconSummary, setBankReconSummary] = useState<PenyataPenyesuaianBank>(INITIAL_BANK_RECON_SUMMARY);
  const [eInvoiceList, setEInvoiceList] = useState<EInvoisLHDN[]>(INITIAL_E_INVOICES);

  // Initial persistent database fetch
  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.fetchAllData();
        if (data.members) setAhliList(data.members);
        if (data.accounts) setCartaAkaun(data.accounts);
        if (data.transactions) setTransaksiList(data.transactions);
        if (data.loans) setPembiayaanList(data.loans);
        if (data.meetings) setMesyuaratList(data.meetings);
        if (data.documents) setDokumenList(data.documents);
        if (data.posProducts) setProdukList(data.posProducts);
        if (data.posTransactions) setTransaksiPosList(data.posTransactions);
        if (data.committees) setJawatanKuasaList(data.committees);
        if (data.yearlyRecords) setRekodTahunanList(data.yearlyRecords);
        if (data.skmFunds) setDanaList(data.skmFunds);
        if (data.welfareClaims) setTuntutanList(data.welfareClaims);
        if (data.welfareSummary) setWelfareSummary(data.welfareSummary);
        if (data.fixedAssets) setAssetList(data.fixedAssets);
        if (data.savingsDeposits) setSavingsList(data.savingsDeposits);
        if (data.bankStatements) setBankItems(data.bankStatements);
        if (data.bankReconSummary) setBankReconSummary(data.bankReconSummary);
        if (data.eInvoices) setEInvoiceList(data.eInvoices);
        if (data.logs) setLogs(data.logs);
      } catch (err) {
        console.warn('API sync unavailable, running with initial local data:', err);
      }
    }
    loadData();
  }, []);

  const handleAddRekodTahunan = (rekod: RekodKewanganTahunan) => {
    setRekodTahunanList(prev => {
      const exists = prev.some(r => r.tahun === rekod.tahun);
      if (exists) {
        return prev.map(r => r.tahun === rekod.tahun ? rekod : r);
      }
      return [...prev, rekod].sort((a, b) => a.tahun - b.tahun);
    });
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Rekod Kewangan Tahun ${rekod.tahun}`,
      deskripsi: `Penyata kewangan teraudit tahun ${rekod.tahun} telah dimuat naik/dikemaskini.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  // ALK & JAD Handlers
  const handleAddJawatankuasa = (newMember: AnggotaJawatankuasa) => {
    setJawatanKuasaList(prev => [newMember, ...prev]);
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Pelantikan ${newMember.kategori} Baru`,
      deskripsi: `Lantikan ${newMember.nama} (${newMember.noAhli}) sebagai ${newMember.jawatanKoperasi}.`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  const handleUpdateJawatankuasa = (updatedMember: AnggotaJawatankuasa) => {
    setJawatanKuasaList(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Kemaskini Kepimpinan ${updatedMember.kategori}`,
      deskripsi: `Rekod ${updatedMember.nama} (${updatedMember.jawatanKoperasi}) telah dikemaskini.`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  const handleDeleteJawatankuasa = (id: string) => {
    const found = jawatanKuasaList.find(m => m.id === id);
    setJawatanKuasaList(prev => prev.filter(m => m.id !== id));
    if (found) {
      handleAddLog({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
        pengguna: currentUser?.name || 'Pentadbir Sistem',
        tindakan: `Padam Kepimpinan ${found.kategori}`,
        deskripsi: `Lantikan ${found.nama} (${found.jawatanKoperasi}) telah dipadam daripada senarai rasmi.`,
        kategori: 'PENTADBIRAN',
        status: 'AMARAN',
      });
    }
  };

  // SKM Funds & Grants Handlers
  const handleAddSkmExpense = (danaId: string, expense: RekodPenggunaanDana) => {
    setDanaList(prev => prev.map(d => {
      if (d.id === danaId) {
        return {
          ...d,
          penggunaanDanaList: [expense, ...(d.penggunaanDanaList || [])],
          bakiBelumDibelanja: Math.max(0, d.bakiBelumDibelanja - expense.jumlahRM)
        };
      }
      return d;
    }));

    // Post to server if online
    api.addSkmExpense(danaId, expense).catch(err => console.warn('Offline sync for SKM expense:', err));

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Rekod Perbelanjaan Dana SKM',
      deskripsi: `Baucar ${expense.noBaucarResit}: ${expense.perkara} berjumlah RM ${expense.jumlahRM.toFixed(2)} direkodkan.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  const handleAddSkmRepayment = (danaId: string, repayment: RekodBayaranBalikPinjamanSKM) => {
    setDanaList(prev => prev.map(d => {
      if (d.id === danaId) {
        return {
          ...d,
          bayaranBalikList: [repayment, ...(d.bayaranBalikList || [])],
          jumlahTelahDibayarBalik: (d.jumlahTelahDibayarBalik || 0) + repayment.jumlahBayaranRM,
          bakiPinjamanSKMTertunggak: Math.max(0, (d.bakiPinjamanSKMTertunggak || 0) - repayment.prinsipalRM)
        };
      }
      return d;
    }));

    // Post to server if online
    api.addSkmRepayment(danaId, repayment).catch(err => console.warn('Offline sync for SKM repayment:', err));

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Rekod Bayaran Balik Pinjaman TMP-SKM',
      deskripsi: `Resit SKM ${repayment.noResitSKM}: Bayaran balik prinsipal RM ${repayment.prinsipalRM.toFixed(2)} + caj RM ${repayment.cajPerkhidmatanRM.toFixed(2)} direkodkan.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  const handleAddSkmFund = (fund: DanaGeranSKM) => {
    setDanaList(prev => [fund, ...prev]);
    api.createSkmFund(fund).catch(err => console.warn('Offline sync for new SKM fund:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Daftar Fasiliti ${fund.jenisDana}`,
      deskripsi: `Kelulusan ${fund.tajukProjek} (${fund.rujukanKelulusanSKM}) bernilai RM ${fund.jumlahDiluluskan.toFixed(2)} didaftarkan.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  // Welfare Fund Handlers
  const handleAddClaim = (claim: TuntutanKebajikan) => {
    setTuntutanList(prev => [claim, ...prev]);
    api.createWelfareClaim(claim).catch(err => console.warn('Offline sync for welfare claim:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Permohonan Tuntutan Tabung Kebajikan',
      deskripsi: `Tuntutan ${claim.noRujukan}: ${claim.namaAhli} (${claim.jenisTuntutan.replace(/_/g, ' ')}) bernilai RM ${claim.jumlahDipohon.toFixed(2)} direkodkan.`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  const handleUpdateClaimStatus = (id: string, newStatus: StatusTuntutanKebajikan, noBaucar?: string, catatan?: string) => {
    setTuntutanList(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          noBaucarBayaran: noBaucar || c.noBaucarBayaran,
          tarikhBayaran: newStatus === 'DIBAYAR' ? new Date().toISOString().split('T')[0] : c.tarikhBayaran,
          catatan: catatan || c.catatan
        };
      }
      return c;
    }));

    api.updateWelfareClaim(id, { 
      status: newStatus, 
      noBaucarBayaran: noBaucar, 
      catatan 
    }).catch(err => console.warn('Offline sync for claim update:', err));

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Kemaskini Status Tuntutan Kebajikan',
      deskripsi: `Tuntutan ID ${id} dikemaskini ke status ${newStatus}. ${noBaucar ? `No. Baucar: ${noBaucar}` : ''}`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  // Fixed Assets Handlers
  const handleAddAsset = (asset: AsetTetap) => {
    setAssetList(prev => [asset, ...prev]);
    api.createFixedAsset(asset).catch(err => console.warn('Offline sync for new asset:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Pendaftaran Harta Tetap Baharu',
      deskripsi: `Tag ${asset.tagAset}: ${asset.namaAset} bernilai RM ${asset.kosAsal.toFixed(2)} didaftarkan.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  const handleUpdateAsset = (id: string, updated: Partial<AsetTetap>) => {
    setAssetList(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    api.updateFixedAsset(id, updated).catch(err => console.warn('Offline sync for asset update:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Kemaskini / Pelupusan Harta Tetap',
      deskripsi: `Aset ID ${id} dikemaskini. Status: ${updated.status || 'AKTIF'}.`,
      kategori: 'PERAKAUNAN',
      status: 'AMARAN',
    });
  };

  const handleRunDepreciation = (year: number) => {
    setAssetList(prev => prev.map(asset => {
      if (asset.status !== 'AKTIF') return asset;
      const alreadyHasYear = (asset.sejarahSusutnilai || []).some(s => s.tahun === year);
      if (alreadyHasYear) return asset;

      let annualDep = 0;
      if (asset.kaedahSusutnilai === 'GARIS_LURUS') {
        const depreciableBase = Math.max(0, asset.kosAsal - asset.nilaiSisa);
        annualDep = Math.round((depreciableBase * (asset.kadarSusutnilaiPeratus / 100)) * 100) / 100;
      } else {
        annualDep = Math.round((asset.nilaiBukuBersihSemasa * (asset.kadarSusutnilaiPeratus / 100)) * 100) / 100;
      }

      annualDep = Math.min(annualDep, Math.max(0, asset.nilaiBukuBersihSemasa - asset.nilaiSisa));
      if (annualDep <= 0) return asset;

      const newAccumulated = asset.susutnilaiTerkumpulSemasa + annualDep;
      const newNBV = Math.max(asset.nilaiSisa, asset.kosAsal - newAccumulated);

      return {
        ...asset,
        susutnilaiTerkumpulSemasa: newAccumulated,
        nilaiBukuBersihSemasa: newNBV,
        sejarahSusutnilai: [
          ...(asset.sejarahSusutnilai || []),
          {
            tahun: year,
            nilaiAwalTahun: asset.nilaiBukuBersihSemasa,
            kadarSusutnilaiPeratus: asset.kadarSusutnilaiPeratus,
            belanjaSusutnilaiTahun: annualDep,
            susutnilaiTerkumpul: newAccumulated,
            nilaiBukuBersihAkhirTahun: newNBV
          }
        ]
      };
    }));

    api.runAssetDepreciation(year).catch(err => console.warn('Offline sync for depreciation:', err));

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Pengiraan Susutnilai Tahunan (${year})`,
      deskripsi: `Jurnal susutnilai automatik tahun ${year} telah dijana bagi semua harta tetap koperasi.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  // Special Savings & Deposit Handlers
  const handleAddSavingsAccount = (account: AkaunSimpananDeposit) => {
    setSavingsList(prev => [account, ...prev]);
    api.createSavingsDeposit(account).catch(err => console.warn('Offline sync for savings account:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Buka Sijil / Akaun Simpanan Khas',
      deskripsi: `Sijil ${account.noSijilAkaun}: ${account.namaAhli} (${account.jenis.replace(/_/g, ' ')}) bernilai RM ${account.bakiSemasa.toFixed(2)} dibuka.`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  const handleUpdateSavingsAccount = (id: string, updates: Partial<AkaunSimpananDeposit>) => {
    setSavingsList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    api.updateSavingsDeposit(id, updates).catch(err => console.warn('Offline sync for savings update:', err));
  };

  const handleAddSavingsTransaction = (accountId: string, tx: TransaksiSimpanan) => {
    setSavingsList(prev => prev.map(s => {
      if (s.id === accountId) {
        return {
          ...s,
          bakiSemasa: tx.bakiSelepas,
          sejarahTransaksi: [tx, ...(s.sejarahTransaksi || [])]
        };
      }
      return s;
    }));
    api.createSavingsTransaction(accountId, tx).catch(err => console.warn('Offline sync for savings tx:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: `Transaksi ${tx.jenisTransaksi} Simpanan Khas`,
      deskripsi: `Resit ${tx.noRujukan}: Transaksi RM ${tx.jumlah.toFixed(2)} bagi akaun ID ${accountId}.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  // Bank Reconciliation Handlers
  const handleAddBankItem = (item: ItemPenyataBank) => {
    setBankItems(prev => [item, ...prev]);
    api.createBankStatementItem(item).catch(err => console.warn('Offline sync for bank item:', err));
  };

  const handleUpdateBankItem = (id: string, updates: Partial<ItemPenyataBank>) => {
    setBankItems(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    api.updateBankStatementItem(id, updates).catch(err => console.warn('Offline sync for bank item update:', err));
  };

  const handleUpdateReconSummary = (summary: PenyataPenyesuaianBank) => {
    setBankReconSummary(summary);
    api.updateBankReconSummary(summary).catch(err => console.warn('Offline sync for recon summary:', err));
  };

  // e-Invoice Handlers
  const handleAddEInvoice = (invoice: EInvoisLHDN) => {
    setEInvoiceList(prev => [invoice, ...prev]);
    api.createEInvoice(invoice).catch(err => console.warn('Offline sync for e-invoice:', err));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Terbit e-Invois LHDN Malaysia',
      deskripsi: `e-Invois ${invoice.noInvois} (${invoice.noRujukanLHDN}) bernilai RM ${invoice.jumlahBersihBayaran.toFixed(2)} diterbitkan dan disahkan LHDN.`,
      kategori: 'PERAKAUNAN',
      status: 'INFO',
    });
  };

  const handleUpdateEInvoice = (uuid: string, updates: Partial<EInvoisLHDN>) => {
    setEInvoiceList(prev => prev.map(inv => inv.uuid === uuid ? { ...inv, ...updates } : inv));
    api.updateEInvoice(uuid, updates).catch(err => console.warn('Offline sync for e-invoice update:', err));
  };

  // Document Handlers
  const handleAddDokumen = (newDoc: DokumenSokongan) => {
    setDokumenList(prev => [newDoc, ...prev]);
  };

  const handleUpdateStatusDokumen = (id: string, newStatus: StatusPengesahanDokumen, catatan?: string) => {
    setDokumenList(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          catatanPengesahan: catatan || d.catatanPengesahan
        };
      }
      return d;
    }));

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Kemaskini Status Dokumen Pengesahan',
      deskripsi: `Dokumen ID ${id} dikemaskini ke status ${newStatus}. ${catatan ? `Catatan: ${catatan}` : ''}`,
      kategori: 'PENTADBIRAN',
      status: 'INFO',
    });
  };

  const handleDeleteDokumen = (id: string) => {
    setDokumenList(prev => prev.filter(d => d.id !== id));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.name || 'Pentadbir Sistem',
      tindakan: 'Padam Dokumen Sokongan',
      deskripsi: `Dokumen ID ${id} telah dipadam daripada repositori pengesahan.`,
      kategori: 'PENTADBIRAN',
      status: 'AMARAN',
    });
  };

  // Direct modal triggers
  const [showNewMemberModalDirect, setShowNewMemberModalDirect] = useState<boolean>(false);
  const [showNewTxModalDirect, setShowNewTxModalDirect] = useState<boolean>(false);

  // Helper to append log
  const handleAddLog = (newLog: ActivityLogType) => {
    setLogs(prev => [newLog, ...prev]);
  };

  // Monitor user activity events to reset inactivity timer
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleUserActivity = () => {
      setLastActivityTime(Date.now());
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isLoggedIn]);

  // Session Timeout Interval Check (15 Minutes = 900s, Warning at 14 Minutes = 840s)
  useEffect(() => {
    if (!isLoggedIn) return;

    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    const WARNING_MS = 14 * 60 * 1000; // 14 minutes

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityTime;

      if (elapsed >= TIMEOUT_MS) {
        // Auto-logout after 15 minutes of inactivity
        setIsLoggedIn(false);
        setShowTimeoutWarning(false);
        setLogoutMessage(
          language === 'EN'
            ? 'Your session expired automatically after 15 minutes of inactivity for co-op security.'
            : 'Sesi anda telah tamat secara automatik selepas 15 minit tanpa aktiviti demi keselamatan akaun koperasi.'
        );
      } else if (elapsed >= WARNING_MS) {
        // Show warning modal 1 minute before auto logout
        setShowTimeoutWarning(true);
        const secondsLeft = Math.max(0, Math.ceil((TIMEOUT_MS - elapsed) / 1000));
        setRemainingSeconds(secondsLeft);
      } else {
        setShowTimeoutWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, lastActivityTime, language]);

  // Auth Handlers
  const handleLogin = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
    setLogoutMessage(null);

    // Auto-adjust active tab if not allowed for the role
    if (!isTabAllowedForRole(user.role, activeTab)) {
      if (user.role === 'JURUWANG_POS') {
        setActiveTab('pos');
      } else {
        setActiveTab('dashboard');
      }
    }

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'PENTADBIRAN',
      tindakan: 'Log Masuk Pengguna',
      deskripsi: `Pengguna ${user.name} (${user.role}) telah berjaya log masuk ke dalam sistem SPPKM.`,
      pengguna: user.name,
      status: 'INFO',
      ipAlamat: '127.0.0.1',
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowTimeoutWarning(false);
    setLogoutMessage(
      language === 'EN'
        ? 'You have successfully logged out.'
        : 'Anda telah berjaya log keluar dari sistem.'
    );
  };

  const handleExtendSession = () => {
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
  };

  // Total Net Profit calculation
  const totalHasil = cartaAkaun.filter(c => c.kategori === 'HASIL').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalBelanja = cartaAkaun.filter(c => c.kategori === 'BELANJA').reduce((a, b) => a + b.bakiSemasa, 0);
  const untungBersih = totalHasil - totalBelanja;

  // Handler: Add New Member Registration
  const handleAddAhli = (newAhli: Ahli) => {
    setAhliList(prev => [newAhli, ...prev]);

    // Record Yuran Masuk (RM 10.00) & Initial Share Payment in Transactions & Chart of Accounts
    const txYuran: Transaksi = {
      id: `TX-${Date.now()}-1`,
      tarikh: new Date().toISOString().split('T')[0],
      noRujukan: `RST-${Date.now()}`,
      perihal: `Yuran Masuk Ahli Baru (${newAhli.nama})`,
      noAhli: newAhli.noAhli,
      namaAhli: newAhli.nama,
      debitAkaunKod: '1010', // Bank
      kreditAkaunKod: '4030', // Hasil Yuran Masuk
      jumlah: 10,
      kategori: 'YURAN_SYER',
      dikemaskiniOleh: 'Sistem Pendaftaran Koperasi',
    };

    const txSyer: Transaksi = {
      id: `TX-${Date.now()}-2`,
      tarikh: new Date().toISOString().split('T')[0],
      noRujukan: `RST-${Date.now()}`,
      perihal: `Modal Syer Terbitan Awal (${newAhli.nama})`,
      noAhli: newAhli.noAhli,
      namaAhli: newAhli.nama,
      debitAkaunKod: '1010', // Bank
      kreditAkaunKod: '3010', // Modal Syer Ahli
      jumlah: newAhli.modalSyer,
      kategori: 'YURAN_SYER',
      dikemaskiniOleh: 'Sistem Pendaftaran Koperasi',
    };

    setTransaksiList(prev => [txYuran, txSyer, ...prev]);

    // Update Chart of Accounts balances
    updateAkaunBaki('1010', newAhli.modalSyer + 10, 'DEBIT');
    updateAkaunBaki('4030', 10, 'KREDIT');
    updateAkaunBaki('3010', newAhli.modalSyer, 'KREDIT');

    // Auto-record Audit Log
    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'AHLI',
      tindakan: 'Pendaftaran Ahli Baru',
      deskripsi: `Ahli baru ${newAhli.nama} (${newAhli.noAhli}) telah mendaftar dengan modal syer RM${newAhli.modalSyer} dan yuran RM10.`,
      pengguna: 'Sistem Pendaftaran Koperasi',
      noAhli: newAhli.noAhli,
      namaAhli: newAhli.nama,
      status: 'INFO',
      jumlahRM: newAhli.modalSyer + 10,
      ipAlamat: '127.0.0.1',
    });
  };

  // Handler: Update Member Status (e.g. Approved by ALK Board)
  const handleUpdateStatusAhli = (id: string, newStatus: StatusAhli) => {
    const target = ahliList.find(a => a.id === id);
    setAhliList(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    if (target) {
      handleAddLog({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'AHLI',
        tindakan: `Pertukaran Status Ahli (${newStatus})`,
        deskripsi: `Status keahlian ${target.nama} (${target.noAhli}) dikemaskini dari ${target.status} kepada ${newStatus}.`,
        pengguna: 'Ahli Lembaga Koperasi (ALK)',
        noAhli: target.noAhli,
        namaAhli: target.nama,
        status: newStatus === 'AKTIF' ? 'BERJAYA' : 'AMARAN',
        ipAlamat: '10.0.4.18',
      });
    }
  };

  // Handler: Topup Member Share/Fee
  const handleTambahSyerAhli = (id: string, jumlahSyer: number, jumlahYuran: number) => {
    const targetAhli = ahliList.find(a => a.id === id);
    if (!targetAhli) return;

    setAhliList(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          modalSyer: a.modalSyer + jumlahSyer,
          yuranBulanan: a.yuranBulanan + jumlahYuran,
        };
      }
      return a;
    }));

    if (jumlahSyer > 0) {
      const tx: Transaksi = {
        id: `TX-${Date.now()}`,
        tarikh: new Date().toISOString().split('T')[0],
        noRujukan: `RST-${Date.now()}`,
        perihal: `Penambahan Modal Syer Ahli (${targetAhli.nama})`,
        noAhli: targetAhli.noAhli,
        namaAhli: targetAhli.nama,
        debitAkaunKod: '1010', // Bank
        kreditAkaunKod: '3010', // Modal Syer
        jumlah: jumlahSyer,
        kategori: 'YURAN_SYER',
        dikemaskiniOleh: 'Bendahari Koperasi',
      };

      setTransaksiList(prev => [tx, ...prev]);
      updateAkaunBaki('1010', jumlahSyer, 'DEBIT');
      updateAkaunBaki('3010', jumlahSyer, 'KREDIT');

      handleAddLog({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'AHLI',
        tindakan: 'Penambahan Modal Syer Ahli',
        deskripsi: `Penambahan modal syer RM${jumlahSyer} diposting bagi ahli ${targetAhli.nama} (${targetAhli.noAhli}).`,
        pengguna: 'Bendahari Koperasi',
        noAhli: targetAhli.noAhli,
        namaAhli: targetAhli.nama,
        status: 'BERJAYA',
        jumlahRM: jumlahSyer,
        ipAlamat: '192.168.1.15',
      });
    }
  };

  const handleUpdateAhli = (updatedAhli: Ahli) => {
    setAhliList(prev => prev.map(a => a.id === updatedAhli.id ? updatedAhli : a));
    api.updateMember(updatedAhli.id, updatedAhli).catch(err => console.warn('Offline member update:', err));
  };

  // Helper: Update Account Balance
  const updateAkaunBaki = (kod: string, jumlah: number, jenis: 'DEBIT' | 'KREDIT') => {
    setCartaAkaun(prev => prev.map(a => {
      if (a.kod === kod) {
        // If account's normal balance matches transaction direction, add to balance
        if (a.jenisBaki === jenis) {
          return { ...a, bakiSemasa: a.bakiSemasa + jumlah };
        } else {
          return { ...a, bakiSemasa: a.bakiSemasa - jumlah };
        }
      }
      return a;
    }));
  };

  // Handler: Manual Journal Transaction
  const handleAddTransaksi = (tx: Transaksi) => {
    setTransaksiList(prev => [tx, ...prev]);
    updateAkaunBaki(tx.debitAkaunKod, tx.jumlah, 'DEBIT');
    updateAkaunBaki(tx.kreditAkaunKod, tx.jumlah, 'KREDIT');

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'PERAKAUNAN',
      tindakan: `Transaksi Lejar (${tx.kategori})`,
      deskripsi: `Entri jurnal ${tx.noRujukan}: ${tx.perihal} (Debit: ${tx.debitAkaunKod}, Kredit: ${tx.kreditAkaunKod}) bernilai RM${tx.jumlah}.`,
      pengguna: tx.dikemaskiniOleh,
      noAhli: tx.noAhli,
      namaAhli: tx.namaAhli,
      status: 'BERJAYA',
      jumlahRM: tx.jumlah,
      ipAlamat: '192.168.1.15',
    });
  };

  // Handler: Loan Application
  const handleAddPembiayaan = (p: PembiayaanAhli) => {
    setPembiayaanList(prev => [p, ...prev]);

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'PEMBIAYAAN',
      tindakan: 'Permohonan Pembiayaan Baru',
      deskripsi: `Permohonan ${p.jenisPembiayaan.replace('_',' ')} berjumlah RM${p.jumlahPinjaman} dihantar untuk pertimbangan ALK.`,
      pengguna: 'Ahli Koperasi',
      noAhli: p.noAhli,
      namaAhli: p.namaAhli,
      status: 'INFO',
      jumlahRM: p.jumlahPinjaman,
      ipAlamat: '192.168.1.55',
    });
  };

  // Handler: Approve or Reject Loan
  const handleUpdateStatusPembiayaan = (id: string, newStatus: 'DILULUSKAN' | 'DITOLAK') => {
    const loan = pembiayaanList.find(p => p.id === id);
    if (!loan) return;

    setPembiayaanList(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));

    if (newStatus === 'DILULUSKAN') {
      // Update member's loan balance
      setAhliList(prev => prev.map(a => a.noAhli === loan.noAhli ? { ...a, bakiPinjaman: a.bakiPinjaman + loan.jumlahPinjaman } : a));

      // Post Disbursement Transaction: Debit Pembiayaan Ahli (1040), Credit Bank (1010)
      const txDisburse: Transaksi = {
        id: `TX-${Date.now()}`,
        tarikh: new Date().toISOString().split('T')[0],
        noRujukan: `PV-${Date.now()}`,
        perihal: `Pengeluaran Pembiayaan Murabahah (${loan.namaAhli})`,
        noAhli: loan.noAhli,
        namaAhli: loan.namaAhli,
        debitAkaunKod: '1040', // Pembiayaan Ahli
        kreditAkaunKod: '1010', // Bank
        jumlah: loan.jumlahPinjaman,
        kategori: 'PEMBIAYAN',
        dikemaskiniOleh: 'Ahli Lembaga Koperasi (ALK)',
      };

      setTransaksiList(prev => [txDisburse, ...prev]);
      updateAkaunBaki('1040', loan.jumlahPinjaman, 'DEBIT');
      updateAkaunBaki('1010', loan.jumlahPinjaman, 'KREDIT');
    }

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'PEMBIAYAAN',
      tindakan: `Keputusan Pembiayaan (${newStatus})`,
      deskripsi: `Permohonan pembiayaan ${loan.id} bagi ${loan.namaAhli} bernilai RM${loan.jumlahPinjaman} telah ${newStatus.toLowerCase()} oleh ALK.`,
      pengguna: 'Ahli Lembaga Koperasi (ALK)',
      noAhli: loan.noAhli,
      namaAhli: loan.namaAhli,
      status: newStatus === 'DILULUSKAN' ? 'BERJAYA' : 'BATAL',
      jumlahRM: loan.jumlahPinjaman,
      ipAlamat: '10.0.4.18',
    });
  };

  // Handler: Bulk Posting Monthly Payroll Deductions
  const handlePostMonthlyPayroll = (bulkEntries: Array<{ noAhli: string; syer: number; yuran: number; pinjaman: number }>) => {
    let totalSyerPosted = 0;
    let totalYuranPosted = 0;
    let totalPinjamanPosted = 0;

    bulkEntries.forEach(entry => {
      totalSyerPosted += entry.syer;
      totalYuranPosted += entry.yuran;
      totalPinjamanPosted += entry.pinjaman;

      // Update individual member balances
      setAhliList(prev => prev.map(a => {
        if (a.noAhli === entry.noAhli) {
          return {
            ...a,
            modalSyer: a.modalSyer + entry.syer,
            bakiPinjaman: Math.max(0, a.bakiPinjaman - entry.pinjaman),
          };
        }
        return a;
      }));

      // Reduce loan balances in pembiayaan list
      if (entry.pinjaman > 0) {
        setPembiayaanList(prev => prev.map(p => {
          if (p.noAhli === entry.noAhli && p.status === 'DILULUSKAN') {
            return {
              ...p,
              bakiPinjaman: Math.max(0, p.bakiPinjaman - entry.pinjaman),
            };
          }
          return p;
        }));
      }
    });

    const totalBankReceived = totalSyerPosted + totalYuranPosted + totalPinjamanPosted;

    // Create summary journal transactions
    const txPayroll: Transaksi = {
      id: `TX-PR-${Date.now()}`,
      tarikh: new Date().toISOString().split('T')[0],
      noRujukan: `RST-BPA-${Date.now()}`,
      perihal: `Penerimaan Potongan Gaji Bulanan BPA/Majikan (Syer, Yuran & Loan Repayments)`,
      debitAkaunKod: '1010', // Bank
      kreditAkaunKod: '3010', // Modal Syer & Yuran
      jumlah: totalBankReceived,
      kategori: 'POTONGAN_GAJI',
      dikemaskiniOleh: 'Posting Automatik Gaji',
    };

    setTransaksiList(prev => [txPayroll, ...prev]);
    updateAkaunBaki('1010', totalBankReceived, 'DEBIT');
    updateAkaunBaki('3010', totalSyerPosted, 'KREDIT');
    updateAkaunBaki('2020', totalYuranPosted, 'KREDIT');
    if (totalPinjamanPosted > 0) {
      updateAkaunBaki('1040', totalPinjamanPosted, 'KREDIT');
    }

    handleAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'POTONGAN_GAJI',
      tindakan: 'Posting Penuh Potongan Gaji Bulanan',
      deskripsi: `Pemprosesan potongan gaji bagi ${bulkEntries.length} ahli disahkan & diposting. Jumlah diterima RM${totalBankReceived}.`,
      pengguna: 'Bendahari / Sistem BPA',
      status: 'BERJAYA',
      jumlahRM: totalBankReceived,
      ipAlamat: '172.16.0.5',
    });
  };

  const pendingCount = ahliList.filter(a => a.status === 'PENDING_AL').length;

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        language={language}
        setLanguage={setLanguage}
        logoutMessage={logoutMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 15-Minute Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <SessionTimeoutModal
          remainingSeconds={remainingSeconds}
          onExtendSession={handleExtendSession}
          onLogout={handleLogout}
          language={language}
        />
      )}

      {/* Top Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onPrintCurrentView={() => window.print()}
        activeTab={activeTab}
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        language={language}
        userRole={currentUser?.role}
      />

      {/* Primary Application Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <DashboardOverview
            ahliList={ahliList}
            cartaAkaun={cartaAkaun}
            transaksiList={transaksiList}
            pembiayaanList={pembiayaanList}
            mesyuaratList={mesyuaratList}
            setActiveTab={setActiveTab}
            onOpenNewMemberModal={() => setActiveTab('members')}
            onOpenNewTxModal={() => {
              setActiveTab('accounting');
              setShowNewTxModalDirect(true);
            }}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'members' && (
          <MemberManagement
            ahliList={ahliList}
            onAddAhli={handleAddAhli}
            onUpdateStatusAhli={handleUpdateStatusAhli}
            onTambahSyerAhli={handleTambahSyerAhli}
            searchQuery={searchQuery}
            language={language}
            setLanguage={setLanguage}
            onNavigateToGovernance={() => setActiveTab('governance')}
          />
        )}

        {activeTab === 'savings' && (
          <MemberSavingsDeposit
            savingsList={savingsList}
            ahliList={ahliList}
            onAddSavingsAccount={handleAddSavingsAccount}
            onUpdateSavingsAccount={handleUpdateSavingsAccount}
            onAddTransaction={handleAddSavingsTransaction}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'governance' && (
          <GovernanceCommittees
            jawatanKuasaList={jawatanKuasaList}
            ahliList={ahliList}
            onAddJawatankuasa={handleAddJawatankuasa}
            onUpdateJawatankuasa={handleUpdateJawatankuasa}
            onDeleteJawatankuasa={handleDeleteJawatankuasa}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'welfare' && (
          <WelfareFundManagement
            tuntutanList={tuntutanList}
            summary={welfareSummary}
            ahliList={ahliList}
            onAddClaim={handleAddClaim}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingManagement
            mesyuaratList={mesyuaratList}
            setMesyuaratList={setMesyuaratList}
            ahliList={ahliList}
            onAddLog={handleAddLog}
            logs={logs}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'pos' && (
          <PointOfSale
            produkList={produkList}
            setProdukList={setProdukList}
            transaksiPosList={transaksiPosList}
            setTransaksiPosList={setTransaksiPosList}
            ahliList={ahliList}
            cartaAkaun={cartaAkaun}
            setCartaAkaun={setCartaAkaun}
            onAddTransaksiLejar={handleAddTransaksi}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingTransactions
            cartaAkaun={cartaAkaun}
            transaksiList={transaksiList}
            onAddTransaksi={handleAddTransaksi}
            searchQuery={searchQuery}
            showNewTxModalDirect={showNewTxModalDirect}
            onCloseNewTxModalDirect={() => setShowNewTxModalDirect(false)}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'bank-recon' && (
          <BankReconciliation
            bankItems={bankItems}
            reconSummary={bankReconSummary}
            transaksiList={transaksiList}
            cartaAkaun={cartaAkaun}
            onAddBankItem={handleAddBankItem}
            onUpdateBankItem={handleUpdateBankItem}
            onUpdateReconSummary={handleUpdateReconSummary}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'fixed-assets' && (
          <FixedAssetManagement
            assetList={assetList}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onRunDepreciation={handleRunDepreciation}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'financing' && (
          <LoanFinancing
            pembiayaanList={pembiayaanList}
            ahliList={ahliList}
            transaksiList={transaksiList}
            onAddPembiayaan={handleAddPembiayaan}
            onUpdateStatusPembiayaan={handleUpdateStatusPembiayaan}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'skm-funds' && (
          <SKMFundsTracking
            danaList={danaList}
            onAddExpense={handleAddSkmExpense}
            onAddRepayment={handleAddSkmRepayment}
            onAddNewFund={handleAddSkmFund}
            dokumenList={dokumenList}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'e-invoice' && (
          <SKMAndEInvoiceBridge
            eInvoiceList={eInvoiceList}
            ahliList={ahliList}
            cartaAkaun={cartaAkaun}
            transaksiList={transaksiList}
            onAddEInvoice={handleAddEInvoice}
            onUpdateEInvoice={handleUpdateEInvoice}
            onFetchEKoperasiData={api.getEKoperasiExportData}
            language={language}
            userRole={currentUser?.role}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollDeductions
            ahliList={ahliList}
            pembiayaanList={pembiayaanList}
            onPostMonthlyPayroll={handlePostMonthlyPayroll}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialStatements
            cartaAkaun={cartaAkaun}
            rekodTahunanList={rekodTahunanList}
            onAddRekodTahunan={handleAddRekodTahunan}
            onOpenAIAudit={() => setActiveTab('ai-audit')}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManagement
            dokumenList={dokumenList}
            onAddDokumen={handleAddDokumen}
            onUpdateStatusDokumen={handleUpdateStatusDokumen}
            onDeleteDokumen={handleDeleteDokumen}
            language={language}
            setLanguage={setLanguage}
            onAddLog={(tajuk, butiran) => handleAddLog({
              id: `LOG-${Date.now()}`,
              tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
              pengguna: currentUser?.name || 'Pentadbir Sistem',
              tindakan: tajuk,
              deskripsi: butiran,
              kategori: 'PENTADBIRAN',
              status: 'INFO',
            })}
          />
        )}

        {activeTab === 'dividend' && (
          <DividendDistribution
            ahliList={ahliList}
            totalUntungBersih={untungBersih}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceChecker
            ahliList={ahliList}
            cartaAkaun={cartaAkaun}
            transaksiList={transaksiList}
            pembiayaanList={pembiayaanList}
            mesyuaratList={mesyuaratList}
            dokumenList={dokumenList}
            jawatanKuasaList={jawatanKuasaList}
            rekodTahunanList={rekodTahunanList}
            untungBersihSemasa={untungBersih}
            onNavigateToTab={setActiveTab}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'automated-reports' && (
          <AutomatedReports
            cartaAkaun={cartaAkaun}
            ahliList={ahliList}
            pembiayaanList={pembiayaanList}
            transaksiList={transaksiList}
            logs={logs}
            mesyuaratList={mesyuaratList}
            rekodTahunanList={rekodTahunanList}
            language={language}
            onAddLog={handleAddLog}
          />
        )}

        {activeTab === 'logs' && (
          <ActivityLog
            logs={logs}
            onAddLog={handleAddLog}
            searchQuery={searchQuery}
            language={language}
            setLanguage={setLanguage}
          />
        )}

        {activeTab === 'ai-audit' && (
          <AIAuditAdvisor
            cartaAkaun={cartaAkaun}
            ahliList={ahliList}
            transaksiList={transaksiList}
            pembiayaanList={pembiayaanList}
            language={language}
            setLanguage={setLanguage}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-medium text-slate-300">
          {language === 'EN'
            ? 'Malaysian Co-operative Management & Accounting System (SPPKM)'
            : 'Sistem Pengurusan & Perakaunan Koperasi Malaysia (SPPKM)'}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {language === 'EN'
            ? 'Compliant with Co-operative Societies Act 1993, Co-operative Regulations 1995 & Suruhanjaya Koperasi Malaysia (SKM) Guidelines.'
            : 'Mematuhi Akta Koperasi 1993, Peraturan-Peraturan Koperasi 1995 & Garis Panduan Suruhanjaya Koperasi Malaysia (SKM).'}
        </p>
        <p className="text-[11px] text-slate-400 mt-2 font-mono">
          {language === 'EN'
            ? 'Copyright © 2026 Verttere Solutions (IP0430882-T). All Rights Reserved.'
            : 'Hak Cipta Terpelihara © 2026 Verttere Solutions (IP0430882-T). All Rights Reserved.'}
        </p>
      </footer>

    </div>
  );
}
