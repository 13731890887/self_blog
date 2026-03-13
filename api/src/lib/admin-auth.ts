import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
export const ADMIN_SESSION_COOKIE = 'self_blog_admin_session';

type SessionPayload = {
  exp: number;
};

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function verifyAdminPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export function createAdminSessionToken(now = Date.now()) {
  const payload: SessionPayload = {
    exp: now + SESSION_TTL_MS
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = toBase64Url(payloadString);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    return typeof payload.exp === 'number' && payload.exp > now;
  } catch {
    return false;
  }
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}
