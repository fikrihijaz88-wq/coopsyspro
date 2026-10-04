import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { KoperasiDatabase } from '../server/db';
import { backupDatabase, verifyBackup } from '../server/backup';
import { createDemoDatabase, seedDemoDatabase } from '../server/demo';
import { createEmptyDatabase } from '../src/data/emptyData';
import { atomicWrite, loadDatabase, persistDatabase } from '../server/storage';

// File-backed capture avoids restricted-environment pipe failures; spawn errors
// must be checked independently because they can accompany a zero status.
function runChild(args: string[], options: Parameters<typeof spawnSync>[2]) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sppkm-child-'));
  const stdoutPath = path.join(directory, 'stdout');
  const stderrPath = path.join(directory, 'stderr');
  const stdout = fs.openSync(stdoutPath, 'w');
  const stderr = fs.openSync(stderrPath, 'w');
  try {
    const result = spawnSync(process.execPath, args, { ...options, stdio: ['ignore', stdout, stderr] });
    assert.ifError(result.error);
    return { ...result, stdout: fs.readFileSync(stdoutPath, 'utf8'), stderr: fs.readFileSync(stderrPath, 'utf8') };
  } finally {
    fs.closeSync(stdout);
    fs.closeSync(stderr);
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function fixture(run: (file: string, directory: string) => void) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sppkm-data-test-'));
  try { run(path.join(directory, 'koperasi_db.json'), directory); }
  finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

function store(file: string, data = createEmptyDatabase()) {
  const bytes = Buffer.from(JSON.stringify(data, null, 4) + '\n\n');
  fs.writeFileSync(file, bytes);
  // A fixed old mtime makes an unintended rewrite deterministic to detect.
  fs.utimesSync(file, new Date('2020-01-01T00:00:00Z'), new Date('2020-01-01T00:00:00Z'));
  return bytes;
}

test('A: fewer members than demo stay unchanged across repeated starts', () => fixture(file => {
  const data = createEmptyDatabase();
  data.members = createDemoDatabase().members.slice(0, 2);
  const bytes = store(file, data);
  for (let restart = 0; restart < 3; restart++) {
    assert.equal(new KoperasiDatabase({ filePath: file }).getMembers().length, 2);
    assert.deepEqual(fs.readFileSync(file), bytes);
  }
}));

test('B: zero assets and other empty collections stay empty', () => fixture(file => {
  const bytes = store(file);
  const db = new KoperasiDatabase({ filePath: file });
  assert.deepEqual(db.getFixedAssets(), []);
  assert.deepEqual(db.getMembers(), []);
  assert.deepEqual(db.getTransactions(), []);
  assert.deepEqual(db.getNotificationTemplates(), []);
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('C: an intentionally deleted demo record never returns', () => fixture(file => {
  store(file, createDemoDatabase());
  const db = new KoperasiDatabase({ filePath: file });
  const deleted = db.getMembers()[0].id;
  const count = db.getMembers().length;
  db.deleteMember(deleted);
  const saved = fs.readFileSync(file);
  for (let restart = 0; restart < 2; restart++) {
    const restarted = new KoperasiDatabase({ filePath: file });
    assert.equal(restarted.getMembers().length, count - 1);
    assert.equal(restarted.getMembers().some(member => member.id === deleted), false);
    assert.deepEqual(fs.readFileSync(file), saved);
  }
}));

test('D: custom financial balances and unknown fields are preserved exactly', () => fixture(file => {
  const data = createEmptyDatabase();
  data.accounts = [{ ...createDemoDatabase().accounts[0], bakiAwal: 123.45, bakiSemasa: -987654.321 }];
  Object.assign(data, { customProvenance: { note: 'fixture-only existing metadata' } });
  const bytes = store(file, data);
  const db = new KoperasiDatabase({ filePath: file });
  assert.deepEqual(db.getAllData(), JSON.parse(bytes.toString()));
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('E: malformed JSON fails startup and preserves original bytes', () => fixture((file, directory) => {
  const bytes = Buffer.from('{"members": [BROKEN historical file');
  fs.writeFileSync(file, bytes);
  assert.throws(() => new KoperasiDatabase({ filePath: file }), /Manual recovery required/);
  assert.deepEqual(fs.readFileSync(file), bytes);
  assert.deepEqual(fs.readdirSync(directory), ['koperasi_db.json']);
  // Exercise the actual runtime initializer in an isolated process too.
  const result = runChild(['--import', 'tsx', 'server/runtimeDb.ts'], {
    cwd: process.cwd(), env: { ...process.env, SPPKM_DB_FILE: file }, encoding: 'utf8', timeout: 15000,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Manual recovery required/);
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('F: absent database creates a complete empty operational structure', () => fixture(file => {
  const db = new KoperasiDatabase({ filePath: file });
  const data = db.getAllData();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) assert.equal(value.length, 0, key);
  }
  assert.equal(data.welfareSummary.bakiSemasa, 0);
  assert.equal(data.bankReconSummary.bakiBukuTunaiLejar, 0);
  assert.equal(data.gatewayConfig.securePayAuthToken, '');
  assert.equal(data.notificationConfig.smsBalanceCredits, 0);
  assert.equal(data.meta.datasetKind, 'operational');
  assert.equal(data.meta.schemaVersion, 1);
  assert.equal(data.meta.lastMigrationAt, null);
  assert.ok(data.meta.databaseCreatedAt);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), data);
  const bytes = fs.readFileSync(file);
  new KoperasiDatabase({ filePath: file });
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('Express startup and read APIs initialize safely with an empty database without network or sample writes', () => fixture(file => {
  // Only the listener is stubbed: actual server initialization and GET handlers execute.
  const script = `
    import assert from 'node:assert/strict';
    import express from 'express';
    let started = false;
    express.application.listen = function(port, ready) {
      assert.equal(port, 3000);
      const read = routePath => {
        const route = this._router.stack.find(layer => layer.route?.path === routePath && layer.route.methods.get);
        assert.ok(route, routePath);
        let result;
        route.route.stack[0].handle({}, { json: data => { result = data; } });
        return result;
      };
      const data = read('/api/all-data');
      assert.equal(data.meta.datasetKind, 'operational');
      for (const value of Object.values(data)) if (Array.isArray(value)) assert.equal(value.length, 0);
      assert.deepEqual(read('/api/members'), []);
      assert.deepEqual(read('/api/fixed-assets'), []);
      assert.deepEqual(read('/api/savings/deposits'), []);
      assert.equal(read('/api/welfare/summary').bakiSemasa, 0);
      assert.equal(read('/api/gateway/config').securePayAuthToken, '');
      started = true;
      ready();
      return {};
    };
    await import('./server.ts');
    assert.ok(started);
    console.log('EMPTY_DATABASE_API_STARTUP_OK');
  `;
  const result = runChild(['--import', 'tsx', '--input-type=module', '-e', script], {
    cwd: process.cwd(), env: { ...process.env, NODE_ENV: 'production', SPPKM_DB_FILE: file },
    encoding: 'utf8', timeout: 15000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /EMPTY_DATABASE_API_STARTUP_OK/);
  assert.equal(loadDatabase(file).data.transactions.length, 0);
}));

test('G: samples appear only after explicit initialization of a separate demo file', () => fixture(file => {
  seedDemoDatabase(file);
  const data = new KoperasiDatabase({ filePath: file }).getAllData();
  assert.equal(data.meta.datasetKind, 'demo');
  assert.equal(data.members.length, createDemoDatabase().members.length);
  assert.ok(data.transactions.length > 0);
  const bytes = fs.readFileSync(file);
  assert.throws(() => seedDemoDatabase(file), /Refusing to replace/);
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('H: normal startup performs no rewrite, timestamp change, or temporary-file creation', () => fixture((file, directory) => {
  const bytes = store(file);
  const before = fs.statSync(file, { bigint: true });
  new KoperasiDatabase({ filePath: file });
  const after = fs.statSync(file, { bigint: true });
  assert.equal(after.mtimeNs, before.mtimeNs);
  assert.equal(after.ino, before.ino);
  assert.deepEqual(fs.readFileSync(file), bytes);
  assert.deepEqual(fs.readdirSync(directory), ['koperasi_db.json']);
}));

test('legacy optional fields stay absent on disk and expose empty views, not samples', () => fixture(file => {
  const data = createEmptyDatabase();
  for (const key of ['skmFunds', 'fixedAssets', 'welfareSummary', 'bankReconSummary', 'gatewayConfig',
    'notificationConfig', 'notificationTemplates', 'notificationLogs', 'supportTickets']) delete data[key];
  for (const key of ['schemaVersion', 'databaseCreatedAt', 'lastMigrationAt', 'datasetKind']) delete data.meta[key];
  const bytes = store(file, data);
  const db = new KoperasiDatabase({ filePath: file });
  assert.deepEqual(db.getAllData(), data);
  assert.deepEqual(db.getSkmFunds(), []);
  assert.deepEqual(db.getFixedAssets(), []);
  assert.deepEqual(db.getNotificationTemplates(), []);
  assert.deepEqual(db.getNotificationLogs(), []);
  assert.deepEqual(db.getSupportTickets(), []);
  assert.equal(db.getWelfareSummary().bakiSemasa, 0);
  assert.equal(db.getBankReconSummary().bakiPenyataBank, 0);
  assert.equal(db.getGatewayConfig().securePayAuthToken, '');
  assert.equal(db.getNotificationConfig().smsBalanceCredits, 0);
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('invalid containers and unsupported schema versions fail without repair', () => fixture(file => {
  for (const data of [null, [], {}, { ...createEmptyDatabase(), fixedAssets: {} },
    { ...createEmptyDatabase(), meta: { ...createEmptyDatabase().meta, schemaVersion: 999 } }]) {
    const bytes = Buffer.from(JSON.stringify(data));
    fs.writeFileSync(file, bytes);
    assert.throws(() => loadDatabase(file), /Manual recovery required/);
    assert.deepEqual(fs.readFileSync(file), bytes);
  }
}));

test('unreadable/non-regular paths and dangling symlinks are never initialized over', () => fixture((file, directory) => {
  fs.mkdirSync(file);
  assert.throws(() => loadDatabase(file), /Manual recovery required/);
  assert.ok(fs.statSync(file).isDirectory());
  const link = path.join(directory, 'dangling.json');
  fs.symlinkSync(path.join(directory, 'missing.json'), link);
  assert.throws(() => loadDatabase(link), /Manual recovery required/);
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.equal(fs.existsSync(path.join(directory, 'missing.json')), false);
}));

test('existing files cannot be replaced by new-file publication, including races', () => fixture(file => {
  const bytes = store(file);
  assert.throws(() => atomicWrite(file, Buffer.from('replacement')), { code: 'EEXIST' });
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('read permission errors fail without attempting initialization or writing', context => fixture(file => {
  const bytes = store(file);
  const error = Object.assign(new Error('permission denied'), { code: 'EACCES' });
  const mock = context.mock.method(fs, 'readFileSync', () => { throw error; });
  try { assert.throws(() => loadDatabase(file), /Manual recovery required.*permission denied/); }
  finally { mock.mock.restore(); }
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('partial write, flush, verification, and rename failures preserve previous database', () => fixture((file, directory) => {
  const bytes = store(file);
  const data = createEmptyDatabase();
  data.meta.koperasiName = 'fixture-only change';
  const failure = Object.assign(new Error('injected disk failure'), { code: 'EIO' });
  const adapters: typeof fs[] = [
    { ...fs, writeFileSync: ((fd: number, buffer: Buffer) => { fs.writeFileSync(fd, buffer.subarray(0, 10)); throw failure; }) as typeof fs.writeFileSync },
    { ...fs, fsyncSync: () => { throw failure; } },
    { ...fs, writeFileSync: ((fd: number, buffer: Buffer) => fs.writeFileSync(fd, buffer.subarray(0, 10))) as typeof fs.writeFileSync },
    { ...fs, renameSync: () => { throw failure; } },
  ];
  for (const io of adapters) {
    assert.throws(() => persistDatabase(file, data, bytes, io));
    assert.deepEqual(fs.readFileSync(file), bytes);
    assert.deepEqual(fs.readdirSync(directory), ['koperasi_db.json']);
  }
}));

test('save errors are surfaced and unsaved in-memory changes are discarded', context => fixture(file => {
  const data = createEmptyDatabase();
  data.members = createDemoDatabase().members.slice(0, 1);
  const bytes = store(file, data);
  const db = new KoperasiDatabase({ filePath: file });
  const mock = context.mock.method(fs, 'renameSync', () => { throw new Error('injected rename failure'); });
  try {
    assert.throws(() => db.deleteMember(data.members[0].id), /injected rename failure/);
    assert.deepEqual(db.getAllData(), data);
    assert.deepEqual(fs.readFileSync(file), bytes);
  } finally { mock.mock.restore(); }
}));

test('external edits/corruption after loading cannot be overwritten by a stale save', () => fixture(file => {
  store(file);
  const db = new KoperasiDatabase({ filePath: file });
  const external = Buffer.from('{ damaged externally');
  fs.writeFileSync(file, external);
  assert.throws(() => db.save(), /Database changed on disk/);
  assert.deepEqual(fs.readFileSync(file), external);
}));

test('backup is timestamped, exact, verified, repeatable, and recoverable', () => fixture((file, directory) => {
  const bytes = store(file);
  const before = fs.statSync(file, { bigint: true }).mtimeNs;
  const options = { backupDirectory: path.join(directory, 'backups'), now: '2026-10-04T10:00:00.000Z' };
  const receipt = backupDatabase(file, options);
  assert.match(receipt.backupFile, /2026-10-04T10-00-00-000Z/);
  assert.deepEqual(fs.readFileSync(receipt.backupFile), bytes);
  assert.deepEqual(verifyBackup(receipt.backupFile), receipt);
  assert.notEqual(backupDatabase(file, options).backupFile, receipt.backupFile);
  assert.equal(fs.statSync(file, { bigint: true }).mtimeNs, before);
  // Simulate recovery only into a disposable, absent path, never an operational database.
  const recovered = path.join(directory, 'recovered.json');
  atomicWrite(recovered, fs.readFileSync(receipt.backupFile));
  assert.deepEqual(loadDatabase(recovered).data, JSON.parse(bytes.toString()));
  fs.appendFileSync(receipt.backupFile, 'tampered');
  assert.throws(() => verifyBackup(receipt.backupFile), /integrity verification failed/);
}));

test('malformed originals can be backed up without parse/repair or provenance fabrication', () => fixture(file => {
  const bytes = Buffer.from('{malformed source');
  fs.writeFileSync(file, bytes);
  const backup = backupDatabase(file);
  assert.deepEqual(fs.readFileSync(backup.backupFile), bytes);
  assert.deepEqual(fs.readFileSync(file), bytes);
  assert.deepEqual(verifyBackup(backup.backupFile), backup);
}));

test('demo tooling refuses the configured operational path and production initialization', () => fixture(file => {
  const previousPath = process.env.SPPKM_DB_FILE;
  const previousEnvironment = process.env.NODE_ENV;
  try {
    process.env.SPPKM_DB_FILE = file;
    assert.throws(() => seedDemoDatabase(file), /operational database/);
    assert.equal(fs.existsSync(file), false);
    process.env.NODE_ENV = 'production';
    assert.throws(() => seedDemoDatabase(path.join(path.dirname(file), 'demo.json')), /disabled in production/);
    assert.equal(fs.existsSync(file), false);
  } finally {
    if (previousPath === undefined) delete process.env.SPPKM_DB_FILE; else process.env.SPPKM_DB_FILE = previousPath;
    if (previousEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousEnvironment;
  }
}));

test('CLI demo initialization and backup/verification operate only on explicit disposable targets', () => fixture((file, directory) => {
  const run = (...args: string[]) => runChild(['--import', 'tsx', 'scripts/db-tools.ts', ...args], {
    cwd: process.cwd(), env: { ...process.env, DOTENV_CONFIG_QUIET: 'true' }, encoding: 'utf8', timeout: 15000,
  });
  const seed = run('seed-demo', '--file', file);
  assert.equal(seed.status, 0, seed.stderr);
  assert.equal(loadDatabase(file).data.meta.datasetKind, 'demo');
  const bytes = fs.readFileSync(file);
  const repeatSeed = run('seed-demo', '--file', file);
  assert.notEqual(repeatSeed.status, 0);
  assert.deepEqual(fs.readFileSync(file), bytes);
  const backup = run('backup', '--file', file, '--output', path.join(directory, 'backup-cli'));
  assert.equal(backup.status, 0, backup.stderr);
  const receipt = JSON.parse(backup.stdout);
  const verification = run('verify-backup', '--file', receipt.backupFile);
  assert.equal(verification.status, 0, verification.stderr);
  assert.deepEqual(JSON.parse(verification.stdout), receipt);
  assert.deepEqual(fs.readFileSync(file), bytes);
}));

test('the committed legacy database loads without sample injection or writes', () => {
  const file = path.resolve('data/koperasi_db.json');
  const bytes = fs.readFileSync(file);
  const before = fs.statSync(file, { bigint: true }).mtimeNs;
  const db = new KoperasiDatabase({ filePath: file });
  assert.deepEqual(db.getAllData(), JSON.parse(bytes.toString()));
  assert.deepEqual(fs.readFileSync(file), bytes);
  assert.equal(fs.statSync(file, { bigint: true }).mtimeNs, before);
});
