import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { atomicWrite } from './storage';

export interface BackupReceipt {
  backupFile: string;
  manifestFile: string;
  sha256: string;
  byteLength: number;
  createdAt: string;
}

const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

/** Copies exact bytes, including malformed JSON, for preservation before manual recovery. */
export function backupDatabase(
  filePath: string,
  options: { backupDirectory?: string; now?: string } = {},
): BackupReceipt {
  const source = path.resolve(filePath);
  if (!fs.lstatSync(source).isFile()) throw new Error('Backup source must be a regular file.');
  const bytes = fs.readFileSync(source);
  const createdAt = options.now ?? new Date().toISOString();
  const directory = options.backupDirectory ?? path.join(path.dirname(source), 'backups');
  const backupFile = path.resolve(directory, `${path.basename(source)}.${createdAt.replace(/[:.]/g, '-')}.${randomUUID()}.bak`);
  const receipt: BackupReceipt = {
    backupFile, manifestFile: `${backupFile}.manifest.json`, sha256: sha256(bytes),
    byteLength: bytes.length, createdAt,
  };
  atomicWrite(backupFile, bytes);
  atomicWrite(receipt.manifestFile, Buffer.from(JSON.stringify({
    version: 1, sourceFile: source, createdAt, sha256: receipt.sha256, byteLength: bytes.length,
  }, null, 2) + '\n'));
  const verified = verifyBackup(backupFile);
  if (verified.sha256 !== receipt.sha256 || verified.byteLength !== receipt.byteLength) {
    throw new Error('Backup verification failed; do not proceed with replacement/migration.');
  }
  return receipt;
}

export function verifyBackup(backupFile: string): BackupReceipt {
  const resolved = path.resolve(backupFile);
  const manifestFile = `${resolved}.manifest.json`;
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const bytes = fs.readFileSync(resolved);
  if (manifest.version !== 1 || typeof manifest.createdAt !== 'string' ||
      sha256(bytes) !== manifest.sha256 || bytes.length !== manifest.byteLength) {
    throw new Error(`Backup integrity verification failed for ${resolved}. Manual recovery required.`);
  }
  return {
    backupFile: resolved, manifestFile, sha256: manifest.sha256,
    byteLength: manifest.byteLength, createdAt: manifest.createdAt,
  };
}
