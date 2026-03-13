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

const admin = new Hono();

admin.get('/session', (c) => {
  return c.json({
    configured: isAdminConfigured(),
    authenticated: isAuthenticated(c)
  });
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
