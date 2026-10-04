import type {
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
} from "../types";

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
  supportTickets: SystemSupportTicket[];
  logs: ActivityLog[];
  meta: {
    koperasiName: string;
    registrationNo: string;
    lastUpdated: string;
    version: string;
    // Only new databases receive these fields; legacy financial provenance stays unknown.
    schemaVersion?: number;
    databaseCreatedAt?: string;
    lastMigrationAt?: string | null;
    datasetKind?: 'operational' | 'demo';
  };
}
