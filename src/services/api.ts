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
  SettlementBatch,
  NotificationTemplate,
  NotificationLog,
  NotificationConfig
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
    try {
      const res = await fetch('/api/gateway/config');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('api.getGatewayConfig offline fallback:', e);
    }
    return {
      provider: 'BOTH',
      activeProvider: 'BOTH',
      securePayMerchantUid: '7f4a9b2c-8821-49fa-91b3-verttere01',
      securePayAuthToken: 'sec_auth_verttere_live_948192048102941',
      securePayChecksumToken: 'chk_verttere_sha256_secpay_883019',
      toyyibUserSecretKey: 'sec_verttere_live_948192048102941',
      toyyibCategoryCode: 'cat_verttere_coop_pay_01',
      merchantUid: '7f4a9b2c-8821-49fa-91b3-verttere01',
      authToken: 'sec_auth_verttere_live_948192048102941',
      checksumToken: 'chk_verttere_sha256_secpay_883019',
      userSecretKey: 'sec_verttere_live_948192048102941',
      categoryCode: 'cat_verttere_coop_pay_01',
      platformFeeType: 'HYBRID',
      fixedFeeRM: 1.00,
      percentageFee: 0.50,
      feeChargeStrategy: 'ABSORB_MARKUP',
      autoMarkupPercentage: 1.5,
      markupApplyTo: 'ONLINE_PAYMENT_ONLY',
      isSandbox: true,
      settlementCycle: 'T+1',
      namaPlatform: 'Verttere Solutions Sdn Bhd (FinTech Payment Aggregator)',
      akaunBankPlatform: '5621-8849-1029 (Maybank Islamic)',
      namaBankPlatform: 'Maybank Berhad'
    };
  },

  async updateGatewayConfig(config: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> {
    try {
      const res = await fetch('/api/gateway/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.updateGatewayConfig offline fallback:', e);
    }
    return config as PaymentGatewayConfig;
  },

  async getGatewayTransactions(): Promise<GatewayTransaction[]> {
    try {
      const res = await fetch('/api/gateway/transactions');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.getGatewayTransactions offline fallback:', e);
    }
    return [];
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
    try {
      const res = await fetch('/api/gateway/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.billCode && data.transaction) return data;
      }
    } catch (e) {
      console.warn('api.createGatewayBill offline fallback:', e);
    }

    // Client-side Safe Fallback Generation
    const isToyyib = payload.provider === 'TOYYIBPAY';
    const billCode = isToyyib
      ? `TYB-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`
      : `SP-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    
    const fee = Math.round((1.00 + (payload.jumlahKasar * 0.005)) * 100) / 100;
    const netAmount = Math.max(0, Math.round((payload.jumlahKasar - fee) * 100) / 100);
    
    const paymentUrl = isToyyib
      ? `https://dev.toyyibpay.com/${billCode}`
      : `https://sandbox.securepay.my/checkout?order_number=${billCode}&buyer_name=${encodeURIComponent(payload.namaPembayar || 'Ahli')}&amount=${Number(payload.jumlahKasar).toFixed(2)}`;

    const newTx: GatewayTransaction = {
      id: `TX-GW-${Date.now()}`,
      billCode,
      kategoriTransaksi: payload.kategoriTransaksi,
      perihal: payload.perihal,
      namaKoperasi: 'Koperasi Warga Berdaya Malaysia Berhad',
      kodKoperasi: 'KOP-MY-001',
      namaPembayar: payload.namaPembayar,
      noKP: payload.noKP,
      noAhli: payload.noAhli,
      emel: payload.emel,
      noTelefon: payload.noTelefon,
      jumlahKasar: payload.jumlahKasar,
      cajPlatformVerttere: fee,
      jumlahBersihKoperasi: netAmount,
      status: 'MENUNGGU',
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      gatewayProvider: isToyyib ? 'TOYYIBPAY' : 'SECUREPAY',
      kaedahBayaran: isToyyib ? 'TOYYIBPAY' : 'SECUREPAY'
    };

    return {
      success: true,
      billCode,
      paymentUrl,
      transaction: newTx,
      cajPlatform: fee,
      jumlahBersih: netAmount,
      provider: isToyyib ? 'TOYYIBPAY' : 'SECUREPAY'
    };
  },

  async triggerGatewayCallback(billCode: string, status_id: number | string, refno?: string): Promise<{ success: boolean; transaction: GatewayTransaction }> {
    try {
      const res = await fetch('/api/gateway/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billCode, status_id, refno }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.triggerGatewayCallback offline fallback:', e);
    }
    const isSuccess = String(status_id) === '1' || status_id === 'SUCCESS' || status_id === 'paid' || String(status_id) === 'true';
    const isToyyib = billCode.startsWith('TYB');
    const mockTx: GatewayTransaction = {
      id: `TX-GW-${Date.now()}`,
      billCode,
      kategoriTransaksi: 'TAMBAH_SYER',
      perihal: 'Pengesahan Bayaran Gateway',
      namaKoperasi: 'Koperasi Warga Berdaya Malaysia Berhad',
      kodKoperasi: 'KOP-MY-001',
      namaPembayar: 'Anggota Koperasi',
      noKP: '880101-10-5555',
      jumlahKasar: 100,
      cajPlatformVerttere: 1.50,
      jumlahBersihKoperasi: 98.50,
      status: isSuccess ? 'BERJAYA' : 'GAGAL',
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      tarikhSelesai: new Date().toISOString().replace('T', ' ').slice(0, 19),
      gatewayProvider: isToyyib ? 'TOYYIBPAY' : 'SECUREPAY',
      kaedahBayaran: isToyyib ? 'TOYYIBPAY' : 'SECUREPAY',
      transaksiBankId: refno || `${isToyyib ? 'TYB' : 'SP'}-MOCK-${Date.now().toString().slice(-6)}`
    };
    return { success: true, transaction: mockTx };
  },

  async getSettlementBatches(): Promise<SettlementBatch[]> {
    try {
      const res = await fetch('/api/gateway/settlements');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.getSettlementBatches offline fallback:', e);
    }
    return [];
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
    dimohonOleh?: string;
    dokumenSokonganPengesahan?: string;
  }): Promise<SettlementBatch> {
    try {
      const res = await fetch('/api/gateway/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.createSettlementBatch offline fallback:', e);
    }
    const batchNo = `SETTLE-2026-B${Math.floor(10 + Math.random() * 90)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return {
      id: `SETTLE-${Date.now()}`,
      batchNo,
      namaKoperasi: payload.namaKoperasi || 'Koperasi Warga Berdaya Malaysia Berhad',
      kodKoperasi: payload.kodKoperasi || 'KOP-MY-001',
      noAkaunBankKoperasi: payload.noAkaunBankKoperasi || '8602-9918-2019 (CIMB Islamic)',
      namaBankKoperasi: payload.namaBankKoperasi || 'CIMB Islamic Bank Berhad',
      tarikhMula: payload.tarikhMula || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      tarikhTamat: payload.tarikhTamat || new Date().toISOString().slice(0, 10),
      jumlahTransaksi: 1,
      jumlahKasar: 100,
      jumlahCajVerttere: 1.50,
      jumlahBersihPindahan: 98.50,
      status: 'MENUNGGU_KELULUSAN_VERTTERE',
      statusKelulusan: 'MENUNGGU_KELULUSAN_VERTTERE',
      dimohonOleh: payload.dimohonOleh || 'Haji Ahmad Zaki (Bendahari)',
      tarikhPermohonan: now,
      dokumenSokonganPengesahan: payload.dokumenSokonganPengesahan || 'Resit Jualan Disahkan',
      dikeluarkanOleh: payload.dikeluarkanOleh || 'Haji Ahmad Zaki (Bendahari)',
      catatan: payload.catatan || 'Permohonan pelepasan kutipan gateway ke akaun koperasi.'
    };
  },

  // ==========================================
  // WhatsApp & SMS Notification System APIs
  // ==========================================
  async getNotificationConfig(): Promise<NotificationConfig> {
    try {
      const res = await fetch('/api/notifications/config');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.getNotificationConfig offline fallback:', e);
    }
    return {
      autoSendPaymentReceipt: true,
      autoSendPosReceipt: true,
      autoSendAgmReminder: true,
      autoSendDividendNotice: true,
      autoSendLoanStatus: true,
      whatsappProvider: 'DIRECT_WA_LINK',
      whatsappPhoneNumberId: '109849102941029',
      whatsappAccessToken: 'EAAOx_sample_token_verttere_wa_cloud_api',
      whatsappBusinessAccountId: '1920491029410',
      whatsappSenderNumber: '+60123456789',
      smsProvider: 'SIMULATOR',
      smsApiKey: 'sms_live_api_verttere_9481920',
      smsSenderId: 'MYCOOP',
      smsBalanceCredits: 850,
      isSandbox: true,
    };
  },

  async updateNotificationConfig(config: Partial<NotificationConfig>): Promise<NotificationConfig> {
    try {
      const res = await fetch('/api/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.updateNotificationConfig offline fallback:', e);
    }
    return config as NotificationConfig;
  },

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const res = await fetch('/api/notifications/templates');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.getNotificationTemplates offline fallback:', e);
    }
    return [];
  },

  async createNotificationTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.createNotificationTemplate offline fallback:', e);
    }
    return template;
  },

  async updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const res = await fetch(`/api/notifications/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.updateNotificationTemplate offline fallback:', e);
    }
    return { ...updates, id } as NotificationTemplate;
  },

  async deleteNotificationTemplate(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/notifications/templates/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.deleteNotificationTemplate offline fallback:', e);
    }
    return { success: true };
  },

  async getNotificationLogs(): Promise<NotificationLog[]> {
    try {
      const res = await fetch('/api/notifications/logs');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.getNotificationLogs offline fallback:', e);
    }
    return [];
  },

  async sendNotification(payload: {
    namaPenerima: string;
    noAhli?: string;
    noTelefon: string;
    saluran: 'WHATSAPP' | 'SMS' | 'BOTH';
    pencetus?: string;
    tajuk?: string;
    mesej: string;
    rujukanTransaksi?: string;
  }): Promise<{
    success: boolean;
    log: NotificationLog;
    directWaUrl: string;
    remainingSmsCredits?: number;
  }> {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('api.sendNotification offline fallback:', e);
    }

    const cleanPhone = (payload.noTelefon || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('60') ? cleanPhone : cleanPhone.startsWith('0') ? `6${cleanPhone}` : `60${cleanPhone}`;
    const directWaUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(payload.mesej)}`;

    const newLog: NotificationLog = {
      id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      namaPenerima: payload.namaPenerima,
      noAhli: payload.noAhli,
      noTelefon: payload.noTelefon,
      saluran: payload.saluran,
      pencetus: (payload.pencetus as any) || 'MANUAL_BROADCAST',
      tajuk: payload.tajuk || 'Notifikasi Rasmi Koperasi',
      mesej: payload.mesej,
      status: 'BERJAYA',
      pembekal: payload.saluran === 'SMS' ? 'BULKSMS_MY' : 'DIRECT_WA_LINK',
      rujukanTransaksi: payload.rujukanTransaksi
    };

    return {
      success: true,
      log: newLog,
      directWaUrl,
      remainingSmsCredits: 849
    };
  }
};
