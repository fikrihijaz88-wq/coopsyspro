import 'dotenv/config';
import path from 'node:path';
import { backupDatabase, verifyBackup } from '../server/backup';
import { databaseFilePath } from '../server/storage';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const options: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!['--file', '--output'].includes(args[index]) || !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error('Usage: db-tools.ts seed-demo|backup|verify-backup [--file PATH] [--output BACKUP_DIRECTORY]');
    }
    options[args[index]] = args[index + 1];
  }
  if (command === 'seed-demo') {
    if (options['--output']) throw new Error('seed-demo accepts only --file.');
    const file = path.resolve(options['--file'] || 'data/demo/koperasi_db.json');
    const { seedDemoDatabase } = await import('../server/demo');
    seedDemoDatabase(file);
    console.log(`Demo database explicitly created at ${file}. Operational data was not replaced.`);
    console.log(`To use it locally: SPPKM_DB_FILE='${file}' npm run dev`);
  } else if (command === 'backup') {
    console.log(JSON.stringify(backupDatabase(options['--file'] || databaseFilePath(), {
      backupDirectory: options['--output'],
    }), null, 2));
  } else if (command === 'verify-backup') {
    if (!options['--file'] || options['--output']) throw new Error('verify-backup requires --file BACKUP_PATH only.');
    console.log(JSON.stringify(verifyBackup(options['--file']), null, 2));
  } else {
    throw new Error('Expected seed-demo, backup, or verify-backup. No operation performed.');
  }
}

main().catch(error => {
  console.error(`[DB tool] ${error.message}`);
  process.exitCode = 1;
});
