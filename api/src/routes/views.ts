import { Hono } from 'hono';
import { db } from '../db/client.js';

const views = new Hono();

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
