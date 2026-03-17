import crypto from 'node:crypto';
import { db } from '../db/client.js';

export type CommunityPayload = {
  username: string;
  email: string;
  content: string;
  website?: string;
  title?: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function hashIp(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'community-secret';
  return crypto.createHash('sha256').update(`${secret}:${value}`).digest('hex');
}

export function sanitizeText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function createThreadSlug(value: string) {
  const ascii = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return ascii || `question-${Date.now()}`;
}

export function validateCommunityPayload(
  payload: CommunityPayload,
  kind: 'comment' | 'question' | 'reply'
) {
  const username = payload.username.trim();
  const email = normalizeEmail(payload.email);
  const content = sanitizeText(payload.content);
  const title = kind === 'question' ? sanitizeText(payload.title ?? '') : '';
  const website = String(payload.website ?? '').trim();

  if (website) {
    return { ok: false as const, error: 'Rejected' };
  }

  if (!/^[\p{L}\p{N}\s_-]{2,24}$/u.test(username)) {
    return { ok: false as const, error: 'Invalid username' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: 'Invalid email' };
  }

  const contentMin = kind === 'question' ? 10 : 3;
  const contentMax = kind === 'question' ? 5000 : 1000;
  if (content.length < contentMin || content.length > contentMax) {
    return { ok: false as const, error: 'Invalid content length' };
  }

  if (kind === 'question' && (title.length < 4 || title.length > 120)) {
    return { ok: false as const, error: 'Invalid title length' };
  }

  if (countUrls(content) > 2) {
    return { ok: false as const, error: 'Too many links' };
  }

  if (isSpammy(content) || isSpammy(username)) {
    return { ok: false as const, error: 'Rejected' };
  }

  return {
    ok: true as const,
    username,
    email,
    emailNormalized: email,
    content,
    title
  };
}

export function enforceRateLimit(input: {
  scope: 'comment' | 'reply' | 'question';
  ipHash: string;
  emailNormalized: string;
}) {
  const limits = {
    comment: { windowMinutes: 1, max: 3 },
    reply: { windowMinutes: 1, max: 3 },
    question: { windowMinutes: 30, max: 2 }
  } as const;

  const { windowMinutes, max } = limits[input.scope];

  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM rate_limit_events
    WHERE scope = ?
      AND (ip_hash = ? OR email_normalized = ?)
      AND created_at >= datetime('now', ?)
  `).get(input.scope, input.ipHash, input.emailNormalized, `-${windowMinutes} minutes`) as { count: number };

  if ((row?.count ?? 0) >= max) {
    return false;
  }

  db.prepare(`
    INSERT INTO rate_limit_events(scope, ip_hash, email_normalized)
    VALUES (?, ?, ?)
  `).run(input.scope, input.ipHash, input.emailNormalized);

  return true;
}

export function recordModerationEvent(targetType: string, targetId: number, action: string, reason?: string) {
  db.prepare(`
    INSERT INTO moderation_events(target_type, target_id, action, reason)
    VALUES (?, ?, ?, ?)
  `).run(targetType, targetId, action, reason ?? null);
}

function countUrls(value: string) {
  return (value.match(/https?:\/\/|www\./gi) ?? []).length;
}

function isSpammy(value: string) {
  const haystack = value.toLowerCase();
  const blocked = ['telegram', 'whatsapp', 'casino', 'loan', 'seo service', 'buy now', 'porn'];
  if (blocked.some((item) => haystack.includes(item))) {
    return true;
  }

  return /(.)\1{7,}/.test(haystack);
}
