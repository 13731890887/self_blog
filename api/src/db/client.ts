import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fromApiRoot } from '../lib/paths.js';

const dbPath = process.env.DATABASE_PATH ?? path.join(fromApiRoot('data'), 'blog.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
