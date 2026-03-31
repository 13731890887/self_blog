import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { createBailianChatCompletion, hasBailianConfig } from '../lib/bailian.js';
import {
  deleteArticle,
  getArticle,
  listArticles,
  publishArticle,
  renameArticle,
  renderArticleSource,
  updateArticle
} from '../lib/content.js';
import { extractAiCliKey, isAiCliConfigured, verifyAiCliKey } from '../lib/cli-auth.js';
import { db } from '../db/client.js';
import { recordModerationEvent } from '../lib/community.js';
import { importDocx } from '../lib/doc-import.js';
import { fromProjectRoot } from '../lib/paths.js';
import { readSiteSettings, sanitizeSiteSettings, writeSiteSettings } from '../lib/site-settings.js';
import { readSiteRebuildLog, readSiteRebuildStatus, triggerSiteRebuild } from '../lib/rebuild.js';

const cli = new Hono();
const uploadsDir = fromProjectRoot('public', 'uploads');
const articlesDir = fromProjectRoot('src', 'content', 'articles');

cli.use('*', async (c, next) => {
  if (!isAiCliConfigured()) {
    return c.json({ error: 'AI CLI auth is not configured' }, 503);
  }

  const key = extractAiCliKey(c.req.header('authorization'), c.req.header('x-ai-cli-key'));
  if (!verifyAiCliKey(key)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
});

cli.get('/status', (c) => {
  return c.json({
    ok: true,
    configured: true,
    rebuild: readSiteRebuildStatus(),
    capabilities: {
      article: ['list', 'get', 'publish', 'update', 'delete', 'assist', 'import-docx', 'rename', 'diff'],
      asset: ['upload', 'list', 'delete'],
      settings: ['get', 'set'],
      settingsTag: ['list', 'add', 'remove'],
      comment: ['list', 'get', 'reply', 'approve', 'hide', 'delete', 'restore'],
      question: ['list', 'get', 'reply', 'reply-to', 'approve', 'hide', 'delete', 'restore', 'lock', 'unlock'],
      rebuild: ['status', 'trigger', 'log'],
      audit: ['list']
    }
  });
});

cli.get('/articles', (c) => {
  const status = c.req.query('status');
  const tag = c.req.query('tag')?.trim().toLowerCase();
  let articles = listArticles();

  if (status === 'draft') {
    articles = articles.filter((item) => item.draft);
  } else if (status === 'published') {
    articles = articles.filter((item) => !item.draft);
  }

  if (tag) {
    articles = articles.filter((item) => {
      const detail = getArticle(item.slug);
      return detail.tags.map((value) => value.toLowerCase()).includes(tag);
    });
  }

  return c.json({ articles });
});

cli.get('/articles/:slug', (c) => {
  try {
    return c.json({ article: getArticle(c.req.param('slug')) });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Article lookup failed' }, 404);
  }
});

cli.post('/articles/assist', async (c) => {
  if (!hasBailianConfig()) {
    return c.json({ error: 'Bailian is not configured' }, 503);
  }

  const body = await c.req.json().catch(() => ({ title: '', content: '', locale: 'zh' }));
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }
  if (content.length > 12000 || title.length > 180) {
    return c.json({ error: 'Input is too long' }, 400);
  }

  try {
    const completion = await createBailianChatCompletion([
      {
        role: 'system',
        content: locale === 'zh'
          ? '你是个人博客后台写作助手。只返回紧凑 JSON，字段为 refinedTitle, titleAlternatives, tags, metaDescription, readabilityNotes。'
          : 'You are an admin writing assistant for a personal blog. Return only compact JSON with fields refinedTitle, titleAlternatives, tags, metaDescription, readabilityNotes.'
      },
      {
        role: 'user',
        content: buildAssistPrompt(title, content, locale)
      }
    ]);

    return c.json(parseAssistPayload(completion.choices?.[0]?.message?.content ?? ''));
  } catch (error) {
    console.error('AI CLI assist failed:', error);
    return c.json({ error: 'AI CLI assist request failed' }, 502);
  }
});

cli.post('/articles', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const input = parseArticleWriteInput(body);

  if (!input.title || !input.content) {
    return c.json({ error: 'title and content are required' }, 400);
  }

  try {
    const result = publishArticle(input);
    const rebuild = input.draft ? idleRebuild() : triggerSiteRebuild();

    return c.json({
      ok: true,
      action: 'publish',
      ...result,
      draft: input.draft,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Publish failed' }, 400);
  }
});

cli.put('/articles/:slug', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json().catch(() => ({}));

  try {
    const existing = getArticle(slug);
    const input = parseArticleWriteInput(body, {
      title: existing.title,
      content: existing.content,
      metaDescription: existing.description,
      tags: existing.tags,
      tldr: existing.tldr,
      draft: existing.draft
    });

    const result = updateArticle({ slug, ...input });
    const rebuild = input.draft ? idleRebuild() : triggerSiteRebuild();

    return c.json({
      ok: true,
      action: 'update',
      ...result,
      draft: input.draft,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return c.json({ error: message }, message === 'Article not found' ? 404 : 400);
  }
});

cli.post('/articles/:slug/rename', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json().catch(() => ({}));
  const nextSlug = typeof body.to === 'string' ? body.to.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;

  if (!nextSlug) {
    return c.json({ error: 'to is required' }, 400);
  }

  try {
    const result = renameArticle({ slug, nextSlug, title });
    return c.json({ ok: true, action: 'rename', ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rename failed';
    return c.json({ error: message }, message === 'Article not found' ? 404 : 400);
  }
});

cli.post('/articles/:slug/diff', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json().catch(() => ({}));

  try {
    const existing = getArticle(slug);
    const input = parseArticleWriteInput(body, {
      title: existing.title,
      content: existing.content,
      metaDescription: existing.description,
      tags: existing.tags,
      tldr: existing.tldr,
      draft: existing.draft
    });

    const currentSource = fs.readFileSync(existing.filePath, 'utf8');
    const proposedSource = renderArticleSource({
      slug,
      ...input
    }, existing.pubDate || new Date().toISOString().slice(0, 10));

    return c.json({
      ok: true,
      slug,
      changed: currentSource !== proposedSource,
      diff: buildUnifiedDiff(currentSource, proposedSource, `${slug}.mdx`, `${slug}.mdx (proposed)`),
      current: {
        title: existing.title,
        description: existing.description,
        tags: existing.tags,
        tldr: existing.tldr,
        draft: existing.draft,
        content: existing.content
      },
      proposed: input
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Diff failed';
    return c.json({ error: message }, message === 'Article not found' ? 404 : 400);
  }
});

cli.delete('/articles/:slug', (c) => {
  try {
    const result = deleteArticle(c.req.param('slug'));
    const rebuild = result.draft ? idleRebuild() : triggerSiteRebuild();
    return c.json({
      ok: true,
      action: 'delete',
      ...result,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return c.json({ error: message }, message === 'Article not found' ? 404 : 400);
  }
});

cli.post('/articles/import-docx', async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('document');

  if (!(file instanceof File)) {
    return c.json({ error: 'document is required' }, 400);
  }
  if (!file.name.toLowerCase().endsWith('.docx')) {
    return c.json({ error: 'Only .docx files are supported' }, 400);
  }

  try {
    return c.json(await importDocx(file));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Document import failed' }, 400);
  }
});

cli.post('/assets/upload-image', async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('image');
  const alt = typeof form?.get('alt') === 'string' ? String(form.get('alt')).trim().slice(0, 120) : '';

  if (!(file instanceof File)) {
    return c.json({ error: 'image is required' }, 400);
  }
  if (file.size === 0) {
    return c.json({ error: 'image is empty' }, 400);
  }

  const extension = inferImageExtension(file);
  if (!extension) {
    return c.json({ error: 'Unsupported image format' }, 400);
  }

  fs.mkdirSync(uploadsDir, { recursive: true });
  const hash = crypto.randomBytes(6).toString('hex');
  const basename = slugifyFilename(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const filename = `${Date.now()}-${basename}-${hash}.${extension}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/${filename}?v=${Date.now()}`;
  return c.json({ ok: true, filename, url, markdown: `![${alt || basename}](${url})` });
});

cli.get('/assets', (c) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const files = fs.readdirSync(uploadsDir)
    .filter((name) => fs.statSync(path.join(uploadsDir, name)).isFile())
    .map((name) => {
      const filePath = path.join(uploadsDir, name);
      const stats = fs.statSync(filePath);
      const references = findAssetReferences(name);
      return {
        filename: name,
        url: `/uploads/${name}`,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        referenced: references.length > 0,
        references
      };
    })
    .sort((a, b) => Date.parse(b.modifiedAt) - Date.parse(a.modifiedAt));

  return c.json({ assets: files });
});

cli.delete('/assets/:filename', (c) => {
  const filename = sanitizeFilename(c.req.param('filename'));
  const force = c.req.query('force') === 'true';
  const filePath = path.join(uploadsDir, filename);

  if (!filename || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return c.json({ error: 'Asset not found' }, 404);
  }

  const references = findAssetReferences(filename);
  if (references.length > 0 && !force) {
    return c.json({ error: 'Asset is still referenced', references }, 409);
  }

  fs.unlinkSync(filePath);
  return c.json({ ok: true, filename, referencesRemoved: references.length });
});

cli.get('/settings', (c) => c.json(readSiteSettings()));

cli.put('/settings', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const settings = sanitizeSiteSettings(body);
  writeSiteSettings(settings);
  return c.json({ ok: true, settings });
});

cli.get('/settings/tags', (c) => {
  return c.json({ tags: readSiteSettings().tags });
});

cli.post('/settings/tags', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const zh = typeof body.zh === 'string' ? body.zh.trim() : '';
  const en = typeof body.en === 'string' ? body.en.trim() : '';
  const current = readSiteSettings();
  const settings = sanitizeSiteSettings({
    ...current,
    tags: [...current.tags, { zh, en }]
  });

  writeSiteSettings(settings);
  return c.json({ ok: true, tags: settings.tags });
});

cli.delete('/settings/tags/:en', (c) => {
  const en = c.req.param('en').trim().toLowerCase();
  const current = readSiteSettings();
  const settings = sanitizeSiteSettings({
    ...current,
    tags: current.tags.filter((tag) => tag.en !== en)
  });

  writeSiteSettings(settings);
  return c.json({ ok: true, tags: settings.tags });
});

cli.get('/comments', (c) => {
  const status = c.req.query('status');
  const rows = db.prepare(`
    SELECT id, article_slug, parent_id, username, email, content, status, created_at, updated_at
    FROM article_comments
    ${status ? 'WHERE status = ?' : ''}
    ORDER BY created_at DESC
    LIMIT 200
  `).all(...(status ? [status] : []));

  return c.json({ comments: rows });
});

cli.get('/comments/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const comment = db.prepare(`
    SELECT id, article_slug, parent_id, username, email, content, status, created_at, updated_at
    FROM article_comments
    WHERE id = ?
  `).get(id);

  if (!comment) {
    return c.json({ error: 'Comment not found' }, 404);
  }

  const replies = db.prepare(`
    SELECT id, article_slug, parent_id, username, email, content, status, created_at, updated_at
    FROM article_comments
    WHERE parent_id = ?
    ORDER BY created_at ASC
  `).all(id);

  return c.json({ comment, replies });
});

cli.post('/comments/:id/reply', async (c) => {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const parent = db.prepare(`
    SELECT id, article_slug
    FROM article_comments
    WHERE id = ? AND status != 'deleted'
  `).get(id) as { id: number; article_slug: string } | undefined;

  if (!parent) {
    return c.json({ error: 'Comment not found' }, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }

  const actor = resolveActor(body);
  const result = db.prepare(`
    INSERT INTO article_comments(
      article_slug, parent_id, username, email, email_normalized, ip_hash, user_agent, content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible')
  `).run(
    parent.article_slug,
    parent.id,
    actor.username,
    actor.email,
    actor.email.toLowerCase(),
    'ai-cli',
    'ai-cli',
    content
  );

  return c.json({ ok: true, id: Number(result.lastInsertRowid), parentId: parent.id });
});

cli.post('/comments/:id/:action', (c) => {
  const id = Number(c.req.param('id'));
  const action = c.req.param('action');
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const status = mapModerationAction(action);
  if (!status) {
    return c.json({ error: 'Unknown action' }, 400);
  }

  const result = db.prepare(`
    UPDATE article_comments
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

  if (result.changes === 0) {
    return c.json({ error: 'Comment not found' }, 404);
  }

  recordModerationEvent('comments', id, action);
  return c.json({ ok: true, id, status, action });
});

cli.get('/questions', (c) => {
  const status = c.req.query('status');
  const rows = db.prepare(`
    SELECT id, slug, title, username, email, status, locked, created_at, updated_at, last_activity_at
    FROM question_threads
    ${status ? 'WHERE status = ?' : ''}
    ORDER BY last_activity_at DESC
    LIMIT 200
  `).all(...(status ? [status] : []));

  return c.json({ questions: rows });
});

cli.get('/questions/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const thread = db.prepare(`
    SELECT id, slug, title, username, email, content, status, locked, created_at, updated_at, last_activity_at
    FROM question_threads
    WHERE id = ?
  `).get(id);

  if (!thread) {
    return c.json({ error: 'Question not found' }, 404);
  }

  const replies = db.prepare(`
    SELECT id, thread_id, parent_id, username, email, content, status, created_at, updated_at
    FROM question_replies
    WHERE thread_id = ?
    ORDER BY created_at ASC
  `).all(id);

  return c.json({ question: thread, replies });
});

cli.post('/questions/:id/reply', async (c) => {
  const threadId = Number(c.req.param('id'));
  if (!threadId) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const thread = db.prepare(`
    SELECT id
    FROM question_threads
    WHERE id = ? AND status != 'deleted'
  `).get(threadId);

  if (!thread) {
    return c.json({ error: 'Question not found' }, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }

  const actor = resolveActor(body);
  const result = db.prepare(`
    INSERT INTO question_replies(
      thread_id, parent_id, username, email, email_normalized, ip_hash, user_agent, content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible')
  `).run(
    threadId,
    null,
    actor.username,
    actor.email,
    actor.email.toLowerCase(),
    'ai-cli',
    'ai-cli',
    content
  );

  db.prepare(`UPDATE question_threads SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(threadId);
  return c.json({ ok: true, id: Number(result.lastInsertRowid), threadId });
});

cli.post('/questions/replies/:id/reply', async (c) => {
  const replyId = Number(c.req.param('id'));
  if (!replyId) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const parent = db.prepare(`
    SELECT id, thread_id
    FROM question_replies
    WHERE id = ? AND status != 'deleted'
  `).get(replyId) as { id: number; thread_id: number } | undefined;

  if (!parent) {
    return c.json({ error: 'Reply not found' }, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }

  const actor = resolveActor(body);
  const result = db.prepare(`
    INSERT INTO question_replies(
      thread_id, parent_id, username, email, email_normalized, ip_hash, user_agent, content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible')
  `).run(
    parent.thread_id,
    parent.id,
    actor.username,
    actor.email,
    actor.email.toLowerCase(),
    'ai-cli',
    'ai-cli',
    content
  );

  db.prepare(`UPDATE question_threads SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(parent.thread_id);
  return c.json({ ok: true, id: Number(result.lastInsertRowid), threadId: parent.thread_id, parentId: parent.id });
});

cli.post('/questions/:id/:action', (c) => {
  const id = Number(c.req.param('id'));
  const action = c.req.param('action');
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  if (action === 'lock' || action === 'unlock') {
    const locked = action === 'lock' ? 1 : 0;
    const result = db.prepare(`
      UPDATE question_threads
      SET locked = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(locked, id);

    if (result.changes === 0) {
      return c.json({ error: 'Question not found' }, 404);
    }

    recordModerationEvent('questions', id, action);
    return c.json({ ok: true, id, action, locked: Boolean(locked) });
  }

  const status = mapModerationAction(action);
  if (!status) {
    return c.json({ error: 'Unknown action' }, 400);
  }

  const result = db.prepare(`
    UPDATE question_threads
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

  if (result.changes === 0) {
    return c.json({ error: 'Question not found' }, 404);
  }

  recordModerationEvent('questions', id, action);
  return c.json({ ok: true, id, action, status });
});

cli.get('/rebuild/status', (c) => c.json(readSiteRebuildStatus()));

cli.post('/rebuild/trigger', (c) => {
  const rebuild = triggerSiteRebuild();
  return c.json({ ok: true, ...rebuild });
});

cli.get('/rebuild/log', (c) => {
  const lines = clampPositiveNumber(c.req.query('lines'), 80, 500);
  return c.json(readSiteRebuildLog(lines));
});

cli.get('/audit', (c) => {
  const limit = clampPositiveNumber(c.req.query('limit'), 100, 500);
  const targetType = c.req.query('targetType');
  const action = c.req.query('action');
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (targetType) {
    conditions.push('target_type = ?');
    values.push(targetType);
  }
  if (action) {
    conditions.push('action = ?');
    values.push(action);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT id, target_type, target_id, action, reason, created_at
    FROM moderation_events
    ${where}
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).all(...values, limit);

  return c.json({ events: rows });
});

type ArticleWriteInput = {
  title: string;
  content: string;
  metaDescription?: string;
  tags: string[];
  tldr?: string;
  draft: boolean;
};

type ArticleDefaults = {
  title: string;
  content: string;
  metaDescription: string;
  tags: string[];
  tldr: string;
  draft: boolean;
};

function parseArticleWriteInput(body: unknown, defaults?: ArticleDefaults): ArticleWriteInput {
  const record = isRecord(body) ? body : {};
  const title = typeof record.title === 'string' ? record.title.trim() : (defaults?.title ?? '');
  const content = typeof record.content === 'string' ? record.content.trim() : (defaults?.content ?? '');
  const metaDescription = typeof record.metaDescription === 'string' ? record.metaDescription.trim() : defaults?.metaDescription;
  const tldr = typeof record.tldr === 'string' ? record.tldr.trim() : defaults?.tldr;
  const draft = typeof record.draft === 'boolean' ? record.draft : (defaults?.draft ?? true);
  const tags = Array.isArray(record.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
    : (defaults?.tags ?? []);

  return { title, content, metaDescription, tags, tldr, draft };
}

function idleRebuild() {
  return {
    started: false,
    logPath: fromProjectRoot('shared', 'site-rebuild.log')
  };
}

function buildAssistPrompt(title: string, content: string, locale: 'zh' | 'en') {
  return [
    locale === 'zh'
      ? '请根据以下草稿生成更好的标题、3个备选标题、3到6个标签、一段 meta description，以及 2 到 4 条可读性建议。'
      : 'Based on the draft below, generate a stronger title, 3 alternative titles, 3 to 6 tags, one meta description, and 2 to 4 readability notes.',
    title ? `Title: ${title}` : '',
    `Content:\n${content.slice(0, 12000)}`
  ].filter(Boolean).join('\n\n');
}

function parseAssistPayload(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No JSON object found in AI CLI assist response');
  }

  const parsed = JSON.parse(match[0]) as {
    refinedTitle?: string;
    titleAlternatives?: string[];
    tags?: string[];
    metaDescription?: string;
    readabilityNotes?: string[];
  };

  return {
    refinedTitle: typeof parsed.refinedTitle === 'string' ? parsed.refinedTitle : '',
    titleAlternatives: Array.isArray(parsed.titleAlternatives) ? parsed.titleAlternatives.filter(isString) : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter(isString) : [],
    metaDescription: typeof parsed.metaDescription === 'string' ? parsed.metaDescription : '',
    readabilityNotes: Array.isArray(parsed.readabilityNotes) ? parsed.readabilityNotes.filter(isString) : []
  };
}

function inferImageExtension(file: File) {
  const type = file.type.toLowerCase();
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/avif') return 'avif';
  if (type === 'image/gif') return 'gif';

  const name = file.name.toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.webp')) return 'webp';
  if (name.endsWith('.avif')) return 'avif';
  if (name.endsWith('.gif')) return 'gif';

  return '';
}

function slugifyFilename(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function sanitizeFilename(value: string) {
  return path.basename(value).trim();
}

function findAssetReferences(filename: string) {
  fs.mkdirSync(articlesDir, { recursive: true });
  const target = `/uploads/${filename}`;

  return fs.readdirSync(articlesDir)
    .filter((name) => name.endsWith('.mdx'))
    .filter((name) => fs.readFileSync(path.join(articlesDir, name), 'utf8').includes(target))
    .map((name) => name.replace(/\.mdx$/, ''));
}

function resolveActor(body: unknown) {
  const record = isRecord(body) ? body : {};
  const username = typeof record.username === 'string' && record.username.trim()
    ? record.username.trim()
    : process.env.AI_CLI_ACTOR_NAME?.trim() || 'AI Admin';
  const email = typeof record.email === 'string' && record.email.trim()
    ? record.email.trim()
    : process.env.AI_CLI_ACTOR_EMAIL?.trim() || 'ai-cli@localhost';

  return { username: username.slice(0, 24), email: email.slice(0, 120) };
}

function mapModerationAction(action: string) {
  if (action === 'approve' || action === 'restore') return 'visible';
  if (action === 'hide') return 'hidden';
  if (action === 'delete') return 'deleted';
  return null;
}

function buildUnifiedDiff(currentSource: string, proposedSource: string, currentLabel: string, proposedLabel: string) {
  const currentLines = currentSource.replace(/\r\n/g, '\n').split('\n');
  const proposedLines = proposedSource.replace(/\r\n/g, '\n').split('\n');
  const rows = buildLcsMatrix(currentLines, proposedLines);
  const body = diffWalk(rows, currentLines, proposedLines);

  return [
    `--- ${currentLabel}`,
    `+++ ${proposedLabel}`,
    '@@',
    ...body
  ].join('\n');
}

function buildLcsMatrix(left: string[], right: string[]) {
  const rows = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      rows[i][j] = left[i] === right[j] ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1]);
    }
  }

  return rows;
}

function diffWalk(rows: number[][], left: string[], right: string[]) {
  const changes: string[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      changes.push(` ${left[i]}`);
      i += 1;
      j += 1;
      continue;
    }

    if (rows[i + 1][j] >= rows[i][j + 1]) {
      changes.push(`-${left[i]}`);
      i += 1;
    } else {
      changes.push(`+${right[j]}`);
      j += 1;
    }
  }

  while (i < left.length) {
    changes.push(`-${left[i]}`);
    i += 1;
  }
  while (j < right.length) {
    changes.push(`+${right[j]}`);
    j += 1;
  }

  return changes;
}

function clampPositiveNumber(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(parsed), max);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export default cli;
