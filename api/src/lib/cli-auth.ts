import { timingSafeEqual } from 'node:crypto';

export function isAiCliConfigured() {
  return Boolean(process.env.AI_CLI_KEY?.trim());
}

export function extractAiCliKey(authorizationHeader: string | undefined, headerKey: string | undefined) {
  const bearerMatch = authorizationHeader?.match(/^Bearer\s+(.+)$/i);
  const bearerKey = bearerMatch?.[1]?.trim();
  if (bearerKey) {
    return bearerKey;
  }

  const explicitKey = headerKey?.trim();
  return explicitKey || undefined;
}

export function verifyAiCliKey(key: string | undefined) {
  const configured = process.env.AI_CLI_KEY?.trim();
  if (!configured || !key) {
    return false;
  }

  const left = Buffer.from(key);
  const right = Buffer.from(configured);
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
