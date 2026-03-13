import { Hono } from 'hono';
import { db } from '../db/client.js';
import { searchBrave } from '../lib/brave.js';
import { buildFtsQuery, normalizeSearchLimit } from '../lib/search.js';

const search = new Hono();

search.get('/', async (c) => {
  const q = c.req.query('q') ?? '';
  const limit = normalizeSearchLimit(c.req.query('limit'));
  const ftsQuery = buildFtsQuery(q);

  if (!q.trim() || !ftsQuery) {
    return c.json({
      mode: 'fts5',
      query: q,
      results: []
    });
  }

  let localResults: Array<{
    slug: string;
    title: string;
    excerpt: string;
    score: number;
  }> = [];

  try {
    localResults = db.prepare(`
      SELECT
        a.slug,
        a.title,
        COALESCE(a.summary, substr(replace(a.body, char(10), ' '), 1, 180)) AS excerpt,
        bm25(articles_fts) AS score
      FROM articles_fts
      JOIN articles a ON a.rowid = articles_fts.rowid
      WHERE articles_fts MATCH ?
      ORDER BY bm25(articles_fts)
      LIMIT ?
    `).all(ftsQuery, limit) as Array<{
      slug: string;
      title: string;
      excerpt: string;
      score: number;
    }>;
  } catch (error) {
    console.error('FTS query failed:', error);
  }

  let braveResults: Array<{ title: string; href: string; excerpt: string; source: string }> = [];

  if (localResults.length < Math.min(3, limit)) {
    try {
      braveResults = await searchBrave(q, Math.max(0, limit - localResults.length));
    } catch (error) {
      console.error('Brave search fallback failed:', error);
    }
  }

  return c.json({
    mode: braveResults.length > 0 ? 'fts5+brave' : 'fts5',
    query: q,
    results: [
      ...localResults.map((item) => ({
        title: item.title,
        href: `/articles/${item.slug}`,
        excerpt: item.excerpt,
        score: Number(Math.max(0, 1 - item.score).toFixed(4)),
        source: 'local'
      })),
      ...braveResults
    ]
  });
});

export default search;
