import 'dotenv/config';
import { KoperasiDatabase } from './db';

// Failure to read/parse an existing file deliberately prevents server startup.
export const db = new KoperasiDatabase();
