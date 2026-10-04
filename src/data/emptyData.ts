import type { KoperasiDatabaseSchema } from './databaseSchema';
import type { CoopBasicProfile } from '../types';

/** Empty operational structure only. Never import sample data into this module. */
export function createEmptyDatabase(now = new Date().toISOString()): KoperasiDatabaseSchema {
  return {
    users: [], members: [], accounts: [], transactions: [], loans: [], meetings: [],
    documents: [], posProducts: [], posTransactions: [], committees: [], yearlyRecords: [],
    skmFunds: [], welfareClaims: [], fixedAssets: [], savingsDeposits: [], bankStatements: [],
    eInvoices: [], gatewayTransactions: [], settlementBatches: [], notificationTemplates: [],
    notificationLogs: [], supportTickets: [], logs: [],
    welfareSummary: {
      bakiAwalTahun: 0, peruntukanUntungStatutori: 0, jumlahCarumanTahunSemasa: 0,
      jumlahTuntutanDibayar: 0, bakiSemasa: 0, jumlahAhliMencarum: 0,
    },
    bankReconSummary: {
      id: '', bulanTahun: '', tarikhPenyata: '', namaBank: '', noAkaunBank: '',
      bakiBukuTunaiLejar: 0, bakiPenyataBank: 0, depositBelumKredit: 0,
      cekBelumDitunaikan: 0, faedahBankBelumRekod: 0, cajBankBelumRekod: 0,
      bakiDisesuaikan: 0, perbezaan: 0, status: 'TIDAK_SEIMBANG',
    },
    gatewayConfig: {
      activeProvider: 'SECUREPAY', securePayMerchantUid: '', securePayAuthToken: '',
      securePayChecksumToken: '', toyyibUserSecretKey: '', toyyibCategoryCode: '',
      platformFeeType: 'FIXED', fixedFeeRM: 0, percentageFee: 0,
      feeChargeStrategy: 'PASSTHROUGH_SURCHARGE', autoMarkupPercentage: 0,
      markupApplyTo: 'ONLINE_PAYMENT_ONLY', isSandbox: true, settlementCycle: 'MANUAL',
      namaPlatform: '', akaunBankPlatform: '', namaBankPlatform: '',
    },
    notificationConfig: {
      autoSendPaymentReceipt: false, autoSendPosReceipt: false, autoSendAgmReminder: false,
      autoSendDividendNotice: false, autoSendLoanStatus: false,
      whatsappProvider: 'DIRECT_WA_LINK', smsProvider: 'SIMULATOR', smsBalanceCredits: 0,
      isSandbox: true,
    },
    meta: {
      koperasiName: '', registrationNo: '', lastUpdated: now, version: '2.6.0-PRO',
      schemaVersion: 1, databaseCreatedAt: now, lastMigrationAt: null, datasetKind: 'operational',
    },
  };
}

export function createEmptyCoopProfile(): CoopBasicProfile {
  return {
    namaKoperasi: '', kodKoperasi: '', noPendaftaranSKM: '', tarikhPenubuhan: '',
    alamatPerniagaan: '', poskod: '', bandar: '', negeri: '', noTelefonRasmi: '',
    emelRasmi: '', namaBankOperasi: '', noAkaunBankOperasi: '', namaPemegangAkaunBank: '',
    statusLangganan: 'PERCUBAAN', pelanVerttere: '',
  };
}
