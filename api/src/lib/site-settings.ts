import fs from 'node:fs';
import { fromProjectRoot } from './paths.js';

export type SiteSettings = {
  hero: {
    zh: {
      title: string;
      description: string;
    };
    en: {
      title: string;
      description: string;
    };
  };
  tags: Array<{
    zh: string;
    en: string;
  }>;
};

const settingsPath = fromProjectRoot('src', 'data', 'site-settings.json');

const fallbackSettings: SiteSettings = {
  hero: {
    zh: {
      title: '先把问题问对',
      description: '慢一点，把复杂的事想明白。'
    },
    en: {
      title: 'Start by asking the right question',
      description: 'Slow down and make the complicated parts legible.'
    }
  },
  tags: [
    { zh: '笔记', en: 'note' }
  ]
};

export function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSystemTag(tag: string) {
  const normalized = normalizeTag(tag);
  return normalized === 'note' || normalized === 'notes';
}

export function readSiteSettings(): SiteSettings {
  try {
    const source = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(source) as SiteSettings;
  } catch {
    return fallbackSettings;
  }
}

export function writeSiteSettings(nextSettings: SiteSettings) {
  fs.writeFileSync(settingsPath, `${JSON.stringify(nextSettings, null, 2)}\n`, 'utf8');
}

export function sanitizeSiteSettings(input: unknown): SiteSettings {
  const source = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const heroSource = typeof source.hero === 'object' && source.hero !== null ? source.hero as Record<string, unknown> : {};
  const zhHero = typeof heroSource.zh === 'object' && heroSource.zh !== null ? heroSource.zh as Record<string, unknown> : {};
  const enHero = typeof heroSource.en === 'object' && heroSource.en !== null ? heroSource.en as Record<string, unknown> : {};
  const tags = Array.isArray(source.tags) ? source.tags : [];

  return {
    hero: {
      zh: {
        title: sanitizeString(zhHero.title, fallbackSettings.hero.zh.title, 80),
        description: sanitizeString(zhHero.description, fallbackSettings.hero.zh.description, 180)
      },
      en: {
        title: sanitizeString(enHero.title, fallbackSettings.hero.en.title, 120),
        description: sanitizeString(enHero.description, fallbackSettings.hero.en.description, 220)
      }
    },
    tags: tags
      .map((tag) => sanitizeTagEntry(tag))
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      .filter((tag) => !isSystemTag(tag.en))
      .filter((tag, index, list) => list.findIndex((item) => item.en === tag.en) === index)
  };
}

function sanitizeTagEntry(tag: unknown) {
  if (typeof tag !== 'object' || tag === null) {
    return null;
  }

  const value = tag as Record<string, unknown>;
  const zh = sanitizeString(value.zh, '', 30);
  const en = normalizeTag(typeof value.en === 'string' ? value.en : '');

  if (!zh || !en) {
    return null;
  }

  return { zh, en };
}

function sanitizeString(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().slice(0, maxLength) || fallback;
}
