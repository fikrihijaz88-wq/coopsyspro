import { 
  Ahli, 
  CartaAkaun, 
  Transaksi, 
  PembiayaanAhli, 
  Mesyuarat, 
  DokumenSokongan, 
  ItemProdukPOS, 
  TransaksiPOS, 
  AnggotaJawatankuasa, 
  RekodKewanganTahunan, 
  ActivityLog,
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
  DataExportEKoperasi,
  PaymentGatewayConfig,
  GatewayTransaction,
  SettlementBatch
} from '../types';

export const api = {
  // Sync All Data on App Launch
  async fetchAllData() {
    const res = await fetch('/api/all-data');
    if (!res.ok) throw new Error('Gagal memuat turun data daripada pelayan.');
    return res.json();
  },

  // Auth
  async login(email: string, pass: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ralat log masuk');
    }
    return res.json();
  },

  async getUsers() {
    const res = await fetch('/api/auth/users');
    return res.json();
  },

  // Members
  async getMembers(): Promise<Ahli[]> {
    const res = await fetch('/api/members');
    return res.json();
  },

  async createMember(member: Ahli): Promise<Ahli> {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return res.json();
  },

  async updateMember(id: string, member: Partial<Ahli>): Promise<Ahli> {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return res.json();
  },

  async deleteMember(id: string): Promise<boolean> {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Accounts & Transactions
  async getAccounts(): Promise<CartaAkaun[]> {
    const res = await fetch('/api/accounts');
    return res.json();
  },

  async updateAccount(kod: string, data: Partial<CartaAkaun>): Promise<CartaAkaun> {
    const res = await fetch(`/api/accounts/${kod}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getTransactions(): Promise<Transaksi[]> {
    const res = await fetch('/api/transactions');
    return res.json();
  },

  async createTransaction(tx: Transaksi): Promise<Transaksi> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Loans
  async getLoans(): Promise<PembiayaanAhli[]> {
    const res = await fetch('/api/loans');
    return res.json();
  },

  async createLoan(loan: PembiayaanAhli): Promise<PembiayaanAhli> {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loan),
    });
    return res.json();
  },

  async updateLoan(id: string, loan: Partial<PembiayaanAhli>): Promise<PembiayaanAhli> {
    const res = await fetch(`/api/loans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loan),
    });
    return res.json();
  },

  // Meetings
  async getMeetings(): Promise<Mesyuarat[]> {
    const res = await fetch('/api/meetings');
    return res.json();
  },

  async createMeeting(meeting: Mesyuarat): Promise<Mesyuarat> {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting),
    });
    return res.json();
  },

  async updateMeeting(id: string, meeting: Partial<Mesyuarat>): Promise<Mesyuarat> {
    const res = await fetch(`/api/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting),
    });
    return res.json();
  },

  async deleteMeeting(id: string): Promise<boolean> {
    const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Documents
  async getDocuments(): Promise<DokumenSokongan[]> {
    const res = await fetch('/api/documents');
    return res.json();
  },

  async createDocument(doc: DokumenSokongan): Promise<DokumenSokongan> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.json();
  },

  async updateDocument(id: string, doc: Partial<DokumenSokongan>): Promise<DokumenSokongan> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // POS
  async getPosProducts(): Promise<ItemProdukPOS[]> {
    const res = await fetch('/api/pos/products');
    return res.json();
  },

  async createPosProduct(prod: ItemProdukPOS): Promise<ItemProdukPOS> {
    const res = await fetch('/api/pos/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    });
    return res.json();
  },

  async updatePosProduct(id: string, prod: Partial<ItemProdukPOS>): Promise<ItemProdukPOS> {
    const res = await fetch(`/api/pos/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    });
    return res.json();
  },

  async getPosTransactions(): Promise<TransaksiPOS[]> {
    const res = await fetch('/api/pos/transactions');
    return res.json();
  },

  async createPosTransaction(tx: TransaksiPOS): Promise<TransaksiPOS> {
    const res = await fetch('/api/pos/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  // Governance
  async getCommittees(): Promise<AnggotaJawatankuasa[]> {
    const res = await fetch('/api/committees');
    return res.json();
  },

  async createCommittee(comm: AnggotaJawatankuasa): Promise<AnggotaJawatankuasa> {
    const res = await fetch('/api/committees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comm),
    });
    return res.json();
  },

  async updateCommittee(id: string, comm: Partial<AnggotaJawatankuasa>): Promise<AnggotaJawatankuasa> {
    const res = await fetch(`/api/committees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comm),
    });
    return res.json();
  },

  async deleteCommittee(id: string): Promise<boolean> {
    const res = await fetch(`/api/committees/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Yearly Financial Records
  async getYearlyRecords(): Promise<RekodKewanganTahunan[]> {
    const res = await fetch('/api/yearly-records');
    return res.json();
  },

  async saveYearlyRecord(rec: RekodKewanganTahunan): Promise<RekodKewanganTahunan> {
    const res = await fetch('/api/yearly-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec),
    });
    return res.json();
  },

  // Logs
  async getLogs(): Promise<ActivityLog[]> {
    const res = await fetch('/api/logs');
    return res.json();
  },

  async createLog(log: ActivityLog): Promise<ActivityLog> {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return res.json();
  },

  // SKM Loans & Grants Tracking (TMP-SKM & Geran)
  async getSkmFunds(): Promise<DanaGeranSKM[]> {
    const res = await fetch('/api/skm-funds');
    return res.json();
  },

  async createSkmFund(fund: DanaGeranSKM): Promise<DanaGeranSKM> {
    const res = await fetch('/api/skm-funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fund),
    });
    return res.json();
  },

  async updateSkmFund(id: string, fund: Partial<DanaGeranSKM>): Promise<DanaGeranSKM> {
    const res = await fetch(`/api/skm-funds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fund),
    });
    return res.json();
  },

  async addSkmExpense(danaId: string, expense: RekodPenggunaanDana): Promise<RekodPenggunaanDana> {
    const res = await fetch(`/api/skm-funds/${danaId}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    return res.json();
  },

  async addSkmRepayment(danaId: string, repayment: RekodBayaranBalikPinjamanSKM): Promise<RekodBayaranBalikPinjamanSKM> {
    const res = await fetch(`/api/skm-funds/${danaId}/repayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repayment),
    });
    return res.json();
  },

  // Welfare Fund Methods
  async getWelfareClaims(): Promise<TuntutanKebajikan[]> {
    const res = await fetch('/api/welfare/claims');
    return res.json();
  },

  async createWelfareClaim(claim: TuntutanKebajikan): Promise<TuntutanKebajikan> {
    const res = await fetch('/api/welfare/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    return res.json();
  },

  async updateWelfareClaim(id: string, claim: Partial<TuntutanKebajikan>): Promise<TuntutanKebajikan> {
    const res = await fetch(`/api/welfare/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    return res.json();
  },

  async getWelfareSummary(): Promise<TabungKebajikanSummary> {
    const res = await fetch('/api/welfare/summary');
    return res.json();
  },

  async updateWelfareSummary(summary: TabungKebajikanSummary): Promise<TabungKebajikanSummary> {
    const res = await fetch('/api/welfare/summary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
    });
    return res.json();
  },

  // Fixed Asset Methods
  async getFixedAssets(): Promise<AsetTetap[]> {
    const res = await fetch('/api/fixed-assets');
    return res.json();
  },

  async createFixedAsset(asset: AsetTetap): Promise<AsetTetap> {
    const res = await fetch('/api/fixed-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    return res.json();
  },

  async updateFixedAsset(id: string, asset: Partial<AsetTetap>): Promise<AsetTetap> {
    const res = await fetch(`/api/fixed-assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    return res.json();
  },

  async runAssetDepreciation(year: number): Promise<{ year: number; totalDepreciationRM: number; assetsUpdated: number }> {
    const res = await fetch('/api/fixed-assets/depreciate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    });
    return res.json();
  },

  // ==========================================
  // Special Savings & Member Fixed Deposits
  // ==========================================
  async getSavingsDeposits(): Promise<AkaunSimpananDeposit[]> {
    const res = await fetch('/api/savings/deposits');
    return res.json();
  },

  async createSavingsDeposit(account: AkaunSimpananDeposit): Promise<AkaunSimpananDeposit> {
    const res = await fetch('/api/savings/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    return res.json();
  },

  async updateSavingsDeposit(id: string, updates: Partial<AkaunSimpananDeposit>): Promise<AkaunSimpananDeposit> {
    const res = await fetch(`/api/savings/deposits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async createSavingsTransaction(id: string, tx: TransaksiSimpanan): Promise<AkaunSimpananDeposit> {
    const res = await fetch(`/api/savings/deposits/${id}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  // ==========================================
  // Bank Reconciliation
  // ==========================================
  async getBankStatementItems(): Promise<ItemPenyataBank[]> {
    const res = await fetch('/api/bank-reconciliation/items');
    return res.json();
  },

  async createBankStatementItem(item: ItemPenyataBank): Promise<ItemPenyataBank> {
    const res = await fetch('/api/bank-reconciliation/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  async updateBankStatementItem(id: string, updates: Partial<ItemPenyataBank>): Promise<ItemPenyataBank> {
    const res = await fetch(`/api/bank-reconciliation/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getBankReconSummary(): Promise<PenyataPenyesuaianBank> {
    const res = await fetch('/api/bank-reconciliation/summary');
    return res.json();
  },

  async updateBankReconSummary(summary: PenyataPenyesuaianBank): Promise<PenyataPenyesuaianBank> {
    const res = await fetch('/api/bank-reconciliation/summary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
    });
    return res.json();
  },

  // ==========================================
  // LHDN e-Invoice Malaysia
  // ==========================================
  async getEInvoices(): Promise<EInvoisLHDN[]> {
    const res = await fetch('/api/e-invoices');
    return res.json();
  },

  async createEInvoice(invoice: EInvoisLHDN): Promise<EInvoisLHDN> {
    const res = await fetch('/api/e-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    return res.json();
  },

  async updateEInvoice(uuid: string, updates: Partial<EInvoisLHDN>): Promise<EInvoisLHDN> {
    const res = await fetch(`/api/e-invoices/${uuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // ==========================================
  // e-Koperasi SKM Data Export
  // ==========================================
  async getEKoperasiExportData(): Promise<DataExportEKoperasi> {
    const res = await fetch('/api/export/e-koperasi');
    return res.json();
  },

  // ==========================================
  // Verttere Solutions Payment Gateway & Escrow
  // ==========================================
  async getGatewayConfig(): Promise<PaymentGatewayConfig> {
    const res = await fetch('/api/gateway/config');
    return res.json();
  },

  async updateGatewayConfig(config: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> {
    const res = await fetch('/api/gateway/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async getGatewayTransactions(): Promise<GatewayTransaction[]> {
    const res = await fetch('/api/gateway/transactions');
    return res.json();
  },

  async createGatewayBill(payload: {
    kategoriTransaksi: string;
    perihal: string;
    namaPembayar: string;
    noKP: string;
    noAhli?: string;
    emel?: string;
    noTelefon?: string;
    jumlahKasar: number;
    provider?: 'SECUREPAY' | 'TOYYIBPAY' | string;
  }): Promise<{
    success: boolean;
    billCode: string;
    paymentUrl: string;
    transaction: GatewayTransaction;
    cajPlatform: number;
    jumlahBersih: number;
    provider?: string;
  }> {
    const res = await fetch('/api/gateway/create-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async triggerGatewayCallback(billCode: string, status_id: number | string, refno?: string): Promise<{ success: boolean; transaction: GatewayTransaction }> {
    const res = await fetch('/api/gateway/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billCode, status_id, refno }),
    });
    return res.json();
  },

  async getSettlementBatches(): Promise<SettlementBatch[]> {
    const res = await fetch('/api/gateway/settlements');
    return res.json();
  },

  async createSettlementBatch(payload: {
    namaKoperasi?: string;
    kodKoperasi?: string;
    noAkaunBankKoperasi?: string;
    namaBankKoperasi?: string;
    tarikhMula?: string;
    tarikhTamat?: string;
    catatan?: string;
    dikeluarkanOleh?: string;
  }): Promise<SettlementBatch> {
    const res = await fetch('/api/gateway/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
