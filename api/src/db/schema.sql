CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  summary TEXT,
  embedding BLOB,
  published_at TEXT NOT NULL,
  updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title,
  body,
  content='articles',
  content_rowid='id'
);

CREATE TABLE IF NOT EXISTS article_views (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_moods (
  day TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  label TEXT NOT NULL,
  rationale TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
