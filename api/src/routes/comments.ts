import { Hono } from 'hono';
import { db } from '../db/client.js';
import { enforceRateLimit, hashIp, validateCommunityPayload } from '../lib/community.js';

const comments = new Hono();

comments.get('/', (c) => {
  const slug = c.req.query('slug') ?? '';
  if (!slug) {
    return c.json({ comments: [] });
  }

  const rows = db.prepare(`
    SELECT id, article_slug, parent_id, username, content, created_at
    FROM article_comments
    WHERE article_slug = ? AND status = 'visible'
    ORDER BY created_at ASC
  `).all(slug) as Array<{
    id: number;
    article_slug: string;
    parent_id: number | null;
    username: string;
    content: string;
    created_at: string;
  }>;

  return c.json({
    comments: rows
  });
});

comments.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const articleSlug = typeof body.articleSlug === 'string' ? body.articleSlug.trim() : '';
  const parentId = typeof body.parentId === 'number' ? body.parentId : null;
  const parsed = validateCommunityPayload({
    username: String(body.username ?? ''),
    email: String(body.email ?? ''),
    content: String(body.content ?? ''),
    website: String(body.website ?? '')
  }, parentId ? 'reply' : 'comment');

  if (!articleSlug) {
    return c.json({ error: 'articleSlug is required' }, 400);
  }

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const ipHash = hashIp(c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local');
  if (!enforceRateLimit({
    scope: parentId ? 'reply' : 'comment',
    ipHash,
    emailNormalized: parsed.emailNormalized
  })) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const result = db.prepare(`
    INSERT INTO article_comments(
      article_slug, parent_id, username, email, email_normalized, ip_hash, user_agent, content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible')
  `).run(
    articleSlug,
    parentId,
    parsed.username,
    parsed.email,
    parsed.emailNormalized,
    ipHash,
    c.req.header('user-agent') ?? null,
    parsed.content
  );

  return c.json({ ok: true, id: Number(result.lastInsertRowid) }, 202);
});

export default comments;
