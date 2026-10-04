import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createEmptyDatabase } from '../src/data/emptyData';
import type { KoperasiDatabaseSchema } from '../src/data/databaseSchema';

export function databaseFilePath(): string {
  return path.resolve(process.env.SPPKM_DB_FILE || path.join(process.cwd(), 'data', 'koperasi_db.json'));
}

const requiredCollections = [
  'users', 'members', 'accounts', 'transactions', 'loans', 'meetings', 'documents',
  'posProducts', 'posTransactions', 'committees', 'yearlyRecords', 'logs',
] as const;
const newerCollections = [
  'skmFunds', 'welfareClaims', 'fixedAssets', 'savingsDeposits', 'bankStatements',
  'eInvoices', 'gatewayTransactions', 'settlementBatches', 'notificationTemplates',
  'notificationLogs', 'supportTickets',
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Validate the container, not financial figures. Legacy optional fields remain absent. */
export function parseDatabase(bytes: Buffer): KoperasiDatabaseSchema {
  const data: unknown = JSON.parse(bytes.toString('utf8'));
  if (!isObject(data) || !isObject(data.meta)) throw new Error('Database and meta must be objects.');
  for (const key of requiredCollections) {
    if (!Array.isArray(data[key])) throw new Error(`Required collection ${key} must be an array.`);
  }
  for (const key of newerCollections) {
    if (key in data && !Array.isArray(data[key])) throw new Error(`Collection ${key} must be an array.`);
  }
  for (const key of ['welfareSummary', 'bankReconSummary', 'gatewayConfig', 'notificationConfig']) {
    if (key in data && !isObject(data[key])) throw new Error(`Configuration ${key} must be an object.`);
  }
  for (const key of ['koperasiName', 'registrationNo', 'lastUpdated', 'version']) {
    if (typeof data.meta[key] !== 'string') throw new Error(`meta.${key} must be a string.`);
  }
  if ('schemaVersion' in data.meta && data.meta.schemaVersion !== 1) {
    throw new Error(`Unsupported schemaVersion ${data.meta.schemaVersion}; explicit migration required.`);
  }
  return data as unknown as KoperasiDatabaseSchema;
}

function assertRegularFile(filePath: string, io = fs): void {
  if (!io.lstatSync(filePath).isFile()) {
    throw new Error(`Refusing non-regular database file: ${filePath}`);
  }
}

function syncDirectory(directory: string, io: typeof fs): void {
  // Replacement is already committed. Do not report rollback if only this sync fails.
  let descriptor: number | undefined;
  try {
    descriptor = io.openSync(directory, 'r');
    io.fsyncSync(descriptor);
  } catch (error) {
    console.error('[DB] File committed, but directory sync failed; crash durability is uncertain:', error);
  } finally {
    if (descriptor !== undefined) {
      try { io.closeSync(descriptor); }
      catch (error) { console.error('[DB] Could not close directory sync descriptor:', error); }
    }
  }
}

/** Publish only fully written, flushed, byte-verified files. New-file mode never replaces a target. */
export function atomicWrite(
  filePath: string,
  bytes: Buffer,
  options: { previousBytes?: Buffer; io?: typeof fs } = {},
): void {
  const io = options.io ?? fs;
  const directory = path.dirname(filePath);
  io.mkdirSync(directory, { recursive: true });
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${randomUUID()}.tmp`);
  let descriptor: number | undefined;
  try {
    descriptor = io.openSync(temporaryPath, 'wx', 0o600);
    io.writeFileSync(descriptor, bytes);
    io.fsyncSync(descriptor);
    io.closeSync(descriptor);
    descriptor = undefined;
    if (!io.readFileSync(temporaryPath).equals(bytes)) throw new Error('Temporary-file verification failed.');

    if (options.previousBytes !== undefined) {
      assertRegularFile(filePath, io);
      if (!io.readFileSync(filePath).equals(options.previousBytes)) {
        throw new Error('Database changed on disk since load. Stop and recover/reload manually; refusing overwrite.');
      }
      io.renameSync(temporaryPath, filePath);
    } else {
      // Hard-link publication is atomic and fails with EEXIST even if startup raced another writer.
      io.linkSync(temporaryPath, filePath);
    }
    syncDirectory(directory, io);
  } finally {
    if (descriptor !== undefined) io.closeSync(descriptor);
    try {
      io.unlinkSync(temporaryPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('[DB] Could not remove non-authoritative temporary file:', temporaryPath, error);
      }
    }
  }
}

export function createDatabaseFile(filePath: string, data: KoperasiDatabaseSchema): Buffer {
  const bytes = Buffer.from(JSON.stringify(data, null, 2) + '\n');
  parseDatabase(bytes);
  atomicWrite(filePath, bytes);
  return bytes;
}

export function loadDatabase(filePath: string): { data: KoperasiDatabaseSchema; bytes: Buffer } {
  try {
    try {
      assertRegularFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      try {
        createDatabaseFile(filePath, createEmptyDatabase());
      } catch (creationError) {
        // A concurrent initialization may already have published a file; read it, never replace it.
        if ((creationError as NodeJS.ErrnoException).code !== 'EEXIST') throw creationError;
      }
      assertRegularFile(filePath);
    }
    const bytes = fs.readFileSync(filePath);
    return { data: parseDatabase(bytes), bytes };
  } catch (error) {
    throw new Error(
      `[DB] Cannot safely load ${filePath}. Existing data has not been replaced. Manual recovery required. ` +
      `Do not delete the file or seed demo data to recover. Cause: ${(error as Error).message}`,
      { cause: error },
    );
  }
}

export function persistDatabase(
  filePath: string,
  data: KoperasiDatabaseSchema,
  previousBytes: Buffer,
  io = fs,
): Buffer {
  const bytes = Buffer.from(JSON.stringify(data, null, 2) + '\n');
  parseDatabase(bytes);
  atomicWrite(filePath, bytes, { previousBytes, io });
  return bytes;
}
