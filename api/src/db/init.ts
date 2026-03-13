import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { db } from './client.js';
import { fromApiRoot, fromProjectRoot } from '../lib/paths.js';

const schemaPath = fromApiRoot('src', 'db', 'schema.sql');
const articlesDir = fromProjectRoot('src', 'content', 'articles');

export function initializeDatabase() {
  fs.mkdirSync(path.dirname(fromApiRoot('data', 'blog.db')), { recursive: true });
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  syncArticlesIntoDatabase();
}

function syncArticlesIntoDatabase() {
  if (!fs.existsSync(articlesDir)) {
    return;
  }

  const files = fs.readdirSync(articlesDir).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
  const existingSlugs = new Set<string>();

  const upsertArticle = db.prepare(`
    INSERT INTO articles (slug, title, body, summary, published_at, updated_at)
    VALUES (@slug, @title, @body, @summary, @published_at, @updated_at)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      summary = excluded.summary,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at
  `);

  const deleteFromFts = db.prepare('DELETE FROM articles_fts');
  const insertIntoFts = db.prepare(`
    INSERT INTO articles_fts(rowid, title, body)
    SELECT id, title, body FROM articles
  `);

  const deleteMissingArticles = db.prepare(`
    DELETE FROM articles
    WHERE slug NOT IN (${files.map(() => '?').join(',') || "''"})
  `);

  const transaction = db.transaction(() => {
    for (const file of files) {
      const filePath = path.join(articlesDir, file);
      const source = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(source);
      const slug = file.replace(/\.(md|mdx)$/, '');
      existingSlugs.add(slug);
      upsertArticle.run({
        slug,
        title: String(parsed.data.title ?? slug),
        body: String(parsed.content ?? ''),
        summary: typeof parsed.data.tldr === 'string' ? parsed.data.tldr : null,
        published_at: String(parsed.data.pubDate ?? new Date().toISOString()),
        updated_at: parsed.data.updatedDate ? String(parsed.data.updatedDate) : null
      });
    }

    deleteMissingArticles.run(...files.map((file) => file.replace(/\.(md|mdx)$/, '')));
    deleteFromFts.run();
    insertIntoFts.run();
  });

  transaction();
}
