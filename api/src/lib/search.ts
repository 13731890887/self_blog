export function normalizeSearchLimit(rawLimit: string | undefined, fallback = 8, max = 20) {
  const parsed = Number(rawLimit);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), max);
}

export function buildFtsQuery(query: string) {
  const terms = query
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) {
    return '';
  }

  return terms.map((term) => `${term}*`).join(' OR ');
}
