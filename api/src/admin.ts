import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
  verifyAdminSessionToken
} from '../lib/admin-auth.js';
import { createBailianChatCompletion, hasBailianConfig } from '../lib/bailian.js';
import { db } from '../db/client.js';
import { recordModerationEvent } from '../lib/community.js';
import { deleteArticle, getArticle, listArticles, publishArticle, updateArticle } from '../lib/content.js';
import { fromProjectRoot } from '../lib/paths.js';
import { triggerSiteRebuild } from '../lib/rebuild.js';
import {
  readSiteSettings,
  sanitizeSiteSettings,
  writeSiteSettings
} from '../lib/site-settings.js';

const admin = new Hono();

admin.get('/session', (c) => {
  return c.json({
    configured: isAdminConfigured(),
    authenticated: isAuthenticated(c)
  });
});

admin.get('/settings', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json(readSiteSettings());
});

admin.post('/login', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  const body = await c.req.json().catch(() => ({ password: '' }));
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyAdminPassword(password)) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  setCookie(c, ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 12
  });

  return c.json({ ok: true });
});

admin.post('/logout', (c) => {
  deleteCookie(c, ADMIN_SESSION_COOKIE, {
    path: '/'
  });

  return c.json({ ok: true });
});

admin.post('/assist', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!hasBailianConfig()) {
    return c.json({ error: 'Bailian is not configured' }, 503);
  }

  const body = await c.req.json().catch(() => ({
    title: '',
    content: '',
    locale: 'zh'
  }));

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

    const text = completion.choices?.[0]?.message?.content ?? '';
    return c.json(parseAssistPayload(text));
  } catch (error) {
    console.error('Admin assist failed:', error);
    return c.json({ error: 'Admin assist request failed' }, 502);
  }
});

admin.post('/publish', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json().catch(() => ({
    title: '',
    content: '',
    metaDescription: '',
    tags: [],
    tldr: '',
    draft: true
  }));

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const metaDescription = typeof body.metaDescription === 'string' ? body.metaDescription.trim() : '';
  const tldr = typeof body.tldr === 'string' ? body.tldr.trim() : '';
  const draft = body.draft !== false;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter(isString).map((tag: string) => tag.trim()).filter(Boolean)
    : [];

  if (!title || !content) {
    return c.json({ error: 'title and content are required' }, 400);
  }

  try {
    const result = publishArticle({
      title,
      content,
      metaDescription,
      tags,
      tldr,
      draft
    });

    const rebuild = draft
      ? { started: false, logPath: fromProjectRoot('shared', 'site-rebuild.log') }
      : triggerSiteRebuild();

    return c.json({
      ok: true,
      ...result,
      draft,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Publish failed'
    }, 400);
  }
});

admin.post('/settings', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const settings = sanitizeSiteSettings(body);
  writeSiteSettings(settings);

  return c.json({
    ok: true,
    settings
  });
});

admin.post('/upload-image', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }

  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const form = await c.req.formData().catch(() => null);
  const file = form?.get('image');
  const alt = typeof form?.get('alt') === 'string' ? String(form?.get('alt')).trim().slice(0, 120) : '';

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

  const uploadsDir = fromProjectRoot('public', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const hash = crypto.randomBytes(6).toString('hex');
  const basename = slugifyFilename(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const filename = `${Date.now()}-${basename}-${hash}.${extension}`;
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/${filename}?v=${Date.now()}`;
  return c.json({
    ok: true,
    url,
    markdown: `![${alt || basename}](${url})`
  });
});

admin.get('/articles', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({
    articles: listArticles()
  });
});

admin.get('/articles/:slug', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const slug = c.req.param('slug').trim();
  if (!slug) {
    return c.json({ error: 'Invalid slug' }, 400);
  }

  try {
    return c.json({
      article: getArticle(slug)
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Article not found'
    }, 404);
  }
});

admin.post('/articles/:slug/update', async (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const slug = c.req.param('slug').trim();
  if (!slug) {
    return c.json({ error: 'Invalid slug' }, 400);
  }

  const body = await c.req.json().catch(() => ({
    title: '',
    content: '',
    metaDescription: '',
    tags: [],
    tldr: '',
    draft: true
  }));

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const metaDescription = typeof body.metaDescription === 'string' ? body.metaDescription.trim() : '';
  const tldr = typeof body.tldr === 'string' ? body.tldr.trim() : '';
  const draft = body.draft !== false;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter(isString).map((tag: string) => tag.trim()).filter(Boolean)
    : [];

  if (!title || !content) {
    return c.json({ error: 'title and content are required' }, 400);
  }

  try {
    const result = updateArticle({
      slug,
      title,
      content,
      metaDescription,
      tags,
      tldr,
      draft
    });

    const rebuild = draft
      ? { started: false, logPath: fromProjectRoot('shared', 'site-rebuild.log') }
      : triggerSiteRebuild();

    return c.json({
      ok: true,
      ...result,
      draft,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Update failed'
    }, 400);
  }
});

admin.post('/articles/:slug/delete', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const slug = c.req.param('slug').trim();
  if (!slug) {
    return c.json({ error: 'Invalid slug' }, 400);
  }

  try {
    const result = deleteArticle(slug);
    const rebuild = result.draft
      ? { started: false, logPath: fromProjectRoot('shared', 'site-rebuild.log') }
      : triggerSiteRebuild();

    return c.json({
      ok: true,
      slug: result.slug,
      draft: result.draft,
      rebuildStarted: rebuild.started,
      rebuildLogPath: rebuild.logPath
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Delete failed'
    }, 400);
  }
});

admin.get('/community/comments', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const rows = db.prepare(`
    SELECT id, article_slug, username, email, content, status, created_at
    FROM article_comments
    ORDER BY created_at DESC
    LIMIT 200
  `).all();

  return c.json({ comments: rows });
});

admin.get('/community/questions', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const threads = db.prepare(`
    SELECT id, slug, title, username, email, status, locked, created_at, last_activity_at
    FROM question_threads
    ORDER BY last_activity_at DESC
    LIMIT 200
  `).all();

  return c.json({ questions: threads });
});

admin.post('/community/:targetType/:id/:action', (c) => {
  if (!isAdminConfigured()) {
    return c.json({ error: 'Admin auth is not configured' }, 503);
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const targetType = c.req.param('targetType');
  const action = c.req.param('action');
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  const table = targetType === 'comments' ? 'article_comments' : targetType === 'questions' ? 'question_threads' : null;
  if (!table) {
    return c.json({ error: 'Unknown target type' }, 400);
  }

  if (action !== 'delete') {
    return c.json({ error: 'Unknown action' }, 400);
  }

  db.prepare(`UPDATE ${table} SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
  recordModerationEvent(targetType, id, action);
  return c.json({ ok: true });
});

export default admin;

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
    throw new Error('No JSON object found in admin assist response');
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

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isAuthenticated(c: Parameters<typeof getCookie>[0]) {
  return verifyAdminSessionToken(getCookie(c, ADMIN_SESSION_COOKIE));
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
    .replace(/-+/g, '-')
    .slice(0, 60);
}
