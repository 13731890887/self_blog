import { Hono } from 'hono';
import { db } from '../db/client.js';

const views = new Hono();

function buildExcerpt(source: string, maxLength = 180) {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

views.get('/top', (c) => {
  const row = db.prepare(`
    SELECT
      a.slug,
      a.title,
      a.summary,
      a.body,
      COALESCE(v.views, 0) AS views
    FROM articles a
    LEFT JOIN article_views v ON v.slug = a.slug
    ORDER BY COALESCE(v.views, 0) DESC, a.published_at DESC
    LIMIT 1
  `).get() as
    | {
        slug: string;
        title: string;
        summary: string | null;
        body: string;
        views: number;
      }
    | undefined;

  if (!row) {
    return c.json({ article: null });
  }

  return c.json({
    article: {
      slug: row.slug,
      title: row.title,
      excerpt: row.summary?.trim() || buildExcerpt(row.body),
      views: row.views
    }
  });
});

views.get('/', (c) => {
  const slug = c.req.query('slug') ?? 'unknown';
  const upsert = db.prepare(`
    INSERT INTO article_views (slug, views, updated_at)
    VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      views = views + 1,
      updated_at = CURRENT_TIMESTAMP
  `);
  const getViews = db.prepare('SELECT views FROM article_views WHERE slug = ?');

  upsert.run(slug);
  const row = getViews.get(slug) as { views: number } | undefined;

  return c.json({ slug, views: row?.views ?? 1 });
});

export default views;
