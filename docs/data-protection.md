# Operational database safety (P0-A)

**Never seed, replace, merge, or fabricate operational financial data automatically.
Sample/demo data must require explicit initialization.**

## Startup and compatibility

- The default file is `data/koperasi_db.json`. `SPPKM_DB_FILE` selects another file;
  it can be set in the environment or `.env`. Ensure this points to durable storage.
- Existing valid files load exactly as stored. Startup does not rewrite bytes,
  timestamps, balances, metadata, or unknown fields. Empty arrays are valid.
- Legacy files may omit the newer modules. Those getters/the frontend expose empty
  arrays or neutral configuration in memory only. Missing fields are not added on disk
  until an explicit operation writes that field. No migration runs on startup.
- The original core collections and `meta` container must be structurally valid.
  Malformed JSON, invalid containers, unreadable/non-regular files (including symlinks),
  and unsupported schema versions stop startup with a manual-recovery error.
- Only an absent file is initialized: every collection is empty, financial totals
  are zero, credentials/identities are blank, notifications are off, and gateway
  configuration is sandbox/manual with no credentials. No users or account balances
  are provisioned. User onboarding/authentication remains a separate task.
- New files have `schemaVersion: 1`, `databaseCreatedAt`, `lastMigrationAt: null`,
  and `datasetKind: operational`. Legacy files receive no invented provenance.
  These describe the container, not the origin of existing financial transactions.
- The browser starts empty and waits for `/api/all-data`. Failure blocks access with
  an error; it never substitutes samples. Sample dashboard trends are shown only for
  a database explicitly marked `datasetKind: demo`.

The repository's existing JSON is intentionally unchanged. Existing records cannot
be retroactively classified as genuine or demo by their count or resemblance to samples.

## Explicit development demo

Useful fixtures remain in `src/data/initialData.ts`, but the operational loader and
database class do not import them. Only explicit demo tooling builds a sample database.

```sh
npm run db:seed-demo
SPPKM_DB_FILE=data/demo/koperasi_db.json npm run dev
```

`db:seed-demo` creates `data/demo/koperasi_db.json`; use `-- --file /path/demo.json`
to select another **absent** development file. It refuses existing files, both the
default and configured operational paths, and `NODE_ENV=production`. There is no
force/reset option. To make another demo, select a different filename. The UI labels
explicitly initialized demo data. Demo files and default backups are gitignored.

## Persistence guarantees and limits

Explicit mutations save synchronously; write errors reach the caller instead of
returning success while a delayed write might fail. On failure, the database class
restores its last successfully persisted in-memory snapshot.

Writes use a uniquely named same-directory temporary file, exclusive creation,
restricted file permissions, file `fsync`, and byte verification before atomic rename.
New-file publication uses an exclusive hard link, so an existing/concurrently created
target cannot be replaced. Failed pre-publication writes preserve the previous file.
Leftover temporary files are never loaded as the authoritative database.

Before replacement, the current disk bytes must still match those loaded by this
process. External changes/corruption cause refusal, not repair. Run only one writer:
this check is not a cross-process lock and does not eliminate the final check/rename
race between independent processes. This remains a JSON store, not a transactional DB.

If directory `fsync` fails *after* publication, the committed file remains authoritative
and a clear durability warning is logged; rollback is not falsely reported. Guarantees
depend on the filesystem supporting same-directory atomic rename/hard links and flushes.
Synchronous full-file saves trade throughput for explicit durability; future database
architecture work should address volume/concurrency without weakening these protections.

## Verified backup procedure

Stop writers before planned replacement, recovery, or a future migration. Then:

```sh
npm run db:backup
npm run db:backup -- --file /path/operational.json --output /secure/backup-directory
npm run db:verify-backup -- --file /secure/backup-directory/GENERATED_NAME.bak
```

The utility copies exact source bytes to a timestamp/UUID backup and writes a separate
manifest containing byte length, SHA-256, source path, and backup creation time. It
re-reads and verifies the backup before reporting success. Record the returned digest
and keep both files together. A missing/mismatched manifest or modified backup fails
verification. A backup without a completed verified receipt must not authorize a migration.

Backups are not created by normal startup. The utility can preserve malformed JSON
without parsing or modifying it; integrity verification does not certify valid JSON,
correct financial figures, or authenticity. Store backups securely and separately from
the live disk; SHA-256 plus a local manifest is not a signed or off-site archive.

Future destructive tools must call `backupDatabase` and require successful verification
before proceeding. No destructive replacement/migration tool is introduced in P0-A.

## Manual recovery

1. Stop the application/writers. Keep the original corrupt file; do not delete it to
   trigger empty initialization, and do not run demo seeding as a recovery step.
2. Back up the original exact bytes using the procedure above, even if JSON is corrupt.
3. Verify the selected known-good backup and retain its digest and manifest.
4. Copy the verified backup to a **separate recovery candidate** path. Validate it with
   `loadDatabase` from `server/storage.ts` (this module does not initialize a singleton),
   then check its financial contents against the approved source records. A SHA match
   alone does not establish the correct financial history.
5. After authorized review, use `SPPKM_DB_FILE` to point to the verified candidate and
   restart. Keep the original and backups. Do not merge or normalize financial values.

Existing legacy fields/types and unknown metadata are preserved. SchemaVersion values
other than 1 require an explicit future migration; no unsupported file is downgraded.

## Validation and remaining scope

```sh
npm test
npm run lint
npm run build
```

Tests use disposable temporary databases and injected I/O failures. A read-only
compatibility test verifies the repository database bytes/mtime. Coverage includes
acceptance scenarios A–H, corrupt/unreadable inputs, stale writes, failed temporary
writes/flush/rename, backup verification/tamper detection, and empty frontend rendering.

P0-A does not repair posting signs, POS duplication, payroll journals, period handling,
reports/exports, authentication/demo login, simulated gateway operations, or other
user-triggered fallback logic. Hard-coded report figures still need the later accounting
and reporting tasks. Do not import FY2021–FY2025 or treat reports as reconciled yet.
