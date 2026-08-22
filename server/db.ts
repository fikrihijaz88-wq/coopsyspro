import fs from "fs";
import path from "path";
import { 
  Ahli, 
  CartaAkaun, 
  Transaksi, 
  PembiayaanAhli, 
  ActivityLog, 
  Mesyuarat, 
  DokumenSokongan, 
  ItemProdukPOS, 
  TransaksiPOS, 
  AnggotaJawatankuasa, 
  RekodKewanganTahunan,
  DanaGeranSKM,
  RekodPenggunaanDana,
  RekodBayaranBalikPinjamanSKM,
  TuntutanKebajikan,
  TabungKebajikanSummary,
  AsetTetap,
  AkaunSimpananDeposit,
  TransaksiSimpanan,
  ItemPenyataBank,
  PenyataPenyesuaianBank,
  EInvoisLHDN,
  PaymentGatewayConfig,
  GatewayTransaction,
  SettlementBatch,
  NotificationTemplate,
  NotificationLog,
  NotificationConfig
} from "../src/types";

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
  INITIAL_E_INVOICES,
  INITIAL_PAYMENT_GATEWAY_CONFIG,
  INITIAL_GATEWAY_TRANSACTIONS,
  INITIAL_SETTLEMENT_BATCHES,
  INITIAL_NOTIFICATION_CONFIG,
  INITIAL_NOTIFICATION_TEMPLATES,
  INITIAL_NOTIFICATION_LOGS
} from "../src/data/initialData";

export interface UserAccount {
  id: string;
  email: string;
  password: string; // Stored password / hash
  name: string;
  role: 'BENDAHARI' | 'PENGERUSI_ALK' | 'SETIAUSAHA' | 'AUDITOR_JAD' | 'JURUWANG_POS' | 'AHLI_KOPERASI';
  roleLabel: string;
  noAhli?: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface KoperasiDatabaseSchema {
  users: UserAccount[];
  members: Ahli[];
  accounts: CartaAkaun[];
  transactions: Transaksi[];
  loans: PembiayaanAhli[];
  meetings: Mesyuarat[];
  documents: DokumenSokongan[];
  posProducts: ItemProdukPOS[];
  posTransactions: TransaksiPOS[];
  committees: AnggotaJawatankuasa[];
  yearlyRecords: RekodKewanganTahunan[];
  skmFunds: DanaGeranSKM[];
  welfareClaims: TuntutanKebajikan[];
  welfareSummary: TabungKebajikanSummary;
  fixedAssets: AsetTetap[];
  savingsDeposits: AkaunSimpananDeposit[];
  bankStatements: ItemPenyataBank[];
  bankReconSummary: PenyataPenyesuaianBank;
  eInvoices: EInvoisLHDN[];
  gatewayConfig: PaymentGatewayConfig;
  gatewayTransactions: GatewayTransaction[];
  settlementBatches: SettlementBatch[];
  notificationConfig: NotificationConfig;
  notificationTemplates: NotificationTemplate[];
  notificationLogs: NotificationLog[];
  logs: ActivityLog[];
  meta: {
    koperasiName: string;
    registrationNo: string;
    lastUpdated: string;
    version: string;
  };
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "koperasi_db.json");

// Default initial users
const DEFAULT_USERS: UserAccount[] = [
  {
    id: "USR-001",
    email: "bendahari@koperasi.my",
    password: "koperasi123",
    name: "Haji Ahmad Zaki",
    role: "BENDAHARI",
    roleLabel: "Bendahari Koperasi",
    noAhli: "KOP-2021-003",
  },
  {
    id: "USR-002",
    email: "pengerusi@koperasi.my",
    password: "koperasi123",
    name: "Dato' Hj. Razali Ismail",
    role: "PENGERUSI_ALK",
    roleLabel: "Pengerusi ALK",
    noAhli: "KOP-2021-001",
  },
  {
    id: "USR-003",
    email: "setiausaha@koperasi.my",
    password: "koperasi123",
    name: "Puan Noraini Hashim",
    role: "SETIAUSAHA",
    roleLabel: "Setiausaha Pentadbiran",
    noAhli: "KOP-2021-002",
  },
  {
    id: "USR-004",
    email: "auditor@koperasi.my",
    password: "koperasi123",
    name: "En. Tan Chee Keong",
    role: "AUDITOR_JAD",
    roleLabel: "Auditor Dalaman (JAD)",
    noAhli: "KOP-2021-005",
  },
  {
    id: "USR-005",
    email: "juruwang@koperasi.my",
    password: "koperasi123",
    name: "Cik Farah Nabilah",
    role: "JURUWANG_POS",
    roleLabel: "Juruwang Kedai POS",
  },
  {
    id: "USR-006",
    email: "ahli@koperasi.my",
    password: "koperasi123",
    name: "Siti Nurhaliza Bt Mohd Safian",
    role: "AHLI_KOPERASI",
    roleLabel: "Anggota Koperasi",
    noAhli: "KOP-2021-002",
  },
];

class KoperasiDatabase {
  private data: KoperasiDatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private getInitialData(): KoperasiDatabaseSchema {
    return {
      users: DEFAULT_USERS,
      members: INITIAL_AHLI,
      accounts: INITIAL_CARTA_AKAUN,
      transactions: INITIAL_TRANSAKSI,
      loans: INITIAL_PEMBIAYAAN,
      meetings: INITIAL_MESYUARAT,
      documents: INITIAL_DOKUMEN_SOKONGAN,
      posProducts: INITIAL_PRODUK_POS,
      posTransactions: INITIAL_TRANSAKSI_POS,
      committees: INITIAL_ALK_JAD,
      yearlyRecords: INITIAL_REKOD_KEWANGAN_TAHUNAN,
      skmFunds: INITIAL_DANA_GERAN_SKM,
      welfareClaims: INITIAL_TUNTUTAN_KEBAJIKAN,
      welfareSummary: INITIAL_TABUNG_KEBAJIKAN,
      fixedAssets: INITIAL_ASET_TETAP,
      savingsDeposits: INITIAL_SIMPANAN_DEPOSIT,
      bankStatements: INITIAL_BANK_STATEMENT_ITEMS,
      bankReconSummary: INITIAL_BANK_RECON_SUMMARY,
      eInvoices: INITIAL_E_INVOICES,
      gatewayConfig: INITIAL_PAYMENT_GATEWAY_CONFIG,
      gatewayTransactions: INITIAL_GATEWAY_TRANSACTIONS,
      settlementBatches: INITIAL_SETTLEMENT_BATCHES,
      notificationConfig: INITIAL_NOTIFICATION_CONFIG,
      notificationTemplates: INITIAL_NOTIFICATION_TEMPLATES,
      notificationLogs: INITIAL_NOTIFICATION_LOGS,
      logs: INITIAL_LOGS,
      meta: {
        koperasiName: "Koperasi Warga Berdaya Malaysia Berhad",
        registrationNo: "SKM-W-4921/2018",
        lastUpdated: new Date().toISOString(),
        version: "2.6.0-PRO",
      },
    };
  }

  private loadDatabase(): KoperasiDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        console.log("💾 [DB] Loaded persistent data successfully from", DB_FILE);
        
        // Merge with initial datasets, prioritizing newer complete sets
        const mergedMembers = (parsed.members && parsed.members.length >= INITIAL_AHLI.length)
          ? parsed.members
          : INITIAL_AHLI;

        const mergedCommittees = (parsed.committees && parsed.committees.length >= INITIAL_ALK_JAD.length)
          ? parsed.committees
          : INITIAL_ALK_JAD;

        const mergedSkmFunds = (parsed.skmFunds && parsed.skmFunds.length >= INITIAL_DANA_GERAN_SKM.length)
          ? parsed.skmFunds
          : INITIAL_DANA_GERAN_SKM;

        const mergedWelfareClaims = (parsed.welfareClaims && parsed.welfareClaims.length >= INITIAL_TUNTUTAN_KEBAJIKAN.length)
          ? parsed.welfareClaims
          : INITIAL_TUNTUTAN_KEBAJIKAN;

        const mergedFixedAssets = (parsed.fixedAssets && parsed.fixedAssets.length >= INITIAL_ASET_TETAP.length)
          ? parsed.fixedAssets
          : INITIAL_ASET_TETAP;

        const mergedSavings = (parsed.savingsDeposits && parsed.savingsDeposits.length >= INITIAL_SIMPANAN_DEPOSIT.length)
          ? parsed.savingsDeposits
          : INITIAL_SIMPANAN_DEPOSIT;

        const mergedBankStatements = (parsed.bankStatements && parsed.bankStatements.length >= INITIAL_BANK_STATEMENT_ITEMS.length)
          ? parsed.bankStatements
          : INITIAL_BANK_STATEMENT_ITEMS;

        const mergedEInvoices = (parsed.eInvoices && parsed.eInvoices.length >= INITIAL_E_INVOICES.length)
          ? parsed.eInvoices
          : INITIAL_E_INVOICES;

        const mergedGatewayTransactions = (parsed.gatewayTransactions && parsed.gatewayTransactions.length >= INITIAL_GATEWAY_TRANSACTIONS.length)
          ? parsed.gatewayTransactions
          : INITIAL_GATEWAY_TRANSACTIONS;

        const mergedSettlementBatches = (parsed.settlementBatches && parsed.settlementBatches.length >= INITIAL_SETTLEMENT_BATCHES.length)
          ? parsed.settlementBatches
          : INITIAL_SETTLEMENT_BATCHES;

        const mergedData: KoperasiDatabaseSchema = {
          ...this.getInitialData(),
          ...parsed,
          members: mergedMembers,
          committees: mergedCommittees,
          skmFunds: mergedSkmFunds,
          welfareClaims: mergedWelfareClaims,
          welfareSummary: parsed.welfareSummary || INITIAL_TABUNG_KEBAJIKAN,
          fixedAssets: mergedFixedAssets,
          savingsDeposits: mergedSavings,
          bankStatements: mergedBankStatements,
          bankReconSummary: parsed.bankReconSummary || INITIAL_BANK_RECON_SUMMARY,
          eInvoices: mergedEInvoices,
          gatewayConfig: parsed.gatewayConfig || INITIAL_PAYMENT_GATEWAY_CONFIG,
          gatewayTransactions: mergedGatewayTransactions,
          settlementBatches: mergedSettlementBatches,
        };

        // Persist the updated complete dataset
        this.persistSync(mergedData);
        return mergedData;
      }
    } catch (err) {
      console.error("⚠️ [DB] Failed to read db file, initializing default dataset:", err);
    }

    const initial = this.getInitialData();
    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: KoperasiDatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
      console.log("💾 [DB] Data persisted to file.");
    } catch (err) {
      console.error("❌ [DB] Error persisting data:", err);
    }
  }

  public save() {
    this.data.meta.lastUpdated = new Date().toISOString();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
      this.saveTimeout = null;
    }, 200);
  }

  // Getters
  public getAllData() {
    return this.data;
  }

  public getUsers() {
    return this.data.users;
  }

  public getMembers() {
    return this.data.members;
  }

  public getAccounts() {
    return this.data.accounts;
  }

  public getTransactions() {
    return this.data.transactions;
  }

  public getLoans() {
    return this.data.loans;
  }

  public getMeetings() {
    return this.data.meetings;
  }

  public getDocuments() {
    return this.data.documents;
  }

  public getPosProducts() {
    return this.data.posProducts;
  }

  public getPosTransactions() {
    return this.data.posTransactions;
  }

  public getCommittees() {
    return this.data.committees;
  }

  public getYearlyRecords() {
    return this.data.yearlyRecords;
  }

  public getSkmFunds() {
    return this.data.skmFunds;
  }

  public getLogs() {
    return this.data.logs;
  }

  // CRUD Mutations
  public addMember(member: Ahli) {
    this.data.members = [member, ...this.data.members];
    this.save();
    return member;
  }

  public updateMember(id: string, updated: Partial<Ahli>) {
    this.data.members = this.data.members.map((m) => (m.id === id ? { ...m, ...updated } : m));
    this.save();
    return this.data.members.find((m) => m.id === id);
  }

  public deleteMember(id: string) {
    this.data.members = this.data.members.filter((m) => m.id !== id);
    this.save();
    return true;
  }

  public updateAccount(kod: string, updated: Partial<CartaAkaun>) {
    this.data.accounts = this.data.accounts.map((a) => (a.kod === kod ? { ...a, ...updated } : a));
    this.save();
    return this.data.accounts.find((a) => a.kod === kod);
  }

  public addTransaction(tx: Transaksi) {
    this.data.transactions = [tx, ...this.data.transactions];
    // Update accounts if matched
    const debitAcc = this.data.accounts.find((a) => a.kod === tx.debitAkaunKod);
    const kreditAcc = this.data.accounts.find((a) => a.kod === tx.kreditAkaunKod);
    if (debitAcc) {
      debitAcc.bakiSemasa += tx.jumlah;
    }
    if (kreditAcc) {
      kreditAcc.bakiSemasa += tx.jumlah;
    }
    this.save();
    return tx;
  }

  public deleteTransaction(id: string) {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
    this.save();
    return true;
  }

  public addLoan(loan: PembiayaanAhli) {
    this.data.loans = [loan, ...this.data.loans];
    this.save();
    return loan;
  }

  public updateLoan(id: string, updated: Partial<PembiayaanAhli>) {
    this.data.loans = this.data.loans.map((l) => (l.id === id ? { ...l, ...updated } : l));
    this.save();
    return this.data.loans.find((l) => l.id === id);
  }

  public addMeeting(meeting: Mesyuarat) {
    this.data.meetings = [meeting, ...this.data.meetings];
    this.save();
    return meeting;
  }

  public updateMeeting(id: string, updated: Partial<Mesyuarat>) {
    this.data.meetings = this.data.meetings.map((m) => (m.id === id ? { ...m, ...updated } : m));
    this.save();
    return this.data.meetings.find((m) => m.id === id);
  }

  public deleteMeeting(id: string) {
    this.data.meetings = this.data.meetings.filter((m) => m.id !== id);
    this.save();
    return true;
  }

  public addDocument(doc: DokumenSokongan) {
    this.data.documents = [doc, ...this.data.documents];
    this.save();
    return doc;
  }

  public updateDocument(id: string, updated: Partial<DokumenSokongan>) {
    this.data.documents = this.data.documents.map((d) => (d.id === id ? { ...d, ...updated } : d));
    this.save();
    return this.data.documents.find((d) => d.id === id);
  }

  public deleteDocument(id: string) {
    this.data.documents = this.data.documents.filter((d) => d.id !== id);
    this.save();
    return true;
  }

  public updatePosProduct(id: string, updated: Partial<ItemProdukPOS>) {
    this.data.posProducts = this.data.posProducts.map((p) => (p.id === id ? { ...p, ...updated } : p));
    this.save();
    return this.data.posProducts.find((p) => p.id === id);
  }

  public addPosProduct(prod: ItemProdukPOS) {
    this.data.posProducts = [prod, ...this.data.posProducts];
    this.save();
    return prod;
  }

  public addPosTransaction(tx: TransaksiPOS) {
    this.data.posTransactions = [tx, ...this.data.posTransactions];
    // Deduct stock
    tx.itemSenarai.forEach((item) => {
      const p = this.data.posProducts.find((prod) => prod.id === item.idProduk);
      if (p) {
        p.stok = Math.max(0, p.stok - item.kuantiti);
      }
    });
    this.save();
    return tx;
  }

  public addCommittee(member: AnggotaJawatankuasa) {
    this.data.committees = [member, ...this.data.committees];
    this.save();
    return member;
  }

  public updateCommittee(id: string, updated: Partial<AnggotaJawatankuasa>) {
    this.data.committees = this.data.committees.map((c) => (c.id === id ? { ...c, ...updated } : c));
    this.save();
    return this.data.committees.find((c) => c.id === id);
  }

  public deleteCommittee(id: string) {
    this.data.committees = this.data.committees.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  public addOrUpdateYearlyRecord(rec: RekodKewanganTahunan) {
    const idx = this.data.yearlyRecords.findIndex((r) => r.tahun === rec.tahun);
    if (idx >= 0) {
      this.data.yearlyRecords[idx] = rec;
    } else {
      this.data.yearlyRecords = [...this.data.yearlyRecords, rec].sort((a, b) => a.tahun - b.tahun);
    }
    this.save();
    return rec;
  }

  public addSkmFund(fund: DanaGeranSKM) {
    this.data.skmFunds = [fund, ...this.data.skmFunds];
    this.save();
    return fund;
  }

  public updateSkmFund(id: string, updated: Partial<DanaGeranSKM>) {
    this.data.skmFunds = this.data.skmFunds.map((f) => (f.id === id ? { ...f, ...updated } : f));
    this.save();
    return this.data.skmFunds.find((f) => f.id === id);
  }

  public addSkmExpense(danaId: string, exp: RekodPenggunaanDana) {
    const fund = this.data.skmFunds.find((f) => f.id === danaId);
    if (fund) {
      fund.penggunaanDanaList = [exp, ...(fund.penggunaanDanaList || [])];
      fund.bakiBelumDibelanja = Math.max(0, fund.bakiBelumDibelanja - exp.jumlahRM);
      this.save();
      return exp;
    }
    return null;
  }

  public addSkmRepayment(danaId: string, rep: RekodBayaranBalikPinjamanSKM) {
    const fund = this.data.skmFunds.find((f) => f.id === danaId);
    if (fund) {
      fund.bayaranBalikList = [rep, ...(fund.bayaranBalikList || [])];
      fund.jumlahTelahDibayarBalik = (fund.jumlahTelahDibayarBalik || 0) + rep.jumlahBayaranRM;
      fund.bakiPinjamanSKMTertunggak = Math.max(0, (fund.bakiPinjamanSKMTertunggak || 0) - rep.prinsipalRM);
      this.save();
      return rep;
    }
    return null;
  }

  // Welfare Fund Methods
  public getWelfareClaims(): TuntutanKebajikan[] {
    return this.data.welfareClaims || [];
  }

  public addWelfareClaim(claim: TuntutanKebajikan): TuntutanKebajikan {
    this.data.welfareClaims = [claim, ...(this.data.welfareClaims || [])];
    this.save();
    return claim;
  }

  public updateWelfareClaim(id: string, updated: Partial<TuntutanKebajikan>): TuntutanKebajikan | null {
    this.data.welfareClaims = (this.data.welfareClaims || []).map((c) =>
      c.id === id ? { ...c, ...updated } : c
    );
    this.save();
    return this.data.welfareClaims.find((c) => c.id === id) || null;
  }

  public getWelfareSummary(): TabungKebajikanSummary {
    return this.data.welfareSummary || INITIAL_TABUNG_KEBAJIKAN;
  }

  public updateWelfareSummary(summary: TabungKebajikanSummary): TabungKebajikanSummary {
    this.data.welfareSummary = summary;
    this.save();
    return this.data.welfareSummary;
  }

  // Fixed Asset Methods
  public getFixedAssets(): AsetTetap[] {
    return this.data.fixedAssets || [];
  }

  public addFixedAsset(asset: AsetTetap): AsetTetap {
    this.data.fixedAssets = [asset, ...(this.data.fixedAssets || [])];
    this.save();
    return asset;
  }

  public updateFixedAsset(id: string, updated: Partial<AsetTetap>): AsetTetap | null {
    this.data.fixedAssets = (this.data.fixedAssets || []).map((a) =>
      a.id === id ? { ...a, ...updated } : a
    );
    this.save();
    return this.data.fixedAssets.find((a) => a.id === id) || null;
  }

  public runDepreciation(year: number): { year: number; totalDepreciationRM: number; assetsUpdated: number } {
    let totalDepreciationRM = 0;
    let assetsUpdated = 0;

    this.data.fixedAssets = (this.data.fixedAssets || []).map((asset) => {
      if (asset.status !== 'AKTIF') return asset;

      // Check if already depreciated for this year
      const alreadyHasYear = (asset.sejarahSusutnilai || []).some((s) => s.tahun === year);
      if (alreadyHasYear) return asset;

      let annualDep = 0;
      if (asset.kaedahSusutnilai === 'GARIS_LURUS') {
        const depreciableBase = Math.max(0, asset.kosAsal - asset.nilaiSisa);
        annualDep = Math.round((depreciableBase * (asset.kadarSusutnilaiPeratus / 100)) * 100) / 100;
      } else {
        // Reducing balance
        annualDep = Math.round((asset.nilaiBukuBersihSemasa * (asset.kadarSusutnilaiPeratus / 100)) * 100) / 100;
      }

      // Cap at NBV - residual value
      annualDep = Math.min(annualDep, Math.max(0, asset.nilaiBukuBersihSemasa - asset.nilaiSisa));
      if (annualDep <= 0) return asset;

      const newAccumulated = asset.susutnilaiTerkumpulSemasa + annualDep;
      const newNBV = Math.max(asset.nilaiSisa, asset.kosAsal - newAccumulated);

      const newRecord = {
        tahun: year,
        nilaiAwalTahun: asset.nilaiBukuBersihSemasa,
        kadarSusutnilaiPeratus: asset.kadarSusutnilaiPeratus,
        belanjaSusutnilaiTahun: annualDep,
        susutnilaiTerkumpul: newAccumulated,
        nilaiBukuBersihAkhirTahun: newNBV,
      };

      totalDepreciationRM += annualDep;
      assetsUpdated += 1;

      return {
        ...asset,
        susutnilaiTerkumpulSemasa: newAccumulated,
        nilaiBukuBersihSemasa: newNBV,
        sejarahSusutnilai: [...(asset.sejarahSusutnilai || []), newRecord],
      };
    });

    this.save();
    return { year, totalDepreciationRM, assetsUpdated };
  }

  // ==========================================
  // SIMPANAN KHAS & DEPOSIT TETAP
  // ==========================================
  public getSavingsDeposits(): AkaunSimpananDeposit[] {
    return this.data.savingsDeposits || [];
  }

  public addSavingsDeposit(account: AkaunSimpananDeposit): AkaunSimpananDeposit {
    this.data.savingsDeposits = [account, ...(this.data.savingsDeposits || [])];
    this.save();
    return account;
  }

  public updateSavingsDeposit(id: string, updates: Partial<AkaunSimpananDeposit>): AkaunSimpananDeposit | null {
    const idx = (this.data.savingsDeposits || []).findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.savingsDeposits[idx] = { ...this.data.savingsDeposits[idx], ...updates };
    this.save();
    return this.data.savingsDeposits[idx];
  }

  public addSavingsTransaction(id: string, tx: TransaksiSimpanan): AkaunSimpananDeposit | null {
    const idx = (this.data.savingsDeposits || []).findIndex(s => s.id === id);
    if (idx === -1) return null;
    const account = this.data.savingsDeposits[idx];
    const newHistory = [tx, ...(account.sejarahTransaksi || [])];
    this.data.savingsDeposits[idx] = {
      ...account,
      bakiSemasa: tx.bakiSelepas,
      sejarahTransaksi: newHistory
    };
    this.save();
    return this.data.savingsDeposits[idx];
  }

  // ==========================================
  // PENYATA PENYESUAIAN BANK
  // ==========================================
  public getBankStatements(): ItemPenyataBank[] {
    return this.data.bankStatements || [];
  }

  public addBankStatementItem(item: ItemPenyataBank): ItemPenyataBank {
    this.data.bankStatements = [item, ...(this.data.bankStatements || [])];
    this.save();
    return item;
  }

  public updateBankStatementItem(id: string, updates: Partial<ItemPenyataBank>): ItemPenyataBank | null {
    const idx = (this.data.bankStatements || []).findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.bankStatements[idx] = { ...this.data.bankStatements[idx], ...updates };
    this.save();
    return this.data.bankStatements[idx];
  }

  public getBankReconSummary(): PenyataPenyesuaianBank {
    return this.data.bankReconSummary || INITIAL_BANK_RECON_SUMMARY;
  }

  public updateBankReconSummary(summary: PenyataPenyesuaianBank): PenyataPenyesuaianBank {
    this.data.bankReconSummary = summary;
    this.save();
    return this.data.bankReconSummary;
  }

  // ==========================================
  // e-INVOIS LHDN MALAYSIA
  // ==========================================
  public getEInvoices(): EInvoisLHDN[] {
    return this.data.eInvoices || [];
  }

  public addEInvoice(invoice: EInvoisLHDN): EInvoisLHDN {
    this.data.eInvoices = [invoice, ...(this.data.eInvoices || [])];
    this.save();
    return invoice;
  }

  public updateEInvoice(uuid: string, updates: Partial<EInvoisLHDN>): EInvoisLHDN | null {
    const idx = (this.data.eInvoices || []).findIndex(e => e.uuid === uuid);
    if (idx === -1) return null;
    this.data.eInvoices[idx] = { ...this.data.eInvoices[idx], ...updates };
    this.save();
    return this.data.eInvoices[idx];
  }

  // ==========================================
  // PAYMENT GATEWAY & ESCROW SETTLEMENT (VERTTERE)
  // ==========================================
  public getGatewayConfig(): PaymentGatewayConfig {
    return this.data.gatewayConfig || INITIAL_PAYMENT_GATEWAY_CONFIG;
  }

  public updateGatewayConfig(updates: Partial<PaymentGatewayConfig>): PaymentGatewayConfig {
    this.data.gatewayConfig = {
      ...(this.data.gatewayConfig || INITIAL_PAYMENT_GATEWAY_CONFIG),
      ...updates
    };
    this.save();
    return this.data.gatewayConfig;
  }

  public getGatewayTransactions(): GatewayTransaction[] {
    return this.data.gatewayTransactions || [];
  }

  public addGatewayTransaction(tx: GatewayTransaction): GatewayTransaction {
    this.data.gatewayTransactions = [tx, ...(this.data.gatewayTransactions || [])];
    this.save();
    return tx;
  }

  public updateGatewayTransaction(id: string, updates: Partial<GatewayTransaction>): GatewayTransaction | null {
    const idx = (this.data.gatewayTransactions || []).findIndex(t => t.id === id || t.billCode === id);
    if (idx === -1) return null;
    this.data.gatewayTransactions[idx] = { ...this.data.gatewayTransactions[idx], ...updates };
    this.save();
    return this.data.gatewayTransactions[idx];
  }

  public getSettlementBatches(): SettlementBatch[] {
    return this.data.settlementBatches || [];
  }

  public createSettlementBatch(batch: SettlementBatch): SettlementBatch {
    this.data.settlementBatches = [batch, ...(this.data.settlementBatches || [])];
    // Mark associated transactions as DILEPASKAN_KE_KOPERASI
    if (this.data.gatewayTransactions) {
      this.data.gatewayTransactions = this.data.gatewayTransactions.map(tx => {
        if (tx.status === 'BERJAYA' && !tx.noBatchSettlement) {
          return {
            ...tx,
            status: 'DILEPASKAN_KE_KOPERASI',
            noBatchSettlement: batch.batchNo
          };
        }
        return tx;
      });
    }
    this.save();
    return batch;
  }

  public updateSettlementBatch(id: string, updates: Partial<SettlementBatch>): SettlementBatch | null {
    const idx = (this.data.settlementBatches || []).findIndex(b => b.id === id || b.batchNo === id);
    if (idx === -1) return null;
    this.data.settlementBatches[idx] = { ...this.data.settlementBatches[idx], ...updates };
    this.save();
    return this.data.settlementBatches[idx];
  }

  public addLog(log: ActivityLog) {
    this.data.logs = [log, ...this.data.logs];
    this.save();
    return log;
  }

  // -------------------------------------------------------------
  // Notification Methods
  // -------------------------------------------------------------
  public getNotificationConfig(): NotificationConfig {
    return this.data.notificationConfig || INITIAL_NOTIFICATION_CONFIG;
  }

  public updateNotificationConfig(cfg: Partial<NotificationConfig>): NotificationConfig {
    this.data.notificationConfig = { ...this.getNotificationConfig(), ...cfg };
    this.save();
    return this.data.notificationConfig;
  }

  public getNotificationTemplates(): NotificationTemplate[] {
    return this.data.notificationTemplates || INITIAL_NOTIFICATION_TEMPLATES;
  }

  public addNotificationTemplate(tmpl: NotificationTemplate): NotificationTemplate {
    this.data.notificationTemplates = [tmpl, ...(this.data.notificationTemplates || [])];
    this.save();
    return tmpl;
  }

  public updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate | null {
    const idx = (this.data.notificationTemplates || []).findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.notificationTemplates[idx] = { ...this.data.notificationTemplates[idx], ...updates };
    this.save();
    return this.data.notificationTemplates[idx];
  }

  public deleteNotificationTemplate(id: string): boolean {
    const initialLen = (this.data.notificationTemplates || []).length;
    this.data.notificationTemplates = (this.data.notificationTemplates || []).filter(t => t.id !== id);
    this.save();
    return this.data.notificationTemplates.length < initialLen;
  }

  public getNotificationLogs(): NotificationLog[] {
    return this.data.notificationLogs || INITIAL_NOTIFICATION_LOGS;
  }

  public addNotificationLog(log: NotificationLog): NotificationLog {
    this.data.notificationLogs = [log, ...(this.data.notificationLogs || [])];
    if (log.saluran === 'SMS' && this.data.notificationConfig) {
      this.data.notificationConfig.smsBalanceCredits = Math.max(0, (this.data.notificationConfig.smsBalanceCredits || 850) - 1);
    }
    this.save();
    return log;
  }

  public authenticate(email: string, pass: string): UserAccount | null {
    const user = this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === pass
    );
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.save();
      return user;
    }
    return null;
  }
}

export const db = new KoperasiDatabase();
