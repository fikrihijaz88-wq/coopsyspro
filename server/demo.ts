// Explicit demo tooling only. Operational startup must never import this module.
import fs from 'node:fs';
import path from 'node:path';
import * as sample from '../src/data/initialData';
import type { KoperasiDatabaseSchema, UserAccount } from '../src/data/databaseSchema';
import { createDatabaseFile, databaseFilePath } from './storage';

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

export function createDemoDatabase(now = new Date().toISOString()): KoperasiDatabaseSchema {
  const data: KoperasiDatabaseSchema = {
    users: DEFAULT_USERS,
    members: sample.INITIAL_AHLI,
    accounts: sample.INITIAL_CARTA_AKAUN,
    transactions: sample.INITIAL_TRANSAKSI,
    loans: sample.INITIAL_PEMBIAYAAN,
    meetings: sample.INITIAL_MESYUARAT,
    documents: sample.INITIAL_DOKUMEN_SOKONGAN,
    posProducts: sample.INITIAL_PRODUK_POS,
    posTransactions: sample.INITIAL_TRANSAKSI_POS,
    committees: sample.INITIAL_ALK_JAD,
    yearlyRecords: sample.INITIAL_REKOD_KEWANGAN_TAHUNAN,
    skmFunds: sample.INITIAL_DANA_GERAN_SKM,
    welfareClaims: sample.INITIAL_TUNTUTAN_KEBAJIKAN,
    welfareSummary: sample.INITIAL_TABUNG_KEBAJIKAN,
    fixedAssets: sample.INITIAL_ASET_TETAP,
    savingsDeposits: sample.INITIAL_SIMPANAN_DEPOSIT,
    bankStatements: sample.INITIAL_BANK_STATEMENT_ITEMS,
    bankReconSummary: sample.INITIAL_BANK_RECON_SUMMARY,
    eInvoices: sample.INITIAL_E_INVOICES,
    gatewayConfig: sample.INITIAL_PAYMENT_GATEWAY_CONFIG,
    gatewayTransactions: sample.INITIAL_GATEWAY_TRANSACTIONS,
    settlementBatches: sample.INITIAL_SETTLEMENT_BATCHES,
    notificationConfig: sample.INITIAL_NOTIFICATION_CONFIG,
    notificationTemplates: sample.INITIAL_NOTIFICATION_TEMPLATES,
    notificationLogs: sample.INITIAL_NOTIFICATION_LOGS,
    supportTickets: sample.INITIAL_SUPPORT_TICKETS,
    logs: sample.INITIAL_LOGS,
    meta: {
      koperasiName: "Koperasi Warga Berdaya Malaysia Berhad",
      registrationNo: "SKM-W-4921/2018",
      lastUpdated: now,
      schemaVersion: 1,
      databaseCreatedAt: now,
      lastMigrationAt: null,
      datasetKind: "demo",
      version: "2.6.0-PRO",
    },
  };
  return structuredClone(data);
}

function canonicalPath(filePath: string): string {
  let ancestor = path.resolve(filePath);
  const suffix: string[] = [];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor));
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...suffix);
}

/** Demo initialization can create only a separate, absent file. No force/reset option. */
export function seedDemoDatabase(filePath: string): void {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo initialization is disabled in production.');
  const target = canonicalPath(filePath);
  const operationalPaths = [databaseFilePath(), path.join(process.cwd(), 'data', 'koperasi_db.json')];
  if (operationalPaths.some(file => canonicalPath(file) === target)) {
    throw new Error('Refusing to seed the operational database. Choose a separate demo file.');
  }
  if (fs.existsSync(filePath)) throw new Error('Refusing to replace an existing database, including demo data.');
  createDatabaseFile(path.resolve(filePath), createDemoDatabase());
}
