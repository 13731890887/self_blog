import { Hono } from 'hono';
import { db } from '../db/client.js';
import {
  createThreadSlug,
  enforceRateLimit,
  hashIp,
  validateCommunityPayload
} from '../lib/community.js';

const questions = new Hono();

questions.get('/', (c) => {
  const rows = db.prepare(`
    SELECT
      q.id,
      q.slug,
      q.title,
      q.username,
      q.content,
      q.created_at,
      q.last_activity_at,
      q.locked,
      COUNT(r.id) AS reply_count
    FROM question_threads q
    LEFT JOIN question_replies r ON r.thread_id = q.id AND r.status = 'visible'
    WHERE q.status = 'visible'
    GROUP BY q.id
    ORDER BY q.last_activity_at DESC
  `).all();

  return c.json({ questions: rows });
});

questions.get('/:slug', (c) => {
  const slug = c.req.param('slug');
  const thread = db.prepare(`
    SELECT id, slug, title, username, content, created_at, last_activity_at, locked
    FROM question_threads
    WHERE slug = ? AND status = 'visible'
  `).get(slug);

  if (!thread) {
    return c.json({ error: 'Not found' }, 404);
  }

  const replies = db.prepare(`
    SELECT id, thread_id, parent_id, username, content, created_at
    FROM question_replies
    WHERE thread_id = ? AND status = 'visible'
    ORDER BY created_at ASC
  `).all((thread as { id: number }).id);

  return c.json({ thread, replies });
});

questions.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = validateCommunityPayload({
    username: String(body.username ?? ''),
    email: String(body.email ?? ''),
    content: String(body.content ?? ''),
    title: String(body.title ?? ''),
    website: String(body.website ?? '')
  }, 'question');

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const ipHash = hashIp(c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local');
  if (!enforceRateLimit({ scope: 'question', ipHash, emailNormalized: parsed.emailNormalized })) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const slug = uniqueQuestionSlug(parsed.title);
  const result = db.prepare(`
    INSERT INTO question_threads(
      slug, username, email, email_normalized, ip_hash, user_agent, title, content, status, locked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible', 0)
  `).run(
    slug,
    parsed.username,
    parsed.email,
    parsed.emailNormalized,
    ipHash,
    c.req.header('user-agent') ?? null,
    parsed.title,
    parsed.content
  );

  return c.json({ ok: true, id: Number(result.lastInsertRowid), slug }, 202);
});

questions.post('/:id/replies', async (c) => {
  const threadId = Number(c.req.param('id'));
  const thread = db.prepare(`SELECT id, locked FROM question_threads WHERE id = ? AND status = 'visible'`).get(threadId) as { id: number; locked: number } | undefined;
  if (!thread) {
    return c.json({ error: 'Not found' }, 404);
  }
  if (thread.locked) {
    return c.json({ error: 'Thread is locked' }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parentId = typeof body.parentId === 'number' ? body.parentId : null;
  const parsed = validateCommunityPayload({
    username: String(body.username ?? ''),
    email: String(body.email ?? ''),
    content: String(body.content ?? ''),
    website: String(body.website ?? '')
  }, 'reply');

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const ipHash = hashIp(c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local');
  if (!enforceRateLimit({ scope: 'reply', ipHash, emailNormalized: parsed.emailNormalized })) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const result = db.prepare(`
    INSERT INTO question_replies(
      thread_id, parent_id, username, email, email_normalized, ip_hash, user_agent, content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible')
  `).run(
    threadId,
    parentId,
    parsed.username,
    parsed.email,
    parsed.emailNormalized,
    ipHash,
    c.req.header('user-agent') ?? null,
    parsed.content
  );

  db.prepare(`UPDATE question_threads SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(threadId);

  return c.json({ ok: true, id: Number(result.lastInsertRowid) }, 202);
});

export default questions;

function uniqueQuestionSlug(title: string) {
  const base = createThreadSlug(title);
  let slug = base;
  let counter = 1;

  while (db.prepare(`SELECT 1 FROM question_threads WHERE slug = ?`).get(slug)) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}
