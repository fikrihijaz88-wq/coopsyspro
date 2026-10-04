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
  NotificationConfig,
  SystemSupportTicket
} from "../src/types";

import { createEmptyDatabase } from "../src/data/emptyData";
import type { KoperasiDatabaseSchema, UserAccount } from "../src/data/databaseSchema";
import { databaseFilePath, loadDatabase, persistDatabase } from "./storage";
export type { KoperasiDatabaseSchema, UserAccount } from "../src/data/databaseSchema";

// Importing this module is side-effect free. Runtime initialization lives in runtimeDb.ts.
export class KoperasiDatabase {
  private data: KoperasiDatabaseSchema;
  private persistedBytes: Buffer;
  private readonly empty = createEmptyDatabase();
  private readonly filePath: string;

  constructor(options: { filePath?: string } = {}) {
    this.filePath = options.filePath || databaseFilePath();
    const loaded = loadDatabase(this.filePath);
    this.data = loaded.data;
    this.persistedBytes = loaded.bytes;
  }

  public save() {
    // A request succeeds only after persistence. On failure, discard unsaved changes.
    const previousBytes = this.persistedBytes;
    try {
      this.data.meta.lastUpdated = new Date().toISOString();
      this.persistedBytes = persistDatabase(this.filePath, this.data, previousBytes);
    } catch (error) {
      this.data = JSON.parse(previousBytes.toString("utf8"));
      console.error("[DB] Save failed; previous database preserved:", error);
      throw error;
    }
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
    return this.data.skmFunds ?? [];
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
    this.data.skmFunds = [fund, ...(this.data.skmFunds ?? [])];
    this.save();
    return fund;
  }

  public updateSkmFund(id: string, updated: Partial<DanaGeranSKM>) {
    this.data.skmFunds = (this.data.skmFunds ?? []).map((f) => (f.id === id ? { ...f, ...updated } : f));
    this.save();
    return (this.data.skmFunds ?? []).find((f) => f.id === id);
  }

  public addSkmExpense(danaId: string, exp: RekodPenggunaanDana) {
    const fund = (this.data.skmFunds ?? []).find((f) => f.id === danaId);
    if (fund) {
      fund.penggunaanDanaList = [exp, ...(fund.penggunaanDanaList || [])];
      fund.bakiBelumDibelanja = Math.max(0, fund.bakiBelumDibelanja - exp.jumlahRM);
      this.save();
      return exp;
    }
    return null;
  }

  public addSkmRepayment(danaId: string, rep: RekodBayaranBalikPinjamanSKM) {
    const fund = (this.data.skmFunds ?? []).find((f) => f.id === danaId);
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
    return this.data.welfareSummary || structuredClone(this.empty.welfareSummary);
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
    return this.data.bankReconSummary || structuredClone(this.empty.bankReconSummary);
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
    return this.data.gatewayConfig || structuredClone(this.empty.gatewayConfig);
  }

  public updateGatewayConfig(updates: Partial<PaymentGatewayConfig>): PaymentGatewayConfig {
    this.data.gatewayConfig = {
      ...(this.data.gatewayConfig || structuredClone(this.empty.gatewayConfig)),
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
    return this.data.notificationConfig || structuredClone(this.empty.notificationConfig);
  }

  public updateNotificationConfig(cfg: Partial<NotificationConfig>): NotificationConfig {
    this.data.notificationConfig = { ...this.getNotificationConfig(), ...cfg };
    this.save();
    return this.data.notificationConfig;
  }

  public getNotificationTemplates(): NotificationTemplate[] {
    return this.data.notificationTemplates || [];
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
    return this.data.notificationLogs || [];
  }

  public addNotificationLog(log: NotificationLog): NotificationLog {
    this.data.notificationLogs = [log, ...(this.data.notificationLogs || [])];
    if (log.saluran === 'SMS' && this.data.notificationConfig) {
      this.data.notificationConfig.smsBalanceCredits = Math.max(0, (this.data.notificationConfig.smsBalanceCredits ?? 0) - 1);
    }
    this.save();
    return log;
  }

  // Support Tickets Methods
  public getSupportTickets(): SystemSupportTicket[] {
    return this.data.supportTickets || [];
  }

  public addSupportTicket(ticket: SystemSupportTicket): SystemSupportTicket {
    this.data.supportTickets = [ticket, ...(this.data.supportTickets || [])];
    this.save();
    return ticket;
  }

  public updateSupportTicket(id: string, updates: Partial<SystemSupportTicket>): SystemSupportTicket | null {
    const idx = (this.data.supportTickets || []).findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.supportTickets[idx] = { ...this.data.supportTickets[idx], ...updates };
    this.save();
    return this.data.supportTickets[idx];
  }

  public deleteSupportTicket(id: string): boolean {
    const initialLen = (this.data.supportTickets || []).length;
    this.data.supportTickets = (this.data.supportTickets || []).filter(t => t.id !== id);
    this.save();
    return this.data.supportTickets.length < initialLen;
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
