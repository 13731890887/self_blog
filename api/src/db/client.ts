import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH ?? 'api/data/blog.db';

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
